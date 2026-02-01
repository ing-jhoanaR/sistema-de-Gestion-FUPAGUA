import React, { createContext, useState, useEffect } from "react";

export const UsuarioContext = createContext();

const UsuarioProvider = ({ children }) => {
  const [usuario, setUser] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);


  useEffect(() => {
    const storedUsuario = localStorage.getItem("usuario");
    if (storedUsuario) {
      const usuarioData = JSON.parse(storedUsuario);
      setUser(usuarioData);
      setUsuarioActual(usuarioData);
    }
  }, []);

  const updateUsuario = (usuarioData) => {
    setUser(usuarioData);
    setUsuarioActual(usuarioData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData)); 
  };

  const clearUsuario = () => {
    setUser(null);
    setUsuarioActual(null);
    localStorage.removeItem("usuario"); 
  };

  return (
    <UsuarioContext.Provider
      value={{ usuario, usuarioActual, updateUsuario, clearUsuario }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

export { UsuarioProvider };
