import React from "react";
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import MonitoreoLayout from "../../components/layouts/MonitoreoLayout";

const Monitoreo = () => {
  return (
    <PrincipalLayout activeMenu="Monitoreo">
      <MonitoreoLayout />
    </PrincipalLayout>
  );
};

export default Monitoreo;
