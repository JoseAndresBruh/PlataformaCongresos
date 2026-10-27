package domain

import (
	"time"

	"github.com/google/uuid"
)

// Roles
const (
	RoleSuperAdmin         = "SUPER_ADMIN"
	RoleAdminEvento        = "ADMIN_EVENTO"
	RolePersonalGestion    = "PERSONAL_GESTION"
	RolePersonalAsistencia = "PERSONAL_ASISTENCIA"
	RolePonenteFeria       = "PONENTE_FERIA"
	RolePonente            = "PONENTE"
	RoleAsistente          = "ASISTENTE"
)

// Estados de Evento
const (
	EstadoBorrador              = "BORRADOR"
	EstadoPublicado             = "PUBLICADO"
	EstadoInscripcionesAbiertas = "INSCRIPCIONES_ABIERTAS"
	EstadoInscripcionesCerradas = "INSCRIPCIONES_CERRADAS"
	EstadoEnCurso               = "EN_CURSO"
	EstadoFinalizado            = "FINALIZADO"
	EstadoArchivado             = "ARCHIVADO"
)

// Estados de Inscripción
const (
	InscripcionPendienteRevision = "PENDIENTE_REVISION"
	InscripcionConfirmada        = "CONFIRMADA"
	InscripcionCancelada         = "CANCELADA"
	InscripcionExonerada         = "EXONERADA"
)

// Estados de Comprobante (Flujo de Pago por Estados)
const (
	ComprobantePendiente   = "PENDIENTE"
	ComprobanteEnRevision  = "EN_REVISION"
	ComprobanteAprobado    = "APROBADO"
	ComprobanteRechazado   = "RECHAZADO"
	ComprobanteExpirado    = "EXPIRADO"
)

// Usuario representa la entidad 'usuarios' (Tabla 43)
type Usuario struct {
	ID               uuid.UUID `json:"id"`
	Correo           string    `json:"correo"`
	ContrasenaHash   string    `json:"-"`
	Nombres          string    `json:"nombres"`
	Apellidos        string    `json:"apellidos"`
	Identificacion   string    `json:"identificacion"`
	Institucion      string    `json:"institucion"`
	Telefono         *string   `json:"telefono,omitempty"`
	URLFotoPerfil    *string   `json:"url_foto_perfil,omitempty"`
	CorreoVerificado bool      `json:"correo_verificado"`
	CreadoAt         time.Time `json:"creado_at"`
	Rol              string    `json:"rol,omitempty"`
}

// Rol representa la entidad 'roles' (Tabla 44)
type Rol struct {
	ID          int    `json:"id"`
	Nombre      string `json:"nombre"`
	Descripcion string `json:"descripcion"`
}

// Evento representa la entidad 'eventos' (Tabla 46)
type Evento struct {
	ID                 uuid.UUID `json:"id"`
	Slug               string    `json:"slug"`
	Nombre             string    `json:"nombre"`
	Descripcion        string    `json:"descripcion"`
	FechaInicio        time.Time `json:"fecha_inicio"`
	FechaFin           time.Time `json:"fecha_fin"`
	Modalidad          string    `json:"modalidad"` // PRESENCIAL, VIRTUAL, HIBRIDO
	Lugar              *string   `json:"lugar,omitempty"`
	URLAfiche          *string   `json:"url_afiche,omitempty"`
	URLLogo            *string   `json:"url_logo,omitempty"`
	IdiomaPrincipal    string    `json:"idioma_principal"`
	CapacidadMaxima    int       `json:"capacidad_maxima"`
	RepositorioAbierto bool      `json:"repositorio_abierto"`
	Estado             string    `json:"estado"`
	CreadoAt           time.Time `json:"creado_at"`
	ActualizadoAt      time.Time `json:"actualizado_at"`

	// Relaciones opcionales para vistas ricas
	LineasTematicas []LineaTematica       `json:"lineas_tematicas,omitempty"`
	Sesiones        []SesionEvento        `json:"sesiones,omitempty"`
	Ponentes        []Ponente             `json:"ponentes,omitempty"`
	Categorias      []CategoriaInscripcion `json:"categorias,omitempty"`
	TotalInscritos  int                   `json:"total_inscritos,omitempty"`
	TotalCheckins   int                   `json:"total_checkins,omitempty"`
}

// LineaTematica representa 'lineas_tematicas' (Tabla 47)
type LineaTematica struct {
	ID       uuid.UUID `json:"id"`
	EventoID uuid.UUID `json:"evento_id"`
	Nombre   string    `json:"nombre"`
	Color    string    `json:"color"`
}

// SesionEvento representa 'sesiones_evento' (Tabla 48)
type SesionEvento struct {
	ID              uuid.UUID  `json:"id"`
	EventoID        uuid.UUID  `json:"evento_id"`
	LineaTematicaID *uuid.UUID `json:"linea_tematica_id,omitempty"`
	Titulo          string     `json:"titulo"`
	Descripcion     *string    `json:"descripcion,omitempty"`
	HoraInicio      time.Time  `json:"hora_inicio"`
	HoraFin         time.Time  `json:"hora_fin"`
	URLLugarVirtual *string    `json:"url_lugar_virtual,omitempty"`
	Ponentes        []Ponente  `json:"ponentes,omitempty"`
}

// Ponente representa 'ponentes' (Tabla 49)
type Ponente struct {
	ID              uuid.UUID  `json:"id"`
	EventoID        uuid.UUID  `json:"evento_id"`
	UsuarioID       *uuid.UUID `json:"usuario_id,omitempty"`
	Nombres         string     `json:"nombres"`
	Apellidos       string     `json:"apellidos"`
	TituloAcademico string     `json:"titulo_academico"`
	Institucion     string     `json:"institucion"`
	Correo          string     `json:"correo"`
	URLLinkedIn     *string    `json:"url_linkedin,omitempty"`
	Biografia       *string    `json:"biografia,omitempty"`
	URLFoto         *string    `json:"url_foto,omitempty"`
}

// CategoriaInscripcion representa 'categorias_inscripcion' (Tabla 52)
type CategoriaInscripcion struct {
	ID                  uuid.UUID `json:"id"`
	EventoID            uuid.UUID `json:"evento_id"`
	Nombre              string    `json:"nombre"`
	Precio              float64   `json:"precio"`
	CapacidadMaxima     int       `json:"capacidad_maxima"`
	FechaInicio         time.Time `json:"fecha_inicio"`
	FechaFin            time.Time `json:"fecha_fin"`
	RequiereComprobante bool      `json:"requiere_comprobante"`
	InscritosActuales   int       `json:"inscritos_actuales,omitempty"`
}

// Inscripcion representa 'inscripciones' (Tabla 53)
type Inscripcion struct {
	ID              uuid.UUID  `json:"id"`
	EventoID        uuid.UUID  `json:"evento_id"`
	UsuarioID       uuid.UUID  `json:"usuario_id"`
	CategoriaID     uuid.UUID  `json:"categoria_id"`
	Estado          string     `json:"estado"`
	ExoneradoPor    *uuid.UUID `json:"exonerado_por,omitempty"`
	NotaExoneracion *string    `json:"nota_exoneracion,omitempty"`
	RegistradoAt    time.Time  `json:"registrado_at"`

	// Datos de join enriquecidos
	EventoNombre       string     `json:"evento_nombre,omitempty"`
	UsuarioNombre      string     `json:"usuario_nombre,omitempty"`
	UsuarioCorreo      string     `json:"usuario_correo,omitempty"`
	CategoriaNombre    string     `json:"categoria_nombre,omitempty"`
	CategoriaPrecio    float64    `json:"categoria_precio,omitempty"`
	ComprobanteURL     *string    `json:"comprobante_url,omitempty"`
	CredencialQR       *string    `json:"credencial_qr,omitempty"`
	LimiteRevisionAt   *time.Time `json:"limite_revision_at,omitempty"`
	HorasRestantes     float64    `json:"horas_restantes,omitempty"`
	EstadoSLA          string     `json:"estado_sla,omitempty"` // A_TIEMPO, URGENTE, VENCIDO
}

