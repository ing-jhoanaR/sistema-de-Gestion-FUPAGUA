import React, { useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateUsuario } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { UsuarioContext } from "../../context/UsuarioContext";
import Modal from "../../components/Modal";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [claveSecreta, setClaveSecreta] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { updateUsuario } = useContext(UsuarioContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!validateUsuario(usuario)) {
      setError("Usuario inválido!");
      return;
    }

    if (!clave) {
      setError("Por favor, coloque su contraseña");
      return;
    }

    if (!rol) {
      setError("Seleccione un rol.");
      return;
    }

    if (!claveSecreta) {
      setError("Por favor, ingrese la clave secreta");
      return;
    }

    setError(null);

    try {
      const response = await axiosInstance.post(
        `${BASE_URL}${API_PATHS.AUTH.LOGIN}`,
        {
          usuario,
          clave,
          claveSecreta,
          rol,
        },
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);

        updateUsuario(user);

        localStorage.setItem("mensajeExito", "¡Sesión iniciada exitosamente!");
        navigate("/principal");
      } else {
        setError("No se recibió un token. Por favor, intente de nuevo.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(
            "Error en la respuesta del servidor. Por favor, intente más tarde.",
          );
        }
      } else if (error.request) {
        setError(
          "No se recibió respuesta del servidor. Verifique su conexión.",
        );
      } else {
        setError("Error al realizar la solicitud. " + error.message);
      }
    }
  };

  const handleAccept = async () => {
    setIsModalOpen(false);
    await handleLogin();
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-[30px] font-semibold text-black flex justify-center">
          Bienvenido!
        </h3>
        <p className="text-[14px] text-slate-700 mt-[5px] mb-6 flex justify-center">
          Introduzca sus Credenciales
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
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
            placeholder="Ingrese su Clave"
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
              <option value="">Seleccione su Cargo</option>
              <option value="terapiaOcupacional">Terapia Ocupacional</option>
              <option value="fisioterapia">Fisioterapia</option>
              <option value="psicologia">Psicología</option>
              <option value="psicopedagogía">Psicopedagogía</option>
              <option value="fonoaudiología">Fonoaudiología</option>
              <option value="aulaIntegral">Aula Integral</option>
              <option value="cultura">Cultura</option>
              <option value="nivelación">Nivelación</option>
              <option value="directora">Directora</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Iniciar Sesión
          </button>
          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        </form>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Ingrese Clave Secreta"
        >
          <Input
            value={claveSecreta}
            onChange={({ target }) => setClaveSecreta(target.value)}
            label="Clave Secreta"
            placeholder="Ingrese su Clave Secreta"
            type="password"
          />
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={handleAccept}
          >
            Aceptar
          </button>
        </Modal>
      </div>
    </AuthLayout>
  );
};

export default Login;
