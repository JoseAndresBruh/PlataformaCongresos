# Plataforma de Gestion de Congresos y Eventos Academicos (ULEAM-EVENTOS)

Sistema integral para la administracion, publicacion, inscripcion, auditoria financiera, control de acceso mediante codigo QR y certificacion oficial de congresos y seminarios academicos de la Universidad Laica Eloy Alfaro de Manabi (ULEAM).

El proyecto esta disenado bajo una arquitectura desacoplada y orientada a servicios:
- Backend: API REST desarrollada en C# (.NET 9 / ASP.NET Core Web API) con arquitectura limpia, autenticacion basada en tokens JWT, control de acceso basado en roles (RBAC) y persistencia dual (PostgreSQL / Supabase y repositorio autonomo en memoria para pruebas y desarrollo local).
- Frontend: Aplicacion web SPA desarrollada en React 19 con Vite, componentes modulares, interfaz responsiva basada en los lineamientos institucionales ULEAM y soporte de escaneo QR multidispositivo en red local.

---

## Estructura del Repositorio

```text
PlataformaCongresos/
|-- backend/                     # API REST en C# (.NET 9 / ASP.NET Core)
|   |-- Controllers/             # Controladores REST (Auth, Eventos, Inscripciones, Asistencia, etc.)
|   |-- Models/                  # Entidades de dominio, modelos DTO y respuestas JSON normalizadas
|   |-- Repositories/            # Contrato de persistencia e implementacion concurrente
|   |-- Security/                # Modulo de criptografia, hashing PBKDF2 y servicio de tokens JWT
|   |-- Configuration/           # Configuracion unificada y cargador de variables de entorno (.env)
|   |-- Middleware/              # Interceptor y validacion de encabezados Bearer JWT
|   |-- Program.cs               # Configuracion de Kestrel (puerto 8080), inyeccion de dependencias y CORS
|   |-- appsettings.json         # Parametros de configuracion general
|   `-- UleamEventos.Api.csproj  # Archivo de definicion del proyecto .NET 9
|-- backend_go_legacy/           # Respaldo historico del prototipo inicial en Go (Golang)
|-- frontend/                    # Interfaz de usuario en React 19 + Vite
|   |-- src/                     # Componentes, vistas por rol, utilidades de exportacion y estilos
|   |   |-- components/          # Vistas de busqueda, estados 404 y modales institucionales
|   |   |-- utils/               # Generadores de PDF de credenciales y certificados oficiales
|   |   |-- App.jsx              # Controlador principal de vistas, estados y navegacion SPA
|   |   `-- App.css              # Sistema de diseno y componentes institucionales ULEAM
|   |-- cert.pem / key.pem       # Certificados SSL locales para habilitar camara movil en red LAN
|   |-- package.json             # Dependencias de React 19 y scripts de ejecucion
|   `-- vite.config.js           # Configuracion del servidor Vite con proxy y soporte HTTPS
|-- supabase/                    # Scripts SQL y migraciones de base de datos relacional
|   `-- migrations/
|       |-- 01_schema.sql        # Esquema relacional con 18 tablas, triggers y politicas RLS
|       |-- 02_seed_data.sql     # Datos iniciales de roles, usuarios, congresos y categorias
|       `-- 03_security_advisor_fixes.sql # Optimizaciones de seguridad y politicas RLS
`-- README.md                    # Documentacion tecnica e instrucciones operativas
```

---

## Arquitectura Tecnologica

### 1. Backend (.NET 9 / ASP.NET Core Web API)
- Capas de diseno:
  - Controllers: Controladores HTTP que exponen la API bajo la ruta base `/api/v1`.
  - Repositories: Capa de acceso a datos con sincronizacion concurrente mediante `ReaderWriterLockSlim` y compatibilidad con PostgreSQL / Supabase.
  - Security: Generacion y validacion de tokens JWT (RFC 7519) con firma HMAC-SHA256 y hashing de contraseñas mediante PBKDF2 con salt criptografico y 100.000 iteraciones (compatible con hashes bcrypt previos).
  - Middleware: Filtro de autenticacion que extrae el token Bearer del encabezado HTTP y propaga la identidad y los roles del usuario a traves del contexto de ejecucion.
- Modo de operacion:
  - Por defecto opera en modo autonomo con almacenamiento en memoria precargado con eventos, usuarios y credenciales iniciales.
  - Si se configura la variable `DATABASE_URL` en `backend/.env`, se conecta directamente a la instancia PostgreSQL correspondiente.

### 2. Frontend (React 19 + Vite)
- Enrutamiento SPA dinámico: Mapeo limpio de URLs en el navegador (`/explorar`, `/mis-eventos`, `/certificados`, `/super-admin`, `/admin-eventos`, `/gestion-pagos`, `/checkin`) sin recarga de pagina.
- Seguridad en interfaz: Eliminacion total de mensajes que revelen nombres de tablas, lenguajes o motores de base de datos a los usuarios finales.
- Soporte multidispositivo: Diseno adaptable con soporte para pantallas de alta resolucion, tablets y dispositivos moviles.
- Escaneo QR de camara en vivo:
  - Selector de camaras fisicas mediante `navigator.mediaDevices.enumerateDevices` para elegir la webcam real y evitar dispositivos virtuales inactivos.
  - Alternancia entre camara frontal y trasera en telefonos moviles.
  - Zona de carga institucional de archivos (Dropzone) para procesar fotografias o capturas de credenciales QR.
  - Sintetizador de audio Web Audio API para emitir tonos de confirmacion sonora (doble beep agudo para acceso autorizado y tono grave para acceso denegado).

---

## Modulos del Sistema y Separacion de Roles

### 1. Super Administrador (/super-admin - Rol: SUPER_ADMIN)
- Control de Usuarios y Asignacion de Roles: Buscador en tiempo real y selector de roles con actualizacion inmediata de privilegios (SuperAdmin, Admin de Evento, Personal de Gestion, Personal de Asistencia, Asistente).
- Firma Digital y Sellos Oficiales: Lienzo interactivo en pantalla para captura de firma manual, boton de carga de firma en formato PNG transparente y selector de sellos institucionales autorizados de Decanato y Rectoria.
- Auditoria del Sistema: Registro de eventos criticos de seguridad (inicios de sesion, revision de pagos, escaneos QR en puerta y descargas de certificados) con direccion IP, marca de tiempo y resultado.

### 2. Administrador de Eventos (/admin-eventos - Rol: ADMIN_EVENTO)
- Gestion de Congresos: Formulario de creacion de eventos con titulo, fechas de inicio y fin, modalidad (Presencial, Virtual o Hibrido), aforo maximo, afiches promocionales y categorias de inscripcion con o sin costo.
- Conmutador de Estado de Eventos: Transicion en vivo del ciclo de vida del congreso (Borrador, Publicado, Inscripciones Abiertas, Inscripciones Cerradas, En Curso, Finalizado y Archivado).
- Control de Asistencia y Aforo: Metricas de participantes inscritos y exportacion de listados a formato Excel / CSV.

### 3. Personal de Gestion y Finanzas (/gestion-pagos - Rol: PERSONAL_GESTION)
- Mesa de Finanzas: Visualizacion de solicitudes de inscripcion que requieren comprobante de transferencia bancaria.
- Control de Ventana SLA de 24 Horas: Contador de tiempo restante con clasificacion automatica del estado de atencion:
  - A Tiempo: Mas de 4 horas disponibles para revision.
  - Urgente: Menos de 4 horas para el cumplimiento del plazo de 24 horas.
  - Vencido: Plazo de revision superado.
- Acciones de Auditoria: Aprobacion de comprobante (con liberacion inmediata de credencial QR oficial) o rechazo con registro de observaciones.
- Exportacion Financiera: Generacion de reportes consolidados en formato CSV estructurado con codificacion UTF-8 BOM.

