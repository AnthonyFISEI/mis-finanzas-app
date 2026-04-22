import axios from 'axios';

// Creamos una instancia configurada
// const api = axios.create({
//   baseURL: 'http://localhost:3000/api'
// });

const api = axios.create({
  baseURL: 'https://mis-finanzas-api-dfdo.onrender.com/api'
});

// Interceptor: Atrapa la petición ANTES de salir y le pega el Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: Si el token expiró, saca al usuario
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);

export default api;