const multer = require("multer");

// Configurar multer para guardar archivos en memoria
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Permitir imágenes y videos
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se permiten imágenes y videos"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;
