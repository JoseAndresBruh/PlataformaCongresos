-- ====================================================================
-- SISTEMA DE GESTIÓN DE EVENTOS ACADÉMICOS: ULEAM-EVENTOS
-- BASE DE DATOS POSTGRESQL / SUPABASE
-- Script de Creación de Esquema DDL (Tablas 43 a 60 del documento)
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS (ENUMS)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modalidad_evento') THEN
        CREATE TYPE modalidad_evento AS ENUM ('PRESENCIAL', 'VIRTUAL', 'HIBRIDO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_evento') THEN
        CREATE TYPE estado_evento AS ENUM (
            'BORRADOR', 
            'PUBLICADO', 
            'INSCRIPCIONES_ABIERTAS', 
            'INSCRIPCIONES_CERRADAS', 
            'EN_CURSO', 
            'FINALIZADO', 
            'ARCHIVADO'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_inscripcion') THEN
        CREATE TYPE estado_inscripcion AS ENUM (
            'PENDIENTE_REVISION', 
            'CONFIRMADA', 
            'CANCELADA', 
            'EXONERADA'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_comprobante') THEN
        CREATE TYPE estado_comprobante AS ENUM (
            'PENDIENTE',
            'EN_REVISION',
            'APROBADO', 
            'RECHAZADO',
            'EXPIRADO'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_email') THEN
        CREATE TYPE estado_email AS ENUM (
            'Enviado', 
            'Fallido'
        );
    END IF;
END $$;

-- ====================================================================
-- 3. MÓDULO: SEGURIDAD, AUTENTICACIÓN Y USUARIOS
-- ====================================================================

-- Tabla 44: Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL
);

-- Tabla 43: Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    identificacion VARCHAR(20) NOT NULL UNIQUE,
    institucion VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    url_foto_perfil VARCHAR(255),
    correo_verificado BOOLEAN DEFAULT false,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================================
-- 4. MÓDULO: NÚCLEO DE EVENTOS, CRONOGRAMAS Y REPOSITORIO
-- ====================================================================

-- Tabla 46: Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    modalidad modalidad_evento NOT NULL,
    lugar VARCHAR(255),
    url_afiche VARCHAR(255),
    url_logo VARCHAR(255),
    idioma_principal VARCHAR(10) NOT NULL DEFAULT 'es',
    capacidad_maxima INT NOT NULL,
    repositorio_abierto BOOLEAN DEFAULT false,
    estado estado_evento NOT NULL DEFAULT 'BORRADOR',
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_fechas_evento CHECK (fecha_fin >= fecha_inicio)
);

-- Tabla 45: Personal del Evento (Asignación de roles internos a eventos o global)
CREATE TABLE IF NOT EXISTS personal_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE, -- NULL = alcance global en la plataforma
    rol_id INT NOT NULL REFERENCES roles(id),
    asignado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unq_usuario_evento_rol UNIQUE (usuario_id, evento_id, rol_id)
);

-- Tabla 47: Líneas Temáticas
CREATE TABLE IF NOT EXISTS lineas_tematicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Formato HEX '#002F6C'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla 48: Sesiones del Evento
CREATE TABLE IF NOT EXISTS sesiones_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    linea_tematica_id UUID REFERENCES lineas_tematicas(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    hora_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    url_lugar_virtual VARCHAR(255),
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_fechas_sesion CHECK (hora_fin >= hora_inicio)
);

-- Tabla 49: Ponentes
CREATE TABLE IF NOT EXISTS ponentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    titulo_academico VARCHAR(50) NOT NULL, -- 'Dr.', 'Mg.', 'Ing.', etc.
    institucion VARCHAR(150) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    url_linkedin VARCHAR(255),
    biografia TEXT,
    url_foto VARCHAR(255),
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla 50: Ponentes por Sesión (Asociativa M:N)
CREATE TABLE IF NOT EXISTS ponentes_sesion (
    sesion_id UUID NOT NULL REFERENCES sesiones_evento(id) ON DELETE CASCADE,
    ponente_id UUID NOT NULL REFERENCES ponentes(id) ON DELETE CASCADE,
    PRIMARY KEY (sesion_id, ponente_id)
);

