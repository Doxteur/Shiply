import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import axiosInstance from '@/app/utils/axios';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiErrorResponse,
} from '@/components/services/auth/type';

// Thunks
export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      // Extraire le message d'erreur de la réponse de l'API
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const responseData = axiosError.response.data as ApiErrorResponse;
        if (responseData.errors && responseData.errors.length > 0) {
          // Si l'API retourne un tableau d'erreurs
          return rejectWithValue(responseData.errors[0].message);
        } else if (responseData.message) {
          // Si l'API retourne un message d'erreur direct
          return rejectWithValue(responseData.message);
        }
      }

      // Fallback sur le message d'erreur d'Axios
      if (axiosError.message) {
        return rejectWithValue(axiosError.message);
      }

      // Message par défaut
      return rejectWithValue('Une erreur est survenue');
    }
  }
);

export const register = createAsyncThunk<AuthResponse, RegisterCredentials, { rejectValue: string }>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<AuthResponse>('/auth/register', credentials);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      // Extraire le message d'erreur de la réponse de l'API
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const responseData = axiosError.response.data as ApiErrorResponse;
        if (responseData.errors && responseData.errors.length > 0) {
          // Si l'API retourne un tableau d'erreurs
          return rejectWithValue(responseData.errors[0].message);
        } else if (responseData.message) {
          // Si l'API retourne un message d'erreur direct
          return rejectWithValue(responseData.message);
        }
      }

      // Fallback sur le message d'erreur d'Axios
      if (axiosError.message) {
        return rejectWithValue(axiosError.message);
      }

      // Message par défaut
      return rejectWithValue('Une erreur est survenue');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  return null;
});

// Slice
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
