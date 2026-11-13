using System;
using System.Text.Json.Serialization;

namespace UleamEventos.Api.Models
{
    // DTOs de Autenticación
    public class LoginRequest
    {
        [JsonPropertyName("correo")]
        public string Correo { get; set; } = string.Empty;

        [JsonPropertyName("contrasena")]
        public string Contrasena { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [JsonPropertyName("nombres")]
        public string Nombres { get; set; } = string.Empty;

        [JsonPropertyName("apellidos")]
        public string Apellidos { get; set; } = string.Empty;

        [JsonPropertyName("correo")]
        public string Correo { get; set; } = string.Empty;

        [JsonPropertyName("contrasena")]
        public string Contrasena { get; set; } = string.Empty;

        [JsonPropertyName("identificacion")]
        public string Identificacion { get; set; } = string.Empty;

        [JsonPropertyName("institucion")]
        public string Institucion { get; set; } = string.Empty;

        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }
    }

    // DTOs de Inscripciones
    public class InscriptionRequest
    {
        [JsonPropertyName("evento_id")]
        public string EventoId { get; set; } = string.Empty;

        [JsonPropertyName("usuario_id")]
        public string UsuarioId { get; set; } = string.Empty;

        [JsonPropertyName("categoria_id")]
        public string CategoriaId { get; set; } = string.Empty;

        [JsonPropertyName("comprobante_url")]
        public string? ComprobanteUrl { get; set; }

        [JsonPropertyName("usuario_nombre")]
        public string UsuarioNombre { get; set; } = string.Empty;

        [JsonPropertyName("usuario_correo")]
        public string UsuarioCorreo { get; set; } = string.Empty;

        [JsonPropertyName("categoria_nombre")]
        public string CategoriaNombre { get; set; } = string.Empty;

        [JsonPropertyName("categoria_precio")]
        public double CategoriaPrecio { get; set; }
    }

    public class ReviewRegistrationRequest
    {
        [JsonPropertyName("estado")]
        public string Estado { get; set; } = string.Empty; // CONFIRMADA o CANCELADA
    }

    public class UpdateStatusRequest
    {
        [JsonPropertyName("estado")]
        public string Estado { get; set; } = string.Empty;
    }

    // DTOs de Asistencia / Check-In
    public class CheckInRequest
    {
        [JsonPropertyName("token_qr")]
        public string TokenQr { get; set; } = string.Empty;

        [JsonPropertyName("sesion_id")]
        public string? SesionId { get; set; }

        [JsonPropertyName("escaneado_por")]
        public string? EscaneadoPor { get; set; }
    }

    // DTO de Health Check
    public class HealthResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "online";

        [JsonPropertyName("sistema")]
        public string Sistema { get; set; } = "ULEAM-EVENTOS API (.NET 9 / C#)";

        [JsonPropertyName("version")]
        public string Version { get; set; } = "1.0.0";

        [JsonPropertyName("postgres_db")]
        public bool PostgresDb { get; set; } = false;
    }
}
