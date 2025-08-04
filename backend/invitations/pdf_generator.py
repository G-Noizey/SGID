from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from io import BytesIO
from datetime import datetime
import base64
from PIL import Image, ImageDraw, ImageFont
import os
# En pdf_generator.py, al inicio del archivo:
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Registra las fuentes necesarias
try:
    pdfmetrics.registerFont(TTFont('TimesNewRoman', 'times.ttf'))
    pdfmetrics.registerFont(TTFont('Georgia', 'georgia.ttf'))  # Asegúrate de tener este archivo
    pdfmetrics.registerFont(TTFont('Helvetica', 'arial.ttf'))  # Usar Arial como fallback para Helvetica
except Exception as e:
    print(f"Error registrando fuentes: {e}")
    # Fuentes por defecto que siempre funcionan
    BUILTIN_FONTS = ['Helvetica', 'Times-Roman', 'Courier']
    
    
# Lista de meses en español para usar en ambas funciones
MESES_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

def formatear_fecha(fecha_iso):
    """Formatea fecha ISO a español con manejo de errores"""
    try:
        fecha_obj = datetime.fromisoformat(fecha_iso)
        dia = fecha_obj.day
        mes = MESES_ES[fecha_obj.month - 1]
        anio = fecha_obj.year
        hora = fecha_obj.strftime("%I:%M %p").lstrip("0").replace("AM", "a.m.").replace("PM", "p.m.")
        return f"{dia} de {mes} de {anio} a las {hora}"
    except Exception as e:
        print(f"Error formateando fecha: {e}")
        return fecha_iso

