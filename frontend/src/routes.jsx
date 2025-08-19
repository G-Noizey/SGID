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
import Event from './pages/Home/Event';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
// Importa los nuevos componentes
import ConfirmacionPage from './pages/Home/ConfirmacionPage';
import DashboardLayoutAdmin from './layout/dashboardAdmin';
import HomeAdmin from './pages/Home/HomeAdmin';
import CreateInvitationAdmin from './pages/Home/CreateInvitationAdmin';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:uid/:token', element: <ResetPasswordPage /> },
      // Nuevas rutas públicas para confirmación
      { 
        path: 'confirmar/:enlace_unico', 
        element: <ConfirmacionPage /> 
      }
    
    ]
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'confirmaciones', element: <Confirmation /> },
          { path: 'create-invitation', element: <CreateInvitation /> },
          { path: 'send-invitation', element: <SendInvitation /> },
          { path: 'event', element: <Event /> },
          { path: 'setting', element: <Setting /> },
        ]
      }
    ]
  },
   {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayoutAdmin />,
        children: [
          { index: true, element: <HomeAdmin /> },
          { path: 'create-invitation', element: <CreateInvitationAdmin /> },
          { path: 'setting', element: <Setting /> },
        ]
      }
    ]
  }
]);

export default router;