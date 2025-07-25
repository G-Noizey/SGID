import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
import Confirmation from './pages/Home/confirmation';
import CreateInvitation from './pages/Home/CreateInvitation';
import SendInvitation from './pages/Home/SendInvitations';
import Setting from './pages/Home/Setting';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/dashboard';

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
    element: <ProtectedRoute />, // Protege la ruta completa
    children: [
      {
        path: '',
        element: <DashboardLayout />, // Contiene AppBar + Drawer + <Outlet />
        children: [
          { index: true, element: <HomePage /> }, // /app
          { path: 'confirmaciones', element: <Confirmation /> }, // /app/confirmaciones
          { path: 'create-invitation', element: <CreateInvitation /> },
          { path: 'send-invitation', element: <SendInvitation /> },
          { path: 'setting', element: <Setting /> },
        ]
      }
    ]
  }
]);

export default router;
