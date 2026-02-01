import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://api.fupagua.org";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Error de Servidor. Por favor intente más tarde!");
      } else {
        console.error(
          `Error: ${error.response.status} - ${error.response.data.message}`
        );
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Error, intente de nuevo!");
    } else {
      console.error("Error desconocido. Intente de nuevo.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
