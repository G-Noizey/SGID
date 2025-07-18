// src/pages/Home/HomePage.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Container, Button, Card } from 'react-bootstrap';

const HomePage = () => {
  const { currentUser, logout } = useAuth();

  return (
    <Container className="py-4">
      <Card className="border-0 shadow">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0 text-beige-dark">
              Bienvenido, {currentUser?.first_name || currentUser?.username}
            </h1>
            <Button 
              variant="outline-beige" 
              className="text-beige-dark border-beige-dark"
              onClick={logout}
            >
              Cerrar Sesión
            </Button>
          </div>
          
          <Card className="bg-beige-light border-0">
            <Card.Body>
              <h3 className="text-beige-dark">Tu Panel de Control</h3>
              <p className="text-muted">
                Aquí podrás gestionar tus eventos, invitaciones y confirmaciones.
                Pronto tendrás acceso a todas las funciones.
              </p>
              
              <div className="d-grid gap-3 mt-4">
                <Button variant="beige-primary" disabled>
                  Mis Eventos
                </Button>
                <Button variant="beige-primary" disabled>
                  Crear Nuevo Evento
                </Button>
                <Button variant="beige-primary" disabled>
                  Plantillas de Invitación
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HomePage;