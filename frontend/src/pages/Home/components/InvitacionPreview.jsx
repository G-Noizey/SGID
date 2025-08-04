import React from "react";

const InvitacionPreview = ({ evento, invitacion }) => {
    console.log("CONFIG DISENO:", evento.config_diseno);

    const config = evento.config_diseno || {};
    const elementos = config.elementos || [];

    const imagenBase64 = (() => {
        for (let el of elementos) {
            if (el.type === "image") {
                const content = el.content;
                if (typeof content === "object" && content.data) {
                    const tipo = content.type || "image/png";
                    const base64 = content.data;
                    if (base64.length > 100) {
                        return `data:${tipo};base64,${base64}`;
                    }
                }
                if (typeof content === "string" && content.startsWith("data:image")) {
                    return content;
                }
            }
        }
        return null;
    })();


    return (
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: 600, margin: "auto" }}>
            <h2 style={{ color: "#333" }}>Hola {invitacion.destinatario_nombre},</h2>
            <p>¡Estás invitado al siguiente evento!</p>

            <h3 style={{ color: "#2E8B57" }}>{evento.titulo}</h3>
            <p>{evento.descripcion}</p>

            {imagenBase64 && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <img src={imagenBase64} alt="Imagen del evento" style={{ maxWidth: "100%", borderRadius: 10 }} />
                </div>
            )}

            <p><strong>Fecha:</strong> {new Date(evento.fecha_evento).toLocaleDateString()}</p>
            <p><strong>Ubicación:</strong> {evento.ubicacion}</p>

            <p>Confirma tu asistencia aquí:</p>
            <div style={{ textAlign: "center", marginTop: 10 }}>
                <a
                    href={`#`}
                    style={{ backgroundColor: "#2E8B57", padding: "10px 20px", color: "#fff", borderRadius: 5, textDecoration: "none" }}
                >
                    Confirmar asistencia
                </a>
            </div>
        </div>
    );
};

export default InvitacionPreview;

