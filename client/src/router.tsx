import { createBrowserRouter } from 'react-router';
import Home from '@/pages/Home';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { RootLayout } from '@/components/core/layouts/RootLayout';
import LoginForm from './components/services/auth/LoginForm';
import { ProtectedRoute, PublicRoute } from '@/components/core/middlewares/AuthMiddleware';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Home />,
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
        path: '/about',
        element: <About />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
    ],
  },
]);
