import React, { useContext } from "react";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu"; 
import { UsuarioContext } from "../../context/UsuarioContext";

const DocumentosLayout = ({ children, activeMenu }) => {
  const { usuario } = useContext(UsuarioContext);

  return (
    <div className="document-layout">
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
    </div>
  );
};

export default DocumentosLayout;