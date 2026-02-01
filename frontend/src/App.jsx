import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Registro from "./pages/Auth/Registro";
import Principal from "./pages/Principal/Principal";
import Configuracion from "./pages/Principal/Configuracion";
import Monitoreo from "./pages/Principal/Monitoreo";
import Ayuda from "./pages/Principal/Ayuda";
import { UsuarioProvider } from "./context/UsuarioContext";
import Documentos from "./pages/Principal/Documentos";
import Dispositivos from "./pages/Principal/Dispositivos";
import Personal from "./pages/Principal/Personal";

const App = () => {
  return (
    <UsuarioProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/monitoreo" element={<Monitoreo />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/dispositivos" element={<Dispositivos />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/personal" element={<Personal />} />
        </Routes>
      </Router>
    </UsuarioProvider>
  );
};

const Root = () => {
  const esAutenticado = !!localStorage.getItem("token");

  return esAutenticado ? (
    <Navigate to="/principal" />
  ) : (
    <Navigate to="/login" />
  );
};

export default App;
