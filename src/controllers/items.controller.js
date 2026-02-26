const prisma = require("../utils/prisma");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../utils/cloudinary");

exports.createItem = async (req, res) => {
  try {
    const { name, description, price, ingredients, categoryId } = req.body;
    let imageUrl = null;

    // Si hay un archivo, subirlo a Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        `item-${Date.now()}`,
        "barlatino/items"
      );
      imageUrl = result.secure_url;
    }

    const data = {
      name,
      description,
      price: parseFloat(price),
      ingredients,
      imageUrl,
    };

    // Si se envía categoryId vacío '', convertir a null (sin categoría)
    if (categoryId !== undefined) {
      data.categoryId = categoryId === "" ? null : categoryId;
    }

    const item = await prisma.item.create({ data });

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, ingredients, categoryId } = req.body;
    const updateData = { name, description, price: parseFloat(price), ingredients };

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId === "" ? null : categoryId;
    }

    // obtener item existente para conocer la imagen anterior
    const existing = await prisma.item.findUnique({ where: { id } });

    // Si hay un archivo nuevo, subirlo primero y luego eliminar el anterior
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        `item-${Date.now()}`,
        "barlatino/items"
      );
      updateData.imageUrl = result.secure_url;

      if (existing && existing.imageUrl) {
        const publicId = getPublicIdFromUrl(existing.imageUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            // ignore delete errors
          }
        }
      }
    }

    const item = await prisma.item.update({ where: { id }, data: updateData });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  // obtener item para eliminar imagen de Cloudinary si existe
  const existing = await prisma.item.findUnique({ where: { id } });
  if (existing && existing.imageUrl) {
    const publicId = getPublicIdFromUrl(existing.imageUrl);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (err) {
        // ignore
      }
    }
  }

  await prisma.item.delete({ where: { id } });
  res.json({ message: "Item eliminado" });
};