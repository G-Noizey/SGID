import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Grid, TextField, MenuItem, Chip, Divider } from "@mui/material";
import { motion } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import { enviarInvitacionMasiva } from "../../services/api";
import { getEventos } from "../../services/eventos.service";
import { toast } from "react-toastify";

const SendInvitation = () => {
  const [eventoId, setEventoId] = useState("");
  const [eventos, setEventos] = useState([]);
  const [destinatarios, setDestinatarios] = useState([
    { nombre: "", email: "", telefono: "", metodo_envio: "email" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventos();
        setEventos(response.data.results || []);
        if (response.data.results.length > 0) {
          setEventoId(response.data.results[0].id);
        }
      } catch (error) {
        toast.error("Error al cargar eventos");
        console.error("Error al cargar eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  // Manejar cambios en los campos de destinatarios
  const handleDestinatarioChange = (index, field, value) => {
    const updatedDestinatarios = [...destinatarios];
    updatedDestinatarios[index][field] = value;
    
    // Si cambia el método de envío, limpiar el otro campo de contacto
    if (field === 'metodo_envio') {
      updatedDestinatarios[index][field === 'email' ? 'telefono' : 'email'] = '';
    }
    
    setDestinatarios(updatedDestinatarios);
  };

  // Agregar nuevo destinatario
  const addDestinatario = () => {
    setDestinatarios([
      ...destinatarios,
      { nombre: "", email: "", telefono: "", metodo_envio: "email" }
    ]);
  };

  // Eliminar destinatario
  const removeDestinatario = (index) => {
    if (destinatarios.length <= 1) return;
    const updated = [...destinatarios];
    updated.splice(index, 1);
    setDestinatarios(updated);
  };

  // Enviar invitaciones
  const handleEnviar = async () => {
    if (!eventoId) {
      toast.error("Selecciona un evento");
      return;
    }

    // Validar destinatarios
    const errores = [];
    const destinatariosValidados = destinatarios.map((dest, index) => {
      if (!dest.nombre) errores.push(`Destinatario ${index + 1}: Falta nombre`);
      
      if (dest.metodo_envio === "email" && !dest.email) {
        errores.push(`Destinatario ${index + 1}: Falta email`);
      } else if (dest.metodo_envio === "whatsapp" && !dest.telefono) {
        errores.push(`Destinatario ${index + 1}: Falta teléfono`);
      }
      
      return {
        nombre: dest.nombre,
        email: dest.email,
        telefono: dest.telefono,
        metodo_envio: dest.metodo_envio
      };
    });

    if (errores.length > 0) {
      errores.forEach(e => toast.error(e));
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        evento_id: eventoId,
        destinatarios: destinatariosValidados
      };

      const response = await enviarInvitacionMasiva(payload);
      
      toast.success(
        `Enviadas ${response.data.exitosos} invitaciones, ${response.data.fallidos} fallos`
      );
      
      // Reiniciar formulario si todo fue exitoso
      if (response.data.fallidos === 0) {
        setDestinatarios([{ nombre: "", email: "", telefono: "", metodo_envio: "email" }]);
      }
      
    } catch (error) {
      console.error("Error al enviar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "var(--beige-light)", padding: 3, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "var(--beige-dark)" }}>
          Enviar Invitaciones
        </Typography>
        
        <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }} elevation={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Seleccionar Evento"
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                disabled={isLoading}
              >
                {eventos.map((evento) => (
                  <MenuItem key={evento.id} value={evento.id}>
                    {evento.titulo} - {new Date(evento.fecha_evento).toLocaleDateString()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 4 }} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Destinatarios
          </Typography>
          
          {destinatarios.map((dest, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={dest.nombre}
                    onChange={(e) => handleDestinatarioChange(index, "nombre", e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Método de envío"
                    value={dest.metodo_envio}
                    onChange={(e) => handleDestinatarioChange(index, "metodo_envio", e.target.value)}
                    disabled={isLoading}
                  >
                    <MenuItem value="email">Correo electrónico</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  {dest.metodo_envio === "email" ? (
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      type="email"
                      value={dest.email}
                      onChange={(e) => handleDestinatarioChange(index, "email", e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Número de WhatsApp"
                      value={dest.telefono}
                      onChange={(e) => handleDestinatarioChange(index, "telefono", e.target.value)}
                      disabled={isLoading}
                      placeholder="+521234567890"
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} md={1} sx={{ display: "flex", alignItems: "center" }}>
                  {destinatarios.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => removeDestinatario(index)}
                      disabled={isLoading}
                    >
                      Eliminar
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addDestinatario}
            sx={{ mt: 1, mb: 3 }}
            disabled={isLoading}
          >
            Agregar otro destinatario
          </Button>
          
          <Divider sx={{ my: 3 }} />
          
          <Button
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            onClick={handleEnviar}
            disabled={isLoading || !eventoId}
            sx={{ py: 1.5, px: 4 }}
          >
            {isLoading ? "Enviando..." : "Enviar Invitaciones"}
          </Button>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default SendInvitation;