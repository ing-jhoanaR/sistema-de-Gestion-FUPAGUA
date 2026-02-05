const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  obtenerDocumentos,
  getDocumentoInfo,
  eliminarDocumento,
  descargarDocumento,
  respaldarDocumentos,
  registrarHistorialAcceso,
  historialAcceso, 
  crearHistoria,
  obtenerHistorias,
  crearDocumento,
  obtenerDocumentosPorHistoria,
  editarDocumento 
} = require("../controllers/documentosController");

const router = express.Router();

// --- RUTAS DE HISTORIAS ---
router.post("/crear-historia", protect, crearHistoria);
router.get("/historias", protect, obtenerHistorias);
router.get("/historia/:historiaId", protect, obtenerDocumentosPorHistoria);

// --- RUTAS DE DOCUMENTOS ---
router.post("/subir", protect, upload.single("archivo"), crearDocumento);
router.get("/", protect, obtenerDocumentos);
router.patch("/info/:id", protect, getDocumentoInfo); 
router.put("/:id", protect, editarDocumento); 
router.delete("/:id", protect, eliminarDocumento);
router.get("/descargar/:id", protect, descargarDocumento);

// --- RESPALDOS Y OTROS ---
router.post("/respaldo", protect, respaldarDocumentos);
router.post("/historial", protect, registrarHistorialAcceso);
router.get("/historial-acceso", protect, historialAcceso);

module.exports = router;