import { Box, Typography, Paper, Switch, FormControlLabel } from "@mui/material";
import { motion } from "framer-motion";

const Setting = () => {
  return (
    <Box sx={{ backgroundColor: "var(--beige-light)", padding: 3, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "var(--beige-dark)" }}>
          Configuración
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Ajusta las preferencias de tu sistema.
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 4 }} elevation={3}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Recibir notificaciones por correo"
          />
          <FormControlLabel
            control={<Switch />}
            label="Modo oscuro"
          />
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Setting;
