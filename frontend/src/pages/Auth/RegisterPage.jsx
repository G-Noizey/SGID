// src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './AuthPages.css';

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar los datos en el formato que espera el backend
      const registrationData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,  // Cambiado a first_name
        last_name: userData.lastName,    // Cambiado a last_name
        rol: 'cliente',                  // Predefinido como 'cliente'
        telefono: userData.phone         // Cambiado a telefono
      };
      
      await register(registrationData);
      toast.success('¡Registro exitoso! Por favor inicia sesión');
      navigate('/login');
    } catch (error) {
      toast.error('Error en el registro: ' + (error.response?.data?.detail || 'Por favor verifica tus datos'));
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
              <h1 className="login-title">CREAR CUENTA</h1>
              <p className="login-subtitle">Completa tus datos para registrarte</p>
            </div>
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="login-label">Nombre</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Tu nombre"
                      value={userData.firstName}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      required
                      className="login-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="login-label">Apellido</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Tu apellido"
                      value={userData.lastName}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      required
                      className="login-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group>
                <Form.Label className="login-label">Usuario</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Elige un nombre de usuario"
                  value={userData.username}
                  onChange={(e) => setUserData({...userData, username: e.target.value})}
                  required
                  className="login-input"
                />
              </Form.Group>
              
              <Form.Group>
                <Form.Label className="login-label">Correo Electrónico</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="tu@email.com"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  required
                  className="login-input"
                />
              </Form.Group>
              
              <Form.Group>
                <Form.Label className="login-label">Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Crea una contraseña segura"
                  value={userData.password}
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  required
                  className="login-input"
                />
              </Form.Group>
              
              <Form.Group>
                <Form.Label className="login-label">Teléfono</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Opcional (ej. 5512345678)"
                  value={userData.phone}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  className="login-input"
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                className="login-button mt-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                REGISTRARME
              </Button>
              
              <div className="login-register-container">
                <p className="login-register-text">¿Ya tienes una cuenta?</p>
                <Button 
                  variant="outline-primary" 
                  className="login-register-button"
                  onClick={() => navigate('/login')}
                >
                  INICIAR SESIÓN
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;