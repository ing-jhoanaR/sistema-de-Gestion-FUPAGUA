// crearUsuario.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario"); // Ajusta la ruta si tu modelo está en otra carpeta

// Datos del usuario a crear
const nuevoUsuario = {
  nombre: "Jhoana Rodriguez",
  usuario: "12345",
  clave: "12345",
  claveSecreta: "12345",
  rol: "admin", // Cambia según el rol deseado
};

const crearUsuario = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");

    // Hashear la contraseña

    // Crear usuario
    const usuario = new Usuario(nuevoUsuario);
    await usuario.save();

    console.log("✅ Usuario creado con éxito!");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error creando usuario:", error.message);
    mongoose.disconnect();
  }
};

crearUsuario();
