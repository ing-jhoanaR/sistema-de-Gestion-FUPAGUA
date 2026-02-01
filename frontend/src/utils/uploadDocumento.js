import { API_PATHS, BASE_URL } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadDocumento = async (formData) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}${API_PATHS.DOCUMENTOS.SUBIR_DOCUMENTO}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ocurrió un error al cargar el documento!", error);
    throw error;
  }
};

export default uploadDocumento;
