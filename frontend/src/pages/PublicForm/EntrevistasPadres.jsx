import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Aquí importare los 6 formularios a futuro
// import Formulario1 from "./Formularios/Form1"; 

const EntrevistasPadres = () => {
  const { token } = useParams();
  const [paso, setPaso] = useState(1); // Controlará cuál de las 6 entrevistas mostrar

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-4">
      {/* Barra de progreso inteligente */}
      <div className="max-w-md w-full mb-8 flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`h-2 flex-1 mx-1 rounded-full ${paso >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
         {/* Lógica condicional: paso === 1 && <Form1 /> ... */}
         <h1 className="text-3xl font-black text-slate-800 mb-2 text-center">Entrevista Inicial</h1>
         <p className="text-slate-400 text-center mb-10 text-sm">Por favor, complete la información solicitada con la mayor precisión posible.</p>
         
         {/* FORMULARIO EJEMPLO */}
         <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors">Motivo de consulta</label>
              <textarea className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-400 transition-all h-32" />
            </div>
            <button className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-100">
              Enviar y Continuar
            </button>
         </div>
      </div>
    </div>
  );
};

export default EntrevistasPadres;