# Plataforma de Gestion de Congresos y Eventos (ULEAM-EVENTOS)

Sistema integral para la administracion, publicacion, inscripcion, control de acceso, gestion de pagos y certificacion de congresos y eventos academicos de la Universidad Laica Eloy Alfaro de Manabi (ULEAM).

El proyecto esta compuesto por:
- **Backend**: API REST desarrollada en **C# (.NET 9 ASP.NET Core Web API)** con conexion a **PostgreSQL (Supabase)**, autenticacion hibrida (JWT y Google OAuth), servicio de alertas persistentes para revision de pagos mediante bot de Telegram, y arquitectura modular con soporte de fallback autonomo.
- **Frontend**: Aplicacion web SPA desarrollada en **React 19** con **Vite**, lectura y generacion de codigos QR para control de asistencia, interfaz responsiva compatible con dispositivos moviles y soporte para navegacion segura HTTPS.
- **Base de Datos y Almacenamiento**: Instancia de **Supabase (PostgreSQL 15+)** con triggers de auditoria, funciones PL/pgSQL y buckets de **Supabase Storage** para el resguardo de comprobantes de pago.

---

## Estructura del Repositorio

```text
PlataformaCongresos/
├── backend/                             # API REST en C# (.NET 9)
│   ├── Configuration/                   # Configuracion y carga de variables de entorno
│   ├── Controllers/                     # Controladores de la API (Auth, Eventos, Inscripciones, etc.)
│   ├── Data/                            # Factoria de conexion a PostgreSQL y scripts
│   ├── Models/                          # Modelos de dominio, entidades y DTOs
│   ├── Repositories/                    # Capa de persistencia (PostgreSQL y Fallback en memoria)
│   ├── Services/                        # Servicios (JWT, Notificaciones Telegram de pagos)
│   ├── .env.example                     # Plantilla de variables de entorno (sin credenciales)
│   ├── Program.cs                       # Pipeline y configuracion de servicios ASP.NET Core
│   └── UleamEventos.Api.csproj          # Archivo de proyecto y dependencias NuGet
├── frontend/                            # Interfaz de usuario en React 19 + Vite
│   ├── src/                             # Componentes modulares, vistas por rol y logica SPA
│   ├── public/                          # Recursos publicos, logos institucionales y favicon
│   ├── .env.example                     # Plantilla de variables de entorno frontend
│   ├── package.json                     # Dependencias y scripts de Node.js
│   └── vite.config.js                   # Configuracion de Vite y servidor de desarrollo
├── supabase/                            # Scripts SQL y migraciones
│   └── migrations/                      # Esquemas de tablas, funciones, enums y seed data
└── README.md                            # Documentacion general del sistema
```

---

## Requisitos Previos

Asegurate de contar con las siguientes herramientas instaladas:

1. **.NET SDK 9.0**: Requerido para compilar y ejecutar el backend.
   - Verificar con: `dotnet --version`
2. **Node.js**: Version **18.x** o **20.x+** y gestor de paquetes **npm**.
   - Verificar con: `node -v` y `npm -v`
3. **Git**: Para el control de versiones.
4. *(Opcional)* Cuenta en **Supabase** para base de datos PostgreSQL y almacenamiento de comprobantes en la nube.

---

## Modulos y Funcionalidades Principales

### 1. Autenticacion Hibrida y Google OAuth
- Inicio de sesion y registro con credenciales locales (correo y contrasena hasheada con BCrypt).
- **Inicio de Sesion con Google**: Integracion fluida mediante Supabase Auth como intermediario OAuth 2.0 y sincronizacion automatica con el backend en `POST /api/v1/auth/google`.
- Emision y validacion de tokens de acceso **JWT** con roles de usuario (`SuperAdmin`, `Organizador`, `Revisor`, `Gestion`, `Asistencia`, `Asistente`).

### 2. Flujo de Inscripciones y Validacion de Pagos
- Registro de participantes en eventos y congresos con seleccion de modalidad (Estudiante, Profesional, Ponente).
- Ciclo de estados de pago:
  - **No pagado**: Inscripcion creada a la espera del comprobante de transferencia o deposito.
  - **Pago en verificacion**: El participante sube el comprobante digital (imagen o PDF), el cual se almacena en el bucket `comprobantes-pago` de Supabase.
  - **Pagado**: El personal de gestion valida el deposito y aprueba el pago, habilitando la credencial QR del participante.
  - **Rechazado**: El personal notifica motivos de inconsistencia en el deposito.
- **Notificaciones Persistentes via Bot de Telegram**: El backend incluye un servicio en segundo plano (`PaymentNotificationService`) que envia alertas periodicas programadas al canal o chat del personal de cobranzas mientras existan comprobantes pendientes de revision.

### 3. Acreditacion y Control de Asistencia mediante QR
- Generacion de credencial digital con codigo QR firmado para cada participante registrado y con pago aprobado.
- Modulo de escaneo de credenciales en tiempo real con camara web (PC) o camara trasera de dispositivos moviles (smartphones/tablets).
- Validacion inmediata contra el backend con registro de timestamp, operador de puerta y bloqueo de duplicados.

---

## Guia de Ejecucion Local

Se recomienda abrir dos terminales separadas para correr el backend y el frontend.

---

### 1. Ejecutar el Backend (.NET 9)

En tu primera terminal:

#### Paso 1: Entrar a la carpeta backend
```bash
cd backend
```

#### Paso 2: Crear el archivo de variables de entorno
Copia la plantilla `.env.example` a un nuevo archivo `.env`:

- En **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- En **Linux / macOS / Bash**:
  ```bash
  cp .env.example .env
  ```

