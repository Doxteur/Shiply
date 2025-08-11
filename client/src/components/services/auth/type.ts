// Types pour l'utilisateur
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les réponses d'API
export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiErrorResponse {
  errors?: Array<{ message: string; field?: string }>;
  message?: string;
  status?: number;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Types pour les états d'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Types pour les actions Redux
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Types pour les props des composants
export interface AuthFormProps {
  onSubmit: (data: LoginFormData | RegisterFormData) => void;
  loading?: boolean;
  error?: string | null;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

// Types pour les hooks personnalisés
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Types pour les validations
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Types pour les paramètres d'URL
export interface AuthUrlParams {
  from?: string;
  token?: string;
  email?: string;
}

// Types pour les événements
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'password_reset';
  user?: User;
  timestamp: Date;
}

// Types pour les configurations
export interface AuthConfig {
  tokenKey: string;
  refreshTokenKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // en secondes
}

// Types pour les permissions et rôles
export type UserRole = 'admin' | 'user' | 'moderator';

export interface Permission {
  name: string;
  description: string;
  roles: UserRole[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Types pour les sessions
export interface UserSession {
  id: string;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  last_activity: string;
  ip_address?: string;
  user_agent?: string;
}

// Types pour les statistiques d'authentification
export interface AuthStats {
  total_users: number;
  active_sessions: number;
  failed_login_attempts: number;
  last_login: string;
}

// Types pour les notifications d'authentification
export interface AuthNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
