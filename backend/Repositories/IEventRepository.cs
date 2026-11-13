using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UleamEventos.Api.Models;

namespace UleamEventos.Api.Repositories
{
    public interface IEventRepository
    {
        Task<IEnumerable<Evento>> GetEventsAsync(string? estado);
        Task<Evento?> GetEventBySlugAsync(string slug);
        Task CreateEventAsync(Evento evento);
        Task<bool> UpdateEventStatusAsync(Guid id, string nuevoEstado);

        Task<Usuario?> FindUserByEmailAsync(string email);
        Task<Usuario?> FindUserByIdAsync(Guid id);
        Task CreateUserAsync(Usuario usuario);

        Task<Credencial> CreateRegistrationAsync(Inscripcion reg, Comprobante? comp);
        Task<IEnumerable<Inscripcion>> GetRegistrationsByEventAsync(Guid? eventoId);
        Task<bool> UpdateRegistrationStatusAsync(Guid id, string estado, Guid? auditorId);

        Task<(Asistencia? Asistencia, Usuario? Usuario, string Mensaje, bool Exito)> ProcessCheckInAsync(string tokenQr, Guid? sesionId, Guid? escaneadoPor);
        Task<MetricasDashboard> GetDashboardMetricsAsync();
        Task SubmitSurveyAsync(RespuestaEncuesta respuesta);
        Task<IEnumerable<Certificado>> GetCertificatesByUserAsync(Guid? usuarioId);
    }
}
