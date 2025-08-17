# Sistema de Generación de Invitaciones Digitales SGID 
Una plataforma web para crear, personalizar, enviar y gestionar sus invitaciones de forma autónoma.

---

# Descripcion
Una plataforma web que permitirá a los clientes de una empresa de organización de eventos crear, personalizar, enviar y gestionar sus invitaciones de forma autónoma.

---

# Usuarios y Roles dentro de la aplicacion
**Anfitrion**
- crea invitaciones, personaliza, envia y gestiona sus invitaciones

**Invitado**
- solo le notifica la invitacion que el anfitrion le mando.

# Modulos Principales
Modulo de Distribucion
Modulo de generacion y descarga de plantillas
Modulo de confirmacion

# Tecnologias utilizadas
FrontEnd React.js - Interfaz web moderna, modular y dinámica.
Backend: Python DJANGO Rest Framework - Herramienta potente y flexible para construir APIs RESTful en Python, utilizando Django.
Base de Datos: MySQL – Almacenamiento relacional de datos estructurados.

# Instrucciones para clonar y ejecutar el proyecto localmente
1. Abre una terminal y navega a la carpeta donde deseas clonar el repositorio.
2. Ejecuta los siguientes comandos para clonar el proyecto:

   git clone https://github.com/G-Noizey/SGID.git
   
4. Ingresar a la carpeta que se genero con Visual Studio Code
5. En MySQL Workbench deberan tener como configuracion predeterminada User: root y Password: root y crear la base de datos llamada "invitations"
6. Dentro del proyecto Abrir 2 terminales en Visual Studio Code:
   a.- Con powershell acceder a la carpeta backend con el comando
   
   cd backend
   
   b.- Con command Prompt acceder a la carpeta frontend con el comando
   
   cd frontend
   
8. Ejecutar las instalaciones con el primer comando en backend y luego ejecutar los demas comandos para inicializar el backend:

   pip install djangorestframework django-cors-headers mysqlclient reportlab
   
   python manage.py makemigrations users
   python manage.py makemigrations invitations
   python manage.py migrate
   python manage.py runserver
    
9. Ejecutar las intalaciones con el primer comando en frontend y luego iniciar el front con el otro comando:
   
   npm i
   npm run dev
   
10. Abre tu navegador y entra al siguiente enlace:
   http://localhost:5173/
