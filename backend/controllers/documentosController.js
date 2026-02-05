const Documento = require("../models/Documentos");
const Historia = require("../models/Historia"); 
const HistorialAcceso = require("../models/HistorialAcceso");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// --- FUNCIONES DE DOCUMENTOS ---

exports.crearDocumento = async (req, res) => {
  const {
    nombreArchivo,
    tipo,
    clasificacion,
    sensibilidad,
    permisos,
    resguardo,
    historiaId,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No se cargó el documento!" });
  }

  // FIX: Validar datos obligatorios
  if (!nombreArchivo || !historiaId) {
    return res.status(400).json({ message: "Faltan datos obligatorios (Nombre o Carpeta)." });
  }

  const documentUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  try {
    const nuevoDocumento = new Documento({
      nombreArchivo,
      tipo,
      tamano: req.file.size,
      url: documentUrl,
      clasificacion,
      sensibilidad: sensibilidad || "Baja", // Evita error de validación si llega vacío
      propietario: req.usuario ? req.usuario._id : null, 
      permisos: permisos ? JSON.parse(permisos) : [],
      resguardo: resguardo ? JSON.parse(resguardo) : { metodo: "local", estado: "completado" },
      historia: historiaId, 
    });

    const documentoGuardado = await nuevoDocumento.save();

    // Actualizar la historia clínica para que contenga el ID del nuevo documento
    await Historia.findByIdAndUpdate(historiaId, {
      $push: { documentos: documentoGuardado._id }
    });

    res.status(201).json(documentoGuardado);
  } catch (error) {
    console.error("Error al crear el documento:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

exports.obtenerDocumentos = async (req, res) => {
  try {
    const documentos = await Documento.find().populate("propietario", "nombre rol");
    const documentosConPropietario = documentos.map((doc) => ({
      ...doc._doc,
      propietario: {
        nombre: doc.propietario ? doc.propietario.nombre : "Desconocido",
        rol: doc.propietario ? doc.propietario.rol : "Desconocido",
      },
    }));
    res.status(200).json(documentosConPropietario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener documentos!", error: error.message });
  }
};

exports.obtenerDocumentosPorHistoria = async (req, res) => {
  const { historiaId } = req.params;
  try {
    const documentos = await Documento.find({ historia: historiaId })
      .populate("propietario", "nombre rol");
    res.status(200).json(documentos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener documentos de esta historia" });
  }
};

exports.getDocumentoInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const documento = await Documento.findById(id);
    if (!documento) return res.status(404).json({ message: "Documento no encontrado!" });

    const updates = {
      ...(req.body.nombreArchivo && { nombreArchivo: req.body.nombreArchivo }),
      ...(req.body.tipo && { tipo: req.body.tipo }),
      ...(req.body.clasificacion && { clasificacion: req.body.clasificacion }),
      ...(req.body.sensibilidad && { sensibilidad: req.body.sensibilidad }),
      ...(req.body.permisos && { permisos: req.body.permisos }),
    };

    if (req.body.resguardo) {
      documento.resguardo = { ...documento.resguardo, ...req.body.resguardo };
    }

    Object.assign(documento, updates);
    await documento.save();
    res.status(200).json({ message: "Documento actualizado!", documento });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar!", error: error.message });
  }
};

exports.eliminarDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    const documentoEliminado = await Documento.findByIdAndDelete(id);
    if (!documentoEliminado) return res.status(404).json({ message: "Documento no encontrado!" });
    res.status(200).json({ message: "Documento eliminado correctamente!" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar!", error: error.message });
  }
};

exports.descargarDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    const documento = await Documento.findById(id).populate("propietario");
    if (!documento || !documento.url) return res.status(404).json({ message: "Archivo no encontrado" });

    const fileName = path.basename(documento.url);
    const filePath = path.join(__dirname, "../uploads", fileName);

    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Archivo físico no encontrado" });

    const ext = path.extname(filePath).toLowerCase();
    const propietario = documento.propietario ? documento.propietario.nombre : "desconocido";
    const nuevoNombre = `${documento.nombreArchivo || "doc"}-${propietario}${ext}`;

    res.status(200).json({
      fileName: nuevoNombre,
      fileUrl: `/uploads/${fileName}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en descarga", error: error.message });
  }
};

// --- FUNCIONES DE RESPALDO Y SEGURIDAD ---

exports.respaldarDocumentos = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const documentos = await Documento.find();
    const respaldoContent = JSON.stringify(documentos, null, 2);

    const hash = crypto.createHash("sha256").update(respaldoContent).digest("hex");
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const backupFileName = `respaldo-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);

    fs.writeFileSync(backupPath, respaldoContent, "utf-8");
    fs.writeFileSync(`${backupPath}.hash`, hash, "utf-8");

    const fechaActual = new Date();
    await Documento.updateMany({}, { $set: { "resguardo.ultimaFechaRespaldo": fechaActual } });

    res.status(200).json({
      message: "Respaldo realizado correctamente",
      hash,
      backupFileName,
      fechaRespaldo: fechaActual,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al realizar el respaldo", error: error.message });
  }
};

exports.editarDocumento = async (req, res) => {
    const { id } = req.params;
    try {
        const documento = await Documento.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(documento);
    } catch (error) {
        res.status(500).json({ message: "Error al editar", error: error.message });
    }
};

exports.historialAcceso = async (req, res) => {
    try {
        const historial = await HistorialAcceso.find().populate("usuario documento");
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener historial" });
    }
};

// --- FUNCIONES DE HISTORIA CLÍNICA ---

exports.crearHistoria = async (req, res) => {
  try {
    const ultimo = await Historia.findOne().sort({ numeroHistoria: -1 });
    const nuevoNumero = ultimo && ultimo.numeroHistoria ? ultimo.numeroHistoria + 1 : 1100;

    const nuevaHistoria = new Historia({
      ...req.body,
      numeroHistoria: nuevoNumero
    });

    await nuevaHistoria.save();
    res.status(201).json(nuevaHistoria);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la historia", error: error.message });
  }
};

exports.obtenerHistorias = async (req, res) => {
  try {
    const historias = await Historia.find().populate("documentos");
    res.status(200).json(historias);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historias" });
  }
};

// --- HISTORIAL DE ACCESO ---

exports.registrarHistorialAcceso = async (req, res) => {
  const { documentoId, accion } = req.body;
  if (!documentoId || !accion) return res.status(400).json({ error: "Faltan datos." });

  try {
    const nuevoHistorial = new HistorialAcceso({
      usuario: req.usuario._id,
      documento: documentoId,
      accion: accion,
      fecha: new Date(),
    });
    await nuevoHistorial.save();
    res.status(200).json({ message: "Acceso registrado." });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar historial." });
  }
};