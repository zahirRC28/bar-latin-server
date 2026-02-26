const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Subir archivo a Cloudinary desde buffer
const uploadToCloudinary = (fileBuffer, filename, folder = "barlatino") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        public_id: filename.split(".")[0],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convertir buffer a stream
    Readable.from(fileBuffer).pipe(stream);
  });
};

// Eliminar archivo de Cloudinary
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  // Extrae el public_id de una URL de Cloudinary
  getPublicIdFromUrl: (url) => {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      let idPart = parts[1];
      // quitar la versión si existe (v123456/)
      idPart = idPart.replace(/^v\d+\//, '');
      // quitar la extensión
      const dotIndex = idPart.lastIndexOf('.');
      if (dotIndex !== -1) idPart = idPart.substring(0, dotIndex);
      return idPart;
    } catch (e) {
      return null;
    }
  },
};
