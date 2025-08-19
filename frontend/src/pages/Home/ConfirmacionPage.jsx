// src/pages/ConfirmacionPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "../Auth/AuthPages.css"; // reutilizamos estilos del login

const API_BASE = "http://localhost:8000/api";

const ConfirmacionPage = () => {
  const { enlace_unico } = useParams();
  const navigate = useNavigate();

  const [invitacion, setInvitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre_invitado: "",
    comentarios: "",
  });

  useEffect(() => {
    const fetchInvitacion = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/invitaciones/publicas/${enlace_unico}/`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invitación no encontrada");
        }
        const data = await response.json();
        setInvitacion(data);
        setFormData((prev) => ({
          ...prev,
          nombre_invitado: data.destinatario_nombre || "",
        }));
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvitacion();
  }, [enlace_unico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/confirmaciones/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, enlace_unico }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al confirmar asistencia");
      }
      toast.success("¡Confirmación exitosa!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="login-container d-flex align-items-center justify-content-center"
      >
        <div className="spinner-border text-primary" role="status"></div>
      </Container>
    );
  }

  if (!invitacion) {
    return (
      <Container className="login-container text-center">
        <h2 className="login-title">Error</h2>
        <p>No se encontró la invitación</p>
        <Button onClick={() => navigate("/")} className="login-button">
          Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="login-container">
      <Row className="g-0 login-card-container shadow-lg rounded">
        {/* Panel izquierdo */}
        <Col md={6} className="d-none d-md-block login-bg-panel position-relative">
          <div className="login-brand-overlay text-center text-white p-4">
            <h1 className="login-brand">{invitacion.evento.titulo}</h1>
            <p className="login-slogan">{invitacion.evento.descripcion}</p>
          </div>
        </Col>

        {/* Panel derecho */}
        <Col md={6} className="d-flex align-items-center">
          <div className="login-form-container w-100 p-4">
            <div className="text-center mb-4">
              <h1 className="login-title">Confirmar Asistencia</h1>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Nombre invitado */}
              <Form.Group className="mb-3">
                <Form.Label className="login-label">Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombre_invitado}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_invitado: e.target.value })
                  }
                  required
                  className="login-input"
                />
              </Form.Group>

              {/* Comentarios */}
              <Form.Group className="mb-4">
                <Form.Label className="login-label">Comentarios</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.comentarios}
                  onChange={(e) =>
                    setFormData({ ...formData, comentarios: e.target.value })
                  }
                  className="login-input"
                />
              </Form.Group>

              <Button type="submit" className="login-button w-100 py-2 fs-5">
                Confirmar Asistencia
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmacionPage;
