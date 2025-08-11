import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { RootState } from '@/app/store';
import { ProtectedRouteProps } from '@/components/services/auth/type';

export const AuthMiddleware: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si on est en cours de chargement, on attend
    if (loading) return;

    // Si l'authentification est requise et que l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
      // Rediriger vers la page de connexion avec l'URL de retour
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname }
      });
    }

    // Si l'authentification n'est pas requise et que l'utilisateur est connecté
    // (par exemple, rediriger un utilisateur connecté depuis la page de login)
    if (!requireAuth && isAuthenticated) {
      // Rediriger vers la page d'accueil ou la page demandée
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, requireAuth, navigate, redirectTo, location]);

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté,
  // ne pas afficher le contenu (redirection en cours)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si l'authentification n'est pas requise et que l'utilisateur est connecté,
  // ne pas afficher le contenu (redirection en cours)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

// Composant pour les routes publiques (login, register, etc.)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthMiddleware requireAuth={false}>
    {children}
  </AuthMiddleware>
);

// Composant pour les routes protégées
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthMiddleware requireAuth={true}>
    {children}
  </AuthMiddleware>
);
