import React, { useState } from "react";
import { HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi";

const ListaEsperaEntrevistas = ({ entrevistas, onRevisar }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <HiOutlineClock className="text-amber-500" /> Entrevistas Pendientes de Revisión
        </h2>
        <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-xs font-bold">
          {entrevistas.length} Por procesar
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {entrevistas.map((ent) => (
          <div key={ent._id} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold">
                {ent.historiaId.nombreNiño[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{ent.historiaId.nombreNiño} {ent.historiaId.apellidoNiño}</h4>
                <p className="text-xs text-slate-400">Enviado por: {ent.historiaId.nombreRepresentante}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onRevisar(ent)}
                className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all"
              >
                <HiOutlineEye /> Revisar Respuestas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaEsperaEntrevistas;