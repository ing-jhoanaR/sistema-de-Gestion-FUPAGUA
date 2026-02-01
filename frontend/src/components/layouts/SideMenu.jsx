import React, { useContext, useState } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UsuarioContext } from "../../context/UsuarioContext";
import { useNavigate } from "react-router-dom";

const SideMenu = ({ activeMenu }) => {
  const { usuario, clearUsuario } = useContext(UsuarioContext);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      clearUsuario();
      navigate("/login");
    }, 1000);
  };

  if (!usuario) {
    return (
      <div className="w-64 h-[calc(100vh-61px)] flex items-center justify-center bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
        <p className="text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {usuario?.perfilFoto ? (
          <img
            src={usuario.perfilFoto || ""}
            alt="Foto de Perfil"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        ) : null}
        <h5 className="text-gray-950 capitalize font-medium leading-6">
          {usuario?.rol || ""}
        </h5>
      </div>
      {SIDE_MENU_DATA.map((item, index) => {
        const mostrarDocumentos = [
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

        if (item.id === "02" && !mostrarDocumentos) {
          return null;
        }

        const mostrarDispositivos =
          usuario?.rol === "vigilante" ||
          usuario?.rol === "admin" ||
          usuario?.rol === "directora";

        if (item.id === "03" && !mostrarDispositivos) {
          return null;
        }

        const mostrarMonitoreo =
          usuario?.rol === "vigilante" ||
          usuario?.rol === "admin" ||
          usuario?.rol === "directora";

        if (item.id === "04" && !mostrarMonitoreo) {
          return null;
        }

        const mostrarPersonal =
          usuario?.rol === "admin" || usuario?.rol === "directora";

        if (item.id === "07" && !mostrarPersonal) {
          return null;
        }

        return (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] transition-all duration-300 ease-in-out ${
              activeMenu === item.label ||
              (item.path === "logout" && loggingOut)
                ? "text-white bg-primary"
                : "text-gray-700 bg-white hover:bg-red-200"
            } py-3 px-6 rounded-lg mb-3 ${
              item.path === "logout" && loggingOut
                ? "cursor-not-allowed opacity-90"
                : "cursor-pointer"
            }`}
            onClick={() => handleClick(item.path)}
            disabled={item.path === "logout" && loggingOut}
          >
            {item.path === "logout" && loggingOut ? (
              <div className="flex items-center justify-center w-full gap-3">
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                Cerrando...
              </div>
            ) : (
              <>
                <item.icon className="text-xl" />
                {item.label}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SideMenu;
