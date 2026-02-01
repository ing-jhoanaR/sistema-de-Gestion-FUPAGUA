import React from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const camarasActivas = [
  {
    id: 1,
    nombre: "Cámara 1",
    ubicacion: "Entrada Principal",
    estado: "Operativa",
  },
  {
    id: 2,
    nombre: "Cámara 2",
    ubicacion: "Entrada Trasera",
    estado: "Operativa",
  },
  {
    id: 3,
    nombre: "Cámara 3",
    ubicacion: "Pasillo",
    estado: "Operativa",
  },
];

const MonitoreoLayout = () => {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br ">
      <h1 className="text-3xl font-semibold text-center text-slate-800 dark:text-white mb-10">
        Alertas y Notificaciones
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {camarasActivas.map((camara, i) => (
          <motion.div
            key={camara.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-900 border-l-4 border-green-500 rounded-xl shadow-md"
          >
            <CheckCircle className="text-green-500 w-6 h-6 mt-1" />
            <div>
              <h2 className="text-md font-semibold text-gray-800 dark:text-white">
                {camara.nombre} en funcionamiento
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Ubicación:</strong> {camara.ubicacion}
              </p>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400">
                Estado: {camara.estado}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MonitoreoLayout;
