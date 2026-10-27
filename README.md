# Plataforma de Gestión de Congresos y Eventos (ULEAM-EVENTOS)

Sistema integral para la administración, publicación, inscripción, control de acceso y certificación de congresos y eventos académicos.

El proyecto está compuesto por:
- **Backend**: API REST desarrollada en **Go (Golang)** con el framework **Gin** y conexión a **PostgreSQL (Supabase)** (con soporte de fallback autónomo en memoria para desarrollo local).
- **Frontend**: Aplicación web SPA desarrollada en **React 19** con **Vite**, componentes modulares y diseño responsivo.

---

## 📂 Estructura del Repositorio

```text
PlataformaCongresos/
├── backend/            # API REST en Go (Gin)
│   ├── cmd/server/     # Punto de entrada (main.go)
│   ├── internal/       # Controladores, modelos, servicios y repositorios
│   ├── .env.example    # Plantilla de variables de entorno
│   └── go.mod          # Módulos y dependencias de Go
├── frontend/           # Interfaz de usuario en React + Vite
│   ├── src/            # Componentes, vistas y lógica de la SPA
│   ├── package.json    # Dependencias y scripts de Node.js
│   └── vite.config.js  # Configuración de Vite
├── supabase/           # Scripts SQL y migraciones de base de datos
│   └── migrations/     # Esquemas y datos de prueba (Seed data)
└── README.md           # Instrucciones generales del proyecto
```

---

## 📋 Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:

1. **Go (Golang)**: Versión **1.22** o superior (recomendado 1.24+).
   - Verifica con: `go version`
2. **Node.js**: Versión **18.x** o **20.x+** y gestor de paquetes **npm**.
   - Verifica con: `node -v` y `npm -v`
3. **Git**: Para clonar y gestionar el repositorio.
4. *(Opcional)* Cuenta en **Supabase** o instancia de **PostgreSQL** si deseas persistencia de datos completa.

---

## 🚀 Guía de Ejecución

Para ejecutar la aplicación completa necesitas iniciar **ambos servicios** (Backend y Frontend). Te recomendamos abrir **dos terminales separadas**.

---

### 1️⃣ Ejecutar el Backend (Go)

En tu primera terminal, sigue estos pasos:

#### 1. Entrar a la carpeta del backend
```bash
cd backend
```

#### 2. Configurar las variables de entorno
Crea tu archivo `.env` a partir del archivo de ejemplo:

- En **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- En **Windows (CMD)**:
  ```cmd
  copy .env.example .env
  ```
- En **Linux / macOS**:
  ```bash
  cp .env.example .env
  ```

> 💡 **Nota sobre la Base de Datos:**  
> Si no configuras la variable `DATABASE_URL` en el archivo `.env`, el backend se iniciará automáticamente en **modo autónomo con repositorio en memoria/fallback**, lo cual permite probar el sistema sin necesidad de configurar Supabase de inmediato.

#### 3. Descargar dependencias
```bash
go mod tidy
```

#### 4. Iniciar el servidor
Ejecuta el archivo principal:
```bash
go run cmd/server/main.go
```

Cuando inicie con éxito, verás un mensaje similar a:
```text
=====================================================
🚀 SERVIDOR ULEAM-EVENTOS (Go/Gin) INICIADO EN PUERTO 8080
📡 URL Base: http://localhost:8080/api/v1
=====================================================
```

#### 5. Verificar que está funcionando
Puedes abrir en tu navegador o hacer una petición a:
- [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

---

### 2️⃣ Ejecutar el Frontend (React + Vite)

En tu segunda terminal, sigue estos pasos:

#### 1. Entrar a la carpeta del frontend
```bash
cd frontend
```

#### 2. Instalar las dependencias de Node
```bash
npm install
```

#### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Una vez levantado, Vite mostrará la URL local en la terminal (por defecto [http://localhost:5173](http://localhost:5173)):
```text
  VITE v8.x.x  ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 4. Acceder a la plataforma
Abre tu navegador web e ingresa a:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🗄️ Base de Datos con Supabase (Opcional)

Si deseas utilizar la base de datos PostgreSQL en la nube de Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com/).
2. Entra al **SQL Editor** y ejecuta en orden los scripts ubicados en `supabase/migrations/`:
   - `01_schema.sql` (Crea tablas, enums, triggers e índices).
   - `02_seed_data.sql` (Inserta roles, usuarios y eventos de prueba).
3. Obtén la cadena de conexión en *Project Settings -> Database -> Connection string (URI / Pooler)*.
4. Pega la URL en tu archivo `backend/.env`:
   ```env
   DATABASE_URL=postgres://postgres.[TU_PROYECTO]:[TU_CONTRASEÑA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### 👤 Usuarios y Credenciales de Prueba (Seed Data)
| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Super Administrador** | `admin@uleam.edu.ec` | `Admin123!` |
| **Organizador / Admin Evento** | `organizador@uleam.edu.ec` | `Admin123!` |
| **Personal de Gestión** | `gestion@uleam.edu.ec` | `Admin123!` |
| **Control de Asistencia** | `asistencia@uleam.edu.ec` | `Admin123!` |
| **Participante / Estudiante** | `estudiante@uleam.edu.ec` | `Admin123!` |

---

## 🛠️ Otros Comandos Útiles

### Frontend
- **Compilar para producción:**
  ```bash
  npm run build
  ```
- **Previsualizar la compilación de producción:**
  ```bash
  npm run preview
  ```
- **Revisar código con linter (Oxlint):**
  ```bash
  npm run lint
  ```

### Backend
- **Compilar binario ejecutable:**
  - En Windows:
    ```bash
    go build -o server.exe cmd/server/main.go
    ```
  - En Linux / macOS:
    ```bash
    go build -o server cmd/server/main.go
    ```
- **Ejecutar el binario generado:**
  - En Windows: `.\server.exe`
  - En Linux / macOS: `./server`

---

## ❓ Preguntas Frecuentes y Solución de Problemas

- **¿Qué pasa si el puerto 8080 o 5173 está ocupado?**
  - Para el backend: Cambia la variable `PORT=8080` en el archivo `backend/.env` por otro puerto (por ejemplo `8081`). Recuerda actualizar también la variable `API_BASE` en el frontend si es necesario.
  - Para el frontend: Vite seleccionará automáticamente el siguiente puerto libre (ejemplo: `5174`).
- **Problemas de CORS:**
  - Si el frontend se ejecuta en un puerto diferente al habitual (5173 o 3000), añade la URL correspondiente en la variable `CORS_ALLOWED_ORIGINS` del archivo `backend/.env` separada por comas.
