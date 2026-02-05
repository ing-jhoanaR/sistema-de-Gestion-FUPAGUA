const mongoose = require('mongoose');

const EntrevistaSchema = new mongoose.Schema({
  historiaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Historia', required: true },
  token: { type: String, required: true, unique: true },
  estado: { type: String, enum: ['pendiente', 'completado', 'revisado'], default: 'pendiente' },
  respuestas: { type: Object, default: {} },
  fechaGeneracion: { type: Date, default: Date.now },
  fechaRespuesta: { type: Date }
});

module.exports = mongoose.model('Entrevista', EntrevistaSchema);