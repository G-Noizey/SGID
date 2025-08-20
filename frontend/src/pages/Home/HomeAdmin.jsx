import { Box, Container, Typography, Grid, Card, CardContent, Button, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";

const HomeAdmin = () => {
  const navigate = useNavigate();

  const theme = useTheme();

    const brand = useMemo(() => {
        if (typeof window !== "undefined") {
            const css = getComputedStyle(document.documentElement);
            return {
                primary:
                    css.getPropertyValue("--beige-primary").trim() ||
                    theme.palette.primary.main,
                dark:
                    css.getPropertyValue("--beige-dark").trim() ||
                    theme.palette.text.primary,
                lightBg:
                    css.getPropertyValue("--beige-light").trim() ||
                    theme.palette.background.default,
            };
        }
        return {
            primary: theme.palette.primary.main,
            dark: theme.palette.text.primary,
            lightBg: theme.palette.background.default,
        };
    }, [theme]);

  return (
    <Box
            sx={{
              margin: 0 ,
              padding: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: `radial-gradient(1200px 600px at 10% -10%, ${brand.primary}26, transparent),
                       radial-gradient(700px 400px at 90% 10%, #8a7cff22, transparent),
                       linear-gradient(180deg, ${brand.lightBg}, #f8f8fb)`,
        
                          }}
        >
      {/* Encabezado con animación */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ textAlign: "center", mb: 6, p: 2 }}>
         <Typography variant="h3" sx={{ fontWeight: 900, color: brand.dark }}>
                     Bienvenido a{" "}
                     <Box component="span" sx={{ color: brand.primary }}>
                       SGID
                     </Box>
                   </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1, opacity: 0.85 }}>
            Administra tus plantillas digitales de forma rápida, elegante y profesional.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        <Grid item xs={12} md={12} sx={{justifyContent: "center", display: "flex", alignContent: "center"}}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card sx={{ borderRadius: "20px", boxShadow: 4, textAlign: "center", p: 2 }}>
              <CardContent>
                <EventIcon sx={{ fontSize: 50, color: "#655a50", mb: 2 }} />
                <Typography variant="h6" gutterBottom>Plantillas</Typography>
                <Typography variant="body2" color="text.secondary">
                  Crea y gestiona invitaciones predifinidas como para bodas, cumpleaños, graduaciones y más.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

      </Grid>

      
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            sx={{ borderRadius: "30px", px: 4, py: 1.5, fontSize: "1.1rem" }}
            onClick={() => navigate("/admin/create-invitation")}
          >
            Crear Plantillas Predefinidas
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HomeAdmin;
