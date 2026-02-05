import React from "react";
import { HiOutlineLink, HiOutlineCheck, HiOutlineSparkles } from "react-icons/hi";

const SeccionEntrevista = ({ link, copiado, onGenerar, onCopiar }) => {
  if (!link) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center hover:border-blue-300 transition-all group">
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <HiOutlineSparkles className="text-blue-500 text-3xl" />
        </div>
        <h3 className="text-slate-800 font-bold text-lg">¿Necesitas información del representante?</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Genera un enlace seguro para que los padres completen la entrevista inicial desde su casa.</p>
        <button onClick={onGenerar} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          Generar Link de Entrevista
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl shadow-blue-100 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-blue-100 text-xs uppercase tracking-widest font-black mb-4">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Link de Acceso Seguro Generado
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" readOnly value={link} 
            className="flex-1 bg-white/10 border border-white/20 p-4 rounded-2xl outline-none text-white placeholder:text-white/40 backdrop-blur-md"
          />
          <button 
            onClick={onCopiar} 
            className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${copiado ? 'bg-green-400 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
          >
            {copiado ? <HiOutlineCheck size={22} /> : <HiOutlineLink size={22} />}
            {copiado ? "Copiado" : "Copiar Link"}
          </button>
        </div>
      </div>
      {/* Decoración estética de fondo */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default SeccionEntrevista;