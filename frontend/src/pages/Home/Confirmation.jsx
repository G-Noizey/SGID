// src/pages/Confirmation.jsx
import { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getConfirmaciones } from "../../services/confirmacionesService";

const Confirmation = () => {
  const [confirmaciones, setConfirmaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conteoEventos, setConteoEventos] = useState({}); // para conteo por evento

  useEffect(() => {
    const fetchConfirmaciones = async () => {
      try {
        const response = await getConfirmaciones();
        console.log("Respuesta API:", response.data);

        if (response.data && Array.isArray(response.data.results)) {
          setConfirmaciones(response.data.results);

          // Contar asistentes por evento
          const conteo = {};
          response.data.results.forEach((c) => {
            const eventoId = c.evento?.id;
            if (!eventoId) return;
            if (!conteo[eventoId]) conteo[eventoId] = 0;
            conteo[eventoId] += 1; // sumamos cada invitado
          });
          setConteoEventos(conteo);
        } else {
          setConfirmaciones([]);
        }
      } catch (err) {
        console.error("Error cargando confirmaciones:", err);
        setError("No se pudieron cargar las confirmaciones.");
        setConfirmaciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmaciones();
  }, []);

  return (
    <Box sx={{ backgroundColor: "var(--beige-light)", padding: 3, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "var(--beige-dark)" }}>
          Confirmación de Asistencia
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Visualiza las confirmaciones recibidas para tus eventos.
        </Typography>

        {loading && <Typography>Cargando confirmaciones...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Grid container spacing={3}>
            {confirmaciones.length > 0 ? (
              confirmaciones.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c.id}>
                  <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: "green" }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Invitado: {c.nombre_invitado}
                    </Typography>
                    {/* Eliminamos la línea de acompañantes */}
                    <Typography variant="body2">Evento: {c.evento?.titulo}</Typography>
                    <Typography variant="body2">
                      Total asistentes a este evento: {c.evento?.id ? conteoEventos[c.evento.id] : 1}
                    </Typography>
                    <Typography variant="body2">
                      Fecha: {c.evento?.fecha_evento ? new Date(c.evento.fecha_evento).toLocaleString() : "No disponible"}
                    </Typography>
                    <Typography variant="body2">
                      Ubicación: {c.evento?.ubicacion || "No disponible"}
                    </Typography>
                    <Typography variant="body2">Comentarios: {c.comentarios || "—"}</Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No hay confirmaciones disponibles.
              </Typography>
            )}
          </Grid>
        )}
      </motion.div>
    </Box>
  );
};

export default Confirmation;