### 4. Personal de Asistencia y Control de Puerta (/checkin - Rol: PERSONAL_ASISTENCIA)
- Validacion de Credencial QR: Escaneo optico en tiempo real desde la camara web de la computadora o la camara del dispositivo movil.
- Deteccion de Duplicados: Advertencia visual y registro en caso de que una credencial ya haya sido registrada previamente en la sesion actual.
- Control de Aforo en Sala: Contador dinamico de asistentes validados en sala y aforo pendiente de ingreso.
- Zona de Carga de Archivos QR: Opcion alternativa para subir capturas de pantalla o fotos de credenciales directamente desde la galeria del telefono.
- Simulacion de Pruebas: Botones integrados para probar la lectura de credenciales validas o denegadas sin requerir camara fisica.

### 5. Portal del Asistente (/explorar, /mis-eventos, /certificados - Rol: ASISTENTE)
- Catalogo de Eventos: Exploracion de la oferta academica institucional con filtros por modalidad y busqueda en tiempo real.
- Inscripcion en Linea: Registro en categorias gratuitas (con generacion automatica de carnet) o aranceladas (con carga de comprobante bancario).
- Credencial Digital Oficial: Carnet digital con codigo QR de seguridad firmado, datos del titular, categoria y sello institucional.
- Descarga en PDF: Generacion y descarga directa del documento de credencial oficial en formato PDF.
- Validacion Publica de Certificados: Formulario publico para consultar la autenticidad de un certificado emitido mediante su codigo alfanumerico.

### 6. Soporte Institucional (Mesa de Soporte)
- Formulario de contacto tecnico y seleccion de categoria de atencion (Pagos y Comprobantes, Certificados Digitales, Credencial QR, Acceso de Cuenta o Consulta General).
- Seccion de Preguntas Frecuentes (FAQ) institucionales.

---

## Requisitos Previos

1. .NET SDK: Version 9.0 o superior instalada en el sistema operativo.
   - Verificacion: `dotnet --version`
2. Node.js: Version 18.x o 20.x o superior con gestor de paquetes npm.
   - Verificacion: `node -v` y `npm -v`
3. Git: Para control de versiones y clonacion del repositorio.
4. Navegador web moderno: Google Chrome, Microsoft Edge, Mozilla Firefox o Safari con soporte para WebRTC y Web Audio API.

---

## Guia de Ejecucion

Para ejecutar la plataforma completa en tu entorno local se deben iniciar ambos servicios (Backend y Frontend). Se recomienda abrir dos terminales independientes.

### 1. Iniciar el Backend en C# (.NET 9)

En la primera terminal:

```bash
# 1. Entrar a la carpeta del backend
cd backend

# 2. Compilar el proyecto
dotnet build

# 3. Ejecutar el servidor API
dotnet run
```

Al iniciar correctamente, Kestrel mostrara el siguiente mensaje en consola:

```text
=====================================================
SERVIDOR ULEAM-EVENTOS (.NET 9 / C#) INICIADO EN PUERTO 8080
URL Base: http://localhost:8080/api/v1
Modo: development | Repositorio: Autonomo en Memoria (PostgreSQL Ready)
=====================================================
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://0.0.0.0:8080
```

Para verificar que el servicio responde, abre en el navegador:
- http://localhost:8080/api/v1/health

### 2. Iniciar el Frontend (React 19 + Vite)

En la segunda terminal:

```bash
# 1. Entrar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

El servidor Vite desplegara las direcciones de acceso local y de red:

```text
  Local:   https://localhost:5173/
  Network: https://192.168.0.239:5173/
