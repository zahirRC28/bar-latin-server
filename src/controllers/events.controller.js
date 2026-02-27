const prisma = require("../utils/prisma");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../utils/cloudinary");

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    let mediaUrl = null;
    let videoUrl = null;

    // Si hay una imagen/media, subirla a Cloudinary
    if (req.files && req.files.media && req.files.media.length > 0) {
      const result = await uploadToCloudinary(
        req.files.media[0].buffer,
        `event-${Date.now()}`,
        "barlatino/events"
      );
      mediaUrl = result.secure_url;
    }

    // Si hay un video, subirlo a Cloudinary
    if (req.files && req.files.video && req.files.video.length > 0) {
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        `event-video-${Date.now()}`,
        "barlatino/events"
      );
      videoUrl = result.secure_url;
    }

    if (!mediaUrl && !videoUrl) {
      return res.status(400).json({ message: "La imagen/video es obligatoria para los eventos" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        mediaUrl,
        videoUrl,
      },
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
  });

  res.json(events);
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);

    // obtener evento existente para conocer los archivos anteriores
    const existing = await prisma.event.findUnique({ where: { id } });

    // Si hay una imagen/media nueva, subirla primero
    if (req.files && req.files.media && req.files.media.length > 0) {
      const result = await uploadToCloudinary(
        req.files.media[0].buffer,
        `event-${Date.now()}`,
        "barlatino/events"
      );
      updateData.mediaUrl = result.secure_url;

      // intentar eliminar la media anterior (no bloquear si falla)
      if (existing && existing.mediaUrl) {
        const publicId = getPublicIdFromUrl(existing.mediaUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            // ignore
          }
        }
      }
    }

    // Si hay un video nuevo, subirlo primero
    if (req.files && req.files.video && req.files.video.length > 0) {
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        `event-video-${Date.now()}`,
        "barlatino/events"
      );
      updateData.videoUrl = result.secure_url;

      // intentar eliminar el video anterior (no bloquear si falla)
      if (existing && existing.videoUrl) {
        const publicId = getPublicIdFromUrl(existing.videoUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            // ignore
          }
        }
      }
    }

    const event = await prisma.event.update({ where: { id }, data: updateData });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener evento existente
    const existing = await prisma.event.findUnique({ where: { id } });

    if (existing && existing.mediaUrl) {
      const publicId = getPublicIdFromUrl(existing.mediaUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId, existing.mediaUrl);
          console.log("Archivo eliminado de Cloudinary:", publicId);
        } catch (err) {
          console.error("Error eliminando media/video en Cloudinary:", err);
        }
      }
    }

    // Borrar el registro de la base de datos
    await prisma.event.delete({ where: { id } });

    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    res.status(500).json({ error: error.message });
  }
};