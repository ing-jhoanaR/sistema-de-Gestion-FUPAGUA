import React, { useContext, useState } from "react";
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import { UsuarioContext } from "../../context/UsuarioContext";
import { Download } from "lucide-react"; // Icono de descarga

const Ayuda = () => {
  const { usuarioActual } = useContext(UsuarioContext);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!usuarioActual) return null;

  const rolesIot = ["admin", "directora", "vigilante"];

  const faqs = [
    {
      question: "¿Cómo puedo subir un documento?",
      answer:
        "Para subir un documento, ve a la sección 'Documentos' y haz clic en el botón 'Subir Documento'. Asegúrate de llenar todos los campos requeridos.",
      iotOnly: false,
      docOnly: true,
    },
    {
      question: "¿Qué tipos de documentos puedo cargar?",
      answer:
        "Puedes cargar documentos en formatos PDF, WORD, EXCEL, JPG, PNG, JPEG. Asegúrate de que el tamaño del archivo no supere los 10 MB.",
      iotOnly: false,
      docOnly: true,
    },
    {
      question: "¿Cómo puedo Editar o Descargar un documento?",
      answer:
        "Para hacer alguna de estas acciones en un documento, dirígete a la lista de documentos, encuentra el documento donde deseas realizar la acción y haz clic en el icono correspondiente.",
      iotOnly: false,
      docOnly: true,
    },
    {
      question: "¿Cómo hacer respaldo de los documentos?",
      answer:
        "Para hacer un respaldo de los documentos, dirígete a la sección 'Documentos' y haz clic en el botón ubicado en la esquina superior derecha 'Hacer Respaldo'.",
      iotOnly: false,
      docOnly: true,
    },
    {
      question: "¿Cómo saber la estadística de los documentos?",
      answer:
        "Para ver la estadística detallada de los documentos dentro del sistema, revisa el panel principal donde se muestran tres gráficos distintos: uno por Tipo, otro por Clasificación y el último por Sensibilidad de los documentos.",
      iotOnly: false,
      docOnly: true,
    },
    {
      question: "¿Cómo funciona el monitoreo de dispositivos IoT?",
      answer:
        "El sistema de monitoreo de dispositivos IoT permite visualizar en tiempo real el estado de cada dispositivo registrado. Los datos se muestran en gráficos interactivos y alertas semanales para facilitar su análisis.",
      iotOnly: true,
    },
    {
      question: "¿Qué debo hacer si un dispositivo IoT deja de enviar datos?",
      answer:
        "Primero revisa si el dispositivo está encendido y conectado a la red. Si el problema persiste, revisa las alertas del sistema o comunícate con el administrador.",
      iotOnly: true,
    },
    {
      question: "¿Cómo puedo registrar o editar un dispositivo IoT?",
      answer:
        "Accede al módulo de 'Dispositivos IoT' desde el menú principal. Allí podrás registrar nuevos dispositivos, editar información existente o desactivar aquellos que ya no están en uso.",
      iotOnly: true,
    },
    {
      question: "¿Quiénes pueden ver los gráficos de monitoreo?",
      answer:
        "Admin, Directora y Vigilantes pueden acceder a los gráficos de monitoreo desde el panel principal.",
      iotOnly: true,
    },
  ];

  return (
    <PrincipalLayout activeMenu="Ayuda">
      <div className="p-5 flex flex-col items-center relative w-full">
        {/* Botón Manual de Usuario */}
        <div className="absolute top-5 right-5">
          <a
            href="/manual_usuario.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Manual de Usuario
          </a>
        </div>

        <h1 className="text-2xl font-sans mt-5 mb-4">Ayuda</h1>
        <p className="mb-4 text-center">
          Bienvenido a la sección de ayuda. Aquí encontrarás información útil
          para utilizar el Software.
        </p>
        <h2 className="text-xl font-light mb-2">Preguntas Frecuentes</h2>

        <div className="flex flex-wrap justify-center w-full">
          {faqs
            .filter((item) => {
              if (item.iotOnly && !rolesIot.includes(usuarioActual.rol))
                return false;
              if (item.docOnly && usuarioActual.rol === "vigilante")
                return false;
              return true;
            })
            .map((item, index) => (
              <div key={index} className="mb-4 w-[70%] p-2">
                <div className="border border-gray-300 rounded-lg shadow-md">
                  <h3
                    className="font-medium cursor-pointer bg-gray-100 p-3 rounded-t-lg"
                    onClick={() => toggleSection(index)}
                  >
                    {item.question}
                  </h3>
                  {openIndex === index && (
                    <p className="p-3 border-t border-gray-300 bg-white rounded-b-lg">
                      {item.answer}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </PrincipalLayout>
  );
};

export default Ayuda;
