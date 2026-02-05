import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DocumentosLayout from "../../components/layouts/DocumentosLayout";
import { UsuarioContext } from "../../context/UsuarioContext";
import { 
  HiOutlineUpload, 
  HiOutlineFolder, 
  HiOutlineArrowLeft,
  HiOutlineClipboardList,
  HiOutlineSearch
} from "react-icons/hi";
import uploadDocumento from "../../utils/uploadDocumento";
import ListaDoc from "../../components/layouts/ListaDoc";
import Modal from "../../components/Modal";
import SeccionEntrevista from "../../components/SeccionEntrevista";
import ListaEsperaEntrevistas from "../../components/Entrevistas/ListaEsperaEntrevistas";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";

const Documentos = () => {
  const { usuario } = useContext(UsuarioContext);
  const navigate = useNavigate();

  // --- ESTADOS DE VISTA Y CARPETAS ---
  const [vista, setVista] = useState("carpetas"); // 'carpetas', 'detalle', 'espera'
  const [historias, setHistorias] = useState([]);
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [modalHistoriaOpen, setModalHistoriaOpen] = useState(false);
  const [nuevaHistoria, setNuevaHistoria] = useState({
    nombreNiño: "", apellidoNiño: "", cedulaNiño: "", nombreRepresentante: "", edadNiño: ""
  });

  // --- ESTADOS DE ENTREVISTA Y ESPERA ---
  const [linkEntrevista, setLinkEntrevista] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [entrevistasPendientes, setEntrevistasPendientes] = useState([]);

  // --- ESTADOS ORIGINALES DOCUMENTOS ---
  const [modalDocOpen, setModalDocOpen] = useState(false);
  const [documentoData, setDocumentoData] = useState({
    nombreArchivo: "", tipo: "", clasificacion: "", sensibilidad: "Baja",
    permisos: [], tamano: 0, propietario: usuario?.nombre,
    resguardo: { metodo: "local", cifrado: "SHA-256", frecuencia: "diaria", estado: "completado" },
  });
  const [archivo, setArchivo] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [respaldoExitoso, setRespaldoExitoso] = useState(false);
  const [botonDesactivado, setBotonDesactivado] = useState(false);

  // --- CARGA INICIAL Y EFECTOS ---
  useEffect(() => {
    fetchHistorias();
    fetchEntrevistasPendientes();
    checkAcceso();
    cargarDatosRespaldo();

    // Polling: revisa si hay entrevistas nuevas cada 2 minutos
    const interval = setInterval(fetchEntrevistasPendientes, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (vista === "detalle" && historiaSeleccionada) {
      fetchDocumentosPorHistoria();
      setLinkEntrevista(""); 
    }
  }, [vista, historiaSeleccionada]);

  // --- FUNCIONES DE LÓGICA ---
  const checkAcceso = () => {
    const tieneAcceso = ["directora", "admin", "terapiaOcupacional", "fisioterapia", "psicologia", "psicopedagogía", "fonoaudiología", "aulaIntegral", "cultura", "nivelación"].includes(usuario?.rol);
    if (!tieneAcceso) navigate("/");
  };

  const fetchHistorias = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/v1/documentos/historias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistorias(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Error cargando historias", error); }
  };

  const fetchEntrevistasPendientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/entrevistas/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEntrevistasPendientes(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Error en lista de espera"); }
  };

  const fetchDocumentosPorHistoria = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/v1/documentos/historia/${historiaSeleccionada._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDocumentos(data);
    } catch (error) { toast.error("Error al cargar los documentos"); }
  };

  const handleGenerarEntrevista = async () => {
    if (!historiaSeleccionada) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/entrevistas/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ historiaId: historiaSeleccionada._id }),
      });
      const data = await res.json();
      if (res.ok) {
        const urlPublica = `${window.location.origin}/entrevista-padres/${data.token}`;
        setLinkEntrevista(urlPublica);
        toast.success("¡Link único generado!");
      }
    } catch (error) { toast.error("Error al generar el link"); }
  };

  const handleConfirmarEntrevista = async (entrevistaId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/entrevistas/confirmar/${entrevistaId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Entrevista aprobada y guardada en el expediente");
        fetchEntrevistasPendientes(); // Limpia la sala de espera
        fetchHistorias(); // Actualiza carpetas
        setVista("carpetas");
      }
    } catch (error) { toast.error("Error al procesar la aprobación"); }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkEntrevista);
    setCopiado(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCrearHistoria = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/v1/documentos/crear-historia`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(nuevaHistoria),
      });
      if (res.ok) {
        toast.success("Expediente creado");
        setModalHistoriaOpen(false);
        fetchHistorias();
      }
    } catch (error) { toast.error("Error al crear"); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setDocumentoData(prev => ({ ...prev, tamano: file.size }));
      setMensajeExito("Archivo listo: " + file.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return toast.error("Debe seleccionar un archivo");
    try {
      const formData = new FormData();
      formData.append("nombreArchivo", documentoData.nombreArchivo);
      formData.append("tipo", documentoData.tipo);
      formData.append("clasificacion", documentoData.clasificacion);
      formData.append("sensibilidad", documentoData.sensibilidad);
      formData.append("permisos", JSON.stringify(documentoData.permisos));
      formData.append("archivo", archivo);
      formData.append("resguardo", JSON.stringify(documentoData.resguardo));
      formData.append("historiaId", historiaSeleccionada._id);
      await uploadDocumento(formData);
      toast.success("Documento guardado");
      setModalDocOpen(false); setArchivo(null); setMensajeExito("");
      fetchDocumentosPorHistoria();
    } catch (error) { toast.error("Error al subir"); }
  };

  const handleBackup = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}${API_PATHS.DOCUMENTOS.RESPALDO_DOCUMENTOS}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRespaldoExitoso(true); setBotonDesactivado(true);
        localStorage.setItem("lastBackupTime", Date.now());
        toast.success("Respaldo completado");
      }
    } catch (error) { toast.error("Error en respaldo"); }
  };

  const cargarDatosRespaldo = () => {
    const lastBackupTime = localStorage.getItem("lastBackupTime");
    if (lastBackupTime && Date.now() - lastBackupTime < 21600000) setBotonDesactivado(true);
  };

  return (
    <DocumentosLayout activeMenu="Documentos">
      {/* CABECERA DINÁMICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm gap-4 border border-slate-50">
        <div>
          {vista !== "carpetas" && (
            <button 
              onClick={() => setVista("carpetas")} 
              className="flex items-center text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest mb-2 transition-colors group"
            >
              <HiOutlineArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Volver al Inicio
            </button>
          )}
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {vista === "carpetas" ? "Historias Clínicas" : vista === "espera" ? "Sala de Espera" : "Detalle del Expediente"}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setVista("espera")}
            className={`relative flex items-center px-6 py-3 rounded-2xl font-bold transition-all ${vista === 'espera' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <HiOutlineClipboardList className="mr-2 text-xl" /> Revisión
            {entrevistasPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-4 border-white font-black animate-bounce">
                {entrevistasPendientes.length}
              </span>
            )}
          </button>

          {vista === "carpetas" ? (
            <button onClick={() => setModalHistoriaOpen(true)} className="flex items-center bg-red-500 text-white px-6 py-3 rounded-2xl hover:bg-red-600 transition shadow-lg shadow-red-100 font-bold">
              Nuevo Expediente <HiOutlineFolder className="ml-2" />
            </button>
          ) : vista === "detalle" ? (
            <button onClick={() => setModalDocOpen(true)} className="flex items-center bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-100 font-bold">
              Subir Archivo <HiOutlineUpload className="ml-2" />
            </button>
          ) : null}

          <button onClick={handleBackup} disabled={botonDesactivado} className={`px-6 py-3 rounded-2xl text-white font-bold transition shadow-lg ${botonDesactivado ? "bg-slate-300 shadow-none" : "bg-slate-800 hover:bg-black shadow-slate-200"}`}>
            {respaldoExitoso ? "Copia Lista" : "Backup"}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN VISTA */}
      <div className="animate-in fade-in duration-500">
        
        {vista === "carpetas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {historias.map((h) => (
              <div 
                key={h._id} 
                onClick={() => { setHistoriaSeleccionada(h); setVista("detalle"); }} 
                className="group cursor-pointer bg-white p-8 rounded-[40px] border border-slate-100 hover:border-red-200 hover:shadow-2xl hover:shadow-red-50 transition-all duration-500 flex flex-col items-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <HiOutlineSearch className="text-red-200 text-2xl" />
                </div>
                <div className="text-8xl text-red-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 mb-4">
                  <HiOutlineFolder />
                </div>
                <span className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-1 rounded-full mb-3 uppercase tracking-tighter">Exp. {h.numeroHistoria}</span>
                <h3 className="font-black text-slate-700 uppercase text-center leading-tight">{h.nombreNiño}<br/>{h.apellidoNiño}</h3>
              </div>
            ))}
          </div>
        )}

        {vista === "detalle" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
               <SeccionEntrevista 
                  link={linkEntrevista} 
                  copiado={copiado} 
                  onGenerar={handleGenerarEntrevista} 
                  onCopiar={copiarLink} 
               />
               <div className="mt-6 bg-white p-6 rounded-[32px] border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Datos del Paciente</h4>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between"><span className="text-slate-400">Representante:</span> <span className="font-medium">{historiaSeleccionada.nombreRepresentante}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Edad:</span> <span className="font-medium">{historiaSeleccionada.edadNiño} años</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Cédula:</span> <span className="font-medium">{historiaSeleccionada.cedulaNiño || 'N/A'}</span></p>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[32px] shadow-sm p-4 border border-slate-100 min-h-[500px]">
                <ListaDoc documentos={documentos} setDocumentos={setDocumentos} setModalIsOpen={setModalDocOpen} setDocumentoData={setDocumentoData} />
              </div>
            </div>
          </div>
        )}

        {vista === "espera" && (
          <ListaEsperaEntrevistas 
            entrevistas={entrevistasPendientes} 
            onRevisar={(ent) => {
              if(window.confirm(`¿Deseas aprobar la entrevista de ${ent.historia.nombreNiño} y guardarla en su expediente?`)) {
                handleConfirmarEntrevista(ent._id);
              }
            }} 
          />
        )}

      </div>

      {/* MODALES */}
      <Modal isOpen={modalHistoriaOpen} onClose={() => setModalHistoriaOpen(false)} title="Crear Nuevo Expediente">
        <form onSubmit={handleCrearHistoria} className="grid grid-cols-2 gap-4 p-2">
          <input className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Nombre del Niño" onChange={(e) => setNuevaHistoria({...nuevaHistoria, nombreNiño: e.target.value})} required />
          <input className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Apellido" onChange={(e) => setNuevaHistoria({...nuevaHistoria, apellidoNiño: e.target.value})} required />
          <input className="col-span-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Nombre del Representante" onChange={(e) => setNuevaHistoria({...nuevaHistoria, nombreRepresentante: e.target.value})} required />
          <input className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Cédula o ID" onChange={(e) => setNuevaHistoria({...nuevaHistoria, cedulaNiño: e.target.value})} />
          <input className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" type="number" placeholder="Edad" onChange={(e) => setNuevaHistoria({...nuevaHistoria, edadNiño: e.target.value})} required />
          <button type="submit" className="col-span-2 bg-red-500 text-white p-4 rounded-2xl font-black text-lg hover:bg-red-600 transition shadow-xl shadow-red-100 mt-2">CREAR CARPETA MAESTRA</button>
        </form>
      </Modal>

      <Modal isOpen={modalDocOpen} onClose={() => setModalDocOpen(false)} title={`Archivo para: ${historiaSeleccionada?.nombreNiño}`}>
        <form onSubmit={handleUploadSubmit} className="grid grid-cols-2 gap-4 p-2">
          <input className="col-span-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 outline-none" placeholder="Título del Documento" value={documentoData.nombreArchivo} onChange={(e) => setDocumentoData({...documentoData, nombreArchivo: e.target.value})} required />
          <input className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 outline-none" placeholder="Tipo (PDF, JPG...)" value={documentoData.tipo} onChange={(e) => setDocumentoData({...documentoData, tipo: e.target.value})} required />
          <select className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 outline-none" value={documentoData.clasificacion} onChange={(e) => setDocumentoData({...documentoData, clasificacion: e.target.value})} required>
            <option value="">Nivel de Privacidad</option>
            <option value="Interno">Uso Interno</option>
            <option value="Confidencial">Estrictamente Confidencial</option>
          </select>
          <div className="col-span-2 border-4 border-dashed border-slate-100 p-10 rounded-[32px] text-center hover:bg-slate-50 transition-colors">
            <input type="file" id="file-up" className="hidden" onChange={handleFileChange} />
            <label htmlFor="file-up" className="cursor-pointer text-green-600 font-black block text-lg">{mensajeExito || "SOLTAR ARCHIVO AQUÍ"}</label>
          </div>
          <button type="submit" className="col-span-2 bg-green-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-green-700 transition shadow-xl shadow-green-100 mt-2">VINCULAR AL EXPEDIENTE</button>
        </form>
      </Modal>
    </DocumentosLayout>
  );
};

export default Documentos;