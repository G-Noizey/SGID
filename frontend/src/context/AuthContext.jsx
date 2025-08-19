// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decoded = parseJwt(accessToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setCurrentUser(decoded);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
          // Intentar refrescar el token si está expirado
          refreshToken();
        }
      } catch (error) {
        console.error('Token inválido:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      const decoded = parseJwt(access);
      setCurrentUser(decoded);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      // Almacenar ambos tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      const decoded = parseJwt(access);
      setCurrentUser(decoded);
      localStorage.setItem('user', JSON.stringify(decoded)); // guardamos user con rol
      
      return true;
    } catch (error) {
      console.error('Error en login:', error.response?.data);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register/', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        rol: 'cliente',
        telefono: userData.phone
      });
      return true;
    } catch (error) {
      console.error('Error en registro:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);   