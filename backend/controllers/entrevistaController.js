const Entrevista = require("../models/Entrevista");
const Historia = require("../models/Historia");
const Documento = require("../models/Documentos");
const crypto = require("crypto");

// 1. Generar link único para el representante
exports.generarTokenEntrevista = async (req, res) => {
  try {
    const { historiaId } = req.body;
    const token = crypto.randomBytes(10).toString("hex");

    const nuevaEntrevista = new Entrevista({
      historia: historiaId, // Asegúrate que en tu modelo se llame 'historia'
      token: token,
      estado: "Pendiente"
    });

    await nuevaEntrevista.save();
    res.status(201).json({ message: "Link generado", token: token });
  } catch (error) {
    res.status(500).json({ message: "Error al generar link", error: error.message });
  }
};

// --- FUNCIÓN NUEVA: Validar el token antes de cargar el formulario ---
exports.validarToken = async (req, res) => {
  try {
    const { token } = req.params;
    // Buscamos la entrevista y traemos los datos del niño (populate)
    const entrevista = await Entrevista.findOne({ token, estado: "Pendiente" })
                                     .populate("historia", "nombreNiño apellidoNiño");

    if (!entrevista) {
      return res.status(404).json({ valido: false, message: "Link inválido o expirado" });
    }

    res.status(200).json({ 
      valido: true, 
      nombreNiño: `${entrevista.historia.nombreNiño} ${entrevista.historia.apellidoNiño}` 
    });
  } catch (error) {
    res.status(500).json({ message: "Error en validación", error: error.message });
  }
};

// 2. Recibir la respuesta del formulario (Link público)
exports.recibirRespuestaEntrevista = async (req, res) => {
  try {
    const { token } = req.params;
    const { respuestas } = req.body; // Cambiado para coincidir con el JSON del frontend

    const entrevista = await Entrevista.findOne({ token, estado: "Pendiente" });

    if (!entrevista) {
      return res.status(404).json({ message: "El link ya no está disponible" });
    }

    entrevista.respuestas = respuestas; // Asegúrate que tu modelo tenga este campo
    entrevista.estado = "Respondida";
    entrevista.fechaRespondida = new Date();
    await entrevista.save();

    res.status(200).json({ message: "Entrevista enviada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar respuesta", error: error.message });
  }
};

// 3. Obtener entrevistas en espera (Para el Admin)
exports.obtenerEntrevistasEnEspera = async (req, res) => {
  try {
    // Traemos los datos del niño para mostrarlos en la "Sala de Espera"
    const espera = await Entrevista.find({ estado: "Respondida" })
                                   .populate("historia", "nombreNiño apellidoNiño nombreRepresentante");
    res.status(200).json(espera);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener lista de espera" });
  }
};

// 4. Confirmar y pasar a la carpeta del niño (Cerrar ciclo de forma inteligente)
exports.confirmarEntrevista = async (req, res) => {
  try {
    const { id } = req.params;
    const entrevista = await Entrevista.findById(id).populate("historia");

    if (!entrevista) return res.status(404).json({ message: "No encontrada" });

    // CREACIÓN AUTOMÁTICA DEL DOCUMENTO
    // Esto hace que la entrevista aparezca en la lista de archivos del niño
    const nuevoDocumento = new Documento({
      nombreArchivo: `Entrevista Inicial - ${entrevista.historia.nombreNiño}`,
      tipo: "Entrevista Digital",
      clasificacion: "Confidencial",
      historiaId: entrevista.historia._id,
      propietario: req.usuario?.nombre || "Sistema", // req.usuario viene de tu authMiddleware
      contenido: entrevista.respuestas, // Guardamos las respuestas dentro del documento
      fechaSubida: new Date()
    });

    await nuevoDocumento.save();

    // Marcamos la entrevista como archivada para que desaparezca de la sala de espera
    entrevista.estado = "Confirmada";
    await entrevista.save();

    res.status(200).json({ message: "Entrevista aprobada y vinculada al expediente" });
  } catch (error) {
    res.status(500).json({ message: "Error al confirmar y archivar", error: error.message });
  }
};