def generar_pdf_desde_json(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    config = data.get("config_diseno", {})
    elementos = config.get("elementos", [])
    fuentes = config.get("fuentes", {})
    colores = config.get("colores", {})

    # Sistema de fallback para fuentes
    def get_safe_font(font_name, style=''):
        font_map = {
            'georgia': 'Times-Roman',
            'times new roman': 'Times-Roman',
            'arial': 'Helvetica',
            'verdana': 'Helvetica'
        }
        
        # Verifica si la fuente está registrada
        if font_name in pdfmetrics.getRegisteredFontNames():
            return font_name
            
        # Busca alternativa
        lower_name = font_name.lower()
        return font_map.get(lower_name, 'Helvetica')

    # Obtener fuentes con fallback
    fuente_titulo = get_safe_font(fuentes.get('titulo', 'Helvetica-Bold'))
    fuente_cuerpo = get_safe_font(fuentes.get('cuerpo', 'Helvetica'))

    # Resto de tu código actual...
    estilo_titulo = ParagraphStyle(
        'Titulo',
        parent=styles['Heading1'],
        fontName=fuente_titulo,
        fontSize=20,
        textColor=colores.get('primary', '#000000'),
        alignment=1,
        spaceAfter=12
    )

    estilo_cuerpo = ParagraphStyle(
        'Cuerpo',
        parent=styles['Normal'],
        fontName=fuente_cuerpo,
        fontSize=12,
        textColor=colores.get('text', '#333333'),
        leading=14,
        spaceAfter=10
    )

    # Procesar elementos
    for el in elementos:
        tipo = el.get("type")
        contenido = el.get("content", "")

        if tipo == "header":
            story.append(Paragraph(contenido, estilo_titulo))
        elif tipo == "text":
            story.append(Paragraph(contenido, estilo_cuerpo))
        elif tipo == "image":
            procesar_imagen_pdf(el.get("content", {}), story, estilo_cuerpo)

    # Detalles del evento
    agregar_detalles_evento(data, story, estilo_cuerpo)

    # Generar PDF
    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf

def procesar_imagen_pdf(contenido, story, estilo_error):
    """Procesa imagen para PDF con manejo de errores"""
    try:
        base64_data = contenido.get("data", "").strip()
        if not base64_data:
            return

        # Limpiar base64 si viene con prefijo
        if "base64," in base64_data:
            base64_data = base64_data.split("base64,")[1]

        image_data = base64.b64decode(base64_data)
        img = RLImage(ImageReader(BytesIO(image_data)), 
                    width=4*inch, 
                    height=3*inch)
        img.hAlign = 'CENTER'
        story.append(img)
        story.append(Spacer(1, 12))
    except Exception as e:
        error_msg = f"[Error imagen: {str(e)}]"
        story.append(Paragraph(error_msg, estilo_error))

def agregar_detalles_evento(data, story, estilo):
    """Agrega sección de detalles del evento"""
    story.append(Spacer(1, 20))
    
    detalles = [
        ("Evento", data.get('titulo', '')),
        ("Fecha", formatear_fecha(data.get('fecha_evento', '')).split(" a las ")[0]),
        ("Hora", datetime.fromisoformat(data['fecha_evento']).strftime("%I:%M %p").lstrip("0") if data.get('fecha_evento') else ''),
        ("Lugar", data.get('ubicacion', '')),
        ("Descripción", data.get('descripcion', ''))
    ]

    for label, value in detalles:
        if value:  # Solo agregar si hay valor
            story.append(Paragraph(f"<b>{label}:</b> {value}", estilo))

def generar_png_desde_json(data, ancho=800, alto=1000):
    """Genera imagen PNG desde JSON"""
    try:
        # Configuración inicial
        img = Image.new("RGB", (ancho, alto), "white")
        draw = ImageDraw.Draw(img)
        x_margen = 50
        y = 40

        # Cargar fuentes (con fallback a default)
        try:
            fuente_header = ImageFont.truetype("arialbd.ttf", 36)
            fuente_texto = ImageFont.truetype("arial.ttf", 24)
            fuente_subtitulo = ImageFont.truetype("arialbd.ttf", 28)
        except:
            default_font = ImageFont.load_default()
            fuente_header = default_font
            fuente_texto = default_font
            fuente_subtitulo = default_font

        # Procesar elementos
        for el in data.get("config_diseno", {}).get("elementos", []):
            y = procesar_elemento_png(el, draw, img, x_margen, y, fuente_header, fuente_texto)

        # Agregar detalles del evento
        y = agregar_detalles_evento_png(data, draw, x_margen, y, fuente_subtitulo, fuente_texto)

        # Guardar en memoria
        output = BytesIO()
        img.save(output, format='PNG', quality=95)
        return output.getvalue()

    except Exception as e:
        print(f"Error generando PNG: {e}")
        raise

def procesar_elemento_png(elemento, draw, img, x, y, fuente_header, fuente_texto):
    """Procesa un elemento individual para PNG"""
    tipo = elemento.get("type")
    contenido = elemento.get("content", "")

    if tipo == "header":
        draw.text((img.width//2, y), contenido, fill="black", font=fuente_header, anchor="mm")
        return y + 60
    elif tipo == "text":
        draw.text((x, y), contenido, fill="black", font=fuente_texto)
        return y + 40
    elif tipo == "image":
        return procesar_imagen_png(elemento.get("content", {}), img, x, y)

    return y

def procesar_imagen_png(contenido, img, x, y):
    """Procesa imagen para PNG"""
    try:
        base64_data = contenido.get("data", "").strip()
        if not base64_data:
            return y

        if "base64," in base64_data:
            base64_data = base64_data.split("base64,")[1]

        img_data = base64.b64decode(base64_data)
        img_elemento = Image.open(BytesIO(img_data))
        img_elemento.thumbnail((img.width - 100, img.height//3))
        
        # Centrar imagen
        x_pos = (img.width - img_elemento.width) // 2
        img.paste(img_elemento, (x_pos, y))
        
        return y + img_elemento.height + 30
    except Exception as e:
        print(f"Error procesando imagen PNG: {e}")
        return y + 50

def agregar_detalles_evento_png(data, draw, x, y, fuente_subtitulo, fuente_texto):
    """Agrega detalles del evento a PNG"""
    # Título sección
    draw.text((x, y), "Detalles del evento:", fill="black", font=fuente_subtitulo)
    y += 50

    # Obtener fecha formateada
    fecha_iso = data.get("fecha_evento", "")
    fecha_str, hora_str = "", ""
    
    if fecha_iso:
        try:
            dt = datetime.fromisoformat(fecha_iso)
            fecha_str = f"{dt.day} de {MESES_ES[dt.month - 1]} de {dt.year}"
            hora_str = dt.strftime("%I:%M %p").lstrip("0")
        except:
            fecha_str = fecha_iso

    # Detalles
    detalles = [
        ("Evento", data.get('titulo', '')),
        ("Fecha", fecha_str),
        ("Hora", hora_str),
        ("Lugar", data.get('ubicacion', '')),
        ("Descripción", data.get('descripcion', ''))
    ]

    # Dibujar cada detalle
    for label, value in detalles:
        if value:
            draw.text((x, y), f"{label}: {value}", fill="black", font=fuente_texto)
            y += 40

    return y + 20