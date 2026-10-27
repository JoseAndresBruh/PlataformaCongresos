import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  exportTableToCSV,
  downloadCertificatePDF,
  downloadCredentialPDF,
  openPrintableCertificateWindow,
} from './utils/documentExporter';
import NotFoundView from './components/NotFoundView';
import Search404State from './components/Search404State';

// API Base (Go Backend)
const API_BASE = 'http://localhost:8080/api/v1';


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
      'Recibirás una notificación en el portal indicando el motivo del rechazo (ej. monto incorrecto o imagen borrosa). Podrás volver a subir un comprobante válido dentro de un nuevo plazo de 24 horas o comunicarte por la Mesa de Ayuda.',
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
    if (clean === '/admin' || clean === '/admin-kpi' || clean === '/resumen') return { view: 'admin_kpi', path: '/admin', role: 'ADMIN' };
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
      else if (view === 'admin_kpi') targetPath = '/admin';
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
        throw new Error(data.error || 'Credenciales inválidas en el servidor PostgreSQL.');
      }

      // Guardar token JWT y sesión
      localStorage.setItem('uleam_jwt_token', data.token);
      localStorage.setItem('uleam_session_user', JSON.stringify(data.usuario));
      setCurrentUser(data.usuario);

      // Sincronizar Rol según usuario
      const rol = (data.usuario.rol || 'ASISTENTE').toUpperCase();
      if (rol.includes('ADMIN')) {
        setCurrentRole('ADMIN');
        setCurrentView('admin_kpi');
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
      showToast(`¡Bienvenido, ${data.usuario.nombres}! Sesión iniciada con éxito (PostgreSQL).`);
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
        throw new Error(data.error || 'Error al registrar usuario en la base de datos PostgreSQL.');
      }

      showToast('¡Cuenta creada con éxito en PostgreSQL! Iniciando sesión...');
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
        'Su requerimiento fue recibido por la Mesa de Ayuda de la Facultad. Un agente especializado le responderá formalmente en menos de 4 horas hábiles.',
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
              className={`role-pill-btn ${currentRole === 'ADMIN' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('ADMIN'); navigateTo('admin_kpi', '/admin'); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
              Panel SuperAdmin / Eventos
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
                  style={{ border: currentView === 'explorar' ? 'none' : 'none' }}
                  onClick={() => navigateTo('explorar', '/explorar')}
                >
                  <span className="material-symbols-outlined">explore</span> Explorar
                </button>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'mis_eventos' ? 'btn-primary' : ''}`}
                  style={{ border: currentView === 'mis_eventos' ? 'none' : 'none' }}
                  onClick={() => navigateTo('mis_eventos', '/mis-eventos')}
                >
                  <span className="material-symbols-outlined">badge</span> Mis Credenciales
                </button>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'certificados' ? 'btn-primary' : ''}`}
                  style={{ border: currentView === 'certificados' ? 'none' : 'none' }}
                  onClick={() => navigateTo('certificados', '/certificados')}
                >
                  <span className="material-symbols-outlined">workspace_premium</span> Certificados
                </button>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <button
                  className={`btn btn-outline btn-sm ${currentView === 'admin_kpi' ? 'btn-primary' : ''}`}
                  style={{ border: currentView === 'admin_kpi' ? 'none' : 'none' }}
                  onClick={() => navigateTo('admin_kpi', '/admin')}
                >
                  <span className="material-symbols-outlined">dashboard</span> Resumen Ejecutivo
                </button>
                <button
                  className="btn btn-urgent btn-sm"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  <span className="material-symbols-outlined">add_circle</span> Crear Evento
                </button>
              </>
            )}

            {currentRole === 'GESTION' && (
              <button
                className={`btn btn-outline btn-sm ${currentView === 'gestion_pagos' ? 'btn-primary' : ''}`}
                style={{ border: currentView === 'gestion_pagos' ? 'none' : 'none' }}
                onClick={() => navigateTo('gestion_pagos', '/gestion-pagos')}
              >
                <span className="material-symbols-outlined">receipt_long</span> Mesa de Finanzas
              </button>
            )}

            {currentRole === 'ASISTENCIA_STAFF' && (
              <button
                className={`btn btn-outline btn-sm ${currentView === 'checkin_staff' ? 'btn-primary' : ''}`}
                style={{ border: currentView === 'checkin_staff' ? 'none' : 'none' }}
                onClick={() => navigateTo('checkin_staff', '/checkin')}
              >
                <span className="material-symbols-outlined">qr_code_scanner</span> Escáner Puerta
              </button>
            )}


            {/* Perfil del Usuario y Acceso PostgreSQL */}
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
                      {currentUser.rol || currentRole} (PG Auth)
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
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
                    ● {currentUser.rol || currentRole} (PG Auth)
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
                <span>Mesa de Ayuda (Soporte)</span>
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
      {/* VISTA 4: PANEL SUPERADMIN / EVENTOS (Resumen Ejecutivo)        */}
      {/* ============================================================== */}
      {currentView === 'admin_kpi' && (
        <main className="main-container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="headline-large">Resumen Ejecutivo y Analítica Institucional</h2>
              <p className="body-regular">Monitoreo en tiempo real de congresos, aforo y estado operacional.</p>
            </div>
            <button
              className="btn btn-urgent"
              onClick={() => setShowCreateEventModal(true)}
            >
              <span className="material-symbols-outlined">add_circle</span> Crear Nuevo Evento
            </button>
          </div>

          {/* Tarjetas KPI */}
          <div className="kpi-grid-auto" style={{ marginBottom: '32px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid var(--primary-container)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Eventos en Sistema</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{eventos.length}</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>+12% este mes</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)', borderLeft: '4px solid #002F6C' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Participantes Registrados</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>4,521</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>+8.4%</span>
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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ingresos por Inscripciones</span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>$ 4,521</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>Auditoría OK</span>
              </div>
            </div>
          </div>

          {/* Gráfico y Tareas */}
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
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Tareas Operativas Pendientes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => { setCurrentRole('GESTION'); navigateTo('gestion_pagos', '/gestion-pagos'); }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>receipt_long</span>
                    Aprobar Comprobantes
                  </span>
                  <span className="chip chip-urgent">2 pendientes</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-alert)' }}>fact_check</span>
                    Validar Acreditaciones
                  </span>
                  <span className="chip chip-alert">15 por revisar</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-container)' }}>workspace_premium</span>
                    Configurar Certificados
                  </span>
                  <span className="chip chip-primary">1 congreso</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN SUPERADMIN: CONFIGURACIÓN DE FIRMA DIGITAL Y AUTORIDAD */}
          {/* ============================================================== */}
          <div style={{ marginTop: '36px', background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-level-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: '28px' }}>draw</span>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)' }}>Firma Digital y Sellos Oficiales para Certificados</h3>
                </div>
                <p className="body-regular" style={{ marginTop: '4px' }}>
                  Sube o dibuja la firma de la autoridad (Rector/Decano) para que se incorpore automáticamente en todos los certificados y credenciales PDF.
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={resetDefaultSignature}>
                <span className="material-symbols-outlined">restart_alt</span> Restaurar Valores Institucionales
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px' }}>
              {/* Formulario de Metadatos de Autoridad */}
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span> Datos de la Autoridad Universitaria
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Nombre de la Autoridad Titular:
                    </label>
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
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Cargo / Dignidad Universitaria:
                    </label>
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
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Resolución u Ordenanza Institucional:
                    </label>
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

                {/* Subir Archivo de Imagen */}
                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed #002F6C' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-dark)' }}>
                    Opción A: Subir Imagen de Firma (PNG / JPG)
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Se recomienda archivo PNG con fondo transparente o fondo blanco limpio.
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleSignatureUpload}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Dibujo de Firma en Lienzo Digital y Vista Previa */}
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gesture</span> Opción B: Dibujar Firma con Mouse o Pantalla Táctil
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
                      <span className="material-symbols-outlined">delete</span> Limpiar Lienzo
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={saveDrawnSignature}>
                      <span className="material-symbols-outlined">save</span> Guardar Trazo como Firma
                    </button>
                  </div>
                </div>

                {/* Vista previa en vivo del pie de firma */}
                <div style={{ marginTop: '20px', padding: '18px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    VISTA PREVIA EN TIEMPO REAL DEL BLOQUE DE FIRMA OFICIAL:
                  </span>
                  <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                    {authorityConfig.firmaUrl ? (
                      <img
                        src={authorityConfig.firmaUrl}
                        alt="Firma actual"
                        style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.9rem', color: '#002F6C' }}>
                        Marcos Zambrano Z.
                      </div>
                    )}
                  </div>
                  <div style={{ width: '220px', height: '1.5px', background: '#002F6C', margin: '0 auto 6px' }}></div>
                  <strong style={{ fontSize: '0.9rem', color: '#002F6C', display: 'block' }}>{authorityConfig.nombre}</strong>
                  <span style={{ fontSize: '0.76rem', color: '#C59B27', fontWeight: 600, display: 'block' }}>{authorityConfig.cargo}</span>
                  <span style={{ fontSize: '0.7rem', color: '#777777', display: 'block' }}>{authorityConfig.resolucion}</span>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm" onClick={handleDownloadCertPDF}>
                      <span className="material-symbols-outlined">download</span> Probar Descarga PDF
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handlePrintCert}>
                      <span className="material-symbols-outlined">print</span> Vista Imprimible
                    </button>
                  </div>
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
            <span className="chip chip-urgent" style={{ marginBottom: '8px' }}>Control de Puerta Activo</span>
            <h2 className="headline-large">Validación de Asistencia en Tiempo Real</h2>
            <p className="body-regular">Escanea el código QR de las credenciales o ingresa la cédula del participante.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '30px' }}>
            {/* Lector QR / Formulario de Entrada */}
            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid rgba(0, 47, 108, 0.1)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validados</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--color-success)', display: 'block' }}>142</strong>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendientes</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--secondary)', display: 'block' }}>58</strong>
                </div>
              </div>

              <form onSubmit={handleCheckInSubmit}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                  Escaneo QR o C.I. del Participante:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej: 1317890123 o TOKEN-QR"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <span className="material-symbols-outlined">qr_code_scanner</span> Validar
                  </button>
                </div>
              </form>

              {/* Botón rápido de prueba */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  onClick={() => setScanInput('1317890123')}
                >
                  Probar Cédula Válida
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.8rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={() => setScanInput('0000000000')}
                >
                  Probar Inválido
                </button>
              </div>

              {/* Resultado del Escaneo */}
              {scanResult && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: scanResult.exito
                      ? scanResult.advertencia
                        ? 'var(--color-alert-bg)'
                        : 'var(--color-success-bg)'
                      : 'var(--color-error-bg)',
                    border: `1px solid ${scanResult.exito ? (scanResult.advertencia ? 'var(--color-alert)' : 'var(--color-success)') : 'var(--color-error)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
                    <strong style={{ fontSize: '1.1rem', color: scanResult.exito ? (scanResult.advertencia ? '#995B00' : 'var(--color-success)') : 'var(--color-error)' }}>
                      {scanResult.mensaje}
                    </strong>
                  </div>
                  {scanResult.participante && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '8px' }}>
                      <p><strong>Participante:</strong> {scanResult.participante}</p>
                      <p><strong>Categoría:</strong> {scanResult.categoria}</p>
                      <p><strong>Hora:</strong> {scanResult.hora}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feed de Últimos Ingresos */}
            <div style={{ background: '#FFFFFF', padding: '26px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-level-1)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Últimos Ingresos Verificados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentCheckins.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface-bg)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--surface-container)',
                          color: 'var(--primary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {item.nombre.charAt(0)}
                      </div>
                      <div>
                        <strong>{item.nombre}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.tiempo}
                        </span>
                      </div>
                    </div>
                    <span className="chip chip-success">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
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
                    ● Conexión Directa a PostgreSQL (Go REST API + JWT)
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
              {/* Callout Explicativo de Arquitectura */}
              <div
                style={{
                  background: 'rgba(0, 47, 108, 0.04)',
                  border: '1px solid rgba(0, 47, 108, 0.12)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  marginBottom: '20px',
                  lineHeight: '1.4',
                }}
              >
                <strong style={{ color: 'var(--primary-dark)', display: 'block', marginBottom: '2px' }}>
                  Arquitectura Nativa PostgreSQL:
                </strong>
                Tus credenciales se validan directamente en la tabla <code>usuarios</code> usando <code>bcrypt</code> en Go y emitiendo tokens estándar JWT. Sin dependencia del servicio propietario de Supabase Auth.
              </div>

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
                    <input
                      type="password"
                      className="input-control"
                      required
                      placeholder="••••••••"
                      value={loginForm.contrasena}
                      onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })}
                    />
                  </div>

                  {/* Acceso Rápido de Prueba para Demostración */}
                  <div style={{ marginBottom: '20px', background: 'var(--surface-bg)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      CUENTAS DE PRUEBA EN POSTGRESQL (1-CLIC):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="role-pill-btn"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setLoginForm({ correo: 'superadmin@uleam.edu.ec', contrasena: 'Admin123!' })}
                      >
                        SuperAdmin
                      </button>
                      <button
                        type="button"
                        className="role-pill-btn"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setLoginForm({ correo: 'estudiante@uleam.edu.ec', contrasena: 'Admin123!' })}
                      >
                        Estudiante
                      </button>
                      <button
                        type="button"
                        className="role-pill-btn"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setLoginForm({ correo: 'gestion@uleam.edu.ec', contrasena: 'Admin123!' })}
                      >
                        Personal Gestión
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
                    <input
                      type="password"
                      className="input-control"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={registerForm.contrasena}
                      onChange={(e) => setRegisterForm({ ...registerForm, contrasena: e.target.value })}
                    />
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
                      {authLoading ? 'Creando en PostgreSQL...' : 'Registrar Cuenta'}
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
                    Mesa de Ayuda y Servicios Académicos
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
                      Enviar Solicitud a Mesa de Ayuda
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
                            Respuesta de la Mesa de Ayuda:
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
                      <strong>Mesa de Ayuda Eventos:</strong> soporte.eventos@uleam.edu.ec
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
                Cerrar Mesa de Ayuda
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

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>2. Almacenamiento Seguro en PostgreSQL Nativo</h4>
              <p style={{ marginBottom: '14px' }}>
                Toda la información institucional y datos de identidad (nombres, cédula, correo institucional) se resguardan en servidores propios de base de datos PostgreSQL. Las contraseñas se almacenan mediante algoritmos de cifrado irreversible <code>bcrypt</code> y los accesos se protegen mediante tokens firmados <code>JWT</code> bajo estándares de seguridad internacional.
              </p>

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>3. Uso de Códigos QR y Firmas Digitales</h4>
              <p style={{ marginBottom: '14px' }}>
                Los tokens QR generados para los participantes son códigos criptográficos únicos destinados exclusivamente a la validación de ingreso y acreditación en las puertas de los auditorios. Los certificados emitidos cuentan con verificación hash SHA-256 para evitar falsificaciones.
              </p>

              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '6px' }}>4. Derechos ARCO y Mesa de Ayuda</h4>
              <p style={{ margin: 0 }}>
                Cualquier participante puede solicitar la actualización, verificación o rectificación de sus datos personales a través de la Mesa de Ayuda Universitaria oficial.
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
                Abrir Mesa de Ayuda
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
                    Mesa de Ayuda (Soporte)
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
