import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from './config';
import { store } from '../store';

interface AuthToken {
  type: string;
  name: string | null;
  token: string;
  abilities: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: REACT_APP_API_URL,
  // Suppression du Content-Type par défaut pour permettre l'envoi de fichiers
});

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authToken = store.getState().auth.token as AuthToken | null;
    if (authToken?.token) {
      config.headers.Authorization = `Bearer ${authToken.token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Gérer la déconnexion ici si nécessaire
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
