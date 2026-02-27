const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const path = require("path");

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
async function deleteFromCloudinary(publicId, url) {
  // Detectar si es video o imagen por la extensión
  let resourceType = "image"; // por defecto
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  if (url && videoExtensions.includes(path.extname(url).toLowerCase())) {
    resourceType = "video";
  }

  console.log("Deleting:", publicId, "as", resourceType);
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

const getPublicIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/'); // ["", "v123456", "barlatino", "events", "event-123.mp4"]
    const uploadIndex = pathParts.findIndex(part => part === "upload");
    if (uploadIndex === -1) return null;

    let filename = pathParts.slice(uploadIndex + 1).join('/'); // "v123456/barlatino/events/event-123.mp4"

    // Quitar versión si existe (v123456/)
    const match = filename.match(/^v\d+\/(.+)$/);
    if (match) filename = match[1]; // "barlatino/events/event-123.mp4"

    // Quitar extensión
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1) filename = filename.substring(0, dotIndex);

    return filename; // "barlatino/events/event-123"
  } catch (e) {
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
};
