// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './AuthPages.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const success = await login(credentials);
    if (success) {
      toast.success('¡Bienvenido!');

      // obtener rol del usuario actual desde AuthContext
      const user = JSON.parse(localStorage.getItem('user')); // o desde currentUser
      const rol = user?.rol;

      setTimeout(() => {
        if (rol === 'admin') {
          navigate('/admin'); // 🔹 admin va a HomeAdmin
        } else {
          navigate('/app'); // 🔹 cliente va al flujo normal
        }
      }, 1500);
    }
  } catch (error) {
    toast.error('Credenciales incorrectas');
  } finally {
    setLoading(false);
  }
};

  return (
    <Container fluid className="login-container">
      <Row className="g-0 login-card-container">
        {/* Panel izquierdo - Imagen de fondo */}
        <Col md={6} className="d-none d-md-block login-bg-panel">
          <div className="login-brand-overlay">
            <h1 className="login-brand">SGID</h1>
            <p className="login-slogan">Sistema de Gestión de Invitaciones Digitales</p>
          </div>
        </Col>

        {/* Panel derecho - Formulario */}
        <Col md={6} className="d-flex align-items-center">
          <div className="login-form-container w-100">
            <div className="text-center mb-4">
              <h1 className="login-title">BIENVENIDO</h1>
              <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
            </div>

            <Form onSubmit={handleSubmit}>

              <Form.Group>
                <Form.Label className="login-label">Usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Coloca tu nombre de usuario"
                  value={credentials.username}  // Corregido: usa credentials.username
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}  // Corregido: actualiza username
                  required
                  className="login-input"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="login-label">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Tu contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  className="login-input"
                />
              </Form.Group>

              <Button
                variant="link"
                className="login-forgot-password"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </Button>

              <Button
                variant="primary"
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                INICIAR SESIÓN
              </Button>

              <div className="login-register-container">
                <p className="login-register-text">¿No tienes una cuenta?</p>
                <Button
                  variant="outline-primary"
                  className="login-register-button"
                  onClick={() => navigate('/register')}
                >
                  REGISTRARME
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;