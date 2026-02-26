require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const itemsRoutes = require("./routes/item.routes");
const eventsRoutes = require("./routes/events.routes");
const categoriesRoutes = require("./routes/categories.routes");

const app = express();

// Configurar CORS: permitir orígenes desde env o localhost por defecto
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // permitir peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy: origin not allowed"), false);
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