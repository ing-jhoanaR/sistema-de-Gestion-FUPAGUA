import React, { useEffect, useState, useContext } from "react";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { FaTrash, FaDownload, FaEdit, FaSearch } from "react-icons/fa";
import Modal from "../Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UsuarioContext } from "../../context/UsuarioContext";
import axiosInstance from "../../utils/axiosInstance";

const ListaDoc = ({ documentos, setDocumentos }) => {
  const { usuario } = useContext(UsuarioContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [documentoData, setDocumentoData] = useState({
    _id: "",
    nombreArchivo: "",
    tipo: "",
    clasificacion: "",
    sensibilidad: "",
    permisos: [],
    resguardo: {
      metodo: "nube",
      cifrado: "AES-256",
      frecuencia: "diaria",
      estado: "pendiente",
    },
  });
  const [mensajeError, setMensajeError] = useState("");
  const [modalAction, setModalAction] = useState("edit");
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No se encontró el token. Por favor, inicia sesión.");
        }

        const response = await fetch(
          `${BASE_URL}${API_PATHS.DOCUMENTOS.OBTENER_DOCUMENTOS}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al obtener los documentos"
          );
        }

        const data = await response.json();
        setDocumentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, [setDocumentos]);

  const eliminarDocumento = async () => {
    if (!documentToDelete) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${BASE_URL}${API_PATHS.DOCUMENTOS.ELIMINAR_DOCUMENTO(
          documentToDelete
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Error al eliminar el documento: " + errorData.message);
      }

      setDocumentos((prevDocs) =>
        prevDocs.filter((doc) => doc._id !== documentToDelete)
      );
      toast.success("Documento eliminado correctamente!", { autoClose: 3000 });
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Error al eliminar el documento: " + error.message, {
        autoClose: 3000,
      });
    }
  };

  const openModal = (id, action) => {
    const documento = documentos.find((doc) => doc._id === id);
    if (documento) {
      if (action === "edit") {
        setDocumentoData({
          _id: documento._id,
          nombreArchivo: documento.nombreArchivo,
          tipo: documento.tipo,
          clasificacion: documento.clasificacion,
          sensibilidad: documento.sensibilidad,
          permisos: documento.permisos,
          resguardo: {
            metodo: documento.resguardo?.metodo || "local",
            cifrado: documento.resguardo?.cifrado || "SHA-256",
            frecuencia: documento.resguardo?.frecuencia || "diaria",
            estado: documento.resguardo?.estado || "completado",
          },
        });
        setModalAction("edit");
      } else if (action === "delete") {
        setDocumentToDelete(id);
        setModalAction("delete");
      }
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setMensajeError("");
    setDocumentToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}${API_PATHS.DOCUMENTOS.OBTENER_DOCUMENTO_INFO(
          documentoData._id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(documentoData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el documento"
        );
      }

      await registrarAcceso(documentoData._id, "edicion");

      toast.success("Documento actualizado correctamente!", {
        autoClose: 3000,
      });
      closeModal();
    } catch (error) {
      setMensajeError(error.message);
    }
  };

  const registrarAcceso = async (documentoId, accion) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${BASE_URL}${API_PATHS.DOCUMENTOS.REGISTRAR_ACCESO}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentoId, accion }),
      });
    } catch (error) {
      console.error("Error al registrar el acceso:", error);
    }
  };

  const descargarDocumento = async (id) => {
    try {
      const { data } = await axiosInstance.get(
        `${BASE_URL}${API_PATHS.DOCUMENTOS.DESCARGAR_DOCUMENTO(id)}`
      );
      const { fileUrl, fileName } = data;

      // Construir URL completa para descargar el archivo
      const fileDownloadUrl = `${BASE_URL}${fileUrl}`;

      // Descargar el archivo
      const response = await axiosInstance.get(fileDownloadUrl, {
        responseType: "blob",
      });

      // Crear Blob y disparar descarga
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);

      // Mostrar mensaje de éxito
      toast.success("Documento descargado correctamente");

      await registrarAcceso(id, "descarga");
    } catch (error) {
      console.error("Error al descargar el documento:", error);
      toast.error("No se pudo descargar el documento.");
    }
  };
  const filteredDocuments = documentos.filter((doc) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      doc.nombreArchivo.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.tipo.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.clasificacion.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.permisos.join(",").toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.sensibilidad.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.propietario?.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.propietario?.rol.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  if (loading) {
    return <div>Cargando historias...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const indexOfLastDocument = currentPage * itemsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  return (
    <div className="relative">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
      <div className="flex items-center justify-between mb-4">
        <h2 className="mt-5 mb-3 text-lg font-sans">Lista de Historias Clinicas</h2>
        <div className="flex items-center border border-gray-300 rounded">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 outline-none rounded-l"
          />
          <span className="px-2">
            <FaSearch className="text-gray-500" />
          </span>
        </div>
      </div>
      <table className="min-w-full text-slate-700 border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-4 py-2">Nombre</th>
            <th className="border border-gray-200 px-4 py-2">Tipo</th>
            <th className="border border-gray-200 px-4 py-2">Clasificación</th>
            <th className="border border-gray-200 px-4 py-2">Sensibilidad</th>
            <th className="border border-gray-200 px-4 py-2">Permisos</th>
            <th className="border border-gray-200 px-4 py-2">Propietario</th>
            <th className="border border-gray-200 px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentDocuments.map((doc) => (
            <tr key={doc._id}>
              <td className="border text-center border-gray-200 px-4 py-2">
                {doc && doc.nombreArchivo
                  ? doc.nombreArchivo.length > 20
                    ? `${doc.nombreArchivo.substring(0, 20)}..`
                    : doc.nombreArchivo
                  : "Sin Nombre"}
              </td>
              <td className="border text-center border-gray-200 px-4 py-2">
                {doc.tipo.length > 10
                  ? `${doc.tipo.substring(0, 10)}..`
                  : doc.tipo}
              </td>
              <td className="border text-center border-gray-200 px-4 py-2">
                {doc.clasificacion}
              </td>
              <td className="border text-center border-gray-200 px-4 py-2">
                {doc.sensibilidad}
              </td>
              <td className="border text-center border-gray-200 px-4 py-2">
                {doc.permisos.join(", ")}
              </td>
              <td className="border text-center border-gray-200 px-2 capitalize py-2">
                {doc.propietario ? (
                  <>
                    {doc.propietario.nombre}{" "}
                    <span className="text-xs text-slate-500">
                      ({doc.propietario.rol})
                    </span>
                  </>
                ) : (
                  "Desconocido"
                )}
              </td>
              <td className="border text-center border-gray-200 px-4 py-2">
                {usuario?.rol === doc.propietario.rol ||
                usuario?.rol === "admin" ||
                usuario?.rol === "directora" ? (
                  <>
                    <button
                      className={`text-blue-500 text-lg cursor-pointer hover:text-blue-400 py-1 rounded`}
                      onClick={() => descargarDocumento(doc._id)}
                    >
                      <FaDownload className="mx-2" />
                    </button>
                    {doc.permisos.includes("Escritura") && (
                      <button
                        className={`text-slate-500 hover:text-slate-400 cursor-pointer text-xl py-1 rounded`}
                        onClick={() => openModal(doc._id, "edit")}
                      >
                        <FaEdit className="mx-2" />
                      </button>
                    )}
                    {(usuario?.rol === "admin" ||
                      usuario?.rol === "directora") && (
                      <button
                        className={`text-primary hover:text-red-400 cursor-pointer text-lg py-1 rounded`}
                        onClick={() => openModal(doc._id, "delete")}
                      >
                        <FaTrash className="mx-2" />
                      </button>
                    )}
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalAction === "delete" && documentToDelete !== null}
        onClose={closeModal}
        title="Eliminar Documento"
      >
        <p>¿Estás seguro de que deseas eliminar esta historia?</p>
        <div className="mt-4 flex justify-end">
          <button
            className="bg-primary hover:text-primary hover:bg-white cursor-pointer border hover:border-primary text-white px-4 py-2 rounded mr-2"
            onClick={eliminarDocumento}
          >
            Eliminar
          </button>
          <button
            className="bg-slate-300 cursor-pointer hover:text-slate-400 hover:bg-white hover:border hover:border-slate-400 px-4 py-2 rounded"
            onClick={closeModal}
          >
            Cancelar
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={modalAction === "edit" && modalIsOpen}
        onClose={closeModal}
        title="Editar Documento"
      >
        {mensajeError && (
          <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
            {mensajeError}
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

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="mt-4 bg-green-600 text-sm text-white px-4 py-2 rounded cursor-pointer hover:text-green-600 hover:bg-white border"
            >
              Actualizar
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

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-slate-100 px-4 py-2 rounded cursor-pointer hover:bg-slate-300"
        >
          Anterior
        </button>
        <span className="text-xs mr-15 text-slate-500">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-slate-100 px-4 py-2 rounded cursor-pointer hover:bg-slate-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ListaDoc;
