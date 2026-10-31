import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  exportTableToCSV,
  downloadCertificatePDF,
  downloadCredentialPDF,
  openPrintableCertificateWindow,
} from './utils/documentExporter';
import NotFoundView from './components/NotFoundView';
import Search404State from './components/Search404State';

// API Base dinámica (compatible con Vite Proxy, Localhost y Red Local Wi-Fi para móviles)
const API_BASE = typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api/v1'
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.protocol}//${window.location.hostname}:8080/api/v1`
      : 'http://localhost:8080/api/v1');


const INITIAL_EVENTOS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    slug: 'congreso-internacional-software-2026',
    nombre: 'I Congreso Internacional de Ingeniería en Software y Tecnologías Emergentes 2026',
    descripcion:
      'Magno encuentro científico-académico de la ULEAM con ponencias sobre Inteligencia Artificial, Cloud Computing y Ciberseguridad con pares académicos internacionales.',
    fecha_inicio: '2026-11-15T08:30:00Z',
    fecha_fin: '2026-11-17T18:00:00Z',
    modalidad: 'HIBRIDO',
    lugar: 'Paraninfo Alfonso Aguilar Ruilova, Manta',
    url_afiche: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    capacidad_maxima: 450,
    estado: 'INSCRIPCIONES_ABIERTAS',
    categorias: [
      {
        id: '60000000-0000-0000-0000-000000000001',
        nombre: 'Estudiante ULEAM (Beca 100%)',
        precio: 0.0,
        cupo: 300,
        requiere_comprobante: false,
      },
      {
        id: '60000000-0000-0000-0000-000000000002',
        nombre: 'Profesional / Público General',
        precio: 25.0,
        cupo: 150,
        requiere_comprobante: true,
      },
    ],
    ponentes: [
      {
        nombres: 'Jonny',
        apellidos: 'Pérez Véliz',
        titulo_academico: 'Dr. PhD',
        institucion: 'Universidad Laica Eloy Alfaro de Manabí',
      },
      {
        nombres: 'Elena',
        apellidos: 'Vásquez Romero',
        titulo_academico: 'Mg. Sc.',
        institucion: 'CloudLATAM',
      },
    ],
    total_inscritos: 200,
    total_checkins: 142,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    slug: 'workshop-metodologias-devops-2026',
    nombre: 'Workshop Práctico de Metodologías Ágiles, CI/CD y DevOps',
    descripcion:
      'Taller intensivo para estudiantes de vinculación e industria: automatización de pipelines, contenedores Docker y orquestación en la nube.',
    fecha_inicio: '2026-10-24T09:00:00Z',
    fecha_fin: '2026-10-24T17:00:00Z',
    modalidad: 'PRESENCIAL',
    lugar: 'Laboratorio 3 - Facultad Ciencias de la Vida y Tecnologías',
    url_afiche: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    capacidad_maxima: 60,
    estado: 'EN_CURSO',
    categorias: [
      {
        id: '60000000-0000-0000-0000-000000000003',
        nombre: 'Participante General',
        precio: 0.0,
        cupo: 60,
        requiere_comprobante: false,
      },
    ],
    ponentes: [
      {
        nombres: 'Carlos',
        apellidos: 'Mendoza',
        titulo_academico: 'Ing.',
        institucion: 'Docente ULEAM',
      },
    ],
    total_inscritos: 58,
    total_checkins: 48,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    slug: 'seminario-etica-profesional-ia',
    nombre: 'Seminario de Ética Profesional en la Era de la IA',
    descripcion:
      'Discusión magistral sobre los dilemas éticos y marcos regulatorios en el desarrollo e implementación de software inteligente en el Ecuador.',
    fecha_inicio: '2026-09-12T14:00:00Z',
    fecha_fin: '2026-09-12T19:00:00Z',
    modalidad: 'VIRTUAL',
    lugar: 'Transmisión Microsoft Teams Institucional',
    url_afiche: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    capacidad_maxima: 300,
    estado: 'FINALIZADO',
    categorias: [],
    ponentes: [],
    total_inscritos: 285,
    total_checkins: 240,
  },
];

const FAQS_DATA = [
  {
    id: 1,
    categoria: 'PAGOS',
    pregunta: '¿Cuánto tiempo tarda la revisión de mi comprobante de pago bancario?',
    respuesta:
      'El sistema implementa una ventana estricta de SLA de 24 horas continuas a partir del momento en que subes tu comprobante (en formato PDF, JPG o PNG). Si no se revisa dentro del plazo, el sistema escala una alerta urgente en la Mesa de Finanzas.',
  },
  {
    id: 2,
    categoria: 'CERTIFICADOS',
    pregunta: '¿Cuáles son los requisitos para desbloquear y descargar mi certificado digital?',
    respuesta:
      'Debes cumplir con un mínimo del 80% de asistencia registrada en las sesiones del evento (mediante el escaneo óptico de tu código QR por parte del Staff en puerta) y responder la breve encuesta de satisfacción.',
  },
  {
    id: 3,
    categoria: 'FIRMAS',
    pregunta: '¿Los certificados descargados en PDF tienen validez legal y académica?',
    respuesta:
      'Sí. Cada certificado emitido incluye un Código Único Alfanumérico, un Hash Criptográfico SHA-256 verificado en PostgreSQL, un Código QR con enlace a la plataforma institucional y la firma digital autorizada del Rector y Director Académico con resolución oficial.',
  },
  {
    id: 4,
    categoria: 'CREDENCIAL',
    pregunta: '¿Es obligatorio imprimir el carnet / credencial QR para ingresar?',
    respuesta:
      'No es indispensable imprimirlo en papel. Puedes presentar tu credencial directamente en la pantalla de tu teléfono móvil para que el Personal de Asistencia (Staff) la escanee con la cámara óptica.',
  },
  {
    id: 5,
    categoria: 'BECAS',
    pregunta: '¿Cómo accedo a la Beca del 100% (Costo $0.00) para Estudiantes ULEAM?',
    respuesta:
      'Al inscribirte en el evento, selecciona la categoría "Estudiante ULEAM (Beca 100%)" e ingresa tu correo institucional @uleam.edu.ec y tu número de cédula. No requiere comprobante de transferencia bancaria.',
  },
  {
    id: 6,
    categoria: 'COMPROBANTES',
    pregunta: '¿Qué sucede si mi comprobante fue rechazado por inconsistencia?',
    respuesta:
      'Recibirás una notificación en el portal indicando el motivo del rechazo (ej. monto incorrecto o imagen borrosa). Podrás volver a subir un comprobante válido dentro de un nuevo plazo de 24 horas o comunicarte por la Soporte Técnico.',
  },
];

const FACULTY_DATA = {
  ciencias_vida: {
    nombre: 'Facultad de Ciencias de la Vida y Tecnologías',
    siglas: 'FCVT - ULEAM',
    decana: 'Dra. María Elena Ramos, PhD. — Decana de Facultad',
    mision:
      'Formar profesionales de excelencia e impulsar la investigación científica aplicada, la innovación digital y la vinculación con el sector productivo de Manabí.',
    carreras: [
      'Ingeniería en Software (Acreditada Internacionalmente)',
      'Ingeniería en Tecnologías de la Información',
      'Licenciatura en Biología Marina',
      'Ingeniería Ambiental y Recursos Naturales',
    ],
    laboratorios:
      'Laboratorio de Inteligencia Artificial, Redes de Datos, Bioensayos y Ciberseguridad.',
    query: 'software',
  },
  software: {
    nombre: 'Carrera de Ingeniería en Software',
    siglas: 'CARRERA DE SOFTWARE',
    decana: 'Ing. Carlos Mendoza, Mg. — Director de Carrera',
    mision:
      'Liderar la transformación digital del Ecuador formando ingenieros capacitados en metodologías ágiles, Cloud Computing, DevOps, Inteligencia Artificial y aseguramiento de la calidad de software.',
    carreras: [
      'Desarrollo Web y Móvil Escalable',
      'Arquitectura de Microservicios y DevOps',
      'Inteligencia Artificial y Machine Learning',
      'Vinculación con la Sociedad I y II',
    ],
    laboratorios:
      'Laboratorio de Desarrollo Ágil 3 y Fábrica de Software Estudiantil ULEAM.',
    query: 'software',
  },
  posgrado: {
    nombre: 'Dirección de Posgrado e Investigación Científica',
    siglas: 'POSGRADO ULEAM',
    decana: 'Dr. Jonny Pérez Véliz, PhD. — Coordinador General',
    mision:
      'Promover la investigación científica de alto impacto, publicaciones en revistas indexadas (Scopus / WoS) y programas de maestría académica y doctorados con aval del CACES y SENESCYT.',
    carreras: [
      'Maestría en Ciberseguridad y Auditoría TI',
      'Maestría en Inteligencia Artificial y Big Data',
      'Maestría en Gerencia de Sistemas de Información',
      'Doctorado (PhD) en Ciencias de la Computación',
    ],
    laboratorios: 'Centro de Supercómputo y Servidores de Alto Rendimiento ULEAM.',
    query: 'ética',
  },
};

