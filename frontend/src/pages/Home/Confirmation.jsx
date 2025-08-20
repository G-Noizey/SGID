// src/pages/Confirmation.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  Skeleton,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import EventIcon from "@mui/icons-material/Event";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getConfirmaciones } from "../../services/confirmacionesService";

const MotionBox = motion(Box);

function formatDate(dateStr) {
  if (!dateStr) return "Fecha no disponible";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => (p[0] || "").toUpperCase()).join("");
}

export default function Confirmation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getConfirmaciones();
        const results = Array.isArray(resp?.data?.results)
          ? resp.data.results
          : Array.isArray(resp?.data)
          ? resp.data
          : [];


        const grouped = results.reduce((acc, c) => {
          const ev = c?.evento;
          const evId = ev?.id;
          if (!evId) return acc;
          if (!acc[evId]) acc[evId] = { evento: ev, confirmaciones: [] };
          acc[evId].confirmaciones.push(c);
          return acc;
        }, {});


        const sorted = Object.values(grouped).sort((a, b) => {
          const da = new Date(a.evento?.fecha_evento || 0).getTime();
          const db = new Date(b.evento?.fecha_evento || 0).getTime();
          return db - da;
        });

        setEvents(sorted);
      } catch (e) {
        console.error("Error cargando confirmaciones:", e);
        setError("No se pudieron cargar las confirmaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <Card sx={{ borderRadius: 4, p: 2 }}>
                <Skeleton variant="text" width={260} height={38} />
                <Skeleton variant="text" width={200} />
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ my: 2, borderRadius: 2 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!events.length)
      return (
        <Alert severity="info">
          Aún no hay confirmaciones registradas.
        </Alert>
      );

    return (
      <Grid container spacing={3}>
        {events.map(({ evento, confirmaciones }) => {

          const asistentes = [
            ...new Set(
              confirmaciones
                .map((c) => (c?.nombre_invitado || "").trim())
                .filter(Boolean)
            ),
          ];


          const comentarios = confirmaciones
            .map((c) => ({
              id: c.id,
              nombre: c?.nombre_invitado || "Invitado",
              texto: c?.comentarios || "",
            }))
            .sort((a, b) => (b.texto ? 1 : 0) - (a.texto ? 1 : 0));

          return (
            <Grid item xs={12} key={evento?.id || Math.random()}>
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                    border: "1px solid rgba(255,255,255,.6)",
                    background:
                      "linear-gradient(180deg, #ffffff, #fbfbfd 60%)",
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: "var(--beige-primary, #8d6e63)",
                          width: 44,
                          height: 44,
                        }}
                      >
                        <EventIcon />
                      </Avatar>
                    }
                    title={
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: "#6b4e34" }}
                      >
                        {evento?.titulo || "Evento sin título"}
                      </Typography>
                    }
                    subheader={
                      <Stack
                        direction="row"
                        spacing={2}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 0.5 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ScheduleIcon fontSize="small" />
                          <Typography variant="body2">
                            {formatDate(evento?.fecha_evento)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PlaceIcon fontSize="small" />
                          <Typography variant="body2">
                            {evento?.ubicacion || "Ubicación no disponible"}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PeopleAltIcon fontSize="small" />
                          <Typography variant="body2">
                            {asistentes.length} asistente
                            {asistentes.length === 1 ? "" : "s"}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                    sx={{ pb: 0, pt: 2.5 }}
                  />

                  <CardContent sx={{ pt: 2 }}>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="overline"
                        sx={{ color: "#7a5d3b", letterSpacing: 1 }}
                      >
                        Asistentes
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1 }}
                      >
                        {asistentes.length ? (
                          asistentes.map((name) => (
                            <Chip
                              key={name}
                              avatar={
                                <Avatar
                                  sx={{ bgcolor: "#efebe9", color: "#6b4e34" }}
                                >
                                  {initials(name)}
                                </Avatar>
                              }
                              label={name}
                              variant="outlined"
                              sx={{
                                borderColor: "#e0d7cf",
                                "& .MuiChip-label": { fontWeight: 600 },
                              }}
                            />
                          ))
                        ) : (
                          <Chip label="Sin asistentes" />
                        )}
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />


                    <Typography
                      variant="overline"
                      sx={{ color: "#7a5d3b", letterSpacing: 1 }}
                    >
                      Comentarios
                    </Typography>

                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {comentarios.length ? (
                        comentarios.map((cm) => (
                          <Box
                            key={cm.id}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "40px 1fr",
                              gap: 1.5,
                              alignItems: "start",
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#ede7f6",
                                color: "#5e35b1",
                                width: 40,
                                height: 40,
                              }}
                              alt={cm.nombre}
                            >
                              {initials(cm.nombre)}
                            </Avatar>

                            <Box
                              sx={{
                                background: "#fff",
                                border: "1px solid #eee",
                                borderRadius: 2,
                                p: 1.25,
                                boxShadow: "0 6px 14px rgba(0,0,0,.04)",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {cm.nombre}
                                </Typography>
                                <ChatBubbleOutlineIcon
                                  sx={{ fontSize: 16, opacity: 0.6 }}
                                />
                                <CheckCircleIcon
                                  sx={{
                                    fontSize: 16,
                                    opacity: 0.6,
                                    color: "#43a047",
                                  }}
                                />
                              </Stack>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  color: "#4a4a4a",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {cm.texto?.trim()
                                  ? cm.texto
                                  : "— Sin comentario —"}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ color: "#7a5d3b" }}
                        >
                          <CheckCircleIcon fontSize="small" />
                          <Typography variant="body2">
                            No hay comentarios aún.
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </MotionBox>
            </Grid>
          );
        })}
      </Grid>
    );
  }, [loading, error, events]);

  return (
    <Box
      sx={{
        backgroundColor: "var(--beige-light)",
        minHeight: "100vh",
        px: { xs: 2.5, md: 5 },
        py: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{ color: "var(--beige-dark)", fontWeight: 900 }}
        >
          Confirmación de Asistencia
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, mt: 0.5 }}>
          Visualiza de forma clara las confirmaciones por evento, el total de
          asistentes, sus nombres y comentarios.
        </Typography>

        {content}
      </motion.div>
    </Box>
  );
}