// Comprobante representa 'comprobantes' (Tabla 54 con ventana SLA de 24h)
type Comprobante struct {
	ID               uuid.UUID  `json:"id"`
	InscripcionID    uuid.UUID  `json:"inscripcion_id"`
	URLArchivo       string     `json:"url_archivo"`
	EstadoRevision   string     `json:"estado_revision"` // EN_REVISION, APROBADO, RECHAZADO, EXPIRADO
	AuditorID        *uuid.UUID `json:"auditor_id,omitempty"`
	Observaciones    *string    `json:"observaciones,omitempty"`
	FechaAuditoria   *time.Time `json:"fecha_auditoria,omitempty"`
	SubidoAt         time.Time  `json:"subido_at"`
	LimiteRevisionAt time.Time  `json:"limite_revision_at"`
	HorasRestantes   float64    `json:"horas_restantes"`
	EstadoSLA        string     `json:"estado_sla"` // A_TIEMPO, URGENTE, VENCIDO
}

// Credencial representa 'credenciales' (Tabla 56)
type Credencial struct {
	ID             uuid.UUID `json:"id"`
	InscripcionID  uuid.UUID `json:"inscripcion_id"`
	TokenQRSeguro  string    `json:"token_qr_seguro"`
	URLPdf         string    `json:"url_pdf"`
	EmitidoAt      time.Time `json:"emitido_at"`
}

// Asistencia representa 'asistencias' (Tabla 57)
type Asistencia struct {
	ID            uuid.UUID  `json:"id"`
	InscripcionID uuid.UUID  `json:"inscripcion_id"`
	SesionID      uuid.UUID  `json:"sesion_id"`
	EscaneadoPor  *uuid.UUID `json:"escaneado_por,omitempty"`
	MarcaTiempo   time.Time  `json:"marca_tiempo"`
}

// Certificado representa 'certificados' (Tabla 58)
type Certificado struct {
	ID               uuid.UUID `json:"id"`
	InscripcionID    uuid.UUID `json:"inscripcion_id"`
	URLPdf           string    `json:"url_pdf"`
	CodigoValidacion string    `json:"codigo_validacion"`
	EmitidoAt        time.Time `json:"emitido_at"`
	Participante     string    `json:"participante,omitempty"`
	EventoNombre     string    `json:"evento_nombre,omitempty"`
}

// Encuesta representa 'encuestas' (Tabla 59)
type Encuesta struct {
	ID        uuid.UUID `json:"id"`
	EventoID  uuid.UUID `json:"evento_id"`
	Preguntas string    `json:"preguntas"` // JSONB string
}

// RespuestaEncuesta representa 'respuestas_encuestas'
type RespuestaEncuesta struct {
	ID            uuid.UUID `json:"id"`
	EncuestaID    uuid.UUID `json:"encuesta_id"`
	InscripcionID uuid.UUID `json:"inscripcion_id"`
	Respuestas    string    `json:"respuestas"` // JSONB
	EnviadoAt     time.Time `json:"enviado_at"`
}

// MetricasDashboard representa las estadísticas para los paneles (RF-019, RF-023)
type MetricasDashboard struct {
	EventosActivos        int     `json:"eventos_activos"`
	ParticipantesTotales  int     `json:"participantes_totales"`
	AsistenciaPromedio    float64 `json:"asistencia_promedio"`
	IngresosTotales       float64 `json:"ingresos_totales"`
	PagosPendientes       int     `json:"pagos_pendientes"`
	CertificadosEmitidos  int     `json:"certificados_emitidos"`
}
