export const validateUsuario = (usuario) => {
  // Verificar que el usuario no esté vacío y tenga una longitud mínima
  if (!usuario || usuario.length < 3) {
    return false;
  }

  // Expresión regular para validar el formato de usuario
  const regex = /^[a-zA-Z0-9._-]+$/;

  // Validar el formato del usuario
  return regex.test(usuario);
};