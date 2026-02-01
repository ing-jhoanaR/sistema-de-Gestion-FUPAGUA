import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [mostrarClave, setMostrarClave] = useState(false);

  const cambioMostrarClave = () => {
    setMostrarClave(!mostrarClave);
  };
  return (
    <div>
      <label className="text-[13px] text-salte-800">{label}</label>

      <div className="input-box">
        <input
          type={type == "password" ? (mostrarClave ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={(e) => onChange(e)}
        />

        {type === "password" && (
          <>
            {mostrarClave ? (
              <FaRegEye
                size={22}
                className="text-primary cursor-pointer"
                onClick={() => cambioMostrarClave()}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="text-slate-400 cursor-pointer"
                onClick={() => cambioMostrarClave()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
