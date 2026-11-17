using System.Collections.Generic;
using System.Threading.Tasks;
using UleamEventos.Api.Models;

namespace UleamEventos.Api.Services
{
    public interface IPaymentNotificationService
    {
        Task<NotificationResponse> SendPaymentAlertAsync(Inscripcion inscripcion, string motivo);
        Task<NotificationResponse> SendPendingPaymentsBatchReminderAsync(IEnumerable<Inscripcion> pendientes);
        Task<NotificationResponse> TestNotificationAsync(string? canal, string? mensaje);
        string GenerateWhatsAppUrl(string mensaje, string? phone = null);
    }
}
