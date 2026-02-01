import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DocumentosLayout from "../../components/layouts/DocumentosLayout";
import { UsuarioContext } from "../../context/UsuarioContext";
import { HiOutlineCheck, HiOutlineLink, HiOutlineUpload } from "react-icons/hi";
import uploadDocumento from "../../utils/uploadDocumento";
import ListaDoc from "../../components/layouts/ListaDoc";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { DateTime } from "luxon";

const Documentos = () => {
  const { usuario } = useContext(UsuarioContext);
  const navigate = useNavigate();
  const location = useLocation();
  const documentoEdit = location.state?.documento;

  const tieneAcceso = [
    "directora",
    "admin",
    "terapiaOcupacional",
    "fisioterapia",
    "psicologia",
    "psicopedagogía",
    "fonoaudiología",
    "aulaIntegral",
    "cultura",
    "nivelación",
  ].includes(usuario?.rol);

  if (!tieneAcceso) {
    navigate("/");
    return null;
  }

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [documentoData, setDocumentoData] = useState({
    nombreArchivo: "",
    tipo: "",
    clasificacion: "",
    sensibilidad: "",
    permisos: [],
    tamano: 0,
    propietario: usuario?.nombre,
    resguardo: {
      metodo: "local",
      cifrado: "SHA-256",
      frecuencia: "diaria",
      estado: "completado",
    },
  });
  const [archivo, setArchivo] = useState(null);
  const [mensajeError, setMensajeError] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [respaldoExitoso, setRespaldoExitoso] = useState(false);
  const [botonDesactivado, setBotonDesactivado] = useState(false);
  const [ultimaFechaRespaldo, setUltimaFechaRespaldo] = useState(null);

  useEffect(() => {
    const fetchUltimaFechaRespaldo = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${BASE_URL}${API_PATHS.DOCUMENTOS.OBTENER_DOCUMENTOS}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener la última fecha de respaldo");
        }

        const data = await response.json();
        console.log("Respuesta de la API:", data);

        if (Array.isArray(data)) {
          if (data.length > 0) {
            const lastBackup = data[0].resguardo?.ultimaFechaRespaldo;
            if (lastBackup) {
              setUltimaFechaRespaldo(
                DateTime.fromISO(lastBackup).setLocale("es"),
              );
            } else {
              console.warn("No hay fecha de respaldo disponible.");
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener la última fecha de respaldo:", error);
      }
    };

    fetchUltimaFechaRespaldo();

    const lastBackupTime = localStorage.getItem("lastBackupTime");
    const currentTime = Date.now();

    if (lastBackupTime && currentTime - lastBackupTime < 21600000) {
      setBotonDesactivado(true);
    }

    if (documentoEdit) {
      setDocumentoData({
        nombreArchivo: documentoEdit.nombreArchivo,
        tipo: documentoEdit.tipo,
        clasificacion: documentoEdit.clasificacion,
        sensibilidad: documentoEdit.sensibilidad,
        permisos: documentoEdit.permisos,
        tamano: documentoEdit.tamano,
        propietario: documentoEdit.propietario.nombre,
        resguardo: {
          metodo: documentoEdit.resguardo?.metodo || "local",
          cifrado: documentoEdit.resguardo?.cifrado || "SHA-256",
          frecuencia: documentoEdit.resguardo?.frecuencia || "diaria",
          estado: documentoEdit.resguardo?.estado || "completado",
        },
      });
      setModalIsOpen(true);
    }
  }, [documentoEdit]);

  const handleSubirDocumento = () => {
    setDocumentoData({
      nombreArchivo: "",
      tipo: "",
      clasificacion: "",
      sensibilidad: "",
      permisos: [],
      tamano: 0,
      propietario: usuario?.nombre,
      resguardo: {
        metodo: "local",
        cifrado: "SHA-256",
        frecuencia: "diaria",
        estado: "completado",
      },
    });
    setModalIsOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleGenerarEntrevista = async () => {
    try {
      console.log("➡️ Generando enlace desde el FRONT...");

      // 1️⃣ Generar token único
      const token = crypto.randomUUID();

      // 2️⃣ Construir link
      const linkUnico = `https://entrevista.fupagua.org/${token}`;

      console.log("🔗 Link generado en front:", linkUnico);

      // 3️⃣ Enviar al backend SOLO para guardar
      const res = await fetch(
        "https://entrevista.fupagua.org/api/entrevistas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            url: linkUnico,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Error guardando entrevista");
      }

      const data = await res.json();
      console.log("✅ Backend confirmó:", data);

      window.open(linkUnico, "_blank");

      alert(`Tu link de entrevista es:\n${linkUnico}`);
    } catch (error) {
      console.error("💥 Error generando entrevista:", error);
      alert("No se pudo generar la entrevista");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    setMensajeError(false);
    setMensajeExito("");

    if (file) {
      if (allowedTypes.includes(file.type)) {
        setArchivo(file);
        setDocumentoData((prevData) => ({
          ...prevData,
          tamano: file.size,
        }));
        setMensajeExito("Documento cargado.");
      } else {
        setMensajeError(true);
        setArchivo(null);
      }
    }
  };

  const handlePermisosChange = (e) => {
    const selectedPermiso = e.target.value;
    setDocumentoData((prevData) => ({
      ...prevData,
      permisos: prevData.permisos.includes(selectedPermiso)
        ? prevData.permisos.filter((permiso) => permiso !== selectedPermiso)
        : [...prevData.permisos, selectedPermiso],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !documentoData.nombreArchivo ||
      !documentoData.tipo ||
      !documentoData.clasificacion ||
      !documentoData.sensibilidad
    ) {
      setMensajeError(true);
      console.error("¡Todos los campos son requeridos!");
      return;
    }

    if (!archivo) {
      setMensajeError(true);
      console.error("¡No se ha seleccionado un archivo!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombreArchivo", documentoData.nombreArchivo);
      formData.append("tipo", documentoData.tipo);
      formData.append("clasificacion", documentoData.clasificacion);
      formData.append("sensibilidad", documentoData.sensibilidad);
      formData.append("permisos", JSON.stringify(documentoData.permisos));
      formData.append("tamano", documentoData.tamano);
      formData.append("propietario", documentoData.propietario);
      formData.append("archivo", archivo);
      formData.append("resguardo", JSON.stringify(documentoData.resguardo));

      const response = await uploadDocumento(formData);
      console.log("Documento procesado:", response);
      toast.success("¡Documento subido correctamente!");
      setModalIsOpen(false);
    } catch (error) {
      console.error("Error al procesar el documento:", error);
      toast.error("Error al subir el documento.");
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setMensajeExito("");
  };

  const handleBackup = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}${API_PATHS.DOCUMENTOS.RESPALDO_DOCUMENTOS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Error al realizar el respaldo: " + errorData.message);
      }

      setRespaldoExitoso(true);
      setBotonDesactivado(true);
      localStorage.setItem("lastBackupTime", Date.now());
      toast.success(
        "¡Respaldo realizado correctamente! (desactivado por 6 horas)",
        {
          autoClose: 7000,
        },
      );

      setTimeout(() => {
        setBotonDesactivado(false);
        setRespaldoExitoso(false);
      }, 21600000);
    } catch (error) {
      console.error("Error al realizar el respaldo:", error);
      toast.error("Error al realizar el respaldo.");
    }
  };

  return (
    <DocumentosLayout activeMenu="Documentos">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleSubirDocumento}
          className="flex items-center text-sm px-4 py-2 cursor-pointer bg-red-400 text-white rounded-md mt-3 hover:bg-red-600"
        >
          Subir Historia
          <HiOutlineUpload className="ml-2" />
        </button>
        <button
          onClick={handleGenerarEntrevista}
          className="flex items-center text-sm px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md mt-3 hover:bg-blue-600"
        >
          Generar Entrevista
          <HiOutlineLink className="ml-2" />
        </button>
        <div className="flex items-center mb-4">
          <div className="mr-4">
            {ultimaFechaRespaldo ? (
              <div className="text-sm mt-3 text-center text-gray-600">
                <span className=" font-bold items-center justify-center">
                  Último Respaldo
                </span>
                <div className="capitalize">
                  {ultimaFechaRespaldo.toFormat("MMMM dd, yyyy h:mm a")}
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Sin respaldo previo</span>
            )}
          </div>
          <button
            onClick={handleBackup}
            disabled={botonDesactivado}
            className={`flex items-center text-sm px-4 py-2 cursor-pointer rounded-md mt-3 ${
              respaldoExitoso ? "bg-green-500" : "bg-blue-500"
            } text-white ${
              botonDesactivado
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {respaldoExitoso ? (
              <>
                <HiOutlineCheck className="ml-2" />
                ¡Respaldo Exitoso!
              </>
            ) : (
              <>
                Hacer Respaldo
                <HiOutlineUpload className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onClose={closeModal}
        title={documentoEdit ? "Editar Documento" : "Subir Documento"}
      >
        {mensajeError && (
          <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
            Error: Formato de archivo no permitido. Solo se permiten PDF, Word y
            Excel.
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              name="nombreArchivo"
              placeholder="Nombre del Documento"
              value={documentoData.nombreArchivo}
              onChange={handleChange}
              required
              className="flex justify-between gap-2 text-sm text-black bg-slate-100 rounded px-4 py-3 border border-slate-200 outline-none w-full"
            />
          </div>
          <div>
            <label>Tipo:</label>
            <input
              type="text"
              name="tipo"
              placeholder="Ej. Historia Clínica, Diagnóstico"
              value={documentoData.tipo}
              onChange={handleChange}
              required
              className="flex justify-between gap-2 text-sm text-black bg-slate-100 rounded px-4 py-3 border border-slate-200 outline-none w-full"
            />
          </div>
          <div>
            <label>Clasificación:</label>
            <select
              name="clasificacion"
              value={documentoData.clasificacion}
              onChange={handleChange}
              required
              className="flex cursor-pointer justify-between gap-2 text-sm text-black bg-slate-100 rounded px-4 py-3 border border-slate-200 outline-none w-full"
            >
              <option value="">Seleccione</option>
              <option value="Público">Público</option>
              <option value="Interno">Interno</option>
              <option value="Confidencial">Confidencial</option>
            </select>
          </div>
          <div>
            <label>Sensibilidad:</label>
            <select
              name="sensibilidad"
              value={documentoData.sensibilidad}
              onChange={handleChange}
              required
              className="flex cursor-pointer justify-between gap-2 text-sm text-black bg-slate-100 rounded px-4 py-3 border border-slate-200 outline-none w-full"
            >
              <option value="">Seleccione</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="mr-2">Archivo:</label>
            <div className="relative flex items-center w-full">
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className={`flex cursor-pointer justify-between items-center gap-2 text-sm rounded px-4 py-3 border border-slate-200 outline-none w-full ${
                  mensajeExito ? "bg-slate-100" : "bg-slate-100 text-gray-600"
                }`}
              >
                <span className={mensajeExito ? "text-green-600" : ""}>
                  {mensajeExito || "Selecciona un archivo"}
                </span>
                {mensajeExito ? (
                  <HiOutlineCheck className="text-xl text-green-600" />
                ) : (
                  <HiOutlineUpload className="text-xl text-gray-600" />
                )}
              </label>
            </div>
          </div>
          <div className="col-span-1">
            <label>Permisos:</label>
            <select
              name="permisos"
              onChange={handlePermisosChange}
              className="flex w-full cursor-pointer text-sm text-black bg-slate-100 rounded px-4 py-3 border border-slate-200 outline-none"
            >
              <option value="">Seleccione un permiso</option>
              <option value="Lectura">Lectura</option>
              <option value="Escritura">Escritura</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="mt-4 bg-green-600 text-sm text-white px-4 py-2 rounded cursor-pointer hover:text-green-600 hover:bg-white border"
            >
              {documentoEdit ? "Actualizar" : "Subir"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="mt-4 bg-red-600 text-sm text-white px-4 py-2 rounded cursor-pointer hover:text-red-600 ml-2 border hover:bg-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
      <ListaDoc
        documentos={documentos}
        setDocumentos={setDocumentos}
        setModalIsOpen={setModalIsOpen}
        setDocumentoData={setDocumentoData}
      />
    </DocumentosLayout>
  );
};

export default Documentos;
