import React, { useContext, useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { UsuarioContext } from "../../context/UsuarioContext";

const PrincipalLayout = ({ children, activeMenu }) => {
  const { usuario } = useContext(UsuarioContext);
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timeoutRef = useRef(null);
  const countdownRef = useRef(null);

  const INACTIVITY_LIMIT = 24000000;

  const resetInactivityTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(30); // Reiniciar contador cuando aparece el modal
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    if (usuario) {
      resetInactivityTimer();

      const events = ["mousemove", "mousedown", "keypress", "touchstart"];
      const handleActivity = () => {
        resetInactivityTimer();
      };

      events.forEach((event) => window.addEventListener(event, handleActivity));

      return () => {
        clearTimeout(timeoutRef.current);
        events.forEach((event) =>
          window.removeEventListener(event, handleActivity)
        );
      };
    }
  }, [usuario]);

  useEffect(() => {
    if (showModal) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownRef.current);
            cerrarSesion(); // Cerrar sesión automáticamente
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }

    return () => clearInterval(countdownRef.current);
  }, [showModal]);

  const mantenerSesion = () => {
    setShowModal(false);
    setCountdown(30);
    resetInactivityTimer();
  };

  const cerrarSesion = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    setTimeout(() => {
      // Limpiar token de sesión
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Redirigir al login
      window.location.href = "/login";
    }, 800);
  };

  return (
    <div className="principal-layout">
      <Navbar activeMenu={activeMenu} />

      {usuario ? (
        <div className="flex">
          <div className="hidden md:block">
            <SideMenu activeMenu={activeMenu} />
          </div>
          <div className="content grow mx-5">{children}</div>
        </div>
      ) : (
        <div className="text-center mt-5">
          <p>Por favor, espere.</p>
        </div>
      )}

      {/* Modal de inactividad */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 transform transition-all duration-300 animate-fade-in text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-indigo-50 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              ¿Deseas mantener tu sesión activa?
            </h2>

            <p className="text-gray-500 mb-6">
              Tu sesión se cerrará automáticamente en{" "}
              <span className="text-red-600 font-bold">{countdown}</span>{" "}
              segundos.
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
              <button
                onClick={mantenerSesion}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
              >
                Sí, continuar
              </button>

              <button
                onClick={cerrarSesion}
                className="px-6 py-3 bg-transparent text-gray-500 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-30 relative overflow-hidden"
                disabled={isLoggingOut}
              >
                <span
                  className={`transition-opacity duration-200 ${
                    isLoggingOut ? "opacity-0" : "opacity-100"
                  }`}
                >
                  No, cerrar sesión
                </span>

                {isLoggingOut && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalLayout;
