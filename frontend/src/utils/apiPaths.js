//export const BASE_URL = "https://api.fupagua.org";
export const BASE_URL = "http://localhost:4000";

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTRO: "/api/v1/auth/registro",
    GET_USER_INFO: "/api/v1/auth/getUsuario",
    EDITAR_USUARIO: (id) => `/api/v1/auth/usuario/${id}`,
  },
  USUARIOS: {
    GET_PERSONAL_INFO: "/api/v1/auth/personal",
    DELETE_USER: "/api/v1/auth/personal",
  },
  PRINCIPAL: {
    GET_DATA: "/api/v1/principal",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
  DOCUMENTOS: {
    SUBIR_DOCUMENTO: "/api/v1/documentos/subir",
    OBTENER_DOCUMENTOS: "/api/v1/documentos",
    OBTENER_DOCUMENTO_INFO: (id) => `/api/v1/documentos/${id}`,
    EDITAR_DOCUMENTO: (id) => `/api/v1/documentos/editar/${id}`,
    ELIMINAR_DOCUMENTO: (id) => `/api/v1/documentos/${id}`,
    DESCARGAR_DOCUMENTO: (id) => `/api/v1/documentos/descargar/${id}`,
    RESPALDO_DOCUMENTOS: "/api/v1/documentos/respaldo",
    OBTENER_INFO_DOCUMENTOS: "/api/v1/documentos/informacion",
    REGISTRAR_ACCESO: "/api/v1/documentos/historial",
    OBTENER_HISTORIAL_ACCESO: "/api/v1/documentos/historial-acceso",
  },
};
