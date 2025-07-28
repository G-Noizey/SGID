export const getCurrentUserId = () => {
  // Obtener usuario de localStorage o contexto
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    return user.id;
  }
  return null;
};