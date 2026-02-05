import React, { useState } from 'react';
import axios from 'axios';
import { FaLink, FaCopy, FaCheck } from 'react-icons/fa'; // Asegúrate de tener react-icons

const GeneradorEntrevista = ({ historiaId }) => {
    const [link, setLink] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const handleGenerar = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Llamamos al backend que preparamos antes
            const res = await axios.post('/api/entrevistas/generar', { historiaId }, config);
            
            // Construimos la URL pública para el representante
            const urlPublica = `${window.location.origin}/entrevista-padres/${res.data.token}`;
            setLink(urlPublica);
            setCopiado(false);
        } catch (error) {
            alert("Error al generar el link");
        }
        setCargando(false);
    };

    const copiarAlPortapapeles = () => {
        navigator.clipboard.writeText(link);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000); // Reset del icono
    };

    return (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
                <FaLink /> Enlace de Entrevista para Representante
            </h4>
            
            <div className="relative flex items-center bg-white border-2 border-blue-200 rounded-full overflow-hidden shadow-sm transition-focus focus-within:border-blue-400">
                <input 
                    type="text" 
                    readOnly 
                    value={link}
                    placeholder="Haz clic en generar para obtener un link único..."
                    className="w-full py-3 px-6 outline-none text-gray-600 bg-transparent text-sm"
                />
                
                {link ? (
                    <button 
                        onClick={copiarAlPortapapeles}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-white transition-all ${copiado ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {copiado ? <><FaCheck /> Copiado</> : <><FaCopy /> Copiar</>}
                    </button>
                ) : (
                    <button 
                        onClick={handleGenerar}
                        disabled={cargando}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold transition-all disabled:opacity-50"
                    >
                        {cargando ? "Generando..." : "Generar Link"}
                    </button>
                )}
            </div>
            <p className="text-xs text-blue-400 mt-2 ml-4">
                * Este link es único para este expediente y expirará una vez sea respondido.
            </p>
        </div>
    );
};

export default GeneradorEntrevista;