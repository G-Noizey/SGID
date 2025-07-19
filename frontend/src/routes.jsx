// src/routes.jsx
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import HomePage from './pages/Home/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/Auth/RegisterPage';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <HomePage /> }
    ]
  }
]);

export default router;