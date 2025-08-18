import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/auth/password-reset/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                toast.success("Revisa tu correo para continuar");
                setEmail("");
            } else {
                toast.error("No se encontró ese correo");
            }
        } catch (error) {
            toast.error("Error al procesar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="login-container d-flex align-items-center justify-content-center">
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }}>
                    <div className="login-form-container">
                        <h2 className="text-center mb-4">Recuperar contraseña</h2>
                        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <Form.Group>
                                <Form.Label className="login-label">Correo Electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Ingresa tu correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="login-input"
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                variant="primary"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : null}
                                ENVIAR ENLACE
                            </Button>

                            <div className="text-center mt-2">
                                <Button
                                    variant="link"
                                    onClick={() => navigate("/login")}
                                    className="login-forgot-password"
                                >
                                    Regresar al inicio de sesión
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPasswordPage;
