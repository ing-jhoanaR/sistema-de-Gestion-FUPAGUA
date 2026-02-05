const express = require("express");
const router = express.Router();
const entrevistaController = require("../controllers/entrevistaController");
const { protect } = require("../middleware/authMiddleware");

// --- RUTAS PRIVADAS (Requieren Login/Token de Especialista) ---

// Generar el link con token único
router.post("/generar", protect, entrevistaController.generarTokenEntrevista);

// Ver la "Sala de Espera" (Entrevistas respondidas por padres)
router.get("/pendientes", protect, entrevistaController.obtenerEntrevistasEnEspera);

// Aprobar entrevista y moverla al expediente del niño
router.post("/confirmar/:id", protect, entrevistaController.confirmarEntrevista);


// --- RUTAS PÚBLICAS (Para los Representantes - Sin Login) ---

// Validar si el link existe y obtener el nombre del niño (se usa al cargar la página)
router.get("/validar/:token", entrevistaController.validarToken);

// Recibir las respuestas del formulario
router.post("/responder/:token", entrevistaController.recibirRespuestaEntrevista);

module.exports = router;