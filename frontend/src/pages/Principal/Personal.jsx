import React, { useEffect, useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa"; // Importamos los íconos de lupa y eliminar
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths"; // Asegúrate de que la ruta sea correcta
import { ToastContainer, toast } from "react-toastify"; // Importamos Toast
import "react-toastify/dist/ReactToastify.css"; // Importamos estilos de Toast
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { UsuarioContext } from "../../context/UsuarioContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { usuarioActual } = useContext(UsuarioContext);

  const fetchPersonalInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró el token. Por favor, inicia sesión.");
      }

      const url = `${BASE_URL}${API_PATHS.USUARIOS.GET_PERSONAL_INFO}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const filteredUsers = data.data.filter(
          (usuario) => usuario.rol !== "admin"
        );
        setPersonal(filteredUsers);
      } else {
        throw new Error("Datos no encontrados");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const filteredPersonal = personal.filter(
    (usuario) =>
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (usuarioId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const url = `${BASE_URL}${API_PATHS.USUARIOS.DELETE_USER}/${usuarioId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      toast.success("Usuario eliminado correctamente");

      setTimeout(() => {
        fetchPersonalInfo();
      }, 3500);
    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Cargando información del personal...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PrincipalLayout activeMenu="Personal">
      <ToastContainer autoClose={1900} />
      <div className="flex justify-between items-center mb-5">
        <h2 className="mt-5 mb-3 text-lg font-bold">Lista de Personal</h2>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded pl-10"
              style={{ width: "350px" }}
            />
            <FaSearch className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
          </div>

          {usuarioActual && usuarioActual.rol === "admin" && (
            <button
              className="text-sm font-medium text-white bg-primary shadow-lg shadow-red-600/5 px-3 py-2 rounded-md hover:bg-white border hover:text-primary cursor-pointer"
              onClick={() => navigate("/registro")}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
              Crear Cuenta
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-between">
        {filteredPersonal.length > 0 ? (
          filteredPersonal.map((usuario) => (
            <div
              key={usuario._id}
              className="flex flex-col items-center w-1/4 p-4 border mb-5 border-gray-300 rounded-lg shadow-md m-2 relative"
            >
              <img
                src={usuario.perfilFoto}
                alt={usuario.nombre}
                className="w-20 h-20 rounded-full mb-2"
              />
              <h3 className="font-semibold capitalize">{usuario.nombre}</h3>
              <p className="text-sm text-gray-600 capitalize">
                Cargo: {usuario.rol}
              </p>
              <p className="text-sm text-gray-600">
                Usuario: {usuario.usuario}
              </p>
              <button
                onClick={() => handleDelete(usuario._id)}
                className="absolute bottom-4 text-lg cursor-pointer right-4 text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))
        ) : (
          <div>No hay personal registrado.</div>
        )}
      </div>
    </PrincipalLayout>
  );
};

export default Personal;
