-- ====================================================================
-- SISTEMA ULEAM-EVENTOS: CONFIGURACIÓN INTEGRAL DE SUPABASE STORAGE & DB
-- Copia y pega este script completo en el SQL Editor de tu consola Supabase
-- Proyecto: https://xoqzmiqdsgtxlhhpandb.supabase.co
-- ====================================================================

-- 1. CREACIÓN DEL BUCKET 'comprobantes' EN STORAGE.BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'comprobantes',
    'comprobantes',
    true, -- Acceso público CDN para previsualización inmediata en navegador
    10485760, -- 10 MB límite máximo de archivo
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'application/pdf'];

-- 2. POLÍTICAS DE ACCESO RLS EN STORAGE.OBJECTS PARA 'comprobantes'
-- Permitir que participantes (autenticados o anónimos en registro) suban comprobantes
DROP POLICY IF EXISTS "Permitir subida publica de comprobantes" ON storage.objects;
CREATE POLICY "Permitir subida publica de comprobantes" ON storage.objects
FOR INSERT TO public, anon, authenticated
WITH CHECK (bucket_id = 'comprobantes');

-- Permitir lectura pública y previsualización de comprobantes mediante CDN
DROP POLICY IF EXISTS "Permitir lectura publica de comprobantes" ON storage.objects;
CREATE POLICY "Permitir lectura publica de comprobantes" ON storage.objects
FOR SELECT TO public, anon, authenticated
USING (bucket_id = 'comprobantes');

-- Permitir que el personal de gestión o administradores actualicen o eliminen soportes
DROP POLICY IF EXISTS "Permitir actualizacion autorizada de comprobantes" ON storage.objects;
CREATE POLICY "Permitir actualizacion autorizada de comprobantes" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'comprobantes');

DROP POLICY IF EXISTS "Permitir eliminacion autorizada de comprobantes" ON storage.objects;
CREATE POLICY "Permitir eliminacion autorizada de comprobantes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'comprobantes');

-- 3. ESTADOS DE PAGO Y COLUMNAS DE OPTIMIZACIÓN WEBP EN EL ESQUEMA PÚBLICO
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pago_enum') THEN
        CREATE TYPE estado_pago_enum AS ENUM (
            'No pagado',
            'Pago en verificación',
            'Pagado',
            'Rechazado'
        );
    END IF;
END $$;

-- Columna estado_pago en inscripciones
ALTER TABLE public.inscripciones
ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(50) DEFAULT 'No pagado';

-- Columna estado_pago y metadatos de compresión en comprobantes
ALTER TABLE public.comprobantes
ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(50) DEFAULT 'Pago en verificación',
ADD COLUMN IF NOT EXISTS formato VARCHAR(10) DEFAULT 'webp',
ADD COLUMN IF NOT EXISTS tamano_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hash_archivo VARCHAR(64);

-- 4. TABLA PARA CONFIGURACIÓN DEL BOT DE NOTIFICACIONES (Telegram / WhatsApp)
CREATE TABLE IF NOT EXISTS public.configuracion_bot (
    id SERIAL PRIMARY KEY,
    telegram_bot_token VARCHAR(255) DEFAULT '',
    telegram_chat_id VARCHAR(100) DEFAULT '',
    whatsapp_phone VARCHAR(30) DEFAULT '+593987654321',
    recordatorios_activos BOOLEAN DEFAULT true,
    intervalo_minutos INT DEFAULT 15,
    ultimo_envio_at TIMESTAMP WITH TIME ZONE,
    total_notificaciones_enviadas INT DEFAULT 0,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en configuracion_bot
ALTER TABLE public.configuracion_bot ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total a configuracion bot" ON public.configuracion_bot;
CREATE POLICY "Acceso total a configuracion bot" ON public.configuracion_bot
FOR ALL USING (true) WITH CHECK (true);

-- Semilla inicial de parámetros del bot si no existe
INSERT INTO public.configuracion_bot (id, telegram_bot_token, telegram_chat_id, whatsapp_phone, recordatorios_activos, intervalo_minutos)
VALUES (1, '', '', '+593987654321', true, 15)
ON CONFLICT (id) DO NOTHING;

-- 5. VISTA DE AUDITORÍA FINANCIERA PARA LA MESA DE GESTIÓN
CREATE OR REPLACE VIEW public.vista_auditoria_finanzas
WITH (security_invoker = true) AS
SELECT 
    i.id AS inscripcion_id,
    e.nombre AS evento_nombre,
    u.nombres || ' ' || u.apellidos AS participante,
    u.identificacion AS cedula,
    u.correo AS participante_correo,
    cat.nombre AS categoria,
    cat.precio AS monto,
    COALESCE(i.estado_pago, 'No pagado') AS estado_pago,
    i.estado AS estado_inscripcion,
    c.url_archivo AS comprobante_url,
    c.formato AS formato_soporte,
    c.tamano_bytes,
    c.subido_at,
    c.limite_revision_at,
    CASE 
        WHEN c.limite_revision_at IS NULL THEN 'SIN_COMPROBANTE'
        WHEN now() > c.limite_revision_at THEN 'VENCIDO'
        WHEN c.limite_revision_at - now() <= interval '4 hours' THEN 'URGENTE'
        ELSE 'A_TIEMPO'
    END AS estado_sla
FROM public.inscripciones i
JOIN public.eventos e ON i.evento_id = e.id
JOIN public.usuarios u ON i.usuario_id = u.id
JOIN public.categorias_inscripcion cat ON i.categoria_id = cat.id
LEFT JOIN public.comprobantes c ON c.inscripcion_id = i.id;
