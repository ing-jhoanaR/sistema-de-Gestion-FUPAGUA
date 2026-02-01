require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const connectDB = require("./config/bd");

const authRoutes = require("./routes/authRoutes");
const principalRoutes = require("./routes/principalRoutes");
const documentosRoute = require("./routes/documentosRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://www.fupagua.org",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  })
);

// Middleware
app.use(express.json());
connectDB();

// Rutas principales
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/principal", principalRoutes);
app.use("/api/v1/documentos", documentosRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Ruta raíz para mostrar que el backend está activo
app.get("/", (req, res) => {
  res.send(`
    
    <p>El servidor está corriendo</p>
  `);
});

// 🌐 Inicializar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