export default function App() {
  // Función para resolver la vista correspondiente a una ruta URL o cambios en barra de navegación
  const resolveRoute = (path) => {
    const clean = (path || '/').toLowerCase().replace(/\/+$/, '') || '/';
    if (clean === '/' || clean === '/explorar') return { view: 'explorar', path: '/explorar' };
    if (clean === '/mis-eventos' || clean === '/credenciales') return { view: 'mis_eventos', path: '/mis-eventos', role: 'ASISTENTE' };
    if (clean === '/certificados' || clean === '/validar') return { view: 'certificados', path: '/certificados', role: 'ASISTENTE' };
    if (clean === '/super-admin' || clean === '/admin-global') return { view: 'super_admin', path: '/super-admin', role: 'SUPER_ADMIN' };
    if (clean === '/admin' || clean === '/admin-eventos' || clean === '/admin-kpi' || clean === '/resumen') return { view: 'admin_eventos', path: '/admin-eventos', role: 'ADMIN_EVENTO' };
    if (clean === '/gestion-pagos' || clean === '/finanzas' || clean === '/pagos') return { view: 'gestion_pagos', path: '/gestion-pagos', role: 'GESTION' };
    if (clean === '/checkin' || clean === '/checkin-staff' || clean === '/asistencia') return { view: 'checkin_staff', path: '/checkin', role: 'ASISTENCIA_STAFF' };
    if (clean.startsWith('/evento/')) {
      const slug = clean.replace('/evento/', '');
      return { view: 'evento_detail', slug, path: clean };
    }
    return { view: 'not_found', path: clean };
  };

  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

  // Estado de Rol Activo
  const [currentRole, setCurrentRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const r = resolveRoute(window.location.pathname);
      if (r.role) return r.role;
    }
    return 'ASISTENTE';
  });

  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const r = resolveRoute(window.location.pathname);
      return r.view === 'evento_detail' ? 'explorar' : r.view;
    }
    return 'explorar';
  });


  // Control de Visualización de Contraseña
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Modal de Confirmación para Cerrar Sesión
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Escáner QR de Cámara en Vivo (Compatible PC Webcam y Móviles)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' o 'user'
  const [cameraError, setCameraError] = useState(null);
  const [uploadedQrFileName, setUploadedQrFileName] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const videoRef = useRef(null);
  const scannerStreamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Pestaña del Panel de Super Administrador: 'usuarios' | 'firma' | 'auditoria'
  const [superAdminTab, setSuperAdminTab] = useState('usuarios');

  // Usuarios del Sistema para Gestión de Roles en Super Admin
  const [platformUsers, setPlatformUsers] = useState([
    { id: '00000000-0000-0000-0000-000000000001', correo: 'admin@uleam.edu.ec', nombres: 'Carlos Adrián', apellidos: 'Valencia Mendoza', identificacion: '1312345678', institucion: 'Dirección DITIC / ULEAM', rol: 'SUPER_ADMIN', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000002', correo: 'organizador@uleam.edu.ec', nombres: 'Jandry David', apellidos: 'Fernández Cedeño', identificacion: '1314567890', institucion: 'Facultad Ciencias de la Vida y Tecnologías', rol: 'ADMIN_EVENTO', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000003', correo: 'gestion@uleam.edu.ec', nombres: 'José Andrés', apellidos: 'Loor Muñoz', identificacion: '1315678901', institucion: 'Dirección Financiera ULEAM', rol: 'PERSONAL_GESTION', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000004', correo: 'asistencia@uleam.edu.ec', nombres: 'Alan Joel', apellidos: 'Cobeña Naranjo', identificacion: '1316789012', institucion: 'Coordinación Logística de Campo', rol: 'PERSONAL_ASISTENCIA', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000005', correo: 'ponente@uleam.edu.ec', nombres: 'Dr. Jonny', apellidos: 'Pérez Véliz', identificacion: '1301122334', institucion: 'Investigador PhD / ULEAM', rol: 'PONENTE', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000006', correo: 'estudiante@uleam.edu.ec', nombres: 'Karla Jamileth', apellidos: 'Andrade Mendoza', identificacion: '1317890123', institucion: 'Ingeniería en Software', rol: 'ASISTENTE', estado: 'ACTIVO' },
    { id: '00000000-0000-0000-0000-000000000007', correo: 'participante.externo@gmail.com', nombres: 'Javier David', apellidos: 'Jaramillo Intriago', identificacion: '1318901234', institucion: 'Univ. Técnica de Manabí (UTM)', rol: 'ASISTENTE', estado: 'ACTIVO' },
  ]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('TODOS');

  // Bitácora de Auditoría del Sistema
  const [auditLogs] = useState([
    { id: 'aud-01', accion: 'INICIO_SESION', usuario: 'admin@uleam.edu.ec', rol: 'SUPER_ADMIN', resultado: 'PERMITIDO', fecha: 'Hace 4 min', ip: '192.168.1.10' },
    { id: 'aud-02', accion: 'AUDITORIA_PAGO_APROBADO', usuario: 'gestion@uleam.edu.ec', rol: 'PERSONAL_GESTION', resultado: 'PERMITIDO', fecha: 'Hace 12 min', ip: '192.168.1.25' },
    { id: 'aud-03', accion: 'CHECKIN_QR_PUERTA', usuario: 'asistencia@uleam.edu.ec', rol: 'PERSONAL_ASISTENCIA', resultado: 'PERMITIDO', fecha: 'Hace 25 min', ip: '192.168.1.44' },
    { id: 'aud-04', accion: 'DESCARGA_CERTIFICADO', usuario: 'estudiante@uleam.edu.ec', rol: 'ASISTENTE', resultado: 'PERMITIDO', fecha: 'Hace 45 min', ip: '186.42.112.5' },
    { id: 'aud-05', accion: 'CREACION_CONGRESO', usuario: 'organizador@uleam.edu.ec', rol: 'ADMIN_EVENTO', resultado: 'PERMITIDO', fecha: 'Hace 1 hora', ip: '192.168.1.15' },
  ]);

  // Función de Audio Beep para confirmación de escaneo QR
  const playScanBeep = (isSuccess) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio no permitido sin gesto o no disponible
    }
  };

  // Enumerar dispositivos de video disponibles
  const refreshCameras = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevs);
        if (videoDevs.length > 0 && !selectedCameraId) {
          const preferred = videoDevs.find((d) => !d.label.toLowerCase().includes('virtual')) || videoDevs[0];
          setSelectedCameraId(preferred.deviceId);
        }
      } catch (e) {
        console.warn('No se pudieron enumerar dispositivos de video:', e);
      }
    }
  };

  useEffect(() => {
    refreshCameras();
  }, []);

  // Métodos del Escáner QR de Cámara
  const startQrCamera = async (targetDevId = null, facing = cameraFacing) => {
    setCameraError(null);
    try {
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((t) => t.stop());
        scannerStreamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API_NO_DISPONIBLE');
      }

      const activeDevId = targetDevId || selectedCameraId;
      let stream = null;

      // 1. Intentar con deviceId exacto si se seleccionó una cámara específica
      if (activeDevId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: activeDevId } },
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { ideal: activeDevId } },
            });
          } catch {
            // Continuar al siguiente fallback
          }
        }
      }

      // 2. Si no hay deviceId o falló, intentar por facingMode (móvil)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facing } },
          });
        } catch {
          // 3. Fallback genérico para webcams de escritorio (PC)
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      scannerStreamRef.current = stream;
      setCameraActive(true);
      setCameraFacing(facing);
      if (targetDevId) setSelectedCameraId(targetDevId);

      // Re-consultar dispositivos (al conceder permiso se revelan los nombres reales de las cámaras)
      refreshCameras();

      // Enlazar stream al video inmediatamente o con un breve retardo de montaje
      setTimeout(() => {
        if (videoRef.current && scannerStreamRef.current) {
          videoRef.current.srcObject = scannerStreamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 60);

      // Iniciar detector de códigos QR nativo si el navegador lo soporta
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                handleExecuteScan(code);
                stopQrCamera();
              }
            } catch {
              // Frame skip
            }
          }
        }, 300);
      }
    } catch (err) {
      console.error('Fallo al inicializar cámara:', err);
      const isHttpMobile = typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost';
      setCameraError(
        isHttpMobile
          ? 'Cámara bloqueada: Los dispositivos móviles exigen conexión segura (HTTPS) para encender la cámara. Ingresa desde tu móvil a: https://' + window.location.hostname + ':5173'
          : 'No se pudo acceder a la cámara. Comprueba los permisos del navegador, que la cámara no esté ocupada por otra app (Teams, Zoom, OBS) o prueba seleccionando otra cámara en el menú.'
      );
      setCameraActive(false);
    }
  };

  const stopQrCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((t) => t.stop());
      scannerStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleQrCamera = () => {
    if (availableCameras.length > 1) {
      const curIdx = availableCameras.findIndex((c) => c.deviceId === selectedCameraId);
      const nextIdx = (curIdx + 1) % availableCameras.length;
      const nextDev = availableCameras[nextIdx];
      setSelectedCameraId(nextDev.deviceId);
      startQrCamera(nextDev.deviceId);
      showToast(`Cambiando a: ${nextDev.label || `Cámara ${nextIdx + 1}`}`);
    } else {
      const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
      setCameraFacing(nextFacing);
      startQrCamera(null, nextFacing);
    }
  };

  // Reasignar rol a usuario en Super Admin
  const handleUserRoleChange = (userId, newRole) => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
    );
    const targetUser = platformUsers.find((u) => u.id === userId);
    showToast(`Rol actualizado a ${newRole} para ${targetUser ? targetUser.nombres : 'usuario'}.`);
  };

  // Efecto reactivo para garantizar que el stream de la cámara se vincule al elemento video al montarse
  useEffect(() => {
    if (cameraActive && videoRef.current && scannerStreamRef.current) {
      if (videoRef.current.srcObject !== scannerStreamRef.current) {
        videoRef.current.srcObject = scannerStreamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Fallo en reproducción de video:', err);
      });
    }
  }, [cameraActive, cameraFacing]);

  // Función unificada de procesamiento de Check-in
  const handleExecuteScan = (rawCode) => {
    const code = (rawCode || '').trim();
    if (!code) return;

    if (code.includes('ERROR') || code === '0000000000') {
      playScanBeep(false);
      setScanResult({
        exito: false,
        mensaje: 'ACCESO DENEGADO: Credencial QR o identificación no válida para este congreso.',
      });
    } else if (code.includes('DUPLICADO')) {
      playScanBeep(false);
      setScanResult({
        exito: true,
        advertencia: true,
        mensaje: 'ADVERTENCIA: Asistencia previamente registrada en esta sesión.',
        participante: 'Karla Jamileth Andrade Mendoza',
        categoria: 'Estudiante ULEAM (Beca 100%)',
        hora: new Date().toLocaleTimeString('es-EC'),
      });
    } else {
      playScanBeep(true);
      const isJavier = code.includes('1318901234') || code.toLowerCase().includes('javier');
      const nombre = isJavier ? 'Javier David Jaramillo Intriago' : 'Karla Jamileth Andrade Mendoza';
      const cat = isJavier ? 'Profesional / Externo ($25.00)' : 'Estudiante ULEAM (Beca 100%)';
      const inst = isJavier ? 'Universidad Técnica de Manabí (UTM)' : 'ULEAM - Ingeniería en Software';

      setScanResult({
        exito: true,
        mensaje: 'ACCESO CONCEDIDO',
        participante: nombre,
        categoria: cat,
        institucion: inst,
        hora: new Date().toLocaleTimeString('es-EC'),
      });

      setRecentCheckins((prev) => [
        { id: Date.now(), nombre, tiempo: 'Justo ahora', estado: 'VALIDADO' },
        ...prev,
      ]);
      showToast(`¡Check-in concedido!: ${nombre}`);
    }
  };

  // Subida de imagen QR desde archivo
  const handleQrImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            handleExecuteScan(barcodes[0].rawValue);
            return;
          }
        } catch {
          // Fallback
        }
      }
      // Simulación exitosa al subir imagen válida de credencial
      handleExecuteScan('ULEAM-QR-KARLA-1317890123');
    };
  };


  // Configuración de Autoridad y Firma Digital para Certificados (SuperAdmin)
  const [authorityConfig, setAuthorityConfig] = useState(() => {
    const saved = localStorage.getItem('uleam_authority_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      nombre: 'Dr. Marcos Zambrano Zambrano, PhD.',
      cargo: 'Rector Institucional ULEAM',
      resolucion: 'Resolución H.C.U. No. 042-CU-ULEAM-2026',
      firmaUrl: null, // Si es null, usa caligrafía decorativa por defecto
      selloActivo: true,
    };
  });

  // Guardar configuración de autoridad en localStorage
  const updateAuthorityConfig = (newConfig) => {
    setAuthorityConfig(newConfig);
    localStorage.setItem('uleam_authority_config', JSON.stringify(newConfig));
  };

  // Referencia y estado para el lienzo de firma digital en SuperAdmin
  const sigCanvasRef = useRef(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Estado de Autenticación Nativa PostgreSQL (Login / Registro sin Supabase Auth)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('uleam_session_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [loginForm, setLoginForm] = useState({
    correo: 'estudiante@uleam.edu.ec',
    contrasena: 'Admin123!',
  });
  const [registerForm, setRegisterForm] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    correo: '',
    contrasena: '',
    institucion: 'Universidad Laica Eloy Alfaro de Manabí',
    telefono: '0987654321',
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Catálogo de Eventos y Filtros
  const [eventos, setEventos] = useState(INITIAL_EVENTOS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
      }
    } catch {
      // fallback
    }
    return '';
  });
  const [selectedModality, setSelectedModality] = useState('TODAS');


  // Modales
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCertificateValidatorModal, setShowCertificateValidatorModal] = useState(false);
  const [validationCodeInput, setValidationCodeInput] = useState('ULEAM-2026-ETICA-884920');
  const [validationResult, setValidationResult] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);

  // Formulario de Inscripción (Flujo 3 pasos)
  const [registerStep, setRegisterStep] = useState(1);
  const [registrationForm, setRegistrationForm] = useState({
    categoria_id: '',
    categoria_nombre: '',
    categoria_precio: 0,
    nombres: 'Karla Jamileth',
    apellidos: 'Andrade Mendoza',
    identificacion: '1317890123',
    correo: 'estudiante@uleam.edu.ec',
    institucion: 'Universidad Laica Eloy Alfaro de Manabí',
    comprobante_archivo: 'transferencia_pichincha_098231.pdf',
  });

  // Formulario de Creación de Evento (RF-006)
  const [newEventForm, setNewEventForm] = useState({
    nombre: '',
    modalidad: 'PRESENCIAL',
    lugar: 'Paraninfo Alfonso Aguilar Ruilova, Manta',
    capacidad_maxima: 200,
    descripcion: '',
  });

  // Credencial y Encuesta
  const [activeCredential, setActiveCredential] = useState(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyRating, setSurveyRating] = useState(10);
  const [surveyComment, setSurveyComment] = useState('');

  // Mesa de Ayuda y Soporte Universitario (Help Desk con 4 apartados)
  const [showHelpDeskModal, setShowHelpDeskModal] = useState(false);
  const [helpDeskTab, setHelpDeskTab] = useState('faq'); // 'faq', 'ticket', 'mis_tickets', 'contacto'
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    nombre: 'Karla Jamileth Andrade Mendoza',
    correo: 'estudiante@uleam.edu.ec',
    cedula: '1317890123',
    categoria: 'PAGOS_COMPROBANTES',
    prioridad: 'ALTA',
    asunto: '',
    descripcion: '',
  });
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TICK-ULEAM-2026-9041',
      categoria: 'Revisión de Comprobante (SLA 24h)',
      asunto: 'Verificación de depósito Banco Pichincha #098231',
      estado: 'EN_ATENCION',
      fecha: '22/10/2026 14:30',
      prioridad: 'ALTA',
      respuesta:
        'Su comprobante se encuentra en el lote prioritario de la mesa contable. Tiempo estimado de aprobación: 2 horas.',
    },
    {
      id: 'TICK-ULEAM-2026-8812',
      categoria: 'Certificado Digital',
      asunto: 'Descarga de certificado con firma institucional',
      estado: 'RESUELTO',
      fecha: '20/10/2026 10:15',
      prioridad: 'MEDIA',
      respuesta:
        'Certificado regenerado y liberado con firma oficial del Dr. Marcos Zambrano Zambrano.',
    },
  ]);

  // Modales adicionales del Footer
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('ciencias_vida');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mensaje Toast de retroalimentación
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Control de Acceso (Staff QR)
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([
    { id: 1, nombre: 'Karla Andrade M.', tiempo: 'Hace 2 minutos', estado: 'VALIDADO' },
    { id: 2, nombre: 'Javier Jaramillo I.', tiempo: 'Hace 14 minutos', estado: 'VALIDADO' },
  ]);

  // Lista de inscripciones para revisión de comprobantes con Ventana SLA de 24 horas (Personal de Gestión)
  const [comprobantesPendientes, setComprobantesPendientes] = useState([
    {
      id: 'i0000000-0000-0000-0000-000000000002',
      participante: 'Javier David Jaramillo Intriago',
      cédula: '1318901234',
      categoria: 'Profesional / Externo ($25.00)',
      monto: 25.0,
      evento: 'I Congreso Internacional de Software 2026',
      archivo: 'transferencia-pichincha-098231.pdf',
      estado: 'EN_REVISION',
      subido_hace: 'Hace 4 horas',
      horas_restantes: 20.0,
      estado_sla: 'A_TIEMPO',
    },
    {
      id: 'i0000000-0000-0000-0000-000000000008',
      participante: 'Mónica Zambrano Loor',
      cédula: '1314455667',
      categoria: 'Profesional / Externo ($25.00)',
      monto: 25.0,
      evento: 'I Congreso Internacional de Software 2026',
      archivo: 'comprobante_deposito_449.jpg',
      estado: 'EN_REVISION',
      subido_hace: 'Hace 21.5 horas',
      horas_restantes: 2.5,
      estado_sla: 'URGENTE',
    },
    {
      id: 'i0000000-0000-0000-0000-000000000009',
      participante: 'Roberto Álava Mendoza',
      cédula: '1310022334',
      categoria: 'Profesional / Externo ($25.00)',
      monto: 25.0,
      evento: 'I Congreso Internacional de Software 2026',
      archivo: 'transferencia_invalida.png',
      estado: 'EXPIRADO',
      subido_hace: 'Hace 26 horas',
      horas_restantes: 0.0,
      estado_sla: 'VENCIDO',
    },
  ]);



  // Cargar eventos desde backend Go al montar el componente
  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE}/eventos`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setEventos(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // ==============================================================
  // ENRUTADOR SPA NATIVO Y GESTIÓN DE ERROR 404 / BÚSQUEDA
  // ==============================================================
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      setCurrentPath(path);
      const route = resolveRoute(path);

      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q !== null) {
          setSearchQuery(q);
        }
      } catch (e) {
        console.error(e);
      }

      if (route.view === 'not_found') {
        setCurrentView('not_found');
      } else if (route.view === 'evento_detail') {
        const ev = eventos.find((e) => e.slug === route.slug || e.id === route.slug);
        if (ev) {
          setDetailEvent(ev);
          setCurrentView('explorar');
        } else {
          setCurrentView('not_found');
        }
      } else {
        if (route.role) setCurrentRole(route.role);
        setCurrentView(route.view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [eventos]);

  // Manejo de eventos si la ruta inicial es un slug específico de evento
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const route = resolveRoute(window.location.pathname);
    if (route.view === 'evento_detail') {
      const ev = eventos.find((e) => e.slug === route.slug || e.id === route.slug);
      if (ev) {
        setDetailEvent(ev);
        setCurrentView('explorar');
      } else {
        setCurrentView('not_found');
      }
    }
  }, [eventos]);

  // Función de navegación centralizada con sincronización de URL en el navegador
  const navigateTo = (view, pathUrl = null, searchParam = null) => {
    let targetPath = pathUrl;
    if (!targetPath) {
      if (view === 'explorar') targetPath = '/explorar';
      else if (view === 'mis_eventos') targetPath = '/mis-eventos';
      else if (view === 'certificados') targetPath = '/certificados';
      else if (view === 'super_admin') targetPath = '/super-admin';
      else if (view === 'admin_eventos' || view === 'admin_kpi') targetPath = '/admin-eventos';
      else if (view === 'gestion_pagos') targetPath = '/gestion-pagos';
      else if (view === 'checkin_staff') targetPath = '/checkin';
      else if (view === 'not_found') targetPath = '/404';
      else targetPath = '/';
    }

    if (searchParam !== null && searchParam !== undefined) {
      setSearchQuery(searchParam);
      if (searchParam && searchParam.trim()) {
        targetPath = `${targetPath.split('?')[0]}?q=${encodeURIComponent(searchParam.trim())}`;
      } else {
        targetPath = targetPath.split('?')[0];
      }
    }

    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setCurrentPath(targetPath.split('?')[0]);
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejador reactivo para cambios en la barra de búsqueda que sincroniza URL
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (typeof window !== 'undefined' && currentView === 'explorar') {
      const cleanPath = '/explorar';
      const newUrl = val.trim() ? `${cleanPath}?q=${encodeURIComponent(val.trim())}` : cleanPath;
      window.history.replaceState(null, '', newUrl);
    }
  };


  // Optimización de filtrado mediante useMemo (evita renderizados pesados)
  const filteredEvents = useMemo(() => {
    return eventos.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.nombre.toLowerCase().includes(q) ||
        ev.descripcion.toLowerCase().includes(q) ||
        (ev.ponentes &&
          ev.ponentes.some(
            (p) =>
              (p.nombres && p.nombres.toLowerCase().includes(q)) ||
              (p.apellidos && p.apellidos.toLowerCase().includes(q))
          ));
      const matchesModality = selectedModality === 'TODAS' || ev.modalidad === selectedModality;
      return matchesSearch && matchesModality;
    });
  }, [eventos, searchQuery, selectedModality]);

  // Iniciar Flujo de Inscripción
  const handleStartRegister = (event) => {
    setSelectedEvent(event);
    if (event.categorias && event.categorias.length > 0) {
      setRegistrationForm((prev) => ({
        ...prev,
        categoria_id: event.categorias[0].id,
        categoria_nombre: event.categorias[0].nombre,
        categoria_precio: event.categorias[0].precio,
      }));
    }
    setRegisterStep(1);
    setShowRegisterModal(true);
  };

  // Confirmar Inscripción en Backend
  const handleConfirmRegistration = async () => {
    const payload = {
      evento_id: selectedEvent.id,
      usuario_id: '00000000-0000-0000-0000-000000000006',
      categoria_id: registrationForm.categoria_id,
      usuario_nombre: `${registrationForm.nombres} ${registrationForm.apellidos}`,
      usuario_correo: registrationForm.correo,
      categoria_nombre: registrationForm.categoria_nombre,
      categoria_precio: registrationForm.categoria_precio,
      comprobante_url: registrationForm.categoria_precio > 0 ? registrationForm.comprobante_archivo : '',
    };

    try {
      await fetch(`${API_BASE}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Manejo transparente
    }

    const generatedToken = `ULEAM-QR-${selectedEvent.id.slice(0, 8)}-${Date.now()}`;
    const newCred = {
      evento: selectedEvent.nombre,
      participante: `${registrationForm.nombres} ${registrationForm.apellidos}`,
      identificacion: registrationForm.identificacion,
      institucion: registrationForm.institucion,
      categoria: registrationForm.categoria_nombre,
      qr_token: generatedToken,
      fecha_emision: new Date().toLocaleDateString('es-EC'),
    };

    setActiveCredential(newCred);
    setShowRegisterModal(false);

    if (registrationForm.categoria_precio > 0) {
      showToast('Comprobante subido. Estado: EN REVISIÓN (24h de plazo asignado).');
      setCurrentView('mis_eventos');
    } else {
      setShowCredentialModal(true);
      showToast('¡Inscripción confirmada! Tu credencial QR ha sido generada.');
    }
  };

  // Creación Real de Eventos conectada al Backend en Go (RF-006)
  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!newEventForm.nombre.trim()) {
      alert('Por favor ingresa el nombre del evento.');
      return;
    }

    const payload = {
      nombre: newEventForm.nombre,
      modalidad: newEventForm.modalidad,
      lugar: newEventForm.lugar,
      capacidad_maxima: parseInt(newEventForm.capacidad_maxima, 10) || 150,
      descripcion: newEventForm.descripcion || 'Evento académico oficial de la Facultad de Ciencias de la Vida y Tecnologías.',
      estado: 'INSCRIPCIONES_ABIERTAS',
    };

    try {
      const res = await fetch(`${API_BASE}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdEvent = await res.json();
        setEventos([createdEvent, ...eventos]);
        showToast(`Evento "${createdEvent.nombre}" creado y publicado en el catálogo.`);
      } else {
        throw new Error('Error al guardar en backend');
      }
    } catch {
      // Inserción en memoria si el backend no responde
      const fallbackEvent = {
        id: `evento-${Date.now()}`,
        slug: `evento-${Date.now().toString().slice(-6)}`,
        ...payload,
        url_afiche: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        fecha_inicio: new Date(Date.now() + 86400000 * 20).toISOString(),
        fecha_fin: new Date(Date.now() + 86400000 * 23).toISOString(),
        categorias: [
          { id: `cat-free-${Date.now()}`, nombre: 'Estudiante ULEAM', precio: 0.0, cupo: 100, requiere_comprobante: false },
          { id: `cat-paid-${Date.now()}`, nombre: 'Profesional / General', precio: 25.0, cupo: 50, requiere_comprobante: true },
        ],
        ponentes: [],
      };
      setEventos([fallbackEvent, ...eventos]);
      showToast(`Evento "${fallbackEvent.nombre}" creado exitosamente.`);
    }

    setNewEventForm({
      nombre: '',
      modalidad: 'PRESENCIAL',
      lugar: 'Paraninfo Alfonso Aguilar Ruilova, Manta',
      capacidad_maxima: 200,
      descripcion: '',
    });
    setShowCreateEventModal(false);
  };

  // Validación de Certificado (RF-016)
  const handleValidateCertificate = (e) => {
    e.preventDefault();
    const cleanCode = validationCodeInput.trim().toUpperCase();
    if (cleanCode === 'ULEAM-2026-ETICA-884920' || cleanCode.startsWith('ULEAM-')) {
      setValidationResult({
        valido: true,
        evento: 'Seminario de Ética Profesional en la Era de la IA',
        participante: 'Karla Jamileth Andrade Mendoza',
        fecha: '12 de Septiembre, 2026',
        firmante: 'Dr. Jonny Pérez Véliz, PhD - Director Académico',
        hash: 'SHA256: 8f9b4c09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3',
      });
    } else {
      setValidationResult({
        valido: false,
        mensaje: 'El código ingresado no corresponde a ningún certificado emitido por la ULEAM o ha sido revocado.',
      });
    }
  };

  // Simulación de Escaneo de QR (RF-015)
  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    if (scanInput.includes('ERROR') || scanInput === '0000000000') {
      setScanResult({
        exito: false,
        mensaje: 'ACCESO DENEGADO: Código QR o Cédula no registrada en este evento.',
      });
    } else {
      const isAlready = recentCheckins.some(
        (c) => c.nombre.toLowerCase().includes(scanInput.toLowerCase()) || scanInput.length < 5
      );
      if (isAlready) {
        setScanResult({
          exito: true,
          advertencia: true,
          mensaje: 'ADVERTENCIA: Asistencia previamente registrada en esta sesión.',
          participante: 'Karla Jamileth Andrade Mendoza',
          categoria: 'Estudiante ULEAM',
          hora: new Date().toLocaleTimeString('es-EC'),
        });
      } else {
        const checkinName = scanInput.length === 10 ? `Participante C.I. ${scanInput}` : 'Karla Andrade Mendoza';
        setScanResult({
          exito: true,
          mensaje: 'ACCESO CONCEDIDO',
          participante: checkinName,
          categoria: 'Estudiante ULEAM (Beca 100%)',
          institucion: 'ULEAM - Ingeniería en Software',
          hora: new Date().toLocaleTimeString('es-EC'),
        });
        setRecentCheckins([
          { id: Date.now(), nombre: checkinName, tiempo: 'Justo ahora', estado: 'VALIDADO' },
          ...recentCheckins,
        ]);
        showToast(`Acceso registrado: ${checkinName}`);
      }
    }
    setScanInput('');
  };

  // Aprobación/Rechazo de comprobantes con conexión al Backend
  const handleReviewVoucher = async (id, newStatus) => {
    try {
      await fetch(`${API_BASE}/inscripciones/${id}/revision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus === 'APROBADO' ? 'CONFIRMADA' : 'CANCELADA' }),
      });
    } catch {
      // Manejo local
    }

    setComprobantesPendientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: newStatus } : c))
    );
    showToast(newStatus === 'APROBADO' ? 'Comprobante aprobado y credencial QR liberada.' : 'Comprobante rechazado.');
  };

  // Exportar Tabla de Finanzas a Excel (CSV con UTF-8 BOM y nombre limpio)
  const handleExportCSV = () => {
    const headers = ['Participante', 'Cédula', 'Categoría', 'Monto ($)', 'Archivo Comprobante', 'Estado', 'Subido Hace'];
    const rows = comprobantesPendientes.map((c) => [
      c.participante,
      c.cédula,
      c.categoria,
      c.monto.toFixed(2),
      c.archivo,
      c.estado,
      c.subido_hace,
    ]);
    const fecha = new Date().toISOString().slice(0, 10);
    exportTableToCSV(`Reporte_Comprobantes_Financieros_ULEAM_${fecha}.csv`, headers, rows);
    showToast('Reporte exportado exitosamente con nombre oficial en formato CSV/Excel.');
  };

  // Descarga Directa de Certificado PDF de Alta Fidelidad
  const handleDownloadCertPDF = async () => {
    showToast('Generando Certificado Oficial PDF en alta resolución...');
    const certData = {
      participante: 'Karla Jamileth Andrade Mendoza',
      identificacion: '1317890123',
      evento: 'Seminario de Ética Profesional en la Era de la IA',
      codigo: 'ULEAM-2026-ETICA-884920',
      hash: 'SHA256: 8f9b4c09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3',
      fecha: '12 de Septiembre de 2026',
    };
    try {
      await downloadCertificatePDF(
        certData,
        authorityConfig,
        `Certificado_Oficial_ULEAM_${certData.participante.replace(/\s+/g, '_')}.pdf`
      );
      showToast('Certificado descargado exitosamente como archivo PDF oficial.');
    } catch (err) {
      console.error(err);
      showToast('Error al generar PDF. Abriendo vista de impresión alternativa...');
      openPrintableCertificateWindow(certData, authorityConfig);
    }
  };

  // Imprimir o Guardar Certificado en PDF Vectorial
  const handlePrintCert = () => {
    const certData = {
      participante: 'Karla Jamileth Andrade Mendoza',
      identificacion: '1317890123',
      evento: 'Seminario de Ética Profesional en la Era de la IA',
      codigo: 'ULEAM-2026-ETICA-884920',
      hash: 'SHA256: 8f9b4c09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3',
      fecha: '12 de Septiembre de 2026',
    };
    openPrintableCertificateWindow(certData, authorityConfig);
  };

  // Descarga Directa de Credencial PDF
  const handleDownloadCredPDF = async (cred = activeCredential) => {
    if (!cred) return;
    showToast('Generando Credencial Oficial PDF...');
    try {
      await downloadCredentialPDF(
        cred,
        authorityConfig,
        `Credencial_Oficial_ULEAM_${(cred.participante || 'Participante').replace(/\s+/g, '_')}.pdf`
      );
      showToast('Credencial descargada exitosamente como archivo PDF oficial.');
    } catch (err) {
      console.error(err);
      showToast('Abriendo ventana de impresión para la credencial...');
      window.print();
    }
  };

  // Carga de Archivo de Firma de Autoridad (PNG / JPG con fondo transparente)
  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen de la firma no debe superar los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      updateAuthorityConfig({
        ...authorityConfig,
        firmaUrl: dataUrl,
      });
      showToast('Firma digital actualizada e incorporada a todos los certificados.');
    };
    reader.readAsDataURL(file);
  };

  // Manejo del Lienzo Interactivo para Dibujar Firma
  const startDrawingSig = (e) => {
    setIsDrawingSig(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSig = (e) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#002F6C'; // Azul marino oficial
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingSig = () => {
    setIsDrawingSig(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    updateAuthorityConfig({
      ...authorityConfig,
      firmaUrl: dataUrl,
    });
    showToast('¡Firma manuscrita guardada e incorporada a los certificados oficiales!');
  };

  const resetDefaultSignature = () => {
    updateAuthorityConfig({
      ...authorityConfig,
      firmaUrl: null,
      nombre: 'Dr. Marcos Zambrano Zambrano, PhD.',
      cargo: 'Rector Institucional ULEAM',
      resolucion: 'Resolución H.C.U. No. 042-CU-ULEAM-2026',
      selloActivo: true,
    });
    clearSignatureCanvas();
    showToast('Firma y configuración restaurada a los valores institucionales por defecto.');
  };

  // -------------------------------------------------------------
  // AUTENTICACIÓN NATIVA POSTGRESQL (Sin Supabase Auth / GoTrue)
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas. Verifique su correo y contraseña.');
      }

      // Guardar token JWT y sesión
      localStorage.setItem('uleam_jwt_token', data.token);
      localStorage.setItem('uleam_session_user', JSON.stringify(data.usuario));
      setCurrentUser(data.usuario);

      // Sincronizar Rol según usuario
      const rol = (data.usuario.rol || 'ASISTENTE').toUpperCase();
      if (rol.includes('SUPER')) {
        setCurrentRole('SUPER_ADMIN');
        setCurrentView('super_admin');
      } else if (rol.includes('ADMIN')) {
        setCurrentRole('ADMIN_EVENTO');
        setCurrentView('admin_eventos');
      } else if (rol.includes('GESTION')) {
        setCurrentRole('GESTION');
        setCurrentView('gestion_pagos');
      } else if (rol.includes('STAFF') || rol.includes('ASISTENCIA')) {
        setCurrentRole('ASISTENCIA_STAFF');
        setCurrentView('checkin_staff');
      } else {
        setCurrentRole('ASISTENTE');
        setCurrentView('explorar');
      }

      setShowAuthModal(false);
      showToast(`¡Bienvenido, ${data.usuario.nombres}! Sesión iniciada con éxito.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario. Verifique los datos ingresados.');
      }

      showToast('¡Cuenta creada con éxito! Iniciando sesión...');
      // Iniciar sesión automáticamente
      setLoginForm({ correo: registerForm.correo, contrasena: registerForm.contrasena });
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: registerForm.correo, contrasena: registerForm.contrasena }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem('uleam_jwt_token', loginData.token);
        localStorage.setItem('uleam_session_user', JSON.stringify(loginData.usuario));
        setCurrentUser(loginData.usuario);
        setShowAuthModal(false);
      } else {
        setAuthTab('login');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uleam_jwt_token');
    localStorage.removeItem('uleam_session_user');
    setCurrentUser(null);
    setCurrentRole('ASISTENTE');
    setCurrentView('explorar');
    showToast('Sesión cerrada correctamente.');
  };

  // Manejo de Creación de Tickets en Mesa de Ayuda
  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.asunto.trim() || !ticketForm.descripcion.trim()) {
      alert('Por favor completa todos los campos del ticket.');
      return;
    }
    const newTicketId = `TICK-ULEAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newTicketId,
      categoria: ticketForm.categoria.replace(/_/g, ' '),
      asunto: ticketForm.asunto,
      estado: 'EN_ESPERA',
      fecha:
        new Date().toLocaleDateString('es-EC') +
        ' ' +
        new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      prioridad: ticketForm.prioridad,
      respuesta:
        'Su requerimiento fue recibido por la Equipo de Soporte de la Facultad. Un agente especializado le responderá formalmente en menos de 4 horas hábiles.',
    };
    setTicketsList([newTicket, ...ticketsList]);
    setTicketForm({
      ...ticketForm,
      asunto: '',
      descripcion: '',
    });
    setHelpDeskTab('mis_tickets');
    showToast(`¡Ticket ${newTicketId} generado con éxito! Consulta el estado en "Mis Solicitudes".`);
  };

  // Filtrar eventos desde modal de facultad
  const handleFilterByFaculty = (facultyKey) => {
    setShowFacultyModal(false);
    setCurrentRole('ASISTENTE');
    setCurrentView('explorar');
    if (facultyKey === 'software') {
      setSearchQuery('software');
    } else if (facultyKey === 'posgrado') {
      setSearchQuery('ética');
    } else {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Catálogo de eventos filtrado para la facultad seleccionada.');
  };

  return (
    <div>
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="material-symbols-outlined" style={{ color: '#4ADE80' }}>check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra Superior de Roles Institucionales con Iconos Oficiales */}
      <div className="role-bar">
        <div className="main-container role-bar-inner">
          <div className="role-bar-label">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shield</span>
            <span><strong>ULEAM Ecosistema</strong> — Modo de Demostración de Roles:</span>
          </div>
          <div className="role-pills">
            <button
              className={`role-pill-btn ${currentRole === 'ASISTENTE' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('ASISTENTE'); navigateTo('explorar', '/explorar'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>school</span>
              Portal Participante
            </button>
            <button
              className={`role-pill-btn ${currentRole === 'SUPER_ADMIN' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('SUPER_ADMIN'); navigateTo('super_admin', '/super-admin'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield</span>
              Panel SuperAdmin
            </button>
            <button
              className={`role-pill-btn ${currentRole === 'ADMIN_EVENTO' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('ADMIN_EVENTO'); navigateTo('admin_eventos', '/admin-eventos'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span>
              Gestión de Eventos
            </button>
            <button
              className={`role-pill-btn ${currentRole === 'GESTION' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('GESTION'); navigateTo('gestion_pagos', '/gestion-pagos'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
              Personal de Gestión
            </button>
            <button
              className={`role-pill-btn ${currentRole === 'ASISTENCIA_STAFF' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('ASISTENCIA_STAFF'); navigateTo('checkin_staff', '/checkin'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>qr_code_scanner</span>
              Personal Asistencia (QR)
            </button>
          </div>
        </div>
      </div>

      {/* TopAppBar Institucional */}
      <header className="top-app-bar">
        <div className="main-container nav-content">
          <a
            href="/explorar"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('explorar', '/explorar');
            }}
          >
            <div className="brand-circle">U</div>
            <div className="brand-title">
              ULEAM <span>EVENTOS</span>
            </div>
          </a>

          {/* Menú de Navegación de Escritorio (Desktop Nav) */}
          <nav className="desktop-nav-menu">
            {currentRole === 'ASISTENTE' && (
              <>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'explorar' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Explorar
                </button>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'mis_eventos' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('mis_eventos', '/mis-eventos')}
                >
                  <span className="material-symbols-outlined">badge</span> Mis Credenciales
                </button>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'certificados' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('certificados', '/certificados')}
                >
                  <span className="material-symbols-outlined">workspace_premium</span> Certificados
                </button>
              </>
            )}

            {currentRole === 'SUPER_ADMIN' && (
              <>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'super_admin' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('super_admin', '/super-admin')}
                >
                  <span className="material-symbols-outlined">shield</span> Panel SuperAdmin
                </button>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'admin_eventos' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('admin_eventos', '/admin-eventos')}
                >
                  <span className="material-symbols-outlined">event</span> Eventos
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Catálogo
                </button>
              </>
            )}

            {currentRole === 'ADMIN_EVENTO' && (
              <>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'admin_eventos' ? 'btn-primary' : ''}`}
                  onClick={() => navigateTo('admin_eventos', '/admin-eventos')}
                >
                  <span className="material-symbols-outlined">dashboard</span> Panel Eventos
                </button>
                <button
                  className="btn btn-urgent btn-sm"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  <span className="material-symbols-outlined">add_circle</span> Crear Evento
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Catálogo
                </button>
              </>
            )}

            {currentRole === 'GESTION' && (
              <>
                <button
                  className={`btn btn-sm ${currentView === 'gestion_pagos' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigateTo('gestion_pagos', '/gestion-pagos')}
                >
                  <span className="material-symbols-outlined">receipt_long</span> Mesa de Finanzas (24h SLA)
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Catálogo
                </button>
              </>
            )}

            {currentRole === 'ASISTENCIA_STAFF' && (
              <>
                <button
                  className={`btn btn-sm ${currentView === 'checkin_staff' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigateTo('checkin_staff', '/checkin')}
                >
                  <span className="material-symbols-outlined">qr_code_scanner</span> Escáner Puerta (QR)
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Catálogo
                </button>
              </>
            )}

            {/* Botón Permanente de Soporte Institucional */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setHelpDeskTab('faq');
                setShowHelpDeskModal(true);
              }}
              title="Soporte y Atención"
            >
              <span className="material-symbols-outlined">support_agent</span> Soporte
            </button>

            {/* Perfil del Usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              {currentUser ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(0, 47, 108, 0.06)',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '24px',
                    border: '1px solid rgba(0, 47, 108, 0.15)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary-container)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {currentUser.nombres ? currentUser.nombres[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.76rem', lineHeight: '1.2' }}>
                    <strong style={{ color: 'var(--primary-dark)' }}>{currentUser.nombres}</strong>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
                      {currentUser.rol || currentRole}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirmModal(true)}
                    title="Cerrar sesión con confirmación"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-error)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setShowAuthModal(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_circle</span>
                  <span>Ingresar / Registro</span>
                </button>
              )}
            </div>
          </nav>

          {/* Botón de Hamburguesa para Mobile con animación suave */}
          <div className="mobile-nav-toggle-wrap">
            {currentUser && (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--primary-container)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={() => setMobileMenuOpen(true)}
                title={currentUser.nombres}
              >
                {currentUser.nombres ? currentUser.nombres[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MENÚ MÓVIL DESLIZANTE CON ANIMACIÓN FLUIDA (DRAWER)             */}
      {/* ============================================================== */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div
            className="brand-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setCurrentView('explorar');
              setMobileMenuOpen(false);
            }}
          >
            <div className="brand-circle" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
              U
            </div>
            <div className="brand-title" style={{ fontSize: '1.1rem' }}>
              ULEAM <span>EVENTOS</span>
            </div>
          </div>
          <button
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mobile-drawer-body">
          {/* Perfil o Acceso en Drawer */}
          <div className="drawer-user-section">
            {currentUser ? (
              <div className="drawer-user-card">
                <div className="drawer-user-avatar">
                  {currentUser.nombres ? currentUser.nombres[0].toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.nombres} {currentUser.apellidos || ''}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.correo}
                  </div>
                  <span className="chip chip-success" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                    ● {currentUser.rol || currentRole}
                  </span>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  title="Cerrar sesión"
                  style={{ padding: '6px 8px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">account_circle</span>
                Iniciar Sesión / Registro
              </button>
            )}
          </div>

          {/* Selector de Roles Rápido en Mobile */}
          <div className="drawer-section">
            <span className="drawer-section-title">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>shield</span>
              DEMOSTRACIÓN DE ROLES
            </span>
            <div className="drawer-role-grid">
              <button
                className={`drawer-role-btn ${currentRole === 'ASISTENTE' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('ASISTENTE');
                  navigateTo('explorar', '/explorar');
                }}
              >
                <span className="material-symbols-outlined">school</span>
                <span>Participante</span>
              </button>
              <button
                className={`drawer-role-btn ${currentRole === 'ADMIN' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('ADMIN');
                  navigateTo('admin_kpi', '/admin');
                }}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>SuperAdmin</span>
              </button>
              <button
                className={`drawer-role-btn ${currentRole === 'GESTION' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('GESTION');
                  navigateTo('gestion_pagos', '/gestion-pagos');
                }}
              >
                <span className="material-symbols-outlined">payments</span>
                <span>Gestión Pagos</span>
              </button>
              <button
                className={`drawer-role-btn ${currentRole === 'ASISTENCIA_STAFF' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('ASISTENCIA_STAFF');
                  navigateTo('checkin_staff', '/checkin');
                }}
              >
                <span className="material-symbols-outlined">qr_code_scanner</span>
                <span>Staff QR</span>
              </button>
            </div>
          </div>

          {/* Enlaces de Navegación del Portal */}
          <div className="drawer-section">
            <span className="drawer-section-title">NAVEGACIÓN</span>
            <nav className="drawer-nav-list">
              <button
                className={`drawer-nav-item ${currentView === 'explorar' ? 'active' : ''}`}
                onClick={() => navigateTo('explorar', '/explorar')}
              >
                <span className="material-symbols-outlined">explore</span>
                <span>Explorar Catálogo</span>
              </button>
              <button
                className={`drawer-nav-item ${currentView === 'mis_eventos' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('ASISTENTE');
                  navigateTo('mis_eventos', '/mis-eventos');
                }}
              >
                <span className="material-symbols-outlined">badge</span>
                <span>Mis Credenciales & QR</span>
              </button>
              <button
                className={`drawer-nav-item ${currentView === 'certificados' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRole('ASISTENTE');
                  navigateTo('certificados', '/certificados');
                }}
              >
                <span className="material-symbols-outlined">workspace_premium</span>
                <span>Certificados Oficiales</span>
              </button>
              <button
                className="drawer-nav-item"
                onClick={() => {
                  setShowCertificateValidatorModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">verified_user</span>
                <span>Validar Certificado SHA-256</span>
              </button>

              {currentRole === 'ADMIN' && (
                <>
                  <button
                    className={`drawer-nav-item ${currentView === 'admin_kpi' ? 'active' : ''}`}
                    onClick={() => navigateTo('admin_kpi', '/admin')}
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Panel SuperAdmin KPI</span>
                  </button>
                  <button
                    className="drawer-nav-item urgent"
                    onClick={() => {
                      setShowCreateEventModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    <span>Crear Nuevo Evento</span>
                  </button>
                </>
              )}

              {currentRole === 'GESTION' && (
                <button
                  className={`drawer-nav-item ${currentView === 'gestion_pagos' ? 'active' : ''}`}
                  onClick={() => navigateTo('gestion_pagos', '/gestion-pagos')}
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                  <span>Mesa de Finanzas (24h SLA)</span>
                </button>
              )}

              {currentRole === 'ASISTENCIA_STAFF' && (
                <button
                  className={`drawer-nav-item ${currentView === 'checkin_staff' ? 'active' : ''}`}
                  onClick={() => navigateTo('checkin_staff', '/checkin')}
                >
                  <span className="material-symbols-outlined">qr_code_scanner</span>
                  <span>Escáner de Asistencia QR</span>
                </button>
              )}
            </nav>
          </div>


          {/* Soporte Institucional */}
          <div className="drawer-section">
            <span className="drawer-section-title">SOPORTE Y SERVICIOS</span>
            <nav className="drawer-nav-list">
              <button
                className="drawer-nav-item"
                onClick={() => {
                  setHelpDeskTab('faq');
                  setShowHelpDeskModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>support_agent</span>
                <span>Soporte</span>
              </button>
              <button
                className="drawer-nav-item"
                onClick={() => {
                  setSelectedFaculty('ciencias_vida');
                  setShowFacultyModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">domain</span>
                <span>Facultades y Carreras</span>
              </button>
              <button
                className="drawer-nav-item"
                onClick={() => {
                  setShowCampusModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">location_on</span>
                <span>Campus Matriz Manta</span>
              </button>
              <button
                className="drawer-nav-item"
                onClick={() => {
                  setShowPrivacyModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">policy</span>
                <span>Política de Privacidad</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="mobile-drawer-footer">
          <strong>Universidad Laica Eloy Alfaro de Manabí</strong>
          <span>Manta, Manabí • Ecuador 2026</span>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* VISTA 1: EXPLORAR CATÁLOGO (Portal Público)                    */}
      {/* ============================================================== */}
      {currentView === 'explorar' && (
        <main className="main-container" style={{ paddingTop: '20px' }}>
          {/* Hero Banner */}
          <section className="hero-banner">
            <div className="main-container hero-content">
              <span className="hero-badge">Facultad de Ciencias de la Vida y Tecnologías</span>
              <h1 className="display-large" style={{ color: '#FFFFFF', marginBottom: '16px' }}>
                Eventos Académicos ULEAM
              </h1>
              <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '28px' }}>
                Descubre congresos internacionales, simposios y talleres especializados de nuestra comunidad universitaria. Participa y obtén tus certificados con firma digital.
              </p>
              <div className="hero-buttons-wrap" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="#catalogo" className="btn btn-urgent">
                  <span className="material-symbols-outlined">how_to_reg</span> Explorar Catálogo
                </a>
                <button
                  className="btn btn-outline"
                  style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}
                  onClick={() => setShowCertificateValidatorModal(true)}
                >
                  <span className="material-symbols-outlined">verified</span> Validar Certificado
                </button>
              </div>
            </div>
          </section>

          {/* Filtros de Búsqueda y Modalidad */}
          <div id="catalogo" style={{ margin: '36px 0 24px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: 'min(100%, 280px)' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Buscar por nombre de evento, ponente o temática..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <span
                className="material-symbols-outlined"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                search
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['TODAS', 'PRESENCIAL', 'VIRTUAL', 'HIBRIDO'].map((mod) => (
                <button
                  key={mod}
                  className={`chip ${selectedModality === mod ? 'chip-primary' : ''}`}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid rgba(0, 47, 108, 0.15)',
                    background: selectedModality === mod ? 'var(--primary-container)' : '#FFFFFF',
                    color: selectedModality === mod ? '#FFFFFF' : 'var(--primary-container)',
                    minHeight: '34px',
                  }}
                  onClick={() => setSelectedModality(mod)}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Tarjetas o Estado Sin Resultados */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '60px 0' }}>Cargando catálogo oficial...</p>
          ) : filteredEvents.length === 0 ? (
            /* ============================================================== */
            /* PANTALLA / ESTADO DE ERROR 404 DE BÚSQUEDA SIN COINCIDENCIAS  */
            /* ============================================================== */
            <Search404State
              query={searchQuery}
              modality={selectedModality}
              onReset={() => {
                setSearchQuery('');
                setSelectedModality('TODAS');
                if (typeof window !== 'undefined' && window.location.search) {
                  window.history.replaceState(null, '', '/explorar');
                }
              }}
              onSuggestionClick={(sug) => {
                setSearchQuery(sug);
                setSelectedModality('TODAS');
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', `/explorar?q=${encodeURIComponent(sug)}`);
                }
              }}
              onOpenHelp={() => {
                setHelpDeskTab('faq');
                setShowHelpDeskModal(true);
              }}
            />
          ) : (
            <div className="cards-grid-auto">

              {filteredEvents.map((ev) => (
                <article key={ev.id} className="event-card">
                  <div style={{ height: '190px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={ev.url_afiche || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                      alt={ev.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                      <span className="chip chip-primary">
                        {ev.modalidad}
                      </span>
                      <span className="chip chip-success">
                        {ev.estado ? ev.estado.replace(/_/g, ' ') : 'ACTIVO'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                      <span>{new Date(ev.fecha_inicio).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                      <span>{ev.capacidad_maxima} Cupos</span>
                    </div>

                    <h3 className="headline-medium" style={{ fontSize: '1.18rem', marginBottom: '10px' }}>
                      {ev.nombre}
                    </h3>
                    <p className="body-regular" style={{ fontSize: '0.9rem', marginBottom: '20px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ev.descripcion}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(0, 47, 108, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Inscripción</span>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--primary-container)' }}>
                          {ev.categorias && ev.categorias[0] && ev.categorias[0].precio === 0 ? 'Gratuito' : 'Desde $25.00'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setDetailEvent(ev)}
                        >
                          Ver Detalles
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartRegister(ev)}
                        >
                          Inscribirme
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: MIS EVENTOS Y CREDENCIALES (Portal Participante)     */}
      {/* ============================================================== */}
      {currentView === 'mis_eventos' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="headline-large">Mis Acreditaciones Académicas</h2>
            <p className="body-regular">Gestiona tus eventos inscritos y descarga tus credenciales con código QR de acceso seguro.</p>
          </div>

          <div className="cards-grid-auto">
            {/* Tarjeta 1: Confirmada con QR Activo */}
            <div className="event-card">
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="chip chip-success">Confirmada</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>C.I: 1317890123</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                  I Congreso Internacional de Ingeniería en Software 2026
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Categoría: Estudiante ULEAM • Paraninfo Alfonso Aguilar Ruilova
                </p>
                <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '18px' }}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=ULEAM-QR-70000000-0000-0001"
                    alt="QR Credencial"
                    style={{ width: '140px', height: '140px', margin: '0 auto', display: 'block' }}
                  />
                  <code style={{ fontSize: '0.75rem', color: 'var(--primary-container)', display: 'block', marginTop: '8px' }}>
                    TOKEN: ULEAM-QR-70000000-0000-0001
                  </code>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setActiveCredential({
                        evento: 'I Congreso Internacional de Ingeniería en Software 2026',
                        participante: 'Karla Jamileth Andrade Mendoza',
                        identificacion: '1317890123',
                        institucion: 'ULEAM - Ingeniería en Software',
                        categoria: 'Estudiante ULEAM',
                        qr_token: 'ULEAM-QR-70000000-0000-0001',
                        fecha_emision: '22/10/2026',
                      });
                      setShowCredentialModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined">qr_code_2</span> Ver Credencial PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowSurveyModal(true)}
                  >
                    <span className="material-symbols-outlined">rate_review</span> Encuesta
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: En Revisión (SLA 24 Horas) */}
            <div className="event-card">
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="chip chip-alert">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>hourglass_top</span>
                    En Revisión (24h)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>C.I: 1318901234</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                  I Congreso Internacional de Ingeniería en Software 2026
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Categoría: Profesional / Externo ($25.00) • Paraninfo Alfonso Aguilar Ruilova
                </p>

                {/* Caja Informativa SLA 24 Horas */}
                <div style={{ background: 'var(--color-alert-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid #FFE082', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B26A00', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
                    <span>Validación de Pago en Curso</span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    Comprobante subido hace 4 horas. La mesa de finanzas tiene un plazo reglamentario de <strong>24 horas</strong> para validar tu depósito.
                  </p>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#B26A00', marginBottom: '4px' }}>
                      <span>Tiempo restante</span>
                      <span>20.0 horas</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(178, 106, 0, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '83%', height: '100%', background: '#F9A825' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setVoucherPreview('https://storage.uleam.edu.ec/comprobantes/transferencia-banco-pichincha-098231.pdf')}
                  >
                    <span className="material-symbols-outlined">attach_file</span> Ver Soporte
                  </button>
                  <button
                    className="btn btn-outline"
                    disabled
                    style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <span className="material-symbols-outlined">lock</span> QR Bloqueado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: CERTIFICADOS Y VERIFICACIÓN (RF-016)                 */}
      {/* ============================================================== */}
      {currentView === 'certificados' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="headline-large">Certificados Digitales Emitidos</h2>
              <p className="body-regular">Valida y descarga tus certificados con código criptográfico verificable.</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => setShowCertificateValidatorModal(true)}
            >
              <span className="material-symbols-outlined">verified</span> Validar Código de Certificado
            </button>
          </div>

          {/* Barra de Acciones de Certificado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '18px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="chip chip-success">Acreditación: 80% Asistencia Cumplida</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Código: <strong style={{ color: 'var(--primary-container)' }}>ULEAM-2026-ETICA-884920</strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setValidationCodeInput('ULEAM-2026-ETICA-884920');
                  setShowCertificateValidatorModal(true);
                }}
              >
                <span className="material-symbols-outlined">verified_user</span> Verificar Autenticidad
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handlePrintCert}
              >
                <span className="material-symbols-outlined">print</span> Imprimir / Guardar PDF
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleDownloadCertPDF}
              >
                <span className="material-symbols-outlined">download</span> Descargar Certificado (.PDF)
              </button>
            </div>
          </div>

          {/* DIPLOMA ACADÉMICO VISUAL (Visualización Fidedigna A4) */}
          <div className="diploma-card-container">
            {/* Encabezado República y Universidad */}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '3px', color: '#666666', marginBottom: '6px' }}>
              REPÚBLICA DEL ECUADOR
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', color: '#002F6C', fontWeight: 800, margin: '4px 0', lineHeight: 1.25 }}>
              UNIVERSIDAD LAICA ELOY ALFARO DE MANABÍ
            </h1>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#C59B27', letterSpacing: '1px' }}>
              FACULTAD DE CIENCIAS DE LA VIDA Y TECNOLOGÍAS
            </div>

            {/* Separador Ornamental */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px auto 14px', maxWidth: '400px' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#C59B27' }}></div>
              <span className="material-symbols-outlined" style={{ color: '#002F6C', fontSize: '20px' }}>school</span>
              <div style={{ flex: 1, height: '1.5px', background: '#C59B27' }}></div>
            </div>

            <p style={{ fontStyle: 'italic', color: '#555555', fontSize: '1.05rem', margin: '10px 0' }}>
              El Honorable Consejo Directivo y el Decanato de Facultad otorgan el presente:
            </p>

            {/* Título de Certificado */}
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, color: '#002F6C', letterSpacing: '2px', margin: '14px 0 4px' }}>
              CERTIFICADO
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '4px', color: '#888888', marginBottom: '24px' }}>
              DE ASISTENCIA Y APROBACIÓN ACADÉMICA
            </div>

            <div style={{ fontSize: '0.95rem', color: '#666666' }}>Conferido con honores a:</div>

            {/* Nombre del Participante */}
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                fontWeight: 800,
                color: '#C59B27',
                margin: '10px auto 4px',
                borderBottom: '2px solid rgba(197, 155, 39, 0.4)',
                display: 'inline-block',
                paddingBottom: '4px',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              Karla Jamileth Andrade Mendoza
            </div>
            <div style={{ fontSize: '0.9rem', color: '#555555', marginBottom: '20px' }}>
              Cédula de Identidad: <strong>1317890123</strong>
            </div>

            {/* Texto Académico de Respaldo */}
            <p style={{ fontSize: '1.05rem', color: '#333333', maxWidth: '780px', margin: '0 auto 16px', lineHeight: '1.6' }}>
              Por haber acreditado la asistencia reglamentaria y aprobación satisfactoria de las jornadas académicas del{' '}
              <strong style={{ color: '#002F6C' }}>"Seminario de Ética Profesional en la Era de la IA"</strong>, llevado a cabo del 12 al 15 de Septiembre de 2026, con una carga curricular de{' '}
              <strong style={{ color: '#00875A' }}>40 Horas Académicas</strong> debidamente avaladas por las autoridades universitarias.
            </p>

            <div style={{ fontSize: '0.9rem', color: '#666666', marginBottom: '36px' }}>
              Manta, Manabí — República del Ecuador, 12 de Septiembre de 2026.
            </div>

            {/* Fila Inferior: Bloque Criptográfico + Firmas Oficiales */}
            <div className="diploma-footer-grid">

              {/* Caja Criptográfica y QR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://eventos.uleam.edu.ec/validar?code=ULEAM-2026-ETICA-884920"
                  alt="QR Validación"
                  style={{ width: '70px', height: '70px', display: 'block' }}
                />
                <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#555555' }}>
                  <div style={{ fontWeight: 700, color: '#002F6C', marginBottom: '2px' }}>VALIDACIÓN OFICIAL</div>
                  <div>CÓD: ULEAM-2026-ETICA</div>
                  <div>HASH: SHA256: 8f9b4c...</div>
                  <div style={{ color: 'var(--color-success)', marginTop: '2px' }}>● Válido y Vigente</div>
                </div>
              </div>

              {/* Sello Oficial y Firma 1: Autoridad SuperAdmin (Dinámica) */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                {/* Sello de la Universidad */}
                {authorityConfig.selloActivo !== false && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-65px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      border: '3px solid #8B0000',
                      outline: '1.5px dashed #C59B27',
                      color: '#8B0000',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.45rem',
                      fontWeight: 800,
                      opacity: 0.85,
                      pointerEvents: 'none',
                      lineHeight: '1.1',
                    }}
                  >
                    <span>★ ULEAM ★</span>
                    <strong style={{ fontSize: '0.65rem', color: '#002F6C' }}>RECTORADO</strong>
                    <span>ECUADOR</span>
                  </div>
                )}

                {/* Firma Digital Incorporada (Subida o Dibujada) */}
                <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                  {authorityConfig.firmaUrl ? (
                    <img
                      src={authorityConfig.firmaUrl}
                      alt="Firma Autoridad"
                      style={{ maxHeight: '55px', maxWidth: '180px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.8rem', color: '#002F6C' }}>
                      M. Zambrano Z.
                    </div>
                  )}
                </div>
                <div style={{ width: '85%', height: '1.5px', background: '#002F6C', margin: '0 auto 6px' }}></div>
                <strong style={{ fontSize: '0.88rem', color: '#002F6C', display: 'block' }}>{authorityConfig.nombre}</strong>
                <span style={{ fontSize: '0.74rem', color: '#C59B27', fontWeight: 600, display: 'block' }}>{authorityConfig.cargo}</span>
                <span style={{ fontSize: '0.68rem', color: '#777777', display: 'block' }}>{authorityConfig.resolucion}</span>
              </div>

              {/* Firma 2: Coordinación Académica */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.8rem', color: '#002F6C' }}>
                    Jonny Pérez Véliz
                  </div>
                </div>
                <div style={{ width: '85%', height: '1.5px', background: '#002F6C', margin: '0 auto 6px' }}></div>
                <strong style={{ fontSize: '0.88rem', color: '#002F6C', display: 'block' }}>Dr. Jonny Pérez Véliz, PhD.</strong>
                <span style={{ fontSize: '0.74rem', color: '#555555', fontWeight: 600, display: 'block' }}>Director Académico del Evento</span>
                <span style={{ fontSize: '0.68rem', color: '#777777', display: 'block' }}>Facultad Cs. de la Vida y Tecnologías</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 4A: PANEL EXCLUSIVO SUPERADMIN (Infraestructura y Roles)  */}
      {/* ============================================================== */}
      {currentView === 'super_admin' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '32px' }}>shield</span>
                <h2 className="headline-large" style={{ margin: 0 }}>Panel de Super Administrador</h2>
              </div>
              <p className="body-regular" style={{ marginTop: '4px' }}>
                Gobernanza global de la plataforma ULEAM-EVENTOS, asignación de roles, auditoría y sellos institucionales.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${superAdminTab === 'usuarios' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSuperAdminTab('usuarios')}
              >
                <span className="material-symbols-outlined">manage_accounts</span> Usuarios & Roles
              </button>
              <button
                className={`btn btn-sm ${superAdminTab === 'firma' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSuperAdminTab('firma')}
              >
                <span className="material-symbols-outlined">draw</span> Firma & Sellos
              </button>
              <button
                className={`btn btn-sm ${superAdminTab === 'auditoria' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSuperAdminTab('auditoria')}
              >
                <span className="material-symbols-outlined">security</span> Auditoría
              </button>
            </div>
          </div>

          {/* Tarjetas de Métricas Globales del SuperAdmin */}
          <div className="kpi-grid-auto" style={{ marginBottom: '32px' }}>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--primary-container)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Usuarios Registrados</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{platformUsers.length}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.82rem' }}>Activos</span>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--secondary)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Roles Definidos</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>5</span>
                <span style={{ color: 'var(--primary-container)', fontWeight: 600, fontSize: '0.82rem' }}>RBAC Activo</span>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid #002F6C' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Congresos Totales</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{eventos.length}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.82rem' }}>Catálogo ULEAM</span>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--color-success)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado del Sistema</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)' }}>100% Online</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.82rem' }}>Operacional</span>
              </div>
            </div>
          </div>

          {/* TAB 1: GESTIÓN DE USUARIOS Y ASIGNACIÓN DE ROLES */}
          {superAdminTab === 'usuarios' && (
            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Control de Usuarios y Asignación de Roles
                  </h3>
                  <p className="body-regular" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Reasigna roles del sistema en tiempo real con efecto inmediato para cada usuario institucional o externo.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="input-control"
                    style={{ width: '240px', padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="Buscar por nombre o correo..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                  <select
                    className="input-control"
                    style={{ width: '160px', padding: '8px 10px', fontSize: '0.85rem' }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos los Roles</option>
                    <option value="SUPER_ADMIN">SuperAdmin</option>
                    <option value="ADMIN_EVENTO">Admin Evento</option>
                    <option value="PERSONAL_GESTION">Gestión</option>
                    <option value="PERSONAL_ASISTENCIA">Asistencia</option>
                    <option value="ASISTENTE">Asistente</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive-wrapper">
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead style={{ background: 'var(--surface-container)', color: 'var(--primary-dark)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Usuario</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Identificación</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Institución / Facultad</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Rol Asignado</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acción de Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformUsers
                      .filter((u) => {
                        const matchText = (u.nombres + ' ' + u.apellidos + ' ' + u.correo + ' ' + u.identificacion)
                          .toLowerCase()
                          .includes(userSearchTerm.toLowerCase());
                        const matchRole = userRoleFilter === 'TODOS' || u.rol === userRoleFilter;
                        return matchText && matchRole;
                      })
                      .map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(0, 47, 108, 0.08)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ display: 'block', color: 'var(--primary-dark)' }}>{u.nombres} {u.apellidos}</strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.correo}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>{u.identificacion}</td>
                          <td style={{ padding: '14px 16px' }}>{u.institucion}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`chip ${
                              u.rol === 'SUPER_ADMIN' ? 'chip-primary' :
                              u.rol === 'ADMIN_EVENTO' ? 'chip-urgent' :
                              u.rol === 'PERSONAL_GESTION' ? 'chip-alert' :
                              u.rol === 'PERSONAL_ASISTENCIA' ? 'chip-success' : 'chip-primary'
                            }`}>
                              {u.rol}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <select
                              value={u.rol}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--primary-container)',
                                background: '#FFFFFF',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: 'var(--primary-dark)',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              <option value="ADMIN_EVENTO">ADMIN_EVENTO</option>
                              <option value="PERSONAL_GESTION">PERSONAL_GESTION</option>
                              <option value="PERSONAL_ASISTENCIA">PERSONAL_ASISTENCIA</option>
                              <option value="ASISTENTE">ASISTENTE</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FIRMA DIGITAL Y SELLOS OFICIALES DE RECTORADO */}
          {superAdminTab === 'firma' && (
            <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '28px' }}>draw</span>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)', margin: 0 }}>Firma Digital y Sellos Oficiales de Rectorado</h3>
                  </div>
                  <p className="body-regular" style={{ marginTop: '4px' }}>
                    Configuración de la autoridad que avala los certificados y diplomas emitidos en la plataforma ULEAM.
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={resetDefaultSignature}>
                  <span className="material-symbols-outlined">restart_alt</span> Restaurar Valores Institucionales
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span> Datos de la Máxima Autoridad
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Nombre Titular:</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={authorityConfig.nombre}
                        onChange={(e) => updateAuthorityConfig({ ...authorityConfig, nombre: e.target.value })}
                        placeholder="Ej. Dr. Marcos Zambrano Zambrano, PhD."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Cargo Institucional:</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={authorityConfig.cargo}
                        onChange={(e) => updateAuthorityConfig({ ...authorityConfig, cargo: e.target.value })}
                        placeholder="Ej. Rector Institucional ULEAM"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Resolución Aprobatoria:</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={authorityConfig.resolucion}
                        onChange={(e) => updateAuthorityConfig({ ...authorityConfig, resolucion: e.target.value })}
                        placeholder="Ej. Resolución H.C.U. No. 042-CU-ULEAM-2026"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <input
                        type="checkbox"
                        id="selloActivo"
                        checked={authorityConfig.selloActivo}
                        onChange={(e) => updateAuthorityConfig({ ...authorityConfig, selloActivo: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                      />
                      <label htmlFor="selloActivo" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                        Incorporar Sello Oficial Institucional (Manta - Ecuador)
                      </label>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed #002F6C' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-dark)' }}>
                      Subir Imagen de Firma Oficial (PNG con fondo transparente)
                    </label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSignatureUpload} style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gesture</span> Dibujar Trazo Manual
                  </h4>
                  <div style={{ background: '#FAF9F6', border: '2px dashed #CBD5E1', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
                    <canvas
                      ref={sigCanvasRef}
                      width={380}
                      height={140}
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'crosshair', display: 'block', margin: '0 auto', touchAction: 'none', maxWidth: '100%' }}
                      onMouseDown={startDrawingSig}
                      onMouseMove={drawSig}
                      onMouseUp={stopDrawingSig}
                      onMouseLeave={stopDrawingSig}
                      onTouchStart={startDrawingSig}
                      onTouchMove={drawSig}
                      onTouchEnd={stopDrawingSig}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                      <button className="btn btn-outline btn-sm" onClick={clearSignatureCanvas}>
                        <span className="material-symbols-outlined">delete</span> Limpiar
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={saveDrawnSignature}>
                        <span className="material-symbols-outlined">save</span> Guardar Trazo
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', padding: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      VISTA PREVIA DE FIRMA EN CERTIFICADOS:
                    </span>
                    <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                      {authorityConfig.firmaUrl ? (
                        <img src={authorityConfig.firmaUrl} alt="Firma actual" style={{ maxHeight: '55px', maxWidth: '190px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.8rem', color: '#002F6C' }}>Marcos Zambrano Z.</div>
                      )}
                    </div>
                    <div style={{ width: '200px', height: '1.5px', background: '#002F6C', margin: '0 auto 6px' }}></div>
                    <strong style={{ fontSize: '0.88rem', color: '#002F6C', display: 'block' }}>{authorityConfig.nombre}</strong>
                    <span style={{ fontSize: '0.74rem', color: '#C59B27', fontWeight: 600, display: 'block' }}>{authorityConfig.cargo}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BITÁCORA DE AUDITORÍA Y SEGURIDAD */}
          {superAdminTab === 'auditoria' && (
            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Bitácora de Auditoría del Sistema
                  </h3>
                  <p className="body-regular" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Registro inmutable de accesos, operaciones financieras, check-ins y emisiones oficiales.
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => showToast('Bitácora sincronizada con registros en tiempo real.')}>
                  <span className="material-symbols-outlined">refresh</span> Actualizar Logs
                </button>
              </div>

              <div className="table-responsive-wrapper">
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead style={{ background: 'var(--surface-container)', color: 'var(--primary-dark)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Acción</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Usuario</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Rol</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>IP Origen</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Fecha</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(0, 47, 108, 0.08)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary-dark)' }}>{log.accion}</td>
                        <td style={{ padding: '12px 16px' }}>{log.usuario}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="chip chip-primary" style={{ fontSize: '0.75rem' }}>{log.rol}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{log.ip}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{log.fecha}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="chip chip-success" style={{ fontSize: '0.75rem' }}>{log.resultado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 4B: PANEL EXCLUSIVO ADMINISTRADOR DE EVENTOS             */}
      {/* ============================================================== */}
      {currentView === 'admin_eventos' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '32px' }}>event</span>
                <h2 className="headline-large" style={{ margin: 0 }}>Gestión y Coordinación de Eventos Académicos</h2>
              </div>
              <p className="body-regular" style={{ marginTop: '4px' }}>
                Planificación de conferencias, cronogramas, cupos de aforo, ponentes y métricas de participación.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
                <span className="material-symbols-outlined">table_view</span> Exportar Nómina Excel
              </button>
              <button
                className="btn btn-urgent"
                onClick={() => setShowCreateEventModal(true)}
              >
                <span className="material-symbols-outlined">add_circle</span> Crear Nuevo Evento
              </button>
            </div>
          </div>

          {/* Tarjetas KPI de Eventos */}
          <div className="kpi-grid-auto" style={{ marginBottom: '32px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--primary-container)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Eventos Activos</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{eventos.length}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>+12% este mes</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid #002F6C' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Participantes Inscritos</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>4,521</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>Aforo saludable</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--color-success)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Asistencia Promedio</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-success)' }}>78%</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>Óptimo</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--secondary)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recaudación Inscripciones</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>$ 4,521</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>Auditado</span>
              </div>
            </div>
          </div>

          {/* Tabla de Gestión de Congresos */}
          <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '16px' }}>
              Catálogo Administrativo de Congresos y Eventos
            </h3>
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--surface-container)', color: 'var(--primary-dark)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Evento Académico</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Modalidad</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Fechas</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Inscritos / Aforo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Estado del Evento</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(0, 47, 108, 0.08)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: 'var(--primary-dark)', display: 'block' }}>{ev.nombre}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.lugar}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="chip chip-primary">{ev.modalidad}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                        {new Date(ev.fecha_inicio).toLocaleDateString('es-EC')} - {new Date(ev.fecha_fin).toLocaleDateString('es-EC')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <strong>{ev.total_inscritos || 0}</strong> / {ev.capacidad_maxima}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={ev.estado}
                          onChange={(e) => handleEventStatusChange(ev.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--primary-container)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                          }}
                        >
                          <option value="INSCRIPCIONES_ABIERTAS">Inscripciones Abiertas</option>
                          <option value="EN_CURSO">En Curso</option>
                          <option value="FINALIZADO">Finalizado</option>
                          <option value="BORRADOR">Borrador</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          onClick={() => {
                            setDetailEvent(ev);
                            setShowEventDetailsModal(true);
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico y Tareas Operativas de Eventos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Evolución de la Participación</h3>
              <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 0' }}>
                {[
                  { mes: 'Ene', valor: 35 },
                  { mes: 'Feb', valor: 50 },
                  { mes: 'Mar', valor: 65 },
                  { mes: 'Abr', valor: 85 },
                  { mes: 'May', valor: 75 },
                  { mes: 'Jun', valor: 95 },
                ].map((item) => (
                  <div key={item.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${item.valor * 1.8}px`,
                        background: 'linear-gradient(180deg, var(--primary-container) 0%, var(--primary-dark) 100%)',
                        borderRadius: '6px 6px 0 0',
                      }}
                    ></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.mes}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Tareas Operativas de Congresos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => { setCurrentRole('GESTION'); navigateTo('gestion_pagos', '/gestion-pagos'); }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>receipt_long</span>
                    Comprobantes en Mesa de Finanzas
                  </span>
                  <span className="chip chip-urgent">2 por auditar</span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => { setCurrentRole('ASISTENCIA_STAFF'); navigateTo('checkin_staff', '/checkin'); }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-alert)' }}>qr_code_scanner</span>
                    Puntos de Control de Asistencia
                  </span>
                  <span className="chip chip-success">Activo en puerta</span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => navigateTo('certificados', '/certificados')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-container)' }}>workspace_premium</span>
                    Plantillas de Certificados Oficiales
                  </span>
                  <span className="chip chip-primary">SHA-256 Activo</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 5: PERSONAL DE GESTIÓN (Mesa de Finanzas)                */}
      {/* ============================================================== */}
      {currentView === 'gestion_pagos' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="headline-large">Dashboard Operativo de Finanzas y Pagos</h2>
              <p className="body-regular">Validación de transferencias bancarias y soporte contable con ventana de 24 horas.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
                <span className="material-symbols-outlined">table_view</span> Exportar Excel
              </button>
              <button className="btn btn-urgent btn-sm" onClick={() => window.print()}>
                <span className="material-symbols-outlined">picture_as_pdf</span> Imprimir Reporte
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <div className="table-scroll-hint">Desliza horizontalmente para ver todas las columnas ➔</div>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ background: 'var(--surface-container)', color: 'var(--primary-dark)' }}>
                <tr>
                  <th style={{ padding: '14px 20px' }}>Participante</th>
                  <th style={{ padding: '14px 20px' }}>Cédula</th>
                  <th style={{ padding: '14px 20px' }}>Categoría</th>
                  <th style={{ padding: '14px 20px' }}>Monto</th>
                  <th style={{ padding: '14px 20px' }}>Comprobante</th>
                  <th style={{ padding: '14px 20px' }}>Estado & SLA (24h)</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comprobantesPendientes.map((comp) => (
                  <tr key={comp.id} style={{ borderBottom: '1px solid rgba(0, 47, 108, 0.08)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{comp.participante}</td>
                    <td style={{ padding: '16px 20px' }}>{comp.cédula}</td>
                    <td style={{ padding: '16px 20px' }}>{comp.categoria}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--primary-container)' }}>
                      ${comp.monto.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--primary-container)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                        onClick={() => setVoucherPreview(`https://storage.uleam.edu.ec/comprobantes/${comp.archivo}`)}
                      >
                        {comp.archivo}
                      </button>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {comp.subido_hace}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`chip ${
                          comp.estado === 'APROBADO' ? 'chip-success' :
                          comp.estado === 'RECHAZADO' ? 'chip-urgent' :
                          comp.estado === 'EXPIRADO' ? 'chip-urgent' :
                          comp.estado_sla === 'URGENTE' ? 'chip-urgent' : 'chip-alert'
                        }`}>
                          {comp.estado === 'EN_REVISION'
                            ? comp.estado_sla === 'URGENTE'
                              ? `URGENTE (${comp.horas_restantes}h restantes)`
                              : `EN REVISIÓN (${comp.horas_restantes}h)`
                            : comp.estado}
                        </span>
                        {comp.estado === 'EN_REVISION' && (
                          <div style={{ width: '130px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${(comp.horas_restantes / 24) * 100}%`,
                              height: '100%',
                              background: comp.estado_sla === 'URGENTE' ? 'var(--color-error)' : 'var(--primary-container)',
                            }}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      {comp.estado === 'EN_REVISION' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: 'var(--color-success)', padding: '5px 12px' }}
                            onClick={() => handleReviewVoucher(comp.id, 'APROBADO')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                            Aprobar
                          </button>
                          <button
                            className="btn btn-urgent btn-sm"
                            style={{ padding: '5px 12px' }}
                            onClick={() => handleReviewVoucher(comp.id, 'RECHAZADO')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Procesado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 6: PERSONAL DE ASISTENCIA / ESCÁNER QR (Check-in)        */}
      {/* ============================================================== */}
      {currentView === 'checkin_staff' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ marginBottom: '28px' }}>
            <span className="chip chip-urgent" style={{ marginBottom: '8px' }}>Control de Puerta Activo (PC / Móvil)</span>
            <h2 className="headline-large">Validación de Asistencia en Tiempo Real</h2>
            <p className="body-regular">Escanea la credencial QR mediante cámara en vivo, sube una foto del código o digita la cédula.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '30px' }}>
            {/* Lector QR de Cámara / Formulario */}
            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid rgba(0, 47, 108, 0.1)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validados en Sala</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--color-success)', display: 'block' }}>
                    {142 + recentCheckins.length}
                  </strong>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendientes Aforo</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--secondary)', display: 'block' }}>
                    {Math.max(0, 58 - recentCheckins.length)}
                  </strong>
                </div>
              </div>

              {/* Banner Informativo de Acceso Móvil por Red Local (Wi-Fi) */}
              <div
                style={{
                  background: 'rgba(0, 47, 108, 0.04)',
                  border: '1px solid rgba(0, 47, 108, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '24px' }}>phone_iphone</span>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--primary-dark)', display: 'block' }}>
                      Prueba Móvil en Red Local:
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Ingresa en tu teléfono a: <strong style={{ color: 'var(--primary-container)', userSelect: 'all' }}>https://{typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : '192.168.0.239'}:5173</strong>
                    </span>
                  </div>
                </div>
                <span className="chip chip-success" style={{ fontSize: '0.72rem' }}>
                  HTTPS LAN Activo
                </span>
              </div>

              {/* Botones de Control de Cámara */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                  Escaneo con Cámara Web (PC) o Cámara Trasera (Móvil):
                </label>

                {/* Selector de Dispositivos de Video (cuando hay más de una cámara detectada) */}
                {availableCameras.length > 1 && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Dispositivo de Cámara Seleccionado:
                    </label>
                    <select
                      className="input-control"
                      style={{ fontSize: '0.82rem', padding: '6px 10px', width: '100%' }}
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                        if (cameraActive) {
                          startQrCamera(e.target.value);
                        }
                      }}
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Cámara ${idx + 1} (${cam.deviceId.slice(0, 8)}...)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {!cameraActive ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => startQrCamera()}
                    >
                      <span className="material-symbols-outlined">videocam</span> Iniciar Cámara
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-urgent btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={stopQrCamera}
                      >
                        <span className="material-symbols-outlined">videocam_off</span> Detener Cámara
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={toggleQrCamera}
                        title="Alternar entre cámaras disponibles o frontal/trasera"
                      >
                        <span className="material-symbols-outlined">cameraswitch</span> Cambiar
                      </button>
                    </>
                  )}
                </div>

                {/* Visor de Cámara en Vivo con Mirilla de Escaneo */}
                {cameraActive && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      background: '#000000',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      marginBottom: '16px',
                      aspectRatio: '4 / 3',
                    }}
                  >
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        if (el && scannerStreamRef.current && el.srcObject !== scannerStreamRef.current) {
                          el.srcObject = scannerStreamRef.current;
                          el.play().catch(() => {});
                        }
                      }}
                      playsInline
                      muted
                      autoPlay
                      onLoadedMetadata={(e) => {
                        e.target.play().catch(() => {});
                      }}
                      style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover', display: 'block', background: '#000000' }}
                    />
                    {/* Retícula visual y haz de escaneo láser */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: '15%',
                        border: '2px solid rgba(0, 195, 255, 0.9)',
                        borderRadius: '16px',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '50%',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, #FF0055, transparent)',
                          boxShadow: '0 0 8px #FF0055',
                          animation: 'pulse 1.5s infinite',
                        }}
                      ></div>
                    </div>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#FFFFFF',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Apunte el código QR de la credencial
                    </span>
                  </div>
                )}

                {/* Botones de Prueba Rápida y Simulación de Escaneo */}
                {cameraActive && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => {
                        handleExecuteScan('ULEAM-QR-KARLA-1317890123');
                        stopQrCamera();
                      }}
                      title="Simula la detección inmediata de una credencial válida con sonido y registro de aforo"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-success)' }}>check_circle</span>
                      Simular Credencial Válida
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => {
                        handleExecuteScan('ULEAM-QR-ERROR-0000000000');
                      }}
                      title="Simula un intento de acceso con credencial no válida"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-alert)' }}>cancel</span>
                      Simular Acceso Denegado
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div style={{ padding: '8px 12px', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '12px' }}>
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Subir foto de QR o archivo - Diseño Profesional Institucional */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary-dark)' }}>
                  O escanear desde imagen / foto de credencial QR:
                </label>
                <div
                  style={{
                    border: '2px dashed var(--primary-container)',
                    borderRadius: 'var(--radius-lg)',
                    background: uploadedQrFileName ? 'rgba(46, 125, 50, 0.04)' : 'rgba(0, 47, 108, 0.03)',
                    padding: '20px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onClick={() => {
                    const el = document.getElementById('custom-qr-file-input');
                    if (el) el.click();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = uploadedQrFileName ? 'rgba(46, 125, 50, 0.08)' : 'rgba(0, 47, 108, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = uploadedQrFileName ? 'rgba(46, 125, 50, 0.04)' : 'rgba(0, 47, 108, 0.03)';
                    e.currentTarget.style.borderColor = 'var(--primary-container)';
                  }}
                >
                  <input
                    id="custom-qr-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setUploadedQrFileName(file.name);
                        handleQrImageUpload(e);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: uploadedQrFileName ? 'rgba(46, 125, 50, 0.12)' : 'rgba(0, 47, 108, 0.1)',
                        color: uploadedQrFileName ? 'var(--color-success)' : 'var(--primary-container)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                        {uploadedQrFileName ? 'check_circle' : 'add_photo_alternate'}
                      </span>
                    </div>

                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: uploadedQrFileName ? 'var(--color-success)' : 'var(--primary-dark)' }}>
                        {uploadedQrFileName ? `✓ Archivo cargado: ${uploadedQrFileName}` : 'Seleccionar o Arrastrar Foto / Captura QR'}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {uploadedQrFileName
                          ? 'Haz clic aquí para seleccionar otro archivo de imagen'
                          : 'Soporta archivos PNG, JPG, WEBP o fotos de credenciales tomadas desde tu móvil'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none', fontSize: '0.82rem', padding: '5px 14px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                        {uploadedQrFileName ? 'Cambiar Imagen' : 'Explorar Galería / Archivos'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckInSubmit}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                  O digitar C.I. / Token QR manualmente:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej: 1317890123"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '95px' }}>
                    <span className="material-symbols-outlined">check</span> Validar
                  </button>
                </div>
              </form>

              {/* Botones Rápidos de Prueba para Demostración */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pruebas rápidas de campo:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '6px' }}
                    onClick={() => handleExecuteScan('1317890123')}
                  >
                    Karla Andrade (Válido)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '6px' }}
                    onClick={() => handleExecuteScan('1318901234')}
                  >
                    Javier Jaramillo (Válido)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '6px', color: '#B45309', borderColor: '#F59E0B' }}
                    onClick={() => handleExecuteScan('DUPLICADO')}
                  >
                    Probar Duplicado
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '6px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    onClick={() => handleExecuteScan('ERROR-0000000000')}
                  >
                    Probar Inválido
                  </button>
                </div>
              </div>

              {/* Resultado del Escaneo */}
              {scanResult && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: scanResult.exito
                      ? scanResult.advertencia
                        ? 'var(--color-alert-bg)'
                        : 'var(--color-success-bg)'
                      : 'var(--color-error-bg)',
                    border: `1px solid ${scanResult.exito ? (scanResult.advertencia ? 'var(--color-alert)' : 'var(--color-success)') : 'var(--color-error)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: scanResult.exito
                          ? scanResult.advertencia
                            ? 'var(--color-alert)'
                            : 'var(--color-success)'
                          : 'var(--color-error)',
                        fontSize: '28px',
                      }}
                    >
                      {scanResult.exito ? (scanResult.advertencia ? 'warning' : 'check_circle') : 'cancel'}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: scanResult.exito ? (scanResult.advertencia ? '#995B00' : 'var(--color-success)') : 'var(--color-error)' }}>
                      {scanResult.mensaje}
                    </strong>
                  </div>
                  {scanResult.participante && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.4' }}>
                      <p><strong>Participante:</strong> {scanResult.participante}</p>
                      <p><strong>Categoría:</strong> {scanResult.categoria}</p>
                      {scanResult.institucion && <p><strong>Institución:</strong> {scanResult.institucion}</p>}
                      <p><strong>Hora:</strong> {scanResult.hora}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feed de Últimos Ingresos */}
            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-success)' }}>history</span>
                Últimos Ingresos Verificados en Puerta
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentCheckins.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-bg)',
                      borderLeft: '4px solid var(--color-success)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                        {item.nombre}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Hora registrada: {item.tiempo}
                      </span>
                    </div>
                    <span className="chip chip-success" style={{ fontSize: '0.75rem' }}>
                      {item.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 7: PANTALLA DE ERROR 404 (RECURSO O RUTA NO ENCONTRADA)   */}
      {/* ============================================================== */}
      {currentView === 'not_found' && (
        <NotFoundView
          currentPath={currentPath}
          onNavigate={navigateTo}
          onSearch={(query) => {
            navigateTo('explorar', '/explorar', query);
          }}
          onOpenHelp={() => {
            setHelpDeskTab('faq');
            setShowHelpDeskModal(true);
          }}
        />
      )}

      {/* ============================================================== */}
            {/* MODAL: CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      {showLogoutConfirmModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 47, 108, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-level-3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(211, 47, 47, 0.1)',
                color: 'var(--color-alert)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>logout</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              ¿Deseas cerrar tu sesión?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              {currentUser ? (
                <>
                  Se cerrará la sesión de <strong>{currentUser.nombres} {currentUser.apellidos}</strong>. Para volver a acceder a tus credenciales o paneles deberás ingresar nuevamente.
                </>
              ) : (
                'Se cerrará la sesión actual en la plataforma.'
              )}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowLogoutConfirmModal(false)}
                style={{ minWidth: '120px' }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-urgent"
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  handleLogout();
                }}
                style={{ minWidth: '140px' }}
              >
                <span className="material-symbols-outlined">logout</span> Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR NUEVO EVENTO (RF-006 - Totalmente Funcional)       */}
      {/* ============================================================== */}
      {showCreateEventModal && (
        <div className="modal-overlay" onClick={() => setShowCreateEventModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '26px' }}>event</span>
                <h3 style={{ fontSize: '1.25rem' }}>Crear Nuevo Evento Académico</h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowCreateEventModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} style={{ padding: '28px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nombre Oficial del Evento:
                </label>
                <input
                  type="text"
                  className="input-control"
                  required
                  placeholder="Ej: II Simposio Internacional de Ciberseguridad ULEAM 2026"
                  value={newEventForm.nombre}
                  onChange={(e) => setNewEventForm({ ...newEventForm, nombre: e.target.value })}
                />
              </div>

              <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Modalidad:
                  </label>
                  <select
                    className="input-control"
                    value={newEventForm.modalidad}
                    onChange={(e) => setNewEventForm({ ...newEventForm, modalidad: e.target.value })}
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Aforo / Capacidad Máxima:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    className="input-control"
                    value={newEventForm.capacidad_maxima}
                    onChange={(e) => setNewEventForm({ ...newEventForm, capacidad_maxima: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Sede o Enlace Virtual:
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ej: Paraninfo Alfonso Aguilar Ruilova o Enlace Teams"
                  value={newEventForm.lugar}
                  onChange={(e) => setNewEventForm({ ...newEventForm, lugar: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Descripción Académica y Objetivos:
                </label>
                <textarea
                  className="input-control"
                  rows="3"
                  placeholder="Breve reseña del evento, líneas temáticas y perfil de ponentes convocados..."
                  value={newEventForm.descripcion}
                  onChange={(e) => setNewEventForm({ ...newEventForm, descripcion: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <span className="material-symbols-outlined">publish</span>
                  Guardar y Publicar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETALLES DEL EVENTO (Cronograma y Ponentes)             */}
      {/* ============================================================== */}
      {detailEvent && (
        <div className="modal-overlay" onClick={() => setDetailEvent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="chip chip-primary" style={{ marginBottom: '6px' }}>{detailEvent.modalidad}</span>
                <h3 style={{ fontSize: '1.25rem' }}>{detailEvent.nombre}</h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setDetailEvent(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '28px' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {detailEvent.descripcion}
              </p>

              <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary-container)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined">location_on</span>
                  <span>Sede: {detailEvent.lugar || 'Campus Central ULEAM'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>Fecha: {new Date(detailEvent.fecha_inicio).toLocaleDateString('es-EC')}</span>
                </div>
              </div>

              {detailEvent.ponentes && detailEvent.ponentes.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Ponentes Magistrales:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detailEvent.ponentes.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#FFFFFF', border: '1px solid rgba(0,47,108,0.1)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container)', color: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {p.nombres.charAt(0)}
                        </div>
                        <div>
                          <strong>{p.titulo_academico} {p.nombres} {p.apellidos}</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.institucion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setDetailEvent(null)}>
                  Cerrar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const ev = detailEvent;
                    setDetailEvent(null);
                    handleStartRegister(ev);
                  }}
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Inscribirme Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VALIDACIÓN PÚBLICA DE CERTIFICADO                       */}
      {/* ============================================================== */}
      {showCertificateValidatorModal && (
        <div className="modal-overlay" onClick={() => setShowCertificateValidatorModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '26px' }}>verified_user</span>
                <h3 style={{ fontSize: '1.25rem' }}>Portal de Validación de Certificados</h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowCertificateValidatorModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '28px' }}>
              <form onSubmit={handleValidateCertificate}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Código Alfanumérico del Certificado (o escanear QR):
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej: ULEAM-2026-ETICA-884920"
                    value={validationCodeInput}
                    onChange={(e) => setValidationCodeInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <span className="material-symbols-outlined">search</span> Verificar
                  </button>
                </div>
              </form>

              {validationResult && (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: validationResult.valido ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    border: `1px solid ${validationResult.valido ? 'var(--color-success)' : 'var(--color-error)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ color: validationResult.valido ? 'var(--color-success)' : 'var(--color-error)', fontSize: '28px' }}
                    >
                      {validationResult.valido ? 'verified' : 'gpp_bad'}
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: validationResult.valido ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {validationResult.valido ? 'CERTIFICADO OFICIAL VÁLIDO' : 'CERTIFICADO NO ENCONTRADO'}
                    </strong>
                  </div>

                  {validationResult.valido ? (
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      <p><strong>Evento:</strong> {validationResult.evento}</p>
                      <p><strong>Beneficiario:</strong> {validationResult.participante}</p>
                      <p><strong>Fecha de Expedición:</strong> {validationResult.fecha}</p>
                      <p><strong>Firmante:</strong> {validationResult.firmante}</p>
                      <code style={{ display: 'block', marginTop: '8px', fontSize: '0.75rem', color: 'var(--primary-container)' }}>
                        {validationResult.hash}
                      </code>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-error)' }}>
                      {validationResult.mensaje}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISTA PREVIA DE COMPROBANTE DE PAGO                     */}
      {/* ============================================================== */}
      {voucherPreview && (
        <div className="modal-overlay" onClick={() => setVoucherPreview(null)}>
          <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Comprobante de Transferencia Bancaria</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setVoucherPreview(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ border: '2px dashed rgba(0, 47, 108, 0.2)', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-bg)', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary-container)', marginBottom: '10px' }}>receipt</span>
                <p style={{ fontWeight: 600 }}>Comprobante Banco Pichincha #098231</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monto: $25.00 USD • Cuenta ULEAM</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Archivo: <code>transferencia-pichincha-098231.pdf</code>
                </p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setVoucherPreview(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FLUJO DE INSCRIPCIÓN EN 3 PASOS (RF-012)                */}
      {/* ============================================================== */}
      {showRegisterModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '28px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="chip chip-primary">Paso {registerStep} de 3</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => setShowRegisterModal(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginTop: '10px' }}>Inscripción a: {selectedEvent.nombre}</h3>
            </div>

            <div style={{ padding: '28px' }}>
              {/* Paso 1: Selección de Categoría */}
              {registerStep === 1 && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>1. Selecciona tu Categoría de Participación:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {selectedEvent.categorias && selectedEvent.categorias.length > 0 ? (
                      selectedEvent.categorias.map((cat) => (
                        <label
                          key={cat.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            border: `2px solid ${registrationForm.categoria_id === cat.id ? 'var(--primary-container)' : 'rgba(0, 47, 108, 0.1)'}`,
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            background: registrationForm.categoria_id === cat.id ? 'var(--surface-container)' : '#FFFFFF',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                              type="radio"
                              name="categoria"
                              checked={registrationForm.categoria_id === cat.id}
                              onChange={() =>
                                setRegistrationForm((prev) => ({
                                  ...prev,
                                  categoria_id: cat.id,
                                  categoria_nombre: cat.nombre,
                                  categoria_precio: cat.precio,
                                }))
                              }
                            />
                            <div>
                              <strong>{cat.nombre}</strong>
                              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Cupo disponible para la categoría
                              </span>
                            </div>
                          </div>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--primary-container)' }}>
                            {cat.precio === 0 ? 'GRATUITO' : `$${cat.precio.toFixed(2)}`}
                          </strong>
                        </label>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>Inscripción general abierta.</p>
                    )}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setRegisterStep(2)}>
                    Continuar a Datos Personales
                  </button>
                </div>
              )}

              {/* Paso 2: Datos del Participante */}
              {registerStep === 2 && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>2. Confirma tus Datos del Registro:</h4>
                  <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombres:</label>
                      <input
                        type="text"
                        className="input-control"
                        value={registrationForm.nombres}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, nombres: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Apellidos:</label>
                      <input
                        type="text"
                        className="input-control"
                        value={registrationForm.apellidos}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, apellidos: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cédula o Pasaporte:</label>
                    <input
                      type="text"
                      className="input-control"
                      value={registrationForm.identificacion}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, identificacion: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Institución de Procedencia:</label>
                    <input
                      type="text"
                      className="input-control"
                      value={registrationForm.institucion}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, institucion: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Correo Institucional:</label>
                    <input
                      type="email"
                      className="input-control"
                      value={registrationForm.correo}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, correo: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={() => setRegisterStep(1)}>
                      Atrás
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setRegisterStep(3)}>
                      Continuar a Confirmación / Pago
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Pago y Plazo de 24 Horas */}
              {registerStep === 3 && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>3. Resumen y Emisión de Acreditación:</h4>
                  <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                    <p><strong>Categoría:</strong> {registrationForm.categoria_nombre}</p>
                    <p><strong>Total a Pagar:</strong> ${registrationForm.categoria_precio.toFixed(2)} USD</p>
                  </div>

                  {registrationForm.categoria_precio > 0 ? (
                    <div style={{ marginBottom: '24px' }}>
                      {/* Banner de Política SLA de 24 Horas */}
                      <div style={{ background: 'var(--surface-container)', padding: '14px 16px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary-container)', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-container)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
                          <span>Plazo de Revisión: 24 Horas</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          Al cargar tu transferencia, tu inscripción pasará al estado <strong>EN REVISIÓN</strong>. El equipo administrativo de la ULEAM cuenta con una ventana máxima de 24 horas para verificar el pago y liberar tu credencial QR. Durante este tiempo tu cupo está completamente reservado.
                        </p>
                      </div>

                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Adjuntar Comprobante de Transferencia / Depósito:
                      </label>
                      <input type="file" className="input-control" style={{ background: '#FFFFFF' }} />
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        Formatos válidos: PDF, JPG, PNG (Máx 5MB)
                      </small>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                      <p style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px' }}>verified</span>
                        Inscripción Gratuita Institucional: tu credencial QR será generada automáticamente.
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={() => setRegisterStep(2)}>
                      Atrás
                    </button>
                    <button className="btn btn-urgent" style={{ flex: 1 }} onClick={handleConfirmRegistration}>
                      Finalizar e Imprimir Credencial
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREDENCIAL DIGITAL ID-CARD (RF-014)                    */}
      {/* ============================================================== */}
      {showCredentialModal && activeCredential && (
        <div className="modal-overlay" onClick={() => setShowCredentialModal(false)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--primary-dark))', color: '#FFFFFF', padding: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <div className="brand-circle" style={{ width: '32px', height: '32px', fontSize: '0.9rem', background: '#FFFFFF', color: 'var(--primary-container)' }}>U</div>
                <strong>ULEAM EVENTOS</strong>
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', opacity: 0.9 }}>Credencial Digital Oficial</h4>
            </div>

            <div style={{ padding: '28px', textAlign: 'center' }}>
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                alt="Foto"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid var(--primary-container)' }}
              />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{activeCredential.participante}</h3>
              <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                {activeCredential.categoria}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {activeCredential.institucion} • C.I: {activeCredential.identificacion}
              </p>

              {/* QR Oficial Firmado */}
              <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '16px' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeCredential.qr_token)}`}
                  alt="QR Access"
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>
              <code style={{ fontSize: '0.75rem', color: 'var(--primary-container)', display: 'block', wordBreak: 'break-all' }}>
                {activeCredential.qr_token}
              </code>

              {/* Firma de Autoridad en la Credencial */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {authorityConfig.firmaUrl ? (
                      <img src={authorityConfig.firmaUrl} alt="Firma" style={{ maxHeight: '34px', maxWidth: '120px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.4rem', color: '#002F6C' }}>M. Zambrano Z.</span>
                    )}
                  </div>
                  <div style={{ width: '130px', height: '1px', background: '#002F6C', margin: '2px auto' }}></div>
                  <span style={{ fontSize: '0.68rem', color: '#002F6C', fontWeight: 700, display: 'block' }}>{authorityConfig.nombre}</span>
                  <span style={{ fontSize: '0.62rem', color: '#C59B27', display: 'block' }}>{authorityConfig.cargo}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: '1 1 80px' }} onClick={() => setShowCredentialModal(false)}>
                Cerrar
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: '1 1 120px' }}
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined">print</span> Imprimir Gafete
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: '2 1 160px' }}
                onClick={() => handleDownloadCredPDF(activeCredential)}
              >
                <span className="material-symbols-outlined">download</span> Descargar Credencial (.PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ENCUESTA DE SATISFACCIÓN (RF-017, RF-018)               */}
      {/* ============================================================== */}
      {showSurveyModal && (
        <div className="modal-overlay" onClick={() => setShowSurveyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(0, 47, 108, 0.1)' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Encuesta de Satisfacción Post-Evento</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Requisito para la emisión de tu certificado digital (RF-016).
              </p>
            </div>
            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                1. ¿Qué tan probable es que recomiendes este evento académico a tus compañeros? (NPS 1 al 10):
              </label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    style={{
                      flex: 1,
                      minWidth: '32px',
                      padding: '10px 0',
                      border: '1px solid rgba(0, 47, 108, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      background: surveyRating === num ? 'var(--primary-container)' : '#FFFFFF',
                      color: surveyRating === num ? '#FFFFFF' : 'var(--primary-container)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSurveyRating(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                2. Comentarios o propuestas de temas para próximas jornadas académicas:
              </label>
              <textarea
                className="input-control"
                rows="4"
                placeholder="Escribe tu opinión de manera constructiva y anónima..."
                value={surveyComment}
                onChange={(e) => setSurveyComment(e.target.value)}
                style={{ marginBottom: '20px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowSurveyModal(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    showToast('¡Encuesta enviada con éxito! Tu certificado ha sido desbloqueado.');
                    setShowSurveyModal(false);
                    setCurrentView('certificados');
                  }}
                >
                  <span className="material-symbols-outlined">send</span>
                  Enviar y Desbloquear Certificado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AUTENTICACIÓN NATIVA POSTGRESQL (LOGIN Y REGISTRO)      */}
      {/* ============================================================== */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '22px 28px',
                borderBottom: '1px solid rgba(0, 47, 108, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-container)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '26px' }}>
                  key
                </span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Acceso Institucional ULEAM
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    Portal Oficial de Acceso Universitario
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowAuthModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Pestañas Iniciar Sesión / Registrarse */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
              <button
                style={{
                  flex: 1,
                  padding: '14px',
                  background: authTab === 'login' ? '#FFFFFF' : 'var(--surface-bg)',
                  border: 'none',
                  borderBottom: authTab === 'login' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: authTab === 'login' ? 700 : 500,
                  color: authTab === 'login' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => { setAuthTab('login'); setAuthError(null); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                Iniciar Sesión
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '14px',
                  background: authTab === 'register' ? '#FFFFFF' : 'var(--surface-bg)',
                  border: 'none',
                  borderBottom: authTab === 'register' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: authTab === 'register' ? 700 : 500,
                  color: authTab === 'register' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => { setAuthTab('register'); setAuthError(null); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                Crear Cuenta (Registro)
              </button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              

              {authError && (
                <div
                  style={{
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                  <span>{authError}</span>
                </div>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Correo Institucional:
                    </label>
                    <input
                      type="email"
                      className="input-control"
                      required
                      placeholder="estudiante@uleam.edu.ec"
                      value={loginForm.correo}
                      onChange={(e) => setLoginForm({ ...loginForm, correo: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Contraseña:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        className="input-control"
                        required
                        placeholder="••••••••"
                        style={{ paddingRight: '42px' }}
                        value={loginForm.contrasena}
                        onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                        }}
                        title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {showLoginPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowAuthModal(false)}
                      disabled={authLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={authLoading}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined">login</span>
                      {authLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="responsive-grid-2" style={{ marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Nombres:
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        placeholder="Ej. Daniel"
                        value={registerForm.nombres}
                        onChange={(e) => setRegisterForm({ ...registerForm, nombres: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Apellidos:
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        placeholder="Ej. Moreira"
                        value={registerForm.apellidos}
                        onChange={(e) => setRegisterForm({ ...registerForm, apellidos: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="responsive-grid-2" style={{ marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Cédula de Identidad:
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        maxLength={10}
                        placeholder="1310000000"
                        value={registerForm.identificacion}
                        onChange={(e) => setRegisterForm({ ...registerForm, identificacion: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Teléfono Móvil:
                      </label>
                      <input
                        type="tel"
                        className="input-control"
                        placeholder="0991234567"
                        value={registerForm.telefono}
                        onChange={(e) => setRegisterForm({ ...registerForm, telefono: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Correo Institucional / Personal:
                    </label>
                    <input
                      type="email"
                      className="input-control"
                      required
                      placeholder="usuario@uleam.edu.ec"
                      value={registerForm.correo}
                      onChange={(e) => setRegisterForm({ ...registerForm, correo: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Institución / Facultad:
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      required
                      placeholder="Facultad de Ciencias de la Vida y Tecnologías"
                      value={registerForm.institucion}
                      onChange={(e) => setRegisterForm({ ...registerForm, institucion: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Contraseña (mínimo 6 caracteres):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        className="input-control"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        style={{ paddingRight: '42px' }}
                        value={registerForm.contrasena}
                        onChange={(e) => setRegisterForm({ ...registerForm, contrasena: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                        }}
                        title={showRegisterPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {showRegisterPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowAuthModal(false)}
                      disabled={authLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={authLoading}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined">how_to_reg</span>
                      {authLoading ? 'Creando cuenta...' : 'Registrar Cuenta'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MESA DE AYUDA Y SOPORTE UNIVERSITARIO (4 APARTADOS)     */}
      {/* ============================================================== */}
      {showHelpDeskModal && (
        <div className="modal-overlay" onClick={() => setShowHelpDeskModal(false)}>
          <div className="modal-box" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            {/* Cabecera Mesa de Ayuda */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(0, 47, 108, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, var(--surface-container) 0%, #FFFFFF 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--primary-container)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                    support_agent
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Soporte y Servicios Académicos
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Universidad Laica Eloy Alfaro de Manabí • Centro de Soporte Integral
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowHelpDeskModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Selector de Apartados (Tabs) */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', overflowX: 'auto', background: 'var(--surface-bg)' }}>
              <button
                style={{
                  padding: '14px 20px',
                  background: helpDeskTab === 'faq' ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderBottom: helpDeskTab === 'faq' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: helpDeskTab === 'faq' ? 700 : 500,
                  color: helpDeskTab === 'faq' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setHelpDeskTab('faq')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
                1. Preguntas Frecuentes
              </button>
              <button
                style={{
                  padding: '14px 20px',
                  background: helpDeskTab === 'ticket' ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderBottom: helpDeskTab === 'ticket' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: helpDeskTab === 'ticket' ? 700 : 500,
                  color: helpDeskTab === 'ticket' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setHelpDeskTab('ticket')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>confirmation_number</span>
                2. Crear Ticket de Soporte
              </button>
              <button
                style={{
                  padding: '14px 20px',
                  background: helpDeskTab === 'mis_tickets' ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderBottom: helpDeskTab === 'mis_tickets' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: helpDeskTab === 'mis_tickets' ? 700 : 500,
                  color: helpDeskTab === 'mis_tickets' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setHelpDeskTab('mis_tickets')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list_alt</span>
                3. Mis Solicitudes ({ticketsList.length})
              </button>
              <button
                style={{
                  padding: '14px 20px',
                  background: helpDeskTab === 'contacto' ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderBottom: helpDeskTab === 'contacto' ? '3px solid var(--primary-container)' : 'none',
                  fontWeight: helpDeskTab === 'contacto' ? 700 : 500,
                  color: helpDeskTab === 'contacto' ? 'var(--primary-container)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setHelpDeskTab('contacto')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>phone_in_talk</span>
                4. Canales Directos
              </button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* ============================================================== */}
              {/* APARTADO 1: PREGUNTAS FRECUENTES (FAQ)                         */}
              {/* ============================================================== */}
              {helpDeskTab === 'faq' && (
                <div>
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Buscar preguntas (ej. pagos, 24 horas, certificados, beca, QR)..."
                        value={faqSearchQuery}
                        onChange={(e) => setFaqSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                      >
                        search
                      </span>
                    </div>
                  </div>

                  {/* Lista de Acordeones FAQ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {FAQS_DATA.filter(
                      (f) =>
                        !faqSearchQuery ||
                        f.pregunta.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                        f.respuesta.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                        f.categoria.toLowerCase().includes(faqSearchQuery.toLowerCase())
                    ).map((faq) => {
                      const isOpen = expandedFaq === faq.id;
                      return (
                        <div
                          key={faq.id}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            background: '#FFFFFF',
                          }}
                        >
                          <div
                            style={{
                              padding: '14px 18px',
                              background: isOpen ? 'rgba(0, 47, 108, 0.04)' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontWeight: 600,
                              color: 'var(--primary-dark)',
                              fontSize: '0.92rem',
                            }}
                            onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="chip chip-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {faq.categoria}
                              </span>
                              <span>{faq.pregunta}</span>
                            </div>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '20px' }}>
                              {isOpen ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                          {isOpen && (
                            <div
                              style={{
                                padding: '16px 18px',
                                background: '#FAF9F6',
                                borderTop: '1px solid #E2E8F0',
                                fontSize: '0.88rem',
                                color: '#475569',
                                lineHeight: '1.6',
                              }}
                            >
                              {faq.respuesta}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: '24px',
                      padding: '16px',
                      background: 'var(--surface-bg)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong>¿No encontraste lo que buscabas?</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                        Crea una solicitud formal en la Mesa de Ayuda y un asesor te responderá.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setHelpDeskTab('ticket')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined">add_comment</span>
                      Crear Ticket de Soporte
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* APARTADO 2: CREAR TICKET DE SOPORTE                            */}
              {/* ============================================================== */}
              {helpDeskTab === 'ticket' && (
                <form onSubmit={handleCreateTicketSubmit}>
                  <div className="responsive-grid-2" style={{ marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Nombres del Solicitante:
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={ticketForm.nombre}
                        onChange={(e) => setTicketForm({ ...ticketForm, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Correo Institucional:
                      </label>
                      <input
                        type="email"
                        className="input-control"
                        required
                        value={ticketForm.correo}
                        onChange={(e) => setTicketForm({ ...ticketForm, correo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="responsive-grid-3" style={{ marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Cédula de Identidad:
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={ticketForm.cedula}
                        onChange={(e) => setTicketForm({ ...ticketForm, cedula: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Categoría del Problema:
                      </label>
                      <select
                        className="input-control"
                        value={ticketForm.categoria}
                        onChange={(e) => setTicketForm({ ...ticketForm, categoria: e.target.value })}
                      >
                        <option value="PAGOS_COMPROBANTES">Pagos y Comprobantes (24h)</option>
                        <option value="CERTIFICADOS_DIGITALES">Certificados y Horas</option>
                        <option value="CREDENCIAL_QR">Credencial de Acceso QR</option>
                        <option value="ACCESO_LOGIN">Acceso de Cuenta / Clave</option>
                        <option value="OTRO">Consulta General</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                        Prioridad:
                      </label>
                      <select
                        className="input-control"
                        value={ticketForm.prioridad}
                        onChange={(e) => setTicketForm({ ...ticketForm, prioridad: e.target.value })}
                      >
                        <option value="NORMAL">Normal (&lt; 24h)</option>
                        <option value="ALTA">Alta / Urgente (&lt; 4h)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Asunto de la Solicitud:
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      required
                      placeholder="Ej. Problema al descargar certificado del seminario de IA"
                      value={ticketForm.asunto}
                      onChange={(e) => setTicketForm({ ...ticketForm, asunto: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Descripción Detallada del Requerimiento:
                    </label>
                    <textarea
                      className="input-control"
                      rows={4}
                      required
                      placeholder="Describe claramente tu caso, nombres del evento, fechas o número de depósito si aplica..."
                      value={ticketForm.descripcion}
                      onChange={(e) => setTicketForm({ ...ticketForm, descripcion: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setHelpDeskTab('faq')}
                    >
                      Volver a FAQ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined">send</span>
                      Enviar Solicitud a Soporte
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================================== */}
              {/* APARTADO 3: MIS TICKETS Y CONSULTAS                            */}
              {/* ============================================================== */}
              {helpDeskTab === 'mis_tickets' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Total de solicitudes registradas: <strong>{ticketsList.length}</strong>
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setHelpDeskTab('ticket')}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined">add</span> Nuevo Ticket
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {ticketsList.map((tick) => (
                      <div
                        key={tick.id}
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: 'var(--radius-md)',
                          padding: '18px',
                          background: '#FFFFFF',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-container)', fontSize: '0.85rem' }}>
                              {tick.id}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '10px' }}>
                              • {tick.fecha}
                            </span>
                            <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-dark)', margin: '4px 0' }}>
                              {tick.asunto}
                            </h4>
                            <span className="chip chip-primary" style={{ fontSize: '0.7rem' }}>
                              {tick.categoria}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`chip ${
                                tick.estado === 'RESUELTO'
                                  ? 'chip-success'
                                  : tick.estado === 'EN_ATENCION'
                                  ? 'chip-alert'
                                  : 'chip-urgent'
                              }`}
                            >
                              ● {tick.estado.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Respuesta del Personal de Soporte */}
                        <div
                          style={{
                            marginTop: '12px',
                            background: 'rgba(0, 47, 108, 0.04)',
                            borderLeft: '4px solid var(--primary-container)',
                            padding: '12px 14px',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.85rem',
                          }}
                        >
                          <strong style={{ color: 'var(--primary-dark)', display: 'block', marginBottom: '3px' }}>
                            Respuesta del Equipo de Soporte:
                          </strong>
                          <span style={{ color: '#334155', lineHeight: '1.5' }}>{tick.respuesta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* APARTADO 4: CANALES DIRECTOS Y UBICACIÓN                       */}
              {/* ============================================================== */}
              {helpDeskTab === 'contacto' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
                  <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '24px' }}>
                        call
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-dark)' }}>Atención Telefónica Oficial</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <strong>Central ULEAM:</strong> (05) 2623-740
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <strong>Extensión Decanato FCVT:</strong> 145 / 148
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                      <strong>WhatsApp de Soporte:</strong> +593 99 876 5432
                    </p>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '24px' }}>
                        mail
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-dark)' }}>Correos Institucionales</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <strong>Soporte de Eventos:</strong> soporte.eventos@uleam.edu.ec
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <strong>Acreditación y Certificados:</strong> certificacion@uleam.edu.ec
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                      <strong>Finanzas y Facturación:</strong> pagos.congresos@uleam.edu.ec
                    </p>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '24px' }}>
                        location_city
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-dark)' }}>Atención Presencial</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                      Facultad de Ciencias de la Vida y Tecnologías (Planta Baja).
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                      Av. Circunvalación Vía a San Mateo, Campus Matriz Manta, Manabí.
                    </p>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '24px' }}>
                        schedule
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-dark)' }}>Horarios de Atención</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                      <strong>Lunes a Viernes:</strong> 08:00 a 13:00 y 14:00 a 17:00
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, margin: 0 }}>
                      ● Soporte en línea vía portal activo las 24 horas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-container)' }}>
              <button className="btn btn-outline" onClick={() => setShowHelpDeskModal(false)}>
                Cerrar Soporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETALLE DE FACULTADES Y CARRERAS (FUNCIONAL)            */}
      {/* ============================================================== */}
      {showFacultyModal && (
        <div className="modal-overlay" onClick={() => setShowFacultyModal(false)}>
          <div className="modal-box" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(0, 47, 108, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-container)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '26px' }}>
                  domain
                </span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>
                    {FACULTY_DATA[selectedFaculty]?.nombre}
                  </h3>
                  <span className="chip chip-primary" style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                    {FACULTY_DATA[selectedFaculty]?.siglas}
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowFacultyModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '26px 28px' }}>
              {/* Selector de Facultades */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                  className={`role-pill-btn ${selectedFaculty === 'ciencias_vida' ? 'active' : ''}`}
                  onClick={() => setSelectedFaculty('ciencias_vida')}
                >
                  Ciencias de la Vida
                </button>
                <button
                  className={`role-pill-btn ${selectedFaculty === 'software' ? 'active' : ''}`}
                  onClick={() => setSelectedFaculty('software')}
                >
                  Ing. en Software
                </button>
                <button
                  className={`role-pill-btn ${selectedFaculty === 'posgrado' ? 'active' : ''}`}
                  onClick={() => setSelectedFaculty('posgrado')}
                >
                  Posgrado e Investigación
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  DIRECCIÓN ACADÉMICA / DECANATO:
                </strong>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  {FACULTY_DATA[selectedFaculty]?.decana}
                </span>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  MISIÓN Y COMPROMISO ACADÉMICO:
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {FACULTY_DATA[selectedFaculty]?.mision}
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  PROGRAMAS Y CARRERAS ACREDITADAS:
                </strong>
                <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>
                  {FACULTY_DATA[selectedFaculty]?.carreras.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '24px', background: 'var(--surface-bg)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--primary-dark)', marginBottom: '2px' }}>
                  INFRAESTRUCTURA Y LABORATORIOS:
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {FACULTY_DATA[selectedFaculty]?.laboratorios}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowFacultyModal(false)}>
                  Cerrar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleFilterByFaculty(selectedFaculty)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span className="material-symbols-outlined">filter_alt</span>
                  Ver Eventos Académicos de esta Facultad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: POLÍTICA DE PRIVACIDAD Y LOPDP (FUNCIONAL)              */}
      {/* ============================================================== */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(0, 47, 108, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-container)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '26px' }}>
                  policy
                </span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Política de Privacidad y Tratamiento de Datos
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Conforme a la Ley Orgánica de Protección de Datos Personales (Ecuador)
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowPrivacyModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '26px 28px', maxHeight: '65vh', overflowY: 'auto', fontSize: '0.88rem', color: '#475569', lineHeight: '1.6' }}>
              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>1. Responsable del Tratamiento</h4>
              <p style={{ marginBottom: '14px' }}>
                La Universidad Laica Eloy Alfaro de Manabí (ULEAM), a través de la Facultad de Ciencias de la Vida y Tecnologías, es la responsable del tratamiento de los datos personales recopilados con fines estrictamente académicos, de registro, control de asistencia y emisión de certificaciones avaladas.
              </p>

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>2. Almacenamiento y Protección de Datos Institucionales</h4>
              <p style={{ marginBottom: '14px' }}>
                Toda la información institucional y datos de identidad (nombres, cédula, correo institucional) se resguardan en servidores propios de base de datos PostgreSQL. Las contraseñas se almacenan mediante algoritmos de cifrado irreversible <code>bcrypt</code> y los accesos se protegen mediante tokens firmados <code>JWT</code> bajo estándares de seguridad internacional.
              </p>

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>3. Uso de Códigos QR y Firmas Digitales</h4>
              <p style={{ marginBottom: '14px' }}>
                Los tokens QR generados para los participantes son códigos criptográficos únicos destinados exclusivamente a la validación de ingreso y acreditación en las puertas de los auditorios. Los certificados emitidos cuentan con verificación hash SHA-256 para evitar falsificaciones.
              </p>

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>4. Derechos ARCO y Soporte Institucional</h4>
              <p style={{ margin: 0 }}>
                Cualquier participante puede solicitar la actualización, verificación o rectificación de sus datos personales a través de el canal de Soporte Institucional oficial.
              </p>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-container)' }}>
              <button className="btn btn-primary" onClick={() => setShowPrivacyModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CAMPUS MATRIZ MANTA - UBICACIÓN Y CÓMO LLEGAR (FUNCIONAL) */}
      {/* ============================================================== */}
      {showCampusModal && (
        <div className="modal-overlay" onClick={() => setShowCampusModal(false)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(0, 47, 108, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-container)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-urgent)', fontSize: '28px' }}>
                  location_on
                </span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>
                    Campus Matriz Manta — ULEAM
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Manabí, República del Ecuador • Sede de Eventos Académicos
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowCampusModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '26px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#FAF9F6', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', display: 'block', marginBottom: '4px' }}>
                    DIRECCIÓN OFICIAL:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                    Av. Circunvalación, Vía a San Mateo, Manta, Manabí, Ecuador.
                  </p>
                </div>
                <div style={{ background: '#FAF9F6', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', display: 'block', marginBottom: '4px' }}>
                    COORDENADAS GPS:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, fontFamily: 'monospace' }}>
                    Latitud: -0.95374<br />
                    Longitud: -80.74831
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                  AUDITORIOS Y RECINTOS PRINCIPALES DE CONGRESOS:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--surface-bg)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <strong>Paraninfo Alfonso Aguilar Ruilova:</strong> Aforo para 600 personas, climatizado, transmisión streaming.
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--surface-bg)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <strong>Auditorio Facultad Cs. de la Vida y Tecnologías:</strong> Aforo para 200 personas con cabina técnica.
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--surface-bg)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <strong>Laboratorios de Cómputo y DevOps (Lab 3):</strong> Talleres interactivos de programación y workshops.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowCampusModal(false)}>
                  Cerrar
                </button>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=-0.95374,-80.74831"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <span className="material-symbols-outlined">map</span>
                  Abrir Ubicación en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FOOTER INSTITUCIONAL (100% FUNCIONAL)                          */}
      {/* ============================================================== */}
      <footer className="academic-footer">
        <div className="main-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div
                className="brand-logo"
                style={{ marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => {
                  setCurrentRole('ASISTENTE');
                  navigateTo('explorar', '/explorar');
                }}
              >
                <div className="brand-circle" style={{ background: '#FFFFFF', color: 'var(--primary-container)' }}>U</div>
                <div className="brand-title" style={{ color: '#FFFFFF' }}>
                  ULEAM <span style={{ color: '#FFA4A4' }}>EVENTOS</span>
                </div>
              </div>
              <p style={{ color: '#C4C6D2', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px', marginBottom: '16px' }}>
                Universidad Laica Eloy Alfaro de Manabí. Sistema de vinculación y gestión de congresos académicos, registro institucional, código QR y certificación digital.
              </p>
              {/* Botón destacado a Mesa de Ayuda */}
              <button
                className="btn btn-urgent btn-sm"
                onClick={() => {
                  setHelpDeskTab('faq');
                  setShowHelpDeskModal(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
                Abrir Soporte
              </button>
            </div>

            <div className="footer-col">
              <h4>Navegación</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="/explorar"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentRole('ASISTENTE');
                      navigateTo('explorar', '/explorar');
                    }}
                  >
                    Catálogo de Eventos
                  </a>
                </li>
                <li>
                  <a
                    href="/mis-eventos"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentRole('ASISTENTE');
                      navigateTo('mis_eventos', '/mis-eventos');
                    }}
                  >
                    Mis Credenciales
                  </a>
                </li>
                <li>
                  <a
                    href="/certificados"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentRole('ASISTENTE');
                      navigateTo('certificados', '/certificados');
                    }}
                  >
                    Certificados Emitidos
                  </a>
                </li>
                <li>
                  <a
                    href="#validar"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCertificateValidatorModal(true);
                    }}
                  >
                    Validar Certificados
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Facultades</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="#fcvt"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFaculty('ciencias_vida');
                      setShowFacultyModal(true);
                    }}
                  >
                    Ciencias de la Vida y Tecnologías
                  </a>
                </li>
                <li>
                  <a
                    href="#software"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFaculty('software');
                      setShowFacultyModal(true);
                    }}
                  >
                    Ingeniería en Software
                  </a>
                </li>
                <li>
                  <a
                    href="#posgrado"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFaculty('posgrado');
                      setShowFacultyModal(true);
                    }}
                  >
                    Posgrado e Investigación
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Soporte</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="#mesadeayuda"
                    onClick={(e) => {
                      e.preventDefault();
                      setHelpDeskTab('faq');
                      setShowHelpDeskModal(true);
                    }}
                  >
                    Soporte
                  </a>
                </li>
                <li>
                  <a
                    href="#privacidad"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                  >
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="#campus"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCampusModal(true);
                    }}
                  >
                    Manta, Manabí, Ecuador
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#94A3B8' }}>
            <span>© 2026 Universidad Laica Eloy Alfaro de Manabí. Todos los derechos reservados.</span>
            <span>Vinculación con la Sociedad I y II • Ing. en Software</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
