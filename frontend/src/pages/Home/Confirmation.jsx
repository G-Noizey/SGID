import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Confirmation = () => {
  return (
    <Box
      sx={{
        backgroundColor: "var(--beige-light)",
        padding: 3,
        minHeight: "100vh",
      }}
    >
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
          Confirmación de Asistencia
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Visualiza las confirmaciones recibidas para tus eventos.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={3}>
              <CheckCircleIcon sx={{ fontSize: 40, color: "green" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Invitado: Juan Pérez
              </Typography>
              <Typography variant="body2">Asistirá: Sí</Typography>
              <Button sx={{ mt: 2 }} variant="outlined">
                Ver Detalles
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Confirmation;
