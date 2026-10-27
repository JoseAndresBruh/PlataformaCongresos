-- ====================================================================
-- SISTEMA DE GESTIÓN DE EVENTOS ACADÉMICOS: ULEAM-EVENTOS
-- BASE DE DATOS POSTGRESQL / SUPABASE
-- Script de Datos Semilla para Pruebas (Seed Data)
-- UUIDs compatibles con estándar RFC 4122 (dígitos hexadecimales 0-9, a-f)
-- ====================================================================

-- 1. ROLES DEL SISTEMA (RF-003, Tabla 44)
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'SUPER_ADMIN', 'Administrador Informático con control total sobre la plataforma y eventos'),
(2, 'ADMIN_EVENTO', 'Administrador de congresos y eventos asignados'),
(3, 'PERSONAL_GESTION', 'Personal encargado de revisión de comprobantes, pagos y finanzas'),
(4, 'PERSONAL_ASISTENCIA', 'Personal operativo de campo para escaneo de credenciales QR y check-in'),
(5, 'PONENTE_FERIA', 'Expositor y ponente en feria de proyectos científicos'),
(6, 'PONENTE', 'Conferencista magistral o ponente académico invitado'),
(7, 'ASISTENTE', 'Participante regular u oyente')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

-- Sincronizar secuencia de roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. USUARIOS DE PRUEBA (Tabla 43)
-- Contraseña para todos los usuarios de prueba: "Admin123!" 
-- Hash bcrypt (cost 10): $2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua
INSERT INTO usuarios (id, correo, contrasena_hash, nombres, apellidos, identificacion, institucion, telefono, url_foto_perfil, correo_verificado)
VALUES
-- Super Admin
('00000000-0000-0000-0000-000000000001', 'admin@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Carlos Adrian', 'Valencia Mendoza', '1312345678', 'Universidad Laica Eloy Alfaro de Manabí', '0987654321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),

-- Admin de Evento
('00000000-0000-0000-0000-000000000002', 'organizador@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Jandry David', 'Fernández Cedeño', '1314567890', 'Universidad Laica Eloy Alfaro de Manabí', '0991234567', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),

-- Personal de Gestión (Finanzas / Pagos)
('00000000-0000-0000-0000-000000000003', 'gestion@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'José Andrés', 'Loor Muñoz', '1315678901', 'Facultad Ciencias de la Vida y Tecnologías', '0998877665', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true),

-- Personal de Asistencia (Staff Puerta / QR)
('00000000-0000-0000-0000-000000000004', 'asistencia@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Alan Joel', 'Cobeña Naranjo', '1316789012', 'Facultad Ciencias de la Vida y Tecnologías', '0995544332', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', true),

-- Ponente Magistral
('00000000-0000-0000-0000-000000000005', 'ponente@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Dr. Jonny', 'Pérez Véliz', '1301122334', 'ULEAM / Investigador PhD', '0993322110', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', true),

-- Asistente Estudiante Regular
('00000000-0000-0000-0000-000000000006', 'estudiante@uleam.edu.ec', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Karla Jamileth', 'Andrade Mendoza', '1317890123', 'Carrera de Ingeniería en Software', '0981122334', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', true),

-- Asistente Externo
('00000000-0000-0000-0000-000000000007', 'participante.externo@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua', 'Javier David', 'Jaramillo Intriago', '1318901234', 'Universidad Técnica de Manabí (UTM)', '0984455667', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', true)
ON CONFLICT (id) DO NOTHING;

-- 3. ASIGNACIÓN DE ROLES INTERNOS (Tabla 45: personal_evento)
INSERT INTO personal_evento (usuario_id, evento_id, rol_id)
VALUES
('00000000-0000-0000-0000-000000000001', NULL, 1), -- Super Admin global
('00000000-0000-0000-0000-000000000002', NULL, 2)  -- Admin Evento general
ON CONFLICT DO NOTHING;

-- 4. EVENTOS ACADÉMICOS (Tabla 46)
INSERT INTO eventos (id, slug, nombre, descripcion, fecha_inicio, fecha_fin, modalidad, lugar, url_afiche, url_logo, idioma_principal, capacidad_maxima, repositorio_abierto, estado)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'congreso-internacional-software-2026',
    'I Congreso Internacional de Ingeniería en Software y Tecnologías Emergentes 2026',
    'Magno encuentro científico-académico de la ULEAM enfocado en Inteligencia Artificial Generativa, Arquitecturas Cloud, Ciberseguridad y Calidad de Software con conferencistas de alto nivel y ponencias indexadas.',
    '2026-11-15 08:30:00+00',
    '2026-11-17 18:00:00+00',
    'HIBRIDO',
    'Paraninfo Alfonso Aguilar Ruilova & Aula Magna Chone, Manta',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200',
    'es',
    450,
    true,
    'INSCRIPCIONES_ABIERTAS'
),
(
    '10000000-0000-0000-0000-000000000002',
    'workshop-metodologias-devops-2026',
    'Workshop Práctico de Metodologías Ágiles, CI/CD y DevOps',
    'Taller intensivo hands-on para estudiantes de vinculación e industria: automatización de pipelines, contenedores Docker y orquestación.',
    '2026-10-24 09:00:00+00',
    '2026-10-24 17:00:00+00',
    'PRESENCIAL',
    'Laboratorio 3 - Facultad Ciencias de la Vida y Tecnologías',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    'es',
    60,
    true,
    'EN_CURSO'
),
(
    '10000000-0000-0000-0000-000000000003',
    'seminario-etica-profesional-ia',
    'Seminario de Ética Profesional en la Era de la IA',
    'Discusión magistral sobre los dilemas éticos, derechos de autor y regulación en el desarrollo de software inteligente en el Ecuador.',
    '2026-09-12 14:00:00+00',
    '2026-09-12 19:00:00+00',
    'VIRTUAL',
    'Sala Virtual Teams ULEAM',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200',
    'es',
    300,
    true,
    'FINALIZADO'
)
ON CONFLICT (id) DO NOTHING;

-- Asignación de personal a eventos específicos
INSERT INTO personal_evento (usuario_id, evento_id, rol_id)
VALUES
('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 3), -- Personal Gestión para el Congreso
('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 4)  -- Personal Asistencia para el Congreso
ON CONFLICT DO NOTHING;

-- 5. LÍNEAS TEMÁTICAS (Tabla 47)
INSERT INTO lineas_tematicas (id, evento_id, nombre, color)
VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Inteligencia Artificial y Machine Learning', '#002F6C'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Arquitectura de Software y Cloud Computing', '#BB001E'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Ciberseguridad y Privacidad de Datos', '#2E7D32')
ON CONFLICT (id) DO NOTHING;

-- 6. SESIONES DEL EVENTO (Tabla 48)
INSERT INTO sesiones_evento (id, evento_id, linea_tematica_id, titulo, descripcion, hora_inicio, hora_fin, url_lugar_virtual)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Conferencia Magistral: Modelos Fundacionales en la Educación Superior',
    'Análisis de impacto, arquitectura de LLMs y personalización de aprendizaje en universidades latinoamericanas.',
    '2026-11-15 09:00:00+00',
    '2026-11-15 11:00:00+00',
    'https://transmision.uleam.edu.ec/live/ciist-dia1'
),
(
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Panel de Expertos: Microservicios de Alto Desempeño en Go y Rust',
    'Debate sobre concurrencia, uso de memoria, patrones de resiliencia y migración de monolitos.',
    '2026-11-15 14:00:00+00',
    '2026-11-15 16:30:00+00',
    'https://transmision.uleam.edu.ec/live/ciist-dia1-panel'
)
ON CONFLICT (id) DO NOTHING;

-- 7. PONENTES (Tabla 49)
INSERT INTO ponentes (id, evento_id, usuario_id, nombres, apellidos, titulo_academico, institucion, correo, url_linkedin, biografia, url_foto)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000005',
    'Jonny',
    'Pérez Véliz',
    'Dr. PhD',
    'Universidad Laica Eloy Alfaro de Manabí',
    'ponente@uleam.edu.ec',
    'https://linkedin.com/in/jonnyperez',
    'Doctor en Ciencias de la Computación, investigador en Inteligencia Artificial y supervisor académico de vinculación.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300'
),
(
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    NULL,
    'Elena',
    'Vásquez Romero',
    'Mg. Sc.',
    'Tech Lead Cloud Architect en CloudLATAM',
    'elena.vasquez@cloudlatam.com',
    'https://linkedin.com/in/elenavasquez',
    'Especialista en infraestructura distribuida de alto tráfico y arquitecturas basadas en eventos.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
)
ON CONFLICT (id) DO NOTHING;

-- Relación Ponente con Sesión (Tabla 50)
INSERT INTO ponentes_sesion (sesion_id, ponente_id)
VALUES
('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Recursos del Evento / Repositorio (Tabla 51)
INSERT INTO recursos_evento (id, ponente_id, evento_id, titulo, url_archivo)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Diapositivas: Modelos Fundacionales e IA en la ULEAM (PDF)',
    'https://storage.uleam.edu.ec/recursos/ciist-2026-dr-jonny-perez.pdf'
)
ON CONFLICT (id) DO NOTHING;

-- 8. CATEGORÍAS DE INSCRIPCIÓN (Tabla 52)
INSERT INTO categorias_inscripcion (id, evento_id, nombre, precio, capacidad_maxima, fecha_inicio, fecha_fin, requiere_comprobante)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Estudiante ULEAM (Beca 100%)',
    0.00,
    300,
    '2026-10-01 00:00:00+00',
    '2026-11-14 23:59:59+00',
    false
),
(
    '60000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Profesional / Público General',
    25.00,
    150,
    '2026-10-01 00:00:00+00',
    '2026-11-14 23:59:59+00',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 9. INSCRIPCIONES (Tabla 53)
INSERT INTO inscripciones (id, evento_id, usuario_id, categoria_id, estado, exonerado_por, nota_exoneracion, registrado_at)
VALUES
-- Inscripción Confirmada Estudiante ULEAM
(
    '70000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006', -- Karla Andrade
    '60000000-0000-0000-0000-000000000001', -- Estudiante ULEAM
    'CONFIRMADA',
    NULL,
    'Inscripción gratuita por matrícula activa ULEAM',
    NOW() - INTERVAL '3 days'
),
-- Inscripción Pendiente de Revisión Externo (Con comprobante)
(
    '70000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000007', -- Javier Jaramillo
    '60000000-0000-0000-0000-000000000002', -- Profesional $25
    'PENDIENTE_REVISION',
    NULL,
    NULL,
    NOW() - INTERVAL '1 day'
),
-- Inscripción de evento finalizado (Seminario Ética)
(
    '70000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000006',
    '60000000-0000-0000-0000-000000000001',
    'CONFIRMADA',
    NULL,
    NULL,
    NOW() - INTERVAL '40 days'
)
ON CONFLICT (id) DO NOTHING;

-- 10. COMPROBANTE DE PAGO (Tabla 54 con ventana SLA de 24 horas)
INSERT INTO comprobantes (id, inscripcion_id, url_archivo, estado_revision, auditor_id, observaciones, fecha_auditoria, subido_at, limite_revision_at)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000002',
    'https://storage.uleam.edu.ec/comprobantes/transferencia-banco-pichincha-098231.pdf',
    'EN_REVISION',
    NULL,
    'Transferencia #098231 por $25.00 a la cuenta institucional ULEAM. Revisión de 24h activa.',
    NULL,
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '20 hours' -- Faltan 20 horas para que venza la ventana
)
ON CONFLICT (id) DO NOTHING;

-- 11. CREDENCIAL DIGITAL CON QR FIRMADO (Tabla 56)
INSERT INTO credenciales (id, inscripcion_id, token_qr_seguro, url_pdf, emitido_at)
VALUES
(
    '90000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000001',
    'ULEAM-QR-70000000-0000-0000-0000-000000000001-TOKEN',
    'https://storage.uleam.edu.ec/credenciales/credencial-karla-andrade-ciist.pdf',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 12. ASISTENCIA / CHECK-IN REGISTRADO (Tabla 57)
INSERT INTO asistencias (id, inscripcion_id, sesion_id, escaneado_por, marca_tiempo)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004', -- Escaneado por personal de asistencia
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- 13. CERTIFICADOS DIGITALES EMITIDOS (Tabla 58)
INSERT INTO certificados (id, inscripcion_id, url_pdf, codigo_validacion, emitido_at)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000003',
    'https://storage.uleam.edu.ec/certificados/cert-etica-karla-andrade.pdf',
    'ULEAM-2026-ETICA-884920',
    NOW() - INTERVAL '35 days'
)
ON CONFLICT (id) DO NOTHING;

-- 14. ENCUESTA DE SATISFACCIÓN (Tabla 59)
INSERT INTO encuestas (id, evento_id, preguntas)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '[
        {
            "id": 1,
            "tipo": "nps",
            "enunciado": "¿Qué tan probable es que recomiendes este congreso a otros estudiantes o profesionales?",
            "escala": [1, 10]
        },
        {
            "id": 2,
            "tipo": "likert",
            "enunciado": "¿El nivel académico y la claridad de los ponentes cumplió tus expectativas?",
            "opciones": ["Muy deficiente", "Deficiente", "Aceptable", "Bueno", "Excelente"]
        },
        {
            "id": 3,
            "tipo": "texto",
            "enunciado": "¿Qué temas te gustaría ver en la próxima edición de ULEAM-EVENTOS?"
        }
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 15. AUDITORÍA INICIAL (Tabla 60)
INSERT INTO registros_auditoria (usuario_id, accion, recurso, resultado, detalles)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'CREAR_EVENTO',
    'eventos:10000000-0000-0000-0000-000000000001',
    'PERMITIDO',
    '{"nombre": "I Congreso Internacional de Software 2026", "autor": "Carlos Adrian Valencia"}'::jsonb
);
