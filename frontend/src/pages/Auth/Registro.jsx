import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateUsuario } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { UsuarioContext } from "../../context/UsuarioContext";
import uploadImage from "../../utils/uploadImage";

const Registro = () => {
  const [perfilFoto, setPerfilFoto] = useState(null);
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState("");
  const [claveSecreta, setClaveSecreta] = useState("");
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const { usuarioActual } = useContext(UsuarioContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (usuarioActual?.usuario !== "jhoa15") {
  //     navigate("/principal");
  //   }
  // }, [usuarioActual, navigate]);

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!nombre || nombre.length < 6) {
      setError("Coloque un Nombre válido!");
      return;
    }
    if (!validateUsuario(usuario) || usuario.length < 5) {
      setError("El usuario debe tener al menos 5 caracteres");
      return;
    }
    if (!clave || clave.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!rol) {
      setError("Seleccione un rol.");
      return;
    }
    if (!claveSecreta || claveSecreta.length < 5) {
      setError("Elija una clave secreta mayor a 5 caracteres");
      return;
    }

    setError("");

    let perfilFotoUrl = "";

    try {
      if (perfilFoto) {
        const imgUploadRes = await uploadImage(perfilFoto);
        perfilFotoUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(
        `${BASE_URL}${API_PATHS.AUTH.REGISTRO}`,
        {
          nombre,
          usuario,
          clave,
          claveSecreta,
          rol,
          perfilFoto: perfilFotoUrl, 
        }
      );

      const { token } = response.data;
      localStorage.setItem("mensajeExito", "¡Cuenta creada exitosamente!");
      navigate("/principal");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Algo salió mal. Intente de nuevo!");
      }
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    navigate("/principal");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 md:w-[600px]">
        <h3 className="text-xl font-semibold text-black flex justify-center">
          Registro de Personal
        </h3>

        {mensajeExito && (
          <p className="text-green-500 text-xs pb-2.5">{mensajeExito}</p>
        )}
        <form onSubmit={handleRegistro}>
          <ProfilePhotoSelector
            image={perfilFoto}
            required
            setImage={setPerfilFoto}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={nombre}
              onChange={({ target }) => setNombre(target.value)}
              label="Nombre Completo"
              placeholder="Ingrese el Nombre"
              type="text"
            />
            <Input
              value={usuario}
              onChange={({ target }) => setUsuario(target.value)}
              label="Usuario"
              placeholder="Ingrese su Usuario"
              type="text"
            />
            <Input
              value={clave}
              onChange={({ target }) => setClave(target.value)}
              label="Contraseña"
              placeholder="Ingrese su Contraseña"
              type="password"
            />
            <div className="flex flex-col mt-1">
              <label className="text-sm font-medium">Cargo</label>
              <select
                value={rol}
                onChange={({ target }) => setRol(target.value)}
                className="w-full bg-transparent outline-none input-box"
                required
              >
                <option value="">Seleccione un cargo</option>
                <option value="terapiaOcupacional">Terapia Ocupacional</option>
                <option value="fisioterapia">Fisioterapia</option>
                <option value="psicologia">Psicología</option>
                <option value="psicopedagogía">Psicopedagogía</option>
                <option value="fonoaudiología">Fonoaudiología</option>
                <option value="aulaIntegral">Aula Integral</option>
                <option value="cultura">Cultura</option>
                <option value="nivelación">Nivelación</option>
                <option value="vigilante">Vigilante</option>
              </select>
            </div>
          </div>
          <div className="mt-7 mb-10">
            <Input
              value={claveSecreta}
              onChange={({ target }) => setClaveSecreta(target.value)}
              label="Clave Secreta"
              placeholder="Ingrese la clave secreta"
              type="password"
            />
            {error && <p className="text-red-500 text-xs ">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-[30%] cursor-pointer text-sm font-medium text-white bg-red-500 shadow-lg shadow-red-600/5 p-[10px] rounded-md my-1 hover:bg-red-200 hover:text-red-500 mb-2"
          >
            Registrar
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="w-[30%] cursor-pointer text-sm font-medium text-white bg-gray-500 shadow-lg shadow-gray-600/5 p-[10px] rounded-md my-1 hover:bg-gray-200 hover:text-gray-500 ml-55"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;
