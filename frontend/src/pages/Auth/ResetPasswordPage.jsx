import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`http://localhost:8000/api/auth/password-reset-confirm/${uid}/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_password: password }),
            });


            if (res.ok) {
                toast.success("Contraseña restablecida con éxito");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                toast.error("Enlace inválido o expirado");
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
                        <h2 className="text-center mb-4">Nueva contraseña</h2>
                        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <Form.Group>
                                <Form.Label className="login-label">Nueva contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Escribe tu nueva contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="login-input"
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="login-label">Confirmar contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Repite tu nueva contraseña"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
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
                                RESTABLECER CONTRASEÑA
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

export default ResetPasswordPage;
