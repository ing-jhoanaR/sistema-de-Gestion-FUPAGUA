import React, { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleCambioImagen = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("El tamaño del archivo debe ser menor a 4 MB.");
        return;
      } else {
        setError(null);
      }

      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoverImagen = () => {
    setImage(null);
    setPreviewUrl(null);
    setError(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleCambioImagen}
        className="hidden"
      />

      <p className="text-xs text-gray-600 mb-2">Tamaño máximo (4 MB).</p>
    

      {!image ? (
        <div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded-full relative">
          <LuUser className="text-3xl text-primary" />
          <button
            className="w-8 cursor-pointer h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1"
            type="button"
            onClick={onChooseFile}
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Foto de Perfil"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-red-700 text-white rounded-full absolute -bottom-1 -right-1"
            onClick={handleRemoverImagen}
          >
            <LuTrash />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ProfilePhotoSelector;
