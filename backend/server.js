require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/bd");

// Importación de Rutas
const authRoutes = require("./routes/authRoutes");
const principalRoutes = require("./routes/principalRoutes");
const documentosRoute = require("./routes/documentosRoutes");
const entrevistaRoutes = require("./routes/entrevistaRoutes"); // <-- Importación clara

const app = express();

// 1. Configuración de CORS
app.use(
  cors({
    origin: ["https://www.fupagua.org", "http://localhost:5173", "http://localhost:3000"], // Añadí el puerto 3000 por si acaso
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  })
);

// 2. Middlewares de parseo 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Conexión a Base de Datos
connectDB();

// 4. Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. Definición de Rutas de la API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/principal", principalRoutes);
app.use("/api/v1/documentos", documentosRoute);
app.use("/api/entrevistas", entrevistaRoutes); 

// 6. Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1 style="color: #2563eb;">🚀 Backend Fupagua Activo</h1>
      <p style="color: #64748b;">El servidor está corriendo correctamente.</p>
    </div>
  `);
});

// 7. Inicializar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;