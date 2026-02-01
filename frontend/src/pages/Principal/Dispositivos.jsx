import React from "react";
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import DispositivosLayout from "../../components/layouts/DispositivosLayout";

const Dispositivos = () => {
  return (
    <PrincipalLayout activeMenu="Dispositivos">
      <DispositivosLayout />
    </PrincipalLayout>
  );
};

export default Dispositivos;
