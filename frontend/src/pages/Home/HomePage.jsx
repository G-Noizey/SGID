import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CssBaseline,
  useTheme,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventIcon from "@mui/icons-material/Event";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * HomePage — cards simétricas (mismo ancho/alto)
 * - Altura fija por breakpoint (minHeight = height = maxHeight)
 * - Texto con line-clamp para no crecer
 * - Botón con width:auto (evita estilos globales de 100%)
 * - Íconos grandes con animación de swap en hover/focus
 */

const MotionBox = motion(Box);

// Alturas uniformes por breakpoint
const CARD_H = { xs: 240, md: 260, lg: 260 };

function IconSwap({ primary: Primary, active: Active, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: "relative", height: 72, width: 72, flexShrink: 0 }}
    >
      <AnimatePresence initial={false}>
        {!hovered ? (
          <MotionBox
            key="primary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Primary sx={{ fontSize: 64, color }} />
          </MotionBox>
        ) : (
          <MotionBox
            key="active"
            initial={{ opacity: 0, y: 8, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -8, rotate: 6 }}
            transition={{ duration: 0.28 }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Active sx={{ fontSize: 64, color }} />
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

function FeatureCard({ title, subtitle, body, cta, onClick, colors, icons }) {
  return (
    <MotionBox
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      sx={{
        // Tamaño uniforme: la card no crece ni encoge
        height: { xs: CARD_H.xs, md: CARD_H.md, lg: CARD_H.lg },
        minHeight: { xs: CARD_H.xs, md: CARD_H.md, lg: CARD_H.lg },
        maxHeight: { xs: CARD_H.xs, md: CARD_H.md, lg: CARD_H.lg },

        width: "100%",
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "88px 1fr" },
        alignItems: "center",
        gap: { xs: 2.25, md: 3 },
        background: "linear-gradient(180deg, #ffffffcc, #ffffffa6)",
        border: "1px solid rgba(255,255,255,0.45)",
        boxShadow: `0 10px 30px ${colors.shadow}`,
        backdropFilter: "blur(10px)",
        overflow: "hidden",
      }}
    >
      <IconSwap
        primary={icons.primary}
        active={icons.active}
        color={colors.accent}
      />

      {/* Layout interno con filas fijas y el CTA pegado abajo */}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "auto auto 1fr auto",
          height: "100%",
          minWidth: 0, // evita desbordes por texto largo
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: colors.title,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            color: colors.subtitle,
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {subtitle}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: colors.text,
            mt: 1.25,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3, // evita que cambie la altura
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {body}
        </Typography>

        <Button
          onClick={onClick}
          variant="contained"
          size="large"
          sx={{
            mt: 1.6,
            alignSelf: "flex-start", // evita width 100% por estilos globales
            width: "auto",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.8,
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}cc)`,
            boxShadow: "none",
            "&:hover": { boxShadow: `0 8px 22px ${colors.accent}4d` },
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 8,
              height: 2,
              background: `${colors.accent}aa`,
              transform: "scaleX(0)",
              transformOrigin: "left",
              transition: "transform .25s ease",
            },
            "&:hover::after": { transform: "scaleX(1)" },
          }}
        >
          {cta}
        </Button>
      </Box>
    </MotionBox>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();

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
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* Fondo elegante sin imágenes */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(1200px 600px at 10% -10%, ${brand.primary}26, transparent),
                       radial-gradient(700px 400px at 90% 10%, #8a7cff22, transparent),
                       linear-gradient(180deg, ${brand.lightBg}, #f8f8fb)`,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ fontWeight: 900, color: brand.dark }}>
            Bienvenido a{" "}
            <Box component="span" sx={{ color: brand.primary }}>
              SGID
            </Box>
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mt: 1.2, opacity: 0.85, maxWidth: 820 }}
          >
            Un panel diseñado para crear, compartir y dar seguimiento a tus
            invitaciones con precisión profesional. Controla cada detalle, desde
            el diseño hasta la confirmación de asistencia, en un flujo simple y
            elegante.
          </Typography>
        </motion.div>

        {/* Grid 2x2 simétrico: items estiran a la misma altura */}
        <Grid
          container
          spacing={3}
          columns={{ xs: 12, md: 12 }}     // fuerza 12 columnas en md+
          sx={{ mt: 3, alignItems: "stretch" }}
        >
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              // Fuerza exactamente 50% del ancho en md+
              flexBasis: { md: "calc(50% - 24px)" }, // 24px = spacing(3)
              maxWidth: { md: "calc(50% - 24px)" },
              minWidth: 0,
              display: "block",           // evita interferencias de flex en el item
            }}
          >
            <FeatureCard
              title="Crear invitación"
              subtitle="Diseño rápido con resultados impecables"
              body="Configura el nombre del evento, fecha, ubicación y estilo en cuestión de segundos. Personaliza textos, tipografías y colores con previsualización inmediata."
              cta="Crear"
              onClick={() => navigate("/app/create-invitation")}
              colors={{
                accent: brand.primary,
                title: "#2f261a",
                subtitle: "#5f4b2f",
                text: "#655a50",
                shadow: `${brand.primary}33`,
              }}
              icons={{ primary: EventIcon, active: EventAvailableIcon }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              // Fuerza exactamente 50% del ancho en md+
              flexBasis: { md: "calc(50% - 24px)" }, // 24px = spacing(3)
              maxWidth: { md: "calc(50% - 24px)" },
              minWidth: 0,
              display: "block",           // evita interferencias de flex en el item
            }}
          >
            <FeatureCard
              title="Envío por Correo y WhatsApp"
              subtitle="Compartir sin esfuerzo"
              body="Envía invitaciones individuales o masivas, con enlaces de RSVP y mensajes autoformateados. "
              cta="Enviar"
              onClick={() => navigate("/app/send-invitation")}
              colors={{
                accent: "#108a6a",
                title: "#1f3c33",
                subtitle: "#2e5a4f",
                text: "#37534c",
                shadow: "#108a6a33",
              }}
              icons={{ primary: EmailIcon, active: WhatsAppIcon }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              // Fuerza exactamente 50% del ancho en md+
              flexBasis: { md: "calc(50% - 24px)" }, // 24px = spacing(3)
              maxWidth: { md: "calc(50% - 24px)" },
              minWidth: 0,
              display: "block",           // evita interferencias de flex en el item
            }}
          >
            <FeatureCard
              title="Confirmación de Asistencia"
              subtitle="Resumen por evento, en tiempo real"
              body="Visualiza cada evento con su fecha y ubicación, el total de asistentes y sus nombres, además de comentarios de cada invitado; todo actualizado al instante."
              cta="Ver respuestas"
              onClick={() => navigate("/app/confirmaciones")}
              colors={{
                accent: "#6a5acd",
                title: "#2f2a4f",
                subtitle: "#4b4380",
                text: "#3e3a57",
                shadow: "#6a5acd33",
              }}
              icons={{ primary: EventIcon, active: EventAvailableIcon }}
            />
          </Grid>


          <Grid
            item
            xs={12}
            md={6}
            sx={{
              // Fuerza exactamente 50% del ancho en md+
              flexBasis: { md: "calc(50% - 24px)" }, // 24px = spacing(3)
              maxWidth: { md: "calc(50% - 24px)" },
              minWidth: 0,
              display: "block",           // evita interferencias de flex en el item
            }}
          >
            <FeatureCard
              title="Invitación y Exportación"
              subtitle="Detalle del evento + descarga"
              body="Abre la ficha del evento para ver fecha y ubicación, previsualiza la invitación generada como imagen y descárgala en PNG o PDF con calidad para impresión."
              cta="Ver invitación"
              onClick={() => navigate("/app/event")}
              colors={{
                accent: "#d86a4f",
                title: "#4b2e27",
                subtitle: "#7b4a3d",
                text: "#5c433f",
                shadow: "#d86a4f33",
              }}
              // mantenemos los íconos y el swap en hover
              icons={{ primary: PictureAsPdfIcon, active: DownloadDoneIcon }}
            />
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
}
