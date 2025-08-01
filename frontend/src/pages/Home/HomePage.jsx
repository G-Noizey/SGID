import {
  Box,
  Typography,
  Grid,
  Paper,
  Button, CssBaseline,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupIcon from "@mui/icons-material/Group";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex",  padding: 3, backgroundColor: "var(--beige-light)", flexDirection: "column",  minHeight: "100vh", }}>
     <CssBaseline />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "var(--beige-dark)" }}
        >
          Bienvenido al Panel SGID
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Gestiona todas tus invitaciones de forma rápida y eficiente.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <GroupIcon sx={{ fontSize: 40, color: "var(--beige-primary)" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
               Crear invitación
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/app/create-invitation")}>
                Crear
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <DesignServicesIcon sx={{ fontSize: 40, color: "var(--beige-primary)" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Plantillas de Invitaciones
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Personalizar
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <EmailIcon sx={{ fontSize: 40, color: "var(--beige-primary)", mr: 1 }} />
              <WhatsAppIcon sx={{ fontSize: 40, color: "var(--beige-primary)" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Envío por Correo y WhatsApp
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/app/send-invitation")}>
                Enviar
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <EventAvailableIcon sx={{ fontSize: 40, color: "var(--beige-primary)" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Confirmación de Asistencia
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/app/confirmaciones")}>
                Ver Respuestas
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <PictureAsPdfIcon sx={{ fontSize: 40, color: "var(--beige-primary)" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Exportar Invitación PDF/PNG
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/app/event")}>
                Exportar
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default HomePage;
