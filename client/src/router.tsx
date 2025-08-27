import { createBrowserRouter, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import Home from '@/pages/Home';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { RootLayout } from '@/components/core/layouts/RootLayout';
import LoginForm from './components/services/auth/LoginForm';
import { ProtectedRoute, PublicRoute } from '@/components/core/middlewares/AuthMiddleware';
import Projects from '@/pages/Projects';
import ProjectCreate from '@/pages/ProjectCreate';
import ProjectCreateFinalize from '@/pages/ProjectCreateFinalize';
import ProjectDetails from '@/pages/ProjectDetails';
import ProjectRuns from '@/pages/ProjectRuns';
import RunDetails from '@/pages/RunDetails';
import Landing from '@/pages/Landing';
import RegisterForm from './components/services/auth/RegisterForm';
import type { RootState } from '@/app/store';

const LandingOrRedirect = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Landing />;
};

export const router = createBrowserRouter([
  // Route publique (hors layout protégé)
  {
    path: '/',
    element: <LandingOrRedirect />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginForm />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterForm />
      </PublicRoute>
    ),
  },
  // Espace applicatif protégé
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Home /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/new', element: <ProjectCreate /> },
      { path: '/projects/new/finalize', element: <ProjectCreateFinalize /> },
      { path: '/projects/:id', element: <ProjectDetails /> },
      { path: '/projects/:id/runs', element: <ProjectRuns /> },
      { path: '/runs/:id', element: <RunDetails /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
]);
