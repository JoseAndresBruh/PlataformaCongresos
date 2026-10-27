# Instrucciones para Supabase - ULEAM-EVENTOS

Este directorio contiene los scripts SQL completos y optimizados para ejecutar en PostgreSQL a través de **Supabase**.

## Archivos de Migración

1. `migrations/01_schema.sql`: 
   - Define las extensiones (`uuid-ossp`, `pgcrypto`).
   - Define los Enums según la especificación: `modalidad_evento`, `estado_evento`, `estado_inscripcion`, `estado_comprobante`, `estado_email`.
   - Crea las **18 tablas del diccionario de datos** (Tablas 43 a 60):
     - `roles`, `usuarios`, `personal_evento`
     - `eventos`, `lineas_tematicas`, `sesiones_evento`, `ponentes`, `ponentes_sesion`, `recursos_evento`
     - `categorias_inscripcion`, `inscripciones`, `comprobantes`, `listas_espera`
     - `credenciales`, `asistencias`, `certificados`
     - `encuestas`, `respuestas_encuestas`, `registros_auditoria`, `email_logs`, `refresh_tokens`, `password_reset_tokens`, `email_verification_tokens`
   - Índices de rendimiento (RNF-015: `idx_eventos_estado`, `idx_inscripciones_evento_registrado`, etc.).
   - Triggers automáticos para `actualizado_at`.
   - Vistas analíticas para Dashboards (`vista_resumen_eventos`).

2. `migrations/02_seed_data.sql`:
   - Inserta los 7 roles jerárquicos de ULEAM-EVENTOS.
   - Crea cuentas de prueba institucionales (`admin@uleam.edu.ec`, `organizador@uleam.edu.ec`, `gestion@uleam.edu.ec`, `asistencia@uleam.edu.ec`, `estudiante@uleam.edu.ec`, etc.) con contraseña: `Admin123!`.
   - Datos reales del **I Congreso Internacional de Software 2026** de la ULEAM con líneas temáticas, ponencias magistrales (Dr. Jonny Pérez Véliz, etc.), categorías tarifarias, comprobantes y credencial QR firmada.

---

## Cómo ejecutar en Supabase

### Opción 1: Supabase Web Dashboard (Recomendado)
1. Inicia sesión en tu proyecto de [Supabase Dashboard](https://supabase.com/dashboard).
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Haz clic en **+ New Query**.
4. Copia y pega el contenido completo de `01_schema.sql` y presiona **Run** (botón verde).
5. Abre una nueva pestaña de consulta, copia y pega `02_seed_data.sql` y presiona **Run**.
6. Ve a **Table Editor** en el menú de Supabase para verificar que todas las tablas y datos están creados.

### Opción 2: Supabase CLI (Desarrollo local)
```bash
# Iniciar supabase local
supabase start

# Ejecutar migraciones
supabase db reset
```

---

## Conexión con el Backend en Go
En el archivo `backend/.env`, configura la variable de conexión de Supabase:
```env
# En Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)
DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
PORT=8080
JWT_SECRET=super_secret_uleam_jwt_key_2026
```
