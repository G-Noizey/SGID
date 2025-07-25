import { Box, Typography, Paper, Button, Grid, TextField } from "@mui/material";
import { motion } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";

const SendInvitation = () => {
  return (
    <Box sx={{ backgroundColor: "var(--beige-light)", padding: 3, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "var(--beige-dark)" }}>
          Enviar Invitaciones
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Elige cómo deseas enviar tus invitaciones: correo, WhatsApp u otro medio.
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 4 }} elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Correo o Número de WhatsApp" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mensaje personalizado" multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<SendIcon />}>
                Enviar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default SendInvitation;
