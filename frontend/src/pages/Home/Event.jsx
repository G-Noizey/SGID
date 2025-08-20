import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Stage, Layer, Text, Image as KonvaImage, Rect, Circle, Line } from "react-konva";
import { getEventos } from "../../services/eventos.service";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";

const Event = () => {
  const [eventos, setEventos] = useState([]);
  const [elementsMap, setElementsMap] = useState({});
  const [loading, setLoading] = useState({});
  const stageRefs = useRef({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch events
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventos();
        setEventos(response.data.results);

        // Inicializar loading por evento
        const initialLoading = {};
        response.data.results.forEach((ev) => {
          initialLoading[ev.id] = { PNG: false, PDF: false };
        });
        setLoading(initialLoading);
      } catch (error) {
        console.error("Error fetching eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  // Cargar imágenes para cada evento
  useEffect(() => {
    eventos.forEach((ev) => {
      if (ev?.config_diseno?.elements) {
        const loadElements = async () => {
          const elementsWithImages = await Promise.all(
            ev.config_diseno.elements.map(async (el) => {
              if (el.type === "image" && el.src) {
                return new Promise((resolve) => {
                  const img = new window.Image();
                  img.src = el.src;
                  img.crossOrigin = "Anonymous";
                  img.onload = () => resolve({ ...el, imageObject: img });
                  img.onerror = () => resolve(el);
                });
              }
              return el;
            })
          );
          setElementsMap((prev) => ({ ...prev, [ev.id]: elementsWithImages }));
        };
        loadElements();
      }
    });
  }, [eventos]);

  const renderElement = (element) => {
    switch (element.type) {
      case "text":
        return <Text key={element.id} {...element} />;
      case "image":
        return element.imageObject ? (
          <KonvaImage
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            image={element.imageObject}
          />
        ) : null;
      case "rect":
        return <Rect key={element.id} {...element} />;
      case "circle":
        return <Circle key={element.id} {...element} />;
      case "line":
        return <Line key={element.id} {...element} />;
      default:
        return null;
    }
  };

  const handleDownloadPNG = (ev) => {
    const stage = stageRefs.current[ev.id];
    if (!stage) return;
    setLoading((prev) => ({ ...prev, [ev.id]: { ...prev[ev.id], PNG: true } }));
    try {
      const uri = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `invitacion_${ev.titulo.replace(/\s+/g, "_")}.png`;
      link.href = uri;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [ev.id]: { ...prev[ev.id], PNG: false } }));
    }
  };

  const handleDownloadPDF = (ev) => {
    const stage = stageRefs.current[ev.id];
    if (!stage) return;
    setLoading((prev) => ({ ...prev, [ev.id]: { ...prev[ev.id], PDF: true } }));
    try {
      const uri = stage.toDataURL({ pixelRatio: 2 });
      const { width = 1200, height = 800 } = ev.config_diseno || {};
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });
      pdf.addImage(uri, "PNG", 0, 0, width, height);
      pdf.save(`invitacion_${ev.titulo.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [ev.id]: { ...prev[ev.id], PDF: false } }));
    }
  };

  const getScale = (containerWidth, width) => Math.min(containerWidth / width, 0.7);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
        Eventos
      </Typography>

      {eventos.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {eventos.map((ev) => {
            const elements = elementsMap[ev.id] || [];
            const { width = 1200, height = 800 } = ev.config_diseno || {};
            const containerWidth = isSmallScreen ? window.innerWidth - 40 : 800;
            const scale = getScale(containerWidth, width);
            const stageWidth = width * scale;
            const stageHeight = height * scale;

            return (
              <Grid item xs={12} key={ev.id}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "#fff",
                  }}
                  elevation={7}
                >
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <Typography variant="h6">{ev.titulo}</Typography>
                    <Typography variant="body2">{ev.tipo}</Typography>
                    <Typography variant="body2">{new Date(ev.fecha_evento).toLocaleDateString()}</Typography>
                    <Typography variant="body2">{ev.ubicacion}</Typography>
                    <Typography variant="body2">{ev.descripcion}</Typography>
                  </Box>

                  <Box sx={{ overflow: "auto", textAlign: "center" }}>
                    <Stage
                      ref={(ref) => (stageRefs.current[ev.id] = ref)}
                      width={stageWidth}
                      height={stageHeight}
                      scaleX={scale}
                      scaleY={scale}
                      style={{ border: "1px solid #ccc", backgroundColor: "#fff" }}
                    >
                      <Layer>{elements.map((el) => renderElement(el))}</Layer>
                    </Stage>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<ImageIcon />}
                      onClick={() => handleDownloadPNG(ev)}
                      disabled={loading[ev.id]?.PNG || loading[ev.id]?.PDF}
                      sx={{
                        bgcolor: "#f5f5dc",
                        color: "#4e342e",
                        "&:hover": { bgcolor: "#e6d5b8" },
                      }}
                    >
                      {loading[ev.id]?.PNG ? "Generando PNG..." : "Descargar PNG"}
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleDownloadPDF(ev)}
                      disabled={loading[ev.id]?.PDF || loading[ev.id]?.PNG}
                      sx={{
                        bgcolor: "#f5f5dc",
                        color: "#4e342e",
                        "&:hover": { bgcolor: "#e6d5b8" },
                      }}
                    >
                      {loading[ev.id]?.PDF ? "Generando PDF..." : "Descargar PDF"}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Event;
