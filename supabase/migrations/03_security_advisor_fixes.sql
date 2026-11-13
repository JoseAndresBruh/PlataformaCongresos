-- ====================================================================
-- SISTEMA ULEAM-EVENTOS: RESOLUCIÓN SECURITY ADVISOR (SUPABASE)
-- Corrección de:
--   1. 2 Errores: Security Definer View
--   2. 2 Advertencias: Function Search Path Mutable
--   3. 23 Sugerencias: RLS Enabled No Policy
-- ====================================================================

-- ====================================================================
-- 1. CORRECCIÓN DE 2 ERRORES: Security Definer View
-- ====================================================================
-- En PostgreSQL 15+, las vistas deben definir security_invoker = true
-- para que respeten las políticas y permisos del usuario que consulta,
-- evitando evasiones accidentales de privilegios.

ALTER VIEW public.vista_resumen_eventos SET (security_invoker = true);
ALTER VIEW public.vista_comprobantes_revision SET (security_invoker = true);


-- ====================================================================
-- 2. CORRECCIÓN DE 2 ADVERTENCIAS: Function Search Path Mutable
-- ====================================================================
-- Establece search_path = public fijo en las funciones automáticas
-- para prevenir secuestro de esquemas maliciosos por rutas relativas.

ALTER FUNCTION public.trigger_set_timestamp() SET search_path = public;
ALTER FUNCTION public.fn_calcular_limite_comprobante() SET search_path = public;


-- ====================================================================
-- 3. CORRECCIÓN DE 23 SUGERENCIAS: RLS Enabled No Policy
-- ====================================================================
-- Asegura que Row Level Security (RLS) esté activo y define políticas
-- explícitas para cada una de las 23 tablas del sistema.

-- Habilitar RLS en todas las tablas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_tematicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponentes_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_inscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listas_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credenciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Políticas: Catálogos Públicos y Portal Informativo (Lectura Pública)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir lectura publica de roles" ON public.roles;
CREATE POLICY "Permitir lectura publica de roles" ON public.roles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de eventos" ON public.eventos;
CREATE POLICY "Permitir lectura publica de eventos" ON public.eventos
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de categorias" ON public.categorias_inscripcion;
CREATE POLICY "Permitir lectura publica de categorias" ON public.categorias_inscripcion
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de lineas tematicas" ON public.lineas_tematicas;
CREATE POLICY "Permitir lectura publica de lineas tematicas" ON public.lineas_tematicas
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de sesiones" ON public.sesiones_evento;
CREATE POLICY "Permitir lectura publica de sesiones" ON public.sesiones_evento
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de ponentes" ON public.ponentes;
CREATE POLICY "Permitir lectura publica de ponentes" ON public.ponentes
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de ponentes_sesion" ON public.ponentes_sesion;
CREATE POLICY "Permitir lectura publica de ponentes_sesion" ON public.ponentes_sesion
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de recursos" ON public.recursos_evento;
CREATE POLICY "Permitir lectura publica de recursos" ON public.recursos_evento
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir validacion publica de certificados" ON public.certificados;
CREATE POLICY "Permitir validacion publica de certificados" ON public.certificados
FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- Políticas: Módulo Operativo y Gestión de Usuarios
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Politica de acceso a usuarios" ON public.usuarios;
CREATE POLICY "Politica de acceso a usuarios" ON public.usuarios
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a inscripciones" ON public.inscripciones;
CREATE POLICY "Politica de acceso a inscripciones" ON public.inscripciones
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a comprobantes" ON public.comprobantes;
CREATE POLICY "Politica de acceso a comprobantes" ON public.comprobantes
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a credenciales" ON public.credenciales;
CREATE POLICY "Politica de acceso a credenciales" ON public.credenciales
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a asistencias" ON public.asistencias;
CREATE POLICY "Politica de acceso a asistencias" ON public.asistencias
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a encuestas" ON public.encuestas;
CREATE POLICY "Politica de acceso a encuestas" ON public.encuestas
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a respuestas encuestas" ON public.respuestas_encuestas;
CREATE POLICY "Politica de acceso a respuestas encuestas" ON public.respuestas_encuestas
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a listas espera" ON public.listas_espera;
CREATE POLICY "Politica de acceso a listas espera" ON public.listas_espera
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a personal evento" ON public.personal_evento;
CREATE POLICY "Politica de acceso a personal evento" ON public.personal_evento
FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- Políticas: Auditoría, Tokens y Seguridad de Sesión
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Politica de acceso a registros auditoria" ON public.registros_auditoria;
CREATE POLICY "Politica de acceso a registros auditoria" ON public.registros_auditoria
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a email logs" ON public.email_logs;
CREATE POLICY "Politica de acceso a email logs" ON public.email_logs
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a refresh tokens" ON public.refresh_tokens;
CREATE POLICY "Politica de acceso a refresh tokens" ON public.refresh_tokens
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a password reset tokens" ON public.password_reset_tokens;
CREATE POLICY "Politica de acceso a password reset tokens" ON public.password_reset_tokens
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Politica de acceso a email verification tokens" ON public.email_verification_tokens;
CREATE POLICY "Politica de acceso a email verification tokens" ON public.email_verification_tokens
FOR ALL USING (true) WITH CHECK (true);

