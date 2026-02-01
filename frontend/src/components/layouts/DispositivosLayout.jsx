import React, { useState } from "react";
import { Camera } from "lucide-react";

const dispositivosIniciales = [
  {
    id: 1,
    nombre: "Cámara 1",
    tipo: "Cámara de Seguridad",
    estado: "Activo",
    ubicacion: "Cocina",
    videoUrl:
      "https://earnings-joel-contrary-successful.trycloudflare.com/camara1/webrtc",
    isWebRTC: true,
  },
  {
    id: 2,
    nombre: "Cámara 2",
    tipo: "Cámara de Seguridad",
    estado: "Activo",
    ubicacion: "Entrada Trasera",
    videoUrl:
      "https://relate-illness-verified-basement.trycloudflare.com/camara2/webrtc",
    isWebRTC: true,
  },
  {
    id: 3,
    nombre: "Cámara 3",
    tipo: "Cámara de Seguridad",
    estado: "Activo",
    ubicacion: "Pasillo Exterior",
    videoUrl:
      "https://commentary-hop-horrible-tiger.trycloudflare.com/camara3/webrtc", // 🔁 Reemplaza con tu URL real
    isWebRTC: true,
  },
];

const DispositivosLayout = () => {
  const [dispositivos] = useState(dispositivosIniciales);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <h1 className="text-4xl font-semibold text-center text-slate-800 dark:text-white mb-10">
        Streaming de Cámaras
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dispositivos.map((dispositivo) => (
          <div
            key={dispositivo.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-700 overflow-hidden transition-transform transform hover:scale-[1.01]"
          >
            <div className="w-full h-64 bg-black">
              <iframe
                src={dispositivo.videoUrl}
                allow="camera; microphone; fullscreen"
                className="w-full h-full border-none"
                title={dispositivo.nombre}
              />
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                {dispositivo.nombre}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Ubicación:</strong> {dispositivo.ubicacion}
              </p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                <strong>Estado:</strong>{" "}
                <span
                  className={`font-medium ${
                    dispositivo.estado === "Activo"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {dispositivo.estado}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DispositivosLayout;
