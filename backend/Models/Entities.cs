using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace UleamEventos.Api.Models
{
    // Roles del Sistema (RBAC)
    public static class Roles
    {
        public const string SuperAdmin = "SUPER_ADMIN";
        public const string AdminEvento = "ADMIN_EVENTO";
        public const string PersonalGestion = "PERSONAL_GESTION";
        public const string PersonalAsistencia = "PERSONAL_ASISTENCIA";
        public const string PonenteFeria = "PONENTE_FERIA";
        public const string Ponente = "PONENTE";
        public const string Asistente = "ASISTENTE";
    }

    // Estados de Evento
    public static class EstadosEvento
    {
        public const string Borrador = "BORRADOR";
        public const string Publicado = "PUBLICADO";
        public const string InscripcionesAbiertas = "INSCRIPCIONES_ABIERTAS";
        public const string InscripcionesCerradas = "INSCRIPCIONES_CERRADAS";
        public const string EnCurso = "EN_CURSO";
        public const string Finalizado = "FINALIZADO";
        public const string Archivado = "ARCHIVADO";
    }

    // Estados de Inscripción
    public static class EstadosInscripcion
    {
        public const string PendienteRevision = "PENDIENTE_REVISION";
        public const string Confirmada = "CONFIRMADA";
        public const string Cancelada = "CANCELADA";
        public const string Exonerada = "EXONERADA";
    }

    // Estados de Comprobante
    public static class EstadosComprobante
    {
        public const string Pendiente = "PENDIENTE";
        public const string EnRevision = "EN_REVISION";
        public const string Aprobado = "APROBADO";
        public const string Rechazado = "RECHAZADO";
        public const string Expirado = "EXPIRADO";
    }

    // Entidad Usuario
    public class Usuario
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("correo")]
        public string Correo { get; set; } = string.Empty;

        [JsonIgnore]
        public string ContrasenaHash { get; set; } = string.Empty;

        [JsonPropertyName("nombres")]
        public string Nombres { get; set; } = string.Empty;

        [JsonPropertyName("apellidos")]
        public string Apellidos { get; set; } = string.Empty;

        [JsonPropertyName("identificacion")]
        public string Identificacion { get; set; } = string.Empty;

        [JsonPropertyName("institucion")]
        public string Institucion { get; set; } = string.Empty;

        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }

        [JsonPropertyName("url_foto_perfil")]
        public string? UrlFotoPerfil { get; set; }

        [JsonPropertyName("correo_verificado")]
        public bool CorreoVerificado { get; set; } = true;

        [JsonPropertyName("creado_at")]
        public DateTime CreadoAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("rol")]
        public string Rol { get; set; } = Roles.Asistente;
    }

    // Entidad Rol
    public class Rol
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("descripcion")]
        public string Descripcion { get; set; } = string.Empty;
    }

    // Entidad Evento
    public class Evento
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("descripcion")]
        public string Descripcion { get; set; } = string.Empty;

        [JsonPropertyName("fecha_inicio")]
        public DateTime FechaInicio { get; set; }

        [JsonPropertyName("fecha_fin")]
        public DateTime FechaFin { get; set; }

        [JsonPropertyName("modalidad")]
        public string Modalidad { get; set; } = "HIBRIDO"; // PRESENCIAL, VIRTUAL, HIBRIDO

        [JsonPropertyName("lugar")]
        public string? Lugar { get; set; }

        [JsonPropertyName("url_afiche")]
        public string? UrlAfiche { get; set; }

        [JsonPropertyName("url_logo")]
        public string? UrlLogo { get; set; }

        [JsonPropertyName("idioma_principal")]
        public string IdiomaPrincipal { get; set; } = "es";

        [JsonPropertyName("capacidad_maxima")]
        public int CapacidadMaxima { get; set; } = 150;

        [JsonPropertyName("repositorio_abierto")]
        public bool RepositorioAbierto { get; set; } = true;

        [JsonPropertyName("estado")]
        public string Estado { get; set; } = EstadosEvento.InscripcionesAbiertas;

        [JsonPropertyName("creado_at")]
        public DateTime CreadoAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("actualizado_at")]
        public DateTime ActualizadoAt { get; set; } = DateTime.UtcNow;

        // Relaciones
        [JsonPropertyName("lineas_tematicas")]
        public List<LineaTematica> LineasTematicas { get; set; } = new();

        [JsonPropertyName("sesiones")]
        public List<SesionEvento> Sesiones { get; set; } = new();

        [JsonPropertyName("ponentes")]
        public List<Ponente> Ponentes { get; set; } = new();

        [JsonPropertyName("categorias")]
        public List<CategoriaInscripcion> Categorias { get; set; } = new();

        [JsonPropertyName("total_inscritos")]
        public int TotalInscritos { get; set; }

        [JsonPropertyName("total_checkins")]
        public int TotalCheckins { get; set; }
    }

    // Línea Temática
    public class LineaTematica
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("evento_id")]
        public Guid EventoId { get; set; }

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("color")]
        public string Color { get; set; } = "#002F6C";
    }

    // Sesión de Evento
    public class SesionEvento
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("evento_id")]
        public Guid EventoId { get; set; }

        [JsonPropertyName("linea_tematica_id")]
        public Guid? LineaTematicaId { get; set; }

        [JsonPropertyName("titulo")]
        public string Titulo { get; set; } = string.Empty;

        [JsonPropertyName("descripcion")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("hora_inicio")]
        public DateTime HoraInicio { get; set; }

        [JsonPropertyName("hora_fin")]
        public DateTime HoraFin { get; set; }

        [JsonPropertyName("url_lugar_virtual")]
        public string? UrlLugarVirtual { get; set; }

        [JsonPropertyName("ponentes")]
        public List<Ponente> Ponentes { get; set; } = new();
    }

    // Ponente
    public class Ponente
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("evento_id")]
        public Guid EventoId { get; set; }

        [JsonPropertyName("usuario_id")]
        public Guid? UsuarioId { get; set; }

        [JsonPropertyName("nombres")]
        public string Nombres { get; set; } = string.Empty;

        [JsonPropertyName("apellidos")]
        public string Apellidos { get; set; } = string.Empty;

        [JsonPropertyName("titulo_academico")]
        public string TituloAcademico { get; set; } = string.Empty;

        [JsonPropertyName("institucion")]
        public string Institucion { get; set; } = string.Empty;

        [JsonPropertyName("correo")]
        public string Correo { get; set; } = string.Empty;

        [JsonPropertyName("url_linkedin")]
        public string? UrlLinkedIn { get; set; }

        [JsonPropertyName("biografia")]
        public string? Biografia { get; set; }

        [JsonPropertyName("url_foto")]
        public string? UrlFoto { get; set; }
    }

    // Categoría de Inscripción
    public class CategoriaInscripcion
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("evento_id")]
        public Guid EventoId { get; set; }

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("precio")]
        public double Precio { get; set; }

        [JsonPropertyName("capacidad_maxima")]
        public int CapacidadMaxima { get; set; } = 100;

        [JsonPropertyName("fecha_inicio")]
        public DateTime FechaInicio { get; set; }

        [JsonPropertyName("fecha_fin")]
        public DateTime FechaFin { get; set; }

        [JsonPropertyName("requiere_comprobante")]
        public bool RequiereComprobante { get; set; }

        [JsonPropertyName("inscritos_actuales")]
        public int InscritosActuales { get; set; }
    }

    // Inscripción
    public class Inscripcion
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("evento_id")]
        public Guid EventoId { get; set; }

        [JsonPropertyName("usuario_id")]
        public Guid UsuarioId { get; set; }

        [JsonPropertyName("categoria_id")]
        public Guid CategoriaId { get; set; }

        [JsonPropertyName("estado")]
        public string Estado { get; set; } = EstadosInscripcion.Confirmada;

        [JsonPropertyName("exonerado_por")]
        public Guid? ExoneradoPor { get; set; }

        [JsonPropertyName("nota_exoneracion")]
        public string? NotaExoneracion { get; set; }

        [JsonPropertyName("registrado_at")]
        public DateTime RegistradoAt { get; set; } = DateTime.UtcNow;

        // Datos enriquecidos para UI
        [JsonPropertyName("evento_nombre")]
        public string EventoNombre { get; set; } = string.Empty;

        [JsonPropertyName("usuario_nombre")]
        public string UsuarioNombre { get; set; } = string.Empty;

        [JsonPropertyName("usuario_correo")]
        public string UsuarioCorreo { get; set; } = string.Empty;

        [JsonPropertyName("categoria_nombre")]
        public string CategoriaNombre { get; set; } = string.Empty;

        [JsonPropertyName("categoria_precio")]
        public double CategoriaPrecio { get; set; }

        [JsonPropertyName("comprobante_url")]
        public string? ComprobanteUrl { get; set; }

        [JsonPropertyName("credencial_qr")]
        public string? CredencialQr { get; set; }

        [JsonPropertyName("limite_revision_at")]
        public DateTime? LimiteRevisionAt { get; set; }

        [JsonPropertyName("horas_restantes")]
        public double HorasRestantes { get; set; }

        [JsonPropertyName("estado_sla")]
        public string EstadoSla { get; set; } = "A_TIEMPO"; // A_TIEMPO, URGENTE, VENCIDO
    }

    // Comprobante de Pago (SLA 24 Horas)
    public class Comprobante
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("inscripcion_id")]
        public Guid InscripcionId { get; set; }

        [JsonPropertyName("url_archivo")]
        public string UrlArchivo { get; set; } = string.Empty;

        [JsonPropertyName("estado_revision")]
        public string EstadoRevision { get; set; } = EstadosComprobante.EnRevision;

        [JsonPropertyName("auditor_id")]
        public Guid? AuditorId { get; set; }

        [JsonPropertyName("observaciones")]
        public string? Observaciones { get; set; }

        [JsonPropertyName("fecha_auditoria")]
        public DateTime? FechaAuditoria { get; set; }

        [JsonPropertyName("subido_at")]
        public DateTime SubidoAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("limite_revision_at")]
        public DateTime LimiteRevisionAt { get; set; } = DateTime.UtcNow.AddHours(24);

        [JsonPropertyName("horas_restantes")]
        public double HorasRestantes { get; set; } = 24.0;

        [JsonPropertyName("estado_sla")]
        public string EstadoSla { get; set; } = "A_TIEMPO";
    }

    // Credencial Oficial Digital
    public class Credencial
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("inscripcion_id")]
        public Guid InscripcionId { get; set; }

        [JsonPropertyName("token_qr_seguro")]
        public string TokenQrSeguro { get; set; } = string.Empty;

        [JsonPropertyName("url_pdf")]
        public string UrlPdf { get; set; } = string.Empty;

        [JsonPropertyName("emitido_at")]
        public DateTime EmitidoAt { get; set; } = DateTime.UtcNow;
    }

    // Asistencia / Check-in
    public class Asistencia
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("inscripcion_id")]
        public Guid InscripcionId { get; set; }

        [JsonPropertyName("sesion_id")]
        public Guid SesionId { get; set; }

        [JsonPropertyName("escaneado_por")]
        public Guid? EscaneadoPor { get; set; }

        [JsonPropertyName("marca_tiempo")]
        public DateTime MarcaTiempo { get; set; } = DateTime.UtcNow;
    }

    // Certificado Oficial
    public class Certificado
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("inscripcion_id")]
        public Guid InscripcionId { get; set; }

        [JsonPropertyName("url_pdf")]
        public string UrlPdf { get; set; } = string.Empty;

        [JsonPropertyName("codigo_validacion")]
        public string CodigoValidacion { get; set; } = string.Empty;

        [JsonPropertyName("emitido_at")]
        public DateTime EmitidoAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("participante")]
        public string Participante { get; set; } = string.Empty;

        [JsonPropertyName("evento_nombre")]
        public string EventoNombre { get; set; } = string.Empty;
    }

    // Encuesta y Respuestas
    public class RespuestaEncuesta
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("encuesta_id")]
        public Guid EncuestaId { get; set; }

        [JsonPropertyName("inscripcion_id")]
        public Guid InscripcionId { get; set; }

        [JsonPropertyName("respuestas")]
        public string Respuestas { get; set; } = "{}";

        [JsonPropertyName("enviado_at")]
        public DateTime EnviadoAt { get; set; } = DateTime.UtcNow;
    }

    // Métricas del Dashboard (RF-019, RF-023)
    public class MetricasDashboard
    {
        [JsonPropertyName("eventos_activos")]
        public int EventosActivos { get; set; }

        [JsonPropertyName("participantes_totales")]
        public int ParticipantesTotales { get; set; }

        [JsonPropertyName("asistencia_promedio")]
        public double AsistenciaPromedio { get; set; }

        [JsonPropertyName("ingresos_totales")]
        public double IngresosTotales { get; set; }

        [JsonPropertyName("pagos_pendientes")]
        public int PagosPendientes { get; set; }

        [JsonPropertyName("certificados_emitidos")]
        public int CertificadosEmitidos { get; set; }
    }
}
