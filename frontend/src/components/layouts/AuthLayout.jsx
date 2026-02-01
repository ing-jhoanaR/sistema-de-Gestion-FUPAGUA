import React from "react";

import LoginI from "../../assets/images/logo.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-9 pb-12 ">
        <h2 className="text-lg font-medium text-black flex justify-center">
          Gestion de Datos FUPAGUA
        </h2>
        <p className="flex justify-center pt-25">{children}</p>
      </div>
      <div className="hidden md:block w-[40vw] h-screen bg-red-100 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative">
        <div className="w-48 h-48 rounded-[40px] bg-red-600 absolute -top-7 -left-5" />
        <div className="w-48 h-56 rounded-[40px] border-[20px] border-red-400 absolute top-[30%] -right-10" />
        <div className="w-48 h-48 rounded-[40px] bg-red-500 absolute -bottom-7 -left-5" />
        <img src={LoginI} className="w-64 lg:w-[40%] absolute bottom-60 shadow-lg shadow-red-300/15 left-15 " />
      </div>
    </div>
  );
};

export default AuthLayout;
