using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;
using UleamEventos.Api.Services;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class NotificacionesController : ControllerBase
    {
        private readonly IEventRepository _repo;
        private readonly IPaymentNotificationService _notificationService;

        public NotificacionesController(IEventRepository repo, IPaymentNotificationService notificationService)
        {
            _repo = repo;
            _notificationService = notificationService;
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfig()
        {
            var config = await _repo.GetBotConfigAsync();
            return Ok(config);
        }

        [HttpPost("config")]
        public async Task<IActionResult> UpdateConfig([FromBody] BotNotificationConfig newConfig)
        {
            await _repo.UpdateBotConfigAsync(newConfig);
            var updated = await _repo.GetBotConfigAsync();
            return Ok(new
            {
                mensaje = "Configuración del bot de notificaciones actualizada con éxito",
                config = updated
            });
        }

        [HttpPost("test")]
        public async Task<IActionResult> SendTest([FromBody] TestNotificationRequest req)
        {
            var res = await _notificationService.TestNotificationAsync(req.Canal, req.Mensaje);
            return Ok(res);
        }

        [HttpPost("recordatorio-manual")]
        public async Task<IActionResult> TriggerManualReminder()
        {
            var pendientes = await _repo.GetRegistrationsByPaymentStatusAsync(EstadosPago.PagoEnVerificacion);
            var res = await _notificationService.SendPendingPaymentsBatchReminderAsync(pendientes);
            return Ok(res);
        }
    }
}