-- Tabla 51: Recursos del Evento (Diapositivas, artículos, etc.)
CREATE TABLE IF NOT EXISTS recursos_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ponente_id UUID REFERENCES ponentes(id) ON DELETE SET NULL,
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================================
-- 5. MÓDULO: INSCRIPCIONES Y FINANZAS
-- ====================================================================

-- Tabla 52: Categorías de Inscripción
CREATE TABLE IF NOT EXISTS categorias_inscripcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    capacidad_maxima INT NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    requiere_comprobante BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla 53: Inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    categoria_id UUID NOT NULL REFERENCES categorias_inscripcion(id) ON DELETE RESTRICT,
    estado estado_inscripcion NOT NULL DEFAULT 'PENDIENTE_REVISION',
    exonerado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nota_exoneracion TEXT,
    registrado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unq_inscripcion_usuario_evento UNIQUE (evento_id, usuario_id)
);

-- Tabla 54: Comprobantes de Pago (Flujo de Pago por Estados con SLA 24h)
CREATE TABLE IF NOT EXISTS comprobantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    url_archivo VARCHAR(255) NOT NULL,
    estado_revision estado_comprobante NOT NULL DEFAULT 'EN_REVISION',
    auditor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    observaciones TEXT,
    fecha_auditoria TIMESTAMP WITH TIME ZONE,
    subido_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    limite_revision_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'), -- Ventana máxima de 24 horas
    CONSTRAINT chk_limite_revision CHECK (limite_revision_at >= subido_at)
);

-- Tabla 55: Listas de Espera
CREATE TABLE IF NOT EXISTS listas_espera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categorias_inscripcion(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    registrado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unq_espera_categoria_usuario UNIQUE (categoria_id, usuario_id)
);

-- ====================================================================
-- 6. MÓDULO: OPERACIÓN EN CAMPO, ASISTENCIA Y CERTIFICACIÓN
-- ====================================================================

-- Tabla 56: Credenciales Digitales
CREATE TABLE IF NOT EXISTS credenciales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL UNIQUE REFERENCES inscripciones(id) ON DELETE CASCADE,
    token_qr_seguro VARCHAR(500) NOT NULL UNIQUE,
    url_pdf VARCHAR(255) NOT NULL,
    emitido_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla 57: Asistencias (Check-ins en puertas/sesiones)
CREATE TABLE IF NOT EXISTS asistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    sesion_id UUID NOT NULL REFERENCES sesiones_evento(id) ON DELETE CASCADE,
    escaneado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    marca_tiempo TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unq_asistencia_inscripcion_sesion UNIQUE (inscripcion_id, sesion_id)
);

-- Tabla 58: Certificados Digitales
CREATE TABLE IF NOT EXISTS certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL UNIQUE REFERENCES inscripciones(id) ON DELETE CASCADE,
    url_pdf VARCHAR(255) NOT NULL,
    codigo_validacion VARCHAR(32) NOT NULL UNIQUE,
    emitido_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================================
-- 7. MÓDULO: ENCUESTAS Y AUDITORÍA DE INFRAESTRUCTURA
-- ====================================================================

-- Tabla 59: Encuestas de Satisfacción
CREATE TABLE IF NOT EXISTS encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL UNIQUE REFERENCES eventos(id) ON DELETE CASCADE,
    preguntas JSONB NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Respuestas a Encuestas
CREATE TABLE IF NOT EXISTS respuestas_encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    inscripcion_id UUID NOT NULL UNIQUE REFERENCES inscripciones(id) ON DELETE CASCADE,
    respuestas JSONB NOT NULL,
    enviado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla 60: Registros de Auditoría
