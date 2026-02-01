import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UsuarioContext } from "../../context/UsuarioContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import Input from "../../components/Inputs/Input";

const Configuracion = () => {
  const { usuarioActual } = useContext(UsuarioContext);
  const [clave, setClave] = useState("");
  const [claveSecreta, setClaveSecreta] = useState("");
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuarioActual) {
      navigate("/login");
    }
  }, [usuarioActual, navigate]);

  const handleGuardarCambios = async (e) => {
    e.preventDefault();

    if (!clave || clave.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!claveSecreta || claveSecreta.length < 5) {
      setError("Elija una clave secreta mayor a 5 caracteres");
      return;
    }

    setError("");

    try {
      await axiosInstance.put(
        `${BASE_URL}${API_PATHS.AUTH.EDITAR_USUARIO(usuarioActual._id)}`,
        {
          nombre: usuarioActual.nombre,
          usuario: usuarioActual.usuario,
          clave,
          claveSecreta,
          rol: usuarioActual.rol,
          perfilFoto: usuarioActual.perfilFoto,
        }
      );

      setMensajeExito("¡Configuración actualizada exitosamente!");
      setClave("");
      setClaveSecreta("");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Algo salió mal. Intente de nuevo!");
      }
    }
  };

  return (
    <PrincipalLayout activeMenu="Configuracion">
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Configuración</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleGuardarCambios}>
            <div className="flex justify-center mb-4">
              <img
                src={usuarioActual.perfilFoto}
                alt="Perfil"
                className="w-20 h-20 rounded-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Nombre</label>
                <p className="@apply w-full flex justify-between gap-3 text-sm text-black bg-slate-100 rounded px-4 py-3 mb-4 mt-3 border border-slate-200 outline-none">
                  {usuarioActual.nombre}
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">Usuario</label>
                <p className="@apply w-full flex justify-between gap-3 text-sm text-black bg-slate-100 rounded px-4 py-3 mb-4 mt-3 border border-slate-200 outline-none">
                  {usuarioActual.usuario}
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">Cargo</label>
                <p className="@apply w-full flex justify-between gap-3 text-sm text-black capitalize bg-slate-100 rounded px-4 py-3 mb-4 mt-3 border border-slate-200 outline-none">
                  {usuarioActual.rol}
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">
                  Modificar contraseña
                </label>
                <Input
                  value={clave}
                  onChange={({ target }) => setClave(target.value)}
                  placeholder="Ingrese su nueva Contraseña"
                  type="password"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">
                  Modificar clave secreta
                </label>
                <Input
                  value={claveSecreta}
                  onChange={({ target }) => setClaveSecreta(target.value)}
                  placeholder="Ingrese su nueva clave secreta"
                  type="password"
                />
              </div>
            </div>
            <div className="mt-4">
              {error && <p className="text-red-500 text-xs">{error}</p>}
              {mensajeExito && (
                <p className="text-green-500 text-xs">{mensajeExito}</p>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="w-[20%] cursor-pointer text-sm font-medium text-white bg-red-500 shadow-lg p-[10px] rounded-md my-1 hover:bg-red-200 hover:text-red-500"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => navigate("/principal")}
                className="w-[20%] cursor-pointer text-sm font-medium text-white bg-gray-500 shadow-lg p-[10px] rounded-md my-1 hover:bg-gray-200 hover:text-gray-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </PrincipalLayout>
  );
};

export default Configuracion;
