require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const itemsRoutes = require("./routes/item.routes");
const eventsRoutes = require("./routes/events.routes");
const categoriesRoutes = require("./routes/categories.routes");

const app = express();

// Configurar CORS: permitir orígenes desde env (ALLOWED_ORIGINS) o usar valores por defecto
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://bar-latin-front.vercel.app, http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // permitir peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // logging para depuración
    console.log("CORS check, incoming origin:", origin);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // permitir cualquier localhost o 127.0.0.1 con puerto (útil para dev)
    const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostRegex.test(origin)) {
      return callback(null, true);
    }
    // en desarrollo permitir temporalmente cualquier origen para evitar bloqueos
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Non-production mode: allowing origin', origin);
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin not allowed: ${origin}`), false);
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Usar expresión regular para cubrir todas las rutas y evitar errores en path-to-regexp
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API BAR funcionando 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/categories", categoriesRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejador de errores: devuelve JSON en caso de errores (incluye CORS)
app.use((err, req, res, next) => {
  if (!err) return next();
  if (err.message && err.message.toLowerCase().includes('cors')) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});