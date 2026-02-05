const mongoose = require("mongoose");

const HistoriaSchema = new mongoose.Schema({
  numeroHistoria: { type: Number, unique: true },
  nombreNiño: { type: String, required: true },
  apellidoNiño: { type: String, required: true },
  cedulaNiño: { type: String },
  nombreRepresentante: { type: String, required: true },
  edadNiño: { type: Number, required: true },
  // Array que contendrá los IDs de los documentos de este niño
  documentos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Documento" }]
}, { timestamps: true });

module.exports = mongoose.model("Historia", HistoriaSchema);