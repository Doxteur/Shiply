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

function shouldDebug(): boolean {
	if (typeof window === 'undefined') return false;
	const flag = window.localStorage.getItem('debugHttp');
	return flag === '1' || flag === 'true' || process.env.NODE_ENV === 'development';
}

function maskSensitiveHeaders(headers: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
	if (!headers) return headers;
	const clone: Record<string, unknown> = { ...headers };
	const authKey = Object.keys(clone).find((k) => k.toLowerCase() === 'authorization');
	if (authKey) clone[authKey] = '******';
	return clone;
}

function generateRequestId(): string {
	return Math.random().toString(36).slice(2, 10);
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
		// Debug request
		if (shouldDebug()) {
			const id = generateRequestId();
			(config as unknown as { metadata?: { id?: string; startTime?: number } }).metadata = { id, startTime: Date.now() };
			const method = (config.method || 'get').toUpperCase();
			const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
			// eslint-disable-next-line no-console
			console.groupCollapsed(`%cHTTP ➜ ${method} ${url} [${id}]`, 'color:#0ea5e9');
			// eslint-disable-next-line no-console
			console.log('Headers', maskSensitiveHeaders(config.headers as unknown as Record<string, unknown>));
			if (config.params) {
				// eslint-disable-next-line no-console
				console.log('Params', config.params);
			}
			if (config.data !== undefined) {
				// eslint-disable-next-line no-console
				console.log('Body', config.data);
			}
			// eslint-disable-next-line no-console
			console.groupEnd();
		}
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
		if (shouldDebug()) {
			const meta = (response.config as unknown as { metadata?: { id?: string; startTime?: number } }).metadata as { id?: string; startTime?: number } | undefined;
			const id = meta?.id ?? 'n/a';
			const start = meta?.startTime ?? Date.now();
			const duration = Date.now() - start;
			const method = (response.config.method || 'get').toUpperCase();
			const url = `${response.config.baseURL ?? ''}${response.config.url ?? ''}`;
			// eslint-disable-next-line no-console
			console.groupCollapsed(`%cHTTP ⇦ ${method} ${url} [${id}] ${response.status} (${duration}ms)`, 'color:#22c55e');
			// eslint-disable-next-line no-console
			console.log('Response headers', response.headers);
			// eslint-disable-next-line no-console
			console.log('Response data', response.data);
			// eslint-disable-next-line no-console
			console.groupEnd();
		}
		return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Gérer la déconnexion ici si nécessaire
      store.dispatch({ type: 'auth/logout' });
    }
    if (shouldDebug()) {
      const cfg = error.config || {};
      const meta = (cfg as unknown as { metadata?: { id?: string; startTime?: number } }).metadata as { id?: string; startTime?: number } | undefined;
      const id = meta?.id ?? 'n/a';
      const start = meta?.startTime ?? Date.now();
      const duration = Date.now() - start;
      const method = ((cfg as unknown as { method?: string }).method || 'get').toUpperCase();
      const url = `${(cfg as unknown as { baseURL?: string }).baseURL ?? ''}${(cfg as unknown as { url?: string }).url ?? ''}`;
      const status = error.response?.status ?? 'ERR';
      // eslint-disable-next-line no-console
      console.groupCollapsed(`%cHTTP ✖ ${method} ${url} [${id}] ${status} (${duration}ms)`, 'color:#ef4444');
      // eslint-disable-next-line no-console
      if ((cfg as unknown as { params?: unknown }).params) {
        // eslint-disable-next-line no-console
        console.log('Params', (cfg as unknown as { params?: unknown }).params);
      }
      if ((cfg as unknown as { data?: unknown }).data !== undefined) {
        // eslint-disable-next-line no-console
        console.log('Body', (cfg as unknown as { data?: unknown }).data);
      }
      if (error.response) {
        // eslint-disable-next-line no-console
        console.log('Response headers', error.response.headers);
        // eslint-disable-next-line no-console
        console.log('Response data', error.response.data);
      } else if (error.request) {
        // eslint-disable-next-line no-console
        console.log('No response received');
      }
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