CREATE TABLE IF NOT EXISTS registros_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    recurso VARCHAR(255) NOT NULL,
    resultado VARCHAR(20) NOT NULL, -- 'PERMITIDO' / 'DENEGADO'
    detalles JSONB,
    marca_tiempo TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Logs de Envío de Correos
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_correo VARCHAR(50) NOT NULL, -- 'CONFIRMACION', 'CREDENCIAL', 'CERTIFICADO', etc.
    estado estado_email NOT NULL,
    reintentos INT DEFAULT 0,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tokens de Sesión y Seguridad
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expira_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    usado BOOLEAN DEFAULT false,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expira_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    usado BOOLEAN DEFAULT false,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expira_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ====================================================================
-- 8. ÍNDICES DE RENDIMIENTO Y ESCALABILIDAD (RNF-015)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON eventos(slug);
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento_registrado ON inscripciones(evento_id, registrado_at);
CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesion ON asistencias(sesion_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_inscripcion ON asistencias(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_inscripcion ON comprobantes(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_registros_auditoria_usuario ON registros_auditoria(usuario_id, marca_tiempo DESC);

-- ====================================================================
-- 9. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ====================================================================

-- Función para actualizar timestamp modificado
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_eventos ON eventos;
CREATE TRIGGER set_timestamp_eventos
BEFORE UPDATE ON eventos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para calcular automáticamente la ventana de 24 horas del comprobante
CREATE OR REPLACE FUNCTION fn_calcular_limite_comprobante()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.limite_revision_at IS NULL THEN
        NEW.limite_revision_at := COALESCE(NEW.subido_at, NOW()) + INTERVAL '24 hours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_limite_comprobante ON comprobantes;
CREATE TRIGGER trg_set_limite_comprobante
BEFORE INSERT ON comprobantes
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_limite_comprobante();

-- ====================================================================
-- 10. VISTAS ANALÍTICAS PARA DASHBOARDS (RF-019, RF-023)
-- ====================================================================
CREATE OR REPLACE VIEW vista_resumen_eventos AS
SELECT 
    e.id AS evento_id,
    e.nombre,
    e.slug,
    e.estado,
    e.fecha_inicio,
    e.fecha_fin,
    e.capacidad_maxima,
    COUNT(DISTINCT i.id) AS total_inscritos,
    COUNT(DISTINCT CASE WHEN i.estado = 'CONFIRMADA' THEN i.id END) AS inscritos_confirmados,
    COUNT(DISTINCT CASE WHEN i.estado = 'PENDIENTE_REVISION' THEN i.id END) AS pagos_pendientes,
    COUNT(DISTINCT a.id) AS total_checkins,
    COUNT(DISTINCT c.id) AS total_certificados
FROM eventos e
LEFT JOIN inscripciones i ON e.id = i.evento_id
LEFT JOIN asistencias a ON i.id = a.inscripcion_id
LEFT JOIN certificados c ON i.id = c.inscripcion_id
GROUP BY e.id, e.nombre, e.slug, e.estado, e.fecha_inicio, e.fecha_fin, e.capacidad_maxima;

-- Vista de Seguimiento Operativo de Comprobantes con SLA de 24 horas
CREATE OR REPLACE VIEW vista_comprobantes_revision AS
SELECT 
    c.id AS comprobante_id,
    c.inscripcion_id,
    c.url_archivo,
    c.estado_revision,
    c.subido_at,
    c.limite_revision_at,
    ROUND(EXTRACT(EPOCH FROM (c.limite_revision_at - NOW())) / 3600, 1) AS horas_restantes,
    CASE 
        WHEN c.estado_revision IN ('APROBADO', 'RECHAZADO') THEN 'ATENDIDO'
        WHEN NOW() > c.limite_revision_at THEN 'SLA_VENCIDO'
        WHEN (c.limite_revision_at - NOW()) <= INTERVAL '4 hours' THEN 'URGENTE'
        ELSE 'A_TIEMPO'
    END AS estado_sla,
    u.nombres || ' ' || u.apellidos AS participante_nombre,
    u.identificacion,
    e.nombre AS evento_nombre,
    cat.nombre AS categoria_nombre,
    cat.precio AS monto_a_pagar
FROM comprobantes c
JOIN inscripciones i ON c.inscripcion_id = i.id
JOIN usuarios u ON i.usuario_id = u.id
JOIN eventos e ON i.evento_id = e.id
JOIN categorias_inscripcion cat ON i.categoria_id = cat.id;