Edita `backend/.env` con tus credenciales reales (este archivo esta en `.gitignore` y nunca se subira al repositorio):
```env
PORT=8080
DATABASE_URL=postgres://postgres.[TU_REF]:[TU_CLAVE]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL=https://[TU_REF].supabase.co
SUPABASE_KEY=[TU_ANON_KEY]
JWT_SECRET=uleam_secure_jwt_token_secret_key_2026_ciist
GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[TU_GOOGLE_CLIENT_SECRET]
TELEGRAM_BOT_TOKEN=[TU_BOT_TOKEN]
TELEGRAM_CHAT_ID=[TU_CHAT_ID]
```

> **Nota sobre Fallback en Memoria:**  
> Si no configuras `DATABASE_URL`, el backend arranca automaticamente con repositorios en memoria, permitiendo probar la API de inmediato sin conexion obligatoria a la nube.

#### Paso 3: Restaurar dependencias y ejecutar
```bash
dotnet build
dotnet run
```

El servidor quedara escuchando en:
- `http://localhost:8080/api/v1`
- Comprobacion de estado: `http://localhost:8080/api/v1/health`

---

### 2. Ejecutar el Frontend (React 19 + Vite)

En tu segunda terminal:

#### Paso 1: Entrar a la carpeta frontend
```bash
cd frontend
```

#### Paso 2: Configurar variables de entorno
Copia la plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```

Configura en `frontend/.env`:
```env
VITE_SUPABASE_URL=https://[TU_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[TU_ANON_KEY]
VITE_API_BASE=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID].apps.googleusercontent.com
```

#### Paso 3: Instalar dependencias
```bash
npm install
```

#### Paso 4: Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre en tu navegador:
- **`http://localhost:5173`**

---

## Configuracion de Google OAuth con Supabase

Para habilitar el boton **"Continuar con Google"**:

1. **Google Cloud Console**:
   - En *APIs y Servicios -> Credenciales*, crea un **ID de cliente de OAuth** tipo *Aplicacion Web*.
   - **Origenes autorizados de JavaScript**:
     - `http://localhost:5173`
     - `https://localhost:5173`
     - `https://micongreso.vercel.app`
   - **URIs de redireccionamiento autorizados**:
     - `https://[TU_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`

2. **Panel de Supabase**:
   - Ve a **Authentication -> Providers -> Google**.
   - Activa el interruptor **Enable Google provider**.
   - Pega tu `Client ID` y `Client Secret`.
   - Guarda los cambios.
   - Ve a **Authentication -> URL Configuration**:
     - **Site URL**: `http://localhost:5173`
     - **Redirect URLs**:
       - `http://localhost:5173/**`
       - `https://localhost:5173/**`
       - `https://micongreso.vercel.app/**`

---

## Acceso desde Dispositivos Moviles y Uso de Camara (Red Local)

Para probar el escaneo de codigos QR con la camara de un telefono movil dentro de la misma red Wi-Fi:

1. **Requisito de Seguridad del Navegador**: Los navegadores moviles modernos (Chrome, Safari) exigen una conexion segura **HTTPS** para conceder permisos de camara web (excepto en `localhost`).
2. **Exponer Vite en red local con HTTPS**:
   - En `frontend/vite.config.js`, puedes configurar el plugin `@vitejs/plugin-basic-ssl` o proveer certificados locales (`cert.pem` y `key.pem`).
   - Ejecuta:
     ```bash
     npm run dev -- --host 0.0.0.0
     ```
   - Accede desde el movil a la IP de tu computador (ejemplo: `https://192.168.1.15:5173`).
   - Acepta la advertencia de certificado autofirmado en el movil para habilitar el uso de la camara trasera.

---

## Base de Datos y Storage en Supabase

### 1. Tablas y Migraciones SQL
En el editor SQL de Supabase, ejecuta los scripts de la carpeta `supabase/migrations/`:
- `01_schema.sql`: Creacion de esquemas, tablas de usuarios, eventos, inscripciones, auditoria y triggers.
- `02_seed_data.sql`: Carga de datos base y usuarios iniciales.

### 2. Bucket de Almacenamiento
Crea un bucket publico en **Supabase -> Storage**:
- **Nombre del bucket**: `comprobantes-pago`
- Permite formatos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.

### Usuarios y Credenciales de Prueba (Seed Data)
| Rol | Correo Electronico | Contrasena |
| :--- | :--- | :--- |
| **Super Administrador** | `admin@uleam.edu.ec` | `Admin123!` |
| **Organizador / Admin Evento** | `organizador@uleam.edu.ec` | `Admin123!` |
| **Personal de Gestion / Finanzas** | `gestion@uleam.edu.ec` | `Admin123!` |
| **Control de Asistencia** | `asistencia@uleam.edu.ec` | `Admin123!` |
| **Participante / Estudiante** | `estudiante@uleam.edu.ec` | `Admin123!` |

---

## Politica de Seguridad y Exclusion de Credenciales

Este repositorio esta protegido para evitar la filtracion accidental de secretos:
- Los archivos `.env`, `.env.local`, certificados SSL (`*.pem`), archivos JSON de cuentas de servicio y credenciales OAuth (`client_secret_*.json`, `credentials.json`) estan estrictamente excluidos en `.gitignore`.
- Las plantillas `.env.example` contienen unicamente descripciones de variables y marcadores de posicion (`[YOUR_KEY]`), sin exponer valores de produccion ni credenciales sensibles.
- Nunca agregues secretos reales directamente en el codigo fuente. Utiliza siempre variables de entorno.
