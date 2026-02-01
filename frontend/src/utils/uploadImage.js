import { API_PATHS, BASE_URL } from "./apiPaths";

import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);

  try {
    const response = await axiosInstance.post(
      `${BASE_URL}${API_PATHS.IMAGE.UPLOAD_IMAGE}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ocurrio un error al cargar la imagen!", error);
    throw error;
  }
};

export default uploadImage;
