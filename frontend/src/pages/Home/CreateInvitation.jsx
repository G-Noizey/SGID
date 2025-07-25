import React from "react";
import { Box, Typography, Paper, Button, TextField, Grid } from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";

const CreateInvitation = () => {
  return (
    <Box sx={{ backgroundColor: "var(--beige-light)", padding: 3, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "var(--beige-dark)" }}>
          Crear Nueva Invitación
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Llena los siguientes campos para generar una nueva invitación.
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 4 }} elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre del Evento" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fecha" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hora" type="time" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Ubicación" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Crear Invitación
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateInvitation;