```

Ingresa a la aplicacion desde tu navegador en:
- https://localhost:5173

---

## Pruebas desde Dispositivos Moviles en Red Local (Wi-Fi)

Por politicas de seguridad de los navegadores moviles (Chrome en Android y Safari en iOS), el acceso a la camara web requiere obligatoriamente una conexion segura (HTTPS).

1. Conecta tu telefono movil y tu computadora a la misma red Wi-Fi.
2. Inicia el frontend (`npm run dev`) y el backend (`dotnet run`).
3. En el navegador del telefono movil ingresa a la direccion HTTPS indicada en la terminal:
   - https://192.168.0.239:5173/checkin
4. Debido a que se utiliza un certificado SSL local de desarrollo:
   - En Android (Chrome): Selecciona "Configuracion avanzada" y luego "Acceder a 192.168.0.239 (sitio no seguro)".
   - En iOS (Safari): Selecciona "Mostrar detalles" y luego "Visitar este sitio web".
5. Presiona el boton "Iniciar Camara" y otorga los permisos solicitados. La camara trasera del telefono se activara para escanear credenciales en tiempo real.

---

## Catalogo de Endpoints de la API REST (.NET 9)

Ruta base del servicio: `/api/v1`

| Metodo | Endpoint | Descripcion | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/health` | Estado de operacion del servicio | Publico |
| POST | `/api/v1/auth/login` | Autenticacion y emision de token JWT | Publico |
| POST | `/api/v1/auth/register` | Registro de nuevos usuarios con hash PBKDF2 | Publico |
| GET | `/api/v1/eventos` | Listado general de congresos academicos | Publico |
| GET | `/api/v1/eventos/{slug}` | Informacion detallada de un congreso por slug | Publico |
| POST | `/api/v1/eventos` | Creacion directa de nuevos eventos | Publico / Admin |
| PATCH | `/api/v1/eventos/{id}/estado` | Actualizacion del estado del congreso | Publico / Admin |
| POST | `/api/v1/inscripciones` | Registro de inscripcion con o sin comprobante | Publico / Asistente |
| GET | `/api/v1/inscripciones` | Listado y auditoria de inscripciones y SLA | Personal de Gestion |
| PATCH | `/api/v1/inscripciones/{id}/revision` | Aprobacion o rechazo de pago y emision de QR | Personal de Gestion |
| POST | `/api/v1/asistencia/check-in` | Validacion de credencial QR en puerta | Personal Asistencia |
| GET | `/api/v1/dashboard/metricas` | Metricas y KPIs consolidados de la plataforma | Administrativo |
| GET | `/api/v1/certificados` | Consulta de certificados emitidos por usuario | Publico / Asistente |
| POST | `/api/v1/encuestas/responder` | Envio de respuestas a encuestas de ponencias | Asistente |
| POST | `/api/v1/admin/eventos` | Creacion protegida de congresos | SUPER_ADMIN / ADMIN_EVENTO |
| PATCH | `/api/v1/admin/eventos/{id}/estado` | Cambio de estado de congreso protegido | SUPER_ADMIN / ADMIN_EVENTO |
| PATCH | `/api/v1/admin/inscripciones/{id}/revision` | Revision administrativa de comprobantes | SUPER_ADMIN / GESTION |

---

## Usuarios y Credenciales Institucionales de Prueba

Todos los usuarios de prueba estan preconfigurados en el repositorio en memoria y en las migraciones de base de datos con la siguiente contrasena unificada:

Contrasena general: `Admin123!`

| Rol Asignado | Correo Institucional | Nombre Completo | Unidad Academica / Cargo |
| :--- | :--- | :--- | :--- |
| Super Administrador | `admin@uleam.edu.ec` | Carlos Adrian Valencia Mendoza | Direccion DITIC / ULEAM |
| Administrador de Evento | `organizador@uleam.edu.ec` | Jandry David Fernandez Cedeno | Facultad Ciencias de la Vida |
| Personal de Gestion | `gestion@uleam.edu.ec` | Jose Andres Loor Munoz | Direccion Financiera ULEAM |
| Personal de Asistencia | `asistencia@uleam.edu.ec` | Alan Joel Cobena Naranjo | Coordinacion Logistica de Campo |
| Participante / Estudiante | `estudiante@uleam.edu.ec` | Karla Jamileth Andrade Mendoza | Ingenieria en Software |
| Participante Externo | `participante.externo@gmail.com` | Javier David Jaramillo Intriago | Universidad Tecnica de Manabi |

---

## Comandos Adicionales de Compilacion y Verificacion

### Backend (.NET 9)
- Compilar binarios de depuracion:
  ```powershell
  dotnet build backend
  ```
- Generar publicacion optimizada para produccion:
  ```powershell
  dotnet publish backend -c Release -o ./publish
  ```

### Frontend (React 19 + Vite)
- Compilacion de produccion:
  ```powershell
  npm --prefix frontend run build
  ```
- Analisis estatico de codigo (Linter):
  ```powershell
  npm --prefix frontend run lint
  ```
