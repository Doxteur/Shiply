import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
  // Route publique (hors layout protégé)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginForm />
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
      { path: '/', element: <Home /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/new', element: <ProjectCreate /> },
      { path: '/projects/new/finalize', element: <ProjectCreateFinalize /> },
      { path: '/projects/:id', element: <ProjectDetails /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
]);
