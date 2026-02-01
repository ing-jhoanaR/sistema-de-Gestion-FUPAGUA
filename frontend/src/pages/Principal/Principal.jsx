import React, { useState, useEffect, useContext, useRef } from "react";
import { DateTime } from "luxon";
import PrincipalLayout from "../../components/layouts/PrincipalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faFileExcel,
  faFilePdf,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { UsuarioContext } from "../../context/UsuarioContext";
import { Bar, Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { toast, ToastContainer } from "react-toastify";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const Principal = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { usuario, clearUsuario } = useContext(UsuarioContext);
  const { usuarioActual } = useContext(UsuarioContext);
  const [principalData, setPrincipalData] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [salidaMarcada, setSalidaMarcada] = useState(false);
  const fechaHoy = DateTime.now().toFormat("yyyyLLdd"); // Formato YYYYMMDD
  const claveLocal = `salidaMarcada_${fechaHoy}`;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [tipoReporte, setTipoReporte] = useState(null);

  const alertasRef = useRef(null);

  const fetchPrincipalData = async () => {
    if (cargando) return;

    setCargando(true);

    try {
      const response = await axiosInstance.get(
        `${BASE_URL}${API_PATHS.PRINCIPAL.GET_DATA}`,
      );

      if (response.data) {
        setPrincipalData(response.data);
      }
    } catch (error) {
      console.log("Algo salió mal. Intente de nuevo!", error);
    } finally {
      setCargando(false);
    }
  };

  const pdfTemplateBufferRef = useRef(null);

  useEffect(() => {
    fetchPrincipalData();

    const mensaje = localStorage.getItem("mensajeExito");
    if (mensaje) {
      setMensajeExito(mensaje);
      localStorage.removeItem("mensajeExito");
    }

    const precargarPdf = async () => {
      if (!pdfTemplateBufferRef.current) {
        const res = await fetch("/formato.pdf");
        pdfTemplateBufferRef.current = await res.arrayBuffer();
      }
    };

    precargarPdf();
  }, []);
  const horaActual = DateTime.now()
    .setLocale("es")
    .toFormat("cccc, dd LLLL yyyy, hh:mm a");
  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generarExcel = async () => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}${API_PATHS.DOCUMENTOS.OBTENER_HISTORIAL_ACCESO}`,
      );

      const historialAcceso = response.data.map((item) => ({
        Usuario: capitalizeFirstLetter(item.usuario.nombre),
        Cargo: capitalizeFirstLetter(item.usuario.rol),
        Nombre_Documento: item.documento
          ? capitalizeFirstLetter(item.documento.nombreArchivo)
          : "Documento Eliminado",
        Tipo_Documento: item.documento
          ? capitalizeFirstLetter(item.documento.tipo)
          : "Documento Eliminado",
        Acción: capitalizeFirstLetter(item.accion),
        Fecha: capitalizeFirstLetter(
          DateTime.fromISO(item.fecha).isValid
            ? DateTime.fromISO(item.fecha)
                .setLocale("es")
                .toFormat("cccc, dd LLLL yyyy")
            : "Fecha inválida",
        ),
      }));

      const worksheet = XLSX.utils.json_to_sheet(historialAcceso);

      const columnWidths = [
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 15 },
        { wch: 30 },
      ];
      worksheet["!cols"] = columnWidths;

      for (let cell in worksheet) {
        if (cell[0] === "!") continue;
        worksheet[cell].s = {
          font: {
            bold: true,
          },
        };
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historial de Acceso");

      const fechaReporte = DateTime.now()
        .setLocale("es")
        .toFormat("yyyy-MM-dd");
      const nombreArchivo = `Historial_Acceso_Documentos_${fechaReporte}.xlsx`;

      XLSX.writeFile(workbook, nombreArchivo);
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  };

  const clasificacionData = {
    labels: Object.keys(principalData?.clasificaciones || {}),
    datasets: [
      {
        label: "Clasificación",
        data: Object.values(principalData?.clasificaciones || {}),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const tipoData = {
    labels: Object.keys(principalData?.tipos || {}),
    datasets: [
      {
        label: "Tipo",
        data: Object.values(principalData?.tipos || {}),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const sensibilidadData = {
    labels: Object.keys(principalData?.sensibilidades || {}),
    datasets: [
      {
        label: "Sensibilidad",
        data: Object.values(principalData?.sensibilidades || {}),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const puedeVerGraficos =
    usuarioActual &&
    [
      "admin",
      "terapiaOcupacional",
      "fisioterapia",
      "psicologia",
      "psicopedagogía",
      "fonoaudiología",
      "aulaIntegral",
      "cultura",
      "nivelación",
      "directora",
    ].includes(usuarioActual.rol);
  const dispositivosData = {
    labels: ["Activos", "En Mantenimiento", "Fuera de Servicio"],
    datasets: [
      {
        label: "Estado de Dispositivos",
        data: [25, 5, 3],
        backgroundColor: [
          "rgba(34,197,94,0.7)",
          "rgba(251,191,36,0.7)",
          "rgba(239,68,68,0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const semanas = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const alertasData = {
    labels: semanas,
    datasets: [
      {
        label: `Alertas - Mes ${selectedMonth}`,
        data: [5, 8, 3, 6],
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  const generarReportePDF = async (tipo) => {
    if (!pdfTemplateBufferRef.current) {
      toast.error("El template PDF no está cargado todavía");
      return;
    }

    const pdfDoc = await PDFDocument.load(pdfTemplateBufferRef.current);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fecha = DateTime.now()
      .setLocale("es")
      .toFormat("dd 'de' LLLL 'de' yyyy");
    const fechaCorta = DateTime.now().toFormat("dd/MM/yyyy");

    const titulo =
      tipo === "diario"
        ? "Reporte Diario de Alertas"
        : tipo === "semanal"
          ? "Reporte Semanal de Alertas"
          : "Reporte Mensual de Alertas";

    let cantidadAlertas =
      tipo === "mensual" ? 20 : tipo === "semanal" ? 15 : 10;

    const alertasSimuladas = Array.from({ length: cantidadAlertas }).map(
      (_, i) => ({
        dispositivo: `Cámara IoT #${(i % 3) + 1}`,
        incidencia:
          i % 3 === 0
            ? "Movimiento detectado"
            : i % 3 === 1
              ? "Puerta abierta"
              : "Cámara inactiva",
        hora: `${8 + (i % 12)}:0${i % 6}`,
        nombre: `Jose Gil`,
      }),
    );

    const drawCenteredText = (
      text,
      y,
      fontSize,
      page,
      color = rgb(0, 0, 0),
    ) => {
      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (page.getWidth() - textWidth) / 2,
        y,
        size: fontSize,
        font: helveticaFont,
        color,
      });
    };

    let page = pdfDoc.getPage(0);
    let { width } = page.getSize();

    // Baja el título para que no interfiera y fecha arriba
    drawCenteredText(
      `Fecha del reporte: ${fecha}`,
      650,
      12,
      page,
      rgb(0.1, 0.1, 0.1),
    );
    drawCenteredText(titulo, 620, 16, page);

    // TABLA
    let y = 590;
    const rowHeight = 20;

    const colWidths = [100, 120, 110, 90];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = (width - tableWidth) / 2;

    const drawRow = (data, yPos, isHeader = false, pageRef) => {
      const fontSize = isHeader ? 11 : 10;
      let x = startX;

      for (let i = 0; i < data.length; i++) {
        const cellText = data[i];
        const cellWidth = colWidths[i];
        const textWidth = helveticaFont.widthOfTextAtSize(cellText, fontSize);
        const textX = x + (cellWidth - textWidth) / 2;

        pageRef.drawText(cellText, {
          x: textX,
          y: yPos + 5,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        x += cellWidth;
      }

      // Dibujar bordes de tabla
      pageRef.drawLine({
        start: { x: startX, y: yPos },
        end: { x: startX + tableWidth, y: yPos },
        thickness: 0.5,
      });
      pageRef.drawLine({
        start: { x: startX, y: yPos + rowHeight },
        end: { x: startX + tableWidth, y: yPos + rowHeight },
        thickness: 0.5,
      });
      x = startX;
      for (let w of colWidths) {
        pageRef.drawLine({
          start: { x, y: yPos },
          end: { x, y: yPos + rowHeight },
          thickness: 0.5,
        });
        x += w;
      }
      pageRef.drawLine({
        start: { x, y: yPos },
        end: { x, y: yPos + rowHeight },
        thickness: 0.5,
      });
    };

    // Encabezado
    drawRow(
      ["Dispositivo", "Incidencia", "Hora / Fecha", "Vigilante"],
      y,
      true,
      page,
    );
    y -= rowHeight;

    for (const alerta of alertasSimuladas) {
      if (y < 50) {
        page = pdfDoc.addPage();
        width = page.getSize().width;
        y = 750;

        drawRow(
          ["Dispositivo", "Incidencia", "Hora / Fecha", "Vigilante"],
          y,
          true,
          page,
        );
        y -= rowHeight;
      }

      drawRow(
        [
          alerta.dispositivo,
          alerta.incidencia,
          `${alerta.hora} / ${fechaCorta}`,
          alerta.nombre,
        ],
        y,
        false,
        page,
      );
      y -= rowHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Mostrar toast primero
    toast.success("Reporte generado correctamente.");

    // Esperar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Descargar archivo después de la espera
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Alertas_${tipo}_${DateTime.now().toFormat(
      "yyyyLLdd",
    )}.pdf`;
    link.click();

    setModalAbierto(false);
    setTipoReporte(null);
  };

  const handleMarcarSalida = async () => {
    const salidaGuardada = localStorage.getItem(claveLocal);
    if (salidaMarcada || salidaGuardada === "true") {
      toast.info("La salida ya fue marcada anteriormente.");
      setSalidaMarcada(true);
      return;
    }

    if (!pdfTemplateBufferRef.current) {
      toast.error("El template PDF no está cargado todavía");
      return;
    }

    // Carga el template PDF
    const pdfDoc = await PDFDocument.load(pdfTemplateBufferRef.current);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fecha = DateTime.now()
      .setLocale("es")
      .toFormat("dd 'de' LLLL 'de' yyyy");
    const fechaHoy = DateTime.now().toFormat("yyyyLLdd");
    const nombreVigilante = usuarioActual?.nombre || "Vigilante";

    // Datos extra para el reporte
    const numeroDispositivos = 5;
    const supervisor = "Carlos Mendoza";
    const resumenTurno = "Turno sin incidentes, monitoreo continuo y activo.";
    const parrafoExtra =
      "Este informe refleja el estado actual de la seguridad, garantizando la tranquilidad de la institución y el cumplimiento estricto de los protocolos establecidos para el correcto funcionamiento y protección del entorno.";

    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();
    const margin = 80;
    const maxWidth = width - margin * 2;
    const fontSizeTitle = 18;
    const fontSizeText = 12;

    let cursorY = height - 200;

    // Función simple para dibujar texto centrado con maxWidth, salto de línea automático
    const drawParagraphCentered = (text, y, fontSize = 12, lineHeight = 16) => {
      // Calcular X para centrar el bloque de texto
      const textWidth = maxWidth; // Forzar ancho máximo para auto wrap
      const x = margin;

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font: helveticaFont,
        maxWidth: textWidth,
        lineHeight,
        color: rgb(0, 0, 0),
      });

      // Calcular número aproximado de líneas (simple división)
      const avgCharWidth = helveticaFont.widthOfTextAtSize("M", fontSize); // promedio ancho char
      const approxCharsPerLine = Math.floor(textWidth / avgCharWidth);
      const lines = Math.ceil(text.length / approxCharsPerLine);

      return y - lines * lineHeight - 10; // nuevo cursor Y con margen
    };

    // Dibuja título centrado manualmente (centramos por ancho del texto)
    const title = "Informe Diario de Vigilancia";
    const titleWidth = helveticaFont.widthOfTextAtSize(title, fontSizeTitle);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: cursorY,
      size: fontSizeTitle,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= 50;

    // Párrafos
    cursorY = drawParagraphCentered(
      `El día ${fecha}, en la institución FUPAGUA no se presentaron incidentes durante el turno. Esto se confirmó gracias al monitoreo activo y continuo de los dispositivos de vigilancia instalados.`,
      cursorY,
      fontSizeText,
    );

    cursorY = drawParagraphCentered(
      `Número de dispositivos activos: ${numeroDispositivos}.`,
      cursorY,
      fontSizeText,
    );

    cursorY = drawParagraphCentered(
      `Resumen del turno: ${resumenTurno}.`,
      cursorY,
      fontSizeText,
    );

    cursorY = drawParagraphCentered(parrafoExtra, cursorY, fontSizeText);

    // Información final centrada
    const footer1 = `Generado por: ${nombreVigilante}`;
    const footer2 = `Fecha de creación: ${fecha}`;

    const footer1Width = helveticaFont.widthOfTextAtSize(footer1, fontSizeText);
    page.drawText(footer1, {
      x: (width - footer1Width) / 2,
      y: cursorY,
      size: fontSizeText,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= 25;

    const footer2Width = helveticaFont.widthOfTextAtSize(footer2, fontSizeText);
    page.drawText(footer2, {
      x: (width - footer2Width) / 2,
      y: cursorY,
      size: fontSizeText,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Guarda y descarga el PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Informe_Salida_${nombreVigilante.replace(
      /\s+/g,
      "_",
    )}_${fechaHoy}.pdf`;
    link.click();

    URL.revokeObjectURL(url);

    // Actualiza estados y almacenamiento local
    setSalidaMarcada(true);
    localStorage.setItem(claveLocal, "true");
    toast.success("Salida marcada correctamente.");
    setModalAbierto(true);
  };

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    // Simular proceso de cierre de sesión con 1 segundo de delay
    setTimeout(() => {
      localStorage.clear();
      clearUsuario();
      navigate("/login");
    }, 1000);
  };

  return (
    <PrincipalLayout activeMenu="Principal">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center my-5 mx-auto">
        {usuarioActual && (
          <div className="text-lg capitalize text-slate-600 font-medium mr-4">
            ¡Buen Día! {usuario.nombre}
            <div className="text-sm text-slate-500 capitalize">
              {horaActual}
            </div>
          </div>
        )}
        {usuarioActual &&
          ["admin", "directora", "vigilante"].includes(usuarioActual.rol) && (
            <div className="">
              {["admin", "directora"].includes(usuarioActual.rol) && (
                <>
                  <button
                    className="text-sm font-medium text-green-500 bg-white shadow-lg shadow-green-600/5 p-[10px] rounded-md my-1 mr-2 border hover:text-white hover:bg-green-400 cursor-pointer"
                    onClick={generarExcel}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="mr-1" />
                    Historial de Acceso
                  </button>
                  <>
                    <button
                      className="text-sm font-medium px-4 cursor-pointer text-red-500 bg-white shadow-md p-2 rounded-md my-1 border hover:text-white hover:bg-red-400"
                      onClick={() => setModalAbierto(true)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                      Reporte Alertas
                    </button>

                    {modalAbierto && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/10 transition-all">
                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-md w-full p-8 mx-4 text-center animate-fade-in">
                          <h2 className="text-3xl font-bold text-gray-800 mb-6">
                            Seleccione tipo de reporte
                          </h2>

                          <div className="flex flex-col gap-4">
                            {["diario", "semanal", "mensual"].map((tipo) => (
                              <button
                                key={tipo}
                                onClick={() => generarReportePDF(tipo)}
                                className="bg-gradient-to-r cursor-pointer from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:scale-105"
                              >
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                              </button>
                            ))}

                            <button
                              onClick={() => setModalAbierto(false)}
                              className="mt-6 cursor-pointer text-gray-700 hover:text-gray-900 font-medium underline transition duration-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                </>
              )}

              {/* Botón exclusivo para vigilantes */}
              {["vigilante"].includes(usuarioActual.rol) && (
                <>
                  <button
                    className={`text-sm font-medium px-4 cursor-pointer text-blue-500 bg-white shadow-md p-2 rounded-md border ml-2 ${
                      salidaMarcada
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-white hover:bg-blue-500"
                    }`}
                    onClick={handleMarcarSalida}
                    disabled={salidaMarcada}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                    Marcar salida
                  </button>

                  {/* Modal */}
                  {modalAbierto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-white rounded-lg shadow-lg max-w-md p-8 mx-4 text-center">
                        <h2 className="text-3xl font-semibold mb-6">
                          ¡Gracias!
                        </h2>
                        <p className="mb-8 text-gray-700 text-lg">
                          Has marcado tu hora de salida exitosamente. Por favor,
                          cierra sesión para proteger tu cuenta.
                        </p>
                        <button
                          onClick={() => handleClick("logout")}
                          disabled={loggingOut}
                          className={`bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-semibold text-lg ${
                            loggingOut
                              ? "cursor-not-allowed opacity-90"
                              : "cursor-pointer"
                          }`}
                        >
                          {loggingOut ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Cerrando...
                            </div>
                          ) : (
                            "Cerrar sesión"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
      </div>

      {mensajeExito && (
        <div className="text-green-500 text-sm mb-4">{mensajeExito}</div>
      )}

      {principalData && puedeVerGraficos && (
        <div>
          <h1 className="text-center text-lg font-semibold text-slate-600 mb-10">
            Historias Clinicas
          </h1>
          <div className="flex justify-around">
            <div
              className="w-1/3"
              style={{ maxWidth: "300px", height: "300px" }}
            >
              <h2 className="text-lg mb-4 font-medium">Por Clasificación</h2>
              <Bar
                data={clasificacionData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div
              className="w-1/3"
              style={{ maxWidth: "300px", height: "300px" }}
            >
              <h2 className="text-lg font-medium mb-4">Por Tipo</h2>
              <Bar
                data={tipoData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div
              className="w-1/3"
              style={{ maxWidth: "300px", height: "300px" }}
            >
              <h2 className="text-lg font-medium mb-4">Por Sensibilidad</h2>
              <Bar
                data={sensibilidadData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      )}
      {/* {dispositivosData &&
        usuarioActual &&
        ["admin", "directora", "vigilante"].includes(usuarioActual.rol) && (
          <div className="mt-12">
            <h1 className="text-center text-lg font-semibold text-slate-600 mb-10">
              Dispositivos y Alertas
            </h1>
            <div className="flex flex-wrap justify-center gap-6">
              
              <div
                className="bg-white p-6 rounded-xl shadow-md"
                style={{ width: "100%", maxWidth: "450px", height: "450px" }}
              >
                <h2 className="text-lg font-medium mb-4 text-center">
                  Estado de Dispositivos IoT
                </h2>
                <div className="w-full h-[350px]">
                  <Doughnut
                    data={dispositivosData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        animateScale: true,
                        animateRotate: true,
                      },
                    }}
                  />
                </div>
              </div>

              
              <div
                className="bg-white p-6 rounded-xl shadow-md"
                style={{ width: "100%", maxWidth: "450px", height: "450px" }}
                ref={alertasRef}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium">Alertas Semanales</h2>
                  <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {DateTime.fromObject({ month: index + 1 })
                          .setLocale("es")
                          .toFormat("LLLL")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full h-[350px]">
                  <Bar
                    data={alertasData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 1000,
                        easing: "easeOutBounce",
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )} */}
    </PrincipalLayout>
  );
};

export default Principal;
