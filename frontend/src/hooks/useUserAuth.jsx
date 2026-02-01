import { useContext, useEffect } from "react";
import { UsuarioContext } from "../context/UsuarioContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const useUserAuth = () => {
  const { usuario, updateUsuario, clearUsuario } = useContext(UsuarioContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) return;

    let isMounted = true;

    const fetchUsuarioInfo = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);

        if (isMounted && response.data) {
          updateUsuario(response.data);
        }
      } catch (error) {
        console.error("Fallo la autorizacion de datos!", error);
        if (isMounted) {
          clearUsuario();
          navigate("/login");
        }
      }
    };

    fetchUsuarioInfo();

    return () => {
      isMounted = false;
    };
  }, [updateUsuario, clearUsuario, navigate]);
};
