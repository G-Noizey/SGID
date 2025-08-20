// src/pages/SendInvitation.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  CssBaseline,
  FormControl,
  FormLabel,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EventIcon from "@mui/icons-material/Event";

import { enviarInvitacionMasiva } from "../../services/api";
import { getEventos } from "../../services/eventos.service";
import { toast } from "react-toastify";


const WHATSAPP = "#26a153ff";  
const EMAIL = "#9e2020ff";     
/* Utilidades UI */
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const glow = (hex) => `0 20px 50px ${hex}22, 0 8px 18px ${hex}26`;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w[0] || "").toUpperCase())
    .join("");

function MailBurst({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            display: "grid",
            placeItems: "center",
            zIndex: 1300,
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 28, scale: 0.86, opacity: 0 }}
              animate={{ y: -24, scale: 1.1, opacity: 1 }}
              exit={{ y: -90, scale: 1.0, opacity: 0 }}
              transition={{
                duration: 1.8,          
                delay: i * 0.12,        
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ position: "absolute" }}
            >
              <EmailIcon
                sx={{
                  fontSize: 110,         
                  color: EMAIL,
                  filter: "drop-shadow(0 14px 28px rgba(208,74,74,.28))",
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* Fila de destinatario */
function DestinatarioRow({
  index,
  dest,
  disabled,
  showErrors,
  onChange,
  onRemove,
}) {
  const isEmail = dest.metodo_envio === "email";
  const nameError = showErrors && !dest.nombre?.trim();
  const emailError = showErrors && isEmail && !dest.email?.trim();
  const phoneError = showErrors && !isEmail && !dest.telefono?.trim();

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #eee",
        background:
          "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.85))",
      }}
    >
      <Grid container spacing={2} alignItems="flex-start">
        {/* Nombre */}
        <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "#efebe9", color: "#6b4e34", fontWeight: 800 }}>
              {initials(dest.nombre || `#${index + 1}`)}
            </Avatar>
            <TextField
              fullWidth
              label="Nombre completo"
              value={dest.nombre}
              onChange={(e) => onChange(index, "nombre", e.target.value)}
              disabled={disabled}
              error={!!nameError}
              helperText={nameError ? "Requerido" : " "}
            />
          </Stack>
        </Grid>

        {/* Método (centrado con los otros inputs gracias a FormLabel) */}
        <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "flex-end" }}>
          <FormControl fullWidth>
           
            <ToggleButtonGroup
              fullWidth
              exclusive
              value={dest.metodo_envio}
              onChange={(_, val) => {
                if (!val) return;
                onChange(index, "metodo_envio", val);
              }}
              disabled={disabled}
              sx={{ height: 56 }}
            >
              <ToggleButton
                value="email"
                sx={{
                  gap: 1,
                  px: 2,
                  color: EMAIL,
                  borderColor: EMAIL + "55",
                  "&.Mui-selected": {
                    color: "#fff",
                    backgroundColor: EMAIL,
                    borderColor: EMAIL,
                  },
                  "&:hover": { borderColor: EMAIL },
                }}
              >
                <EmailIcon fontSize="small" />
                EMAIL
              </ToggleButton>
              <ToggleButton
                value="whatsapp"
                sx={{
                  gap: 1,
                  px: 2,
                  color: WHATSAPP,
                  borderColor: WHATSAPP + "66",
                  "&.Mui-selected": {
                    color: "#0b4f2e",
                    backgroundColor: WHATSAPP + "22",
                    borderColor: WHATSAPP,
                  },
                  "&:hover": { borderColor: WHATSAPP },
                }}
              >
                <WhatsAppIcon fontSize="small" />
                WHATSAPP
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
        </Grid>

        {/* Contacto (sin iconos dentro del input) */}
        <Grid item xs={12} md={5}>
          {isEmail ? (
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={dest.email}
              onChange={(e) => onChange(index, "email", e.target.value)}
              disabled={disabled}
              error={!!emailError}
              helperText={emailError ? "Requerido" : " "}
            />
          ) : (
            <TextField
              fullWidth
              label="Número de WhatsApp"
              value={dest.telefono}
              onChange={(e) => onChange(index, "telefono", e.target.value)}
              disabled={disabled}
              error={!!phoneError}
              helperText={phoneError ? "Requerido" : " "}
              placeholder="+521234567890"
            />
          )}
        </Grid>

        {/* Eliminar */}
        <Grid
          item
          xs={12}
          md={1}
          sx={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
        >
          {onRemove && (
            <Tooltip title="Eliminar destinatario">
              <span>
                <IconButton
                  color="error"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </MotionPaper>
  );
}

export default function SendInvitation() {
  const [eventoId, setEventoId] = useState("");
  const [eventos, setEventos] = useState([]);
  const [destinatarios, setDestinatarios] = useState([
    { nombre: "", email: "", telefono: "", metodo_envio: "email" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showMailFx, setShowMailFx] = useState(false);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventos();
        setEventos(response.data.results || []);
        if (response.data.results?.length > 0) {
          setEventoId(response.data.results[0].id);
        }
      } catch (error) {
        toast.error("Error al cargar eventos");
        console.error("Error al cargar eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  const stats = useMemo(() => {
    const total = destinatarios.length;
    const emails = destinatarios.filter((d) => d.metodo_envio === "email").length;
    const whats = total - emails;
    return { total, emails, whats };
  }, [destinatarios]);

  const handleDestinatarioChange = (index, field, value) => {
    const updated = [...destinatarios];
    updated[index][field] = value;
    if (field === "metodo_envio") {
      if (value === "email") updated[index].telefono = "";
      else updated[index].email = "";
    }
    setDestinatarios(updated);
  };

  const addDestinatario = () => {
    setDestinatarios((prev) => [
      ...prev,
      { nombre: "", email: "", telefono: "", metodo_envio: "email" },
    ]);
  };
  const removeDestinatario = (index) => {
    if (destinatarios.length <= 1) return;
    const updated = [...destinatarios];
    updated.splice(index, 1);
    setDestinatarios(updated);
  };

  // === Enviar (consumo intacto) ===
  const handleEnviar = async () => {
    if (!eventoId) {
      toast.error("Selecciona un evento");
      return;
    }
    setShowErrors(true);

    const errores = [];
    const destinatariosValidados = destinatarios.map((dest, index) => {
      const nombre = (dest.nombre || "").trim();
      const email = (dest.email || "").trim();
      const telefono = (dest.telefono || "").trim();
      const metodo_envio = dest.metodo_envio || "email";

      if (!nombre) errores.push(`Destinatario ${index + 1}: Falta nombre`);
      if (metodo_envio === "email" && !email) {
        errores.push(`Destinatario ${index + 1}: Falta email`);
      } else if (metodo_envio === "whatsapp" && !telefono) {
        errores.push(`Destinatario ${index + 1}: Falta teléfono`);
      }
      return { nombre, email, telefono, metodo_envio };
    });

    if (errores.length > 0) {
      errores.forEach((e) => toast.error(e));
      return;
    }

    setIsLoading(true);
    try {
      const payload = { evento_id: eventoId, destinatarios: destinatariosValidados };
      const response = await enviarInvitacionMasiva(payload);

      const exitosos = response?.data?.exitosos ?? 0;
      const fallidos = response?.data?.fallidos ?? 0;
      toast.success("Correo enviado correctamente");

      const solicitadosEmail = destinatariosValidados.filter(
        (d) => d.metodo_envio === "email"
      ).length;
      if (solicitadosEmail > 0 && (exitosos > 0 || fallidos < solicitadosEmail)) {
        setShowMailFx(true);
        setTimeout(() => setShowMailFx(false), 2200);
      }

      if (fallidos === 0) {
        setDestinatarios([
          { nombre: "", email: "", telefono: "", metodo_envio: "email" },
        ]);
        setShowErrors(false);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      toast.error("No se pudieron enviar las invitaciones");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* Fondo */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1200px 600px at 10% -10%, #c8b6a633, transparent), radial-gradient(700px 400px at 90% 10%, #8a7cff22, transparent), linear-gradient(180deg, #faf8f6, #f7f7fa)",
        }}
      />

      {/* Animación elegante al enviar */}
      <MailBurst show={showMailFx} />

      <Box sx={{ position: "relative", zIndex: 1, px: { xs: 2.5, md: 5 }, py: 4 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#5a4634" }}>
            Enviar invitaciones
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 3 }}>
            Selecciona un evento, agrega destinatarios y envía por correo o WhatsApp.
          </Typography>
        </motion.div>

        {/* Selector de evento + resumen (chips NEUTRALES: sin color) */}
        <MotionPaper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(180deg,#fff,#fffaf7)",
            border: "1px solid #f0eae4",
            boxShadow: glow("#d1bfae"),
            mb: 3,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                select
                fullWidth
                label="Seleccionar evento"
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    // solo icono en el input select del evento está OK
                    <Box sx={{ pr: 1, display: "flex", alignItems: "center" }}>
                      <EventIcon fontSize="small" />
                    </Box>
                  ),
                }}
              >
                {eventos.map((ev) => (
                  <MenuItem key={ev.id} value={ev.id}>
                    {ev.titulo} — {new Date(ev.fecha_evento).toLocaleDateString()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                <Chip label={`Total: ${stats.total}`} variant="outlined" />

                <Chip icon={<EmailIcon />} label={`Email: ${stats.emails}`} variant="outlined" />
                <Chip icon={<WhatsAppIcon />} label={`WhatsApp: ${stats.whats}`} variant="outlined" />
              </Stack>
            </Grid>
          </Grid>

          {isLoading && <LinearProgress sx={{ mt: 2 }} />}
        </MotionPaper>

        <MotionPaper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(180deg,#fff,#fbfbff)",
            border: "1px solid #ece9f5",
            boxShadow: glow("#b6b2e6"),
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Destinatarios
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addDestinatario}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "transparent",
                border: "1px dashed #c7c7d6",
                "&:hover": { background: "#fafaff" },
              }}
            >
              Agregar destinatario
            </Button>
          </Stack>

          <Stack spacing={2}>
            <AnimatePresence initial={false}>
              {destinatarios.map((dest, i) => (
                <DestinatarioRow
                  key={i}
                  index={i}
                  dest={dest}
                  disabled={isLoading}
                  showErrors={showErrors}
                  onChange={handleDestinatarioChange}
                  onRemove={destinatarios.length > 1 ? removeDestinatario : undefined}
                />
              ))}
            </AnimatePresence>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Se enviarán <strong>{stats.total}</strong> invitación(es) para el evento seleccionado.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleEnviar}
              disabled={isLoading || !eventoId}
              sx={{
                py: 1.4,
                px: 4,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              {isLoading ? "Enviando..." : "Enviar invitaciones"}
            </Button>
          </Stack>
        </MotionPaper>
      </Box>
    </Box>
  );
}
