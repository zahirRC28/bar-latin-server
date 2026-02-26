const prisma = require("../utils/prisma");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../utils/cloudinary");

exports.createEvent = async (req, res) => {
  try {
    // Validar que exista el archivo de media
    if (!req.file) {
      return res.status(400).json({ message: "La imagen/video es obligatoria para los eventos" });
    }

    const { title, description, date } = req.body;

    // Subir a Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      `event-${Date.now()}`,
      "barlatino/events"
    );

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        mediaUrl: result.secure_url,
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

    // obtener evento existente para conocer el media anterior
    const existing = await prisma.event.findUnique({ where: { id } });

    // Si hay un archivo nuevo, subirlo primero
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        `event-${Date.now()}`,
        "barlatino/events"
      );
      updateData.mediaUrl = result.secure_url;

      // intentar eliminar el media anterior (no bloquear si falla)
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

    const event = await prisma.event.update({ where: { id }, data: updateData });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  await prisma.event.delete({
    where: { id },
  });

  res.json({ message: "Evento eliminado" });
};