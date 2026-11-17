using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;
using UleamEventos.Api.Services;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class InscripcionesController : ControllerBase
    {
        private readonly IEventRepository _repo;
        private readonly IPaymentNotificationService _notificationService;

        public InscripcionesController(IEventRepository repo, IPaymentNotificationService notificationService)
        {
            _repo = repo;
            _notificationService = notificationService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRegistration([FromBody] InscriptionRequest req)
        {
            if (!Guid.TryParse(req.EventoId, out var evId) ||
                !Guid.TryParse(req.UsuarioId, out var usrId) ||
                !Guid.TryParse(req.CategoriaId, out var catId))
            {
                return BadRequest(new { error = "Identificadores de evento, usuario o categoría inválidos" });
            }

            string estado = EstadosInscripcion.Confirmada;
            string estadoPago = EstadosPago.Pagado;
            Comprobante? comp = null;

            if (req.CategoriaPrecio > 0)
            {
                if (!string.IsNullOrEmpty(req.ComprobanteUrl))
                {
                    estado = EstadosInscripcion.PendienteRevision;
                    estadoPago = EstadosPago.PagoEnVerificacion;
                    comp = new Comprobante
                    {
                        UrlArchivo = req.ComprobanteUrl,
                        EstadoRevision = EstadosComprobante.EnRevision,
                        EstadoPago = EstadosPago.PagoEnVerificacion
                    };
                }
                else
                {
                    estado = EstadosInscripcion.PendientePago;
                    estadoPago = EstadosPago.NoPagado;
                }
            }

            var ins = new Inscripcion
            {
                Id = Guid.NewGuid(),
                EventoId = evId,
                UsuarioId = usrId,
                CategoriaId = catId,
                Estado = estado,
                EstadoPago = estadoPago,
                UsuarioNombre = req.UsuarioNombre,
                UsuarioCorreo = req.UsuarioCorreo,
                CategoriaNombre = req.CategoriaNombre,
                CategoriaPrecio = req.CategoriaPrecio,
                ComprobanteUrl = req.ComprobanteUrl
            };

            var cred = await _repo.CreateRegistrationAsync(ins, comp);

            // Si el estado es "Pago en verificación", disparar alerta al bot del encargado de finanzas
            NotificationResponse? notif = null;
            if (estadoPago == EstadosPago.PagoEnVerificacion)
            {
                notif = await _notificationService.SendPaymentAlertAsync(ins, "Nuevo comprobante registrado para auditoría");
            }

            return Created(string.Empty, new
            {
                mensaje = "Inscripción registrada con éxito",
                inscripcion = ins,
                credencial = cred,
                estado_pago = estadoPago,
                notificacion = notif,
                plazo_revision_horas = 24
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetRegistrations(
            [FromQuery(Name = "evento_id")] string? eventoIdStr,
            [FromQuery(Name = "estado_pago")] string? estadoPago)
        {
            if (!string.IsNullOrEmpty(estadoPago))
            {
                var filtered = await _repo.GetRegistrationsByPaymentStatusAsync(estadoPago);
                return Ok(filtered);
            }

            Guid? evId = null;
            if (!string.IsNullOrEmpty(eventoIdStr) && Guid.TryParse(eventoIdStr, out var parsed))
            {
                evId = parsed;
            }

            var list = await _repo.GetRegistrationsByEventAsync(evId);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetRegistrationById(Guid id)
        {
            var ins = await _repo.GetRegistrationByIdAsync(id);
            if (ins == null)
            {
                return NotFound(new { error = "Inscripción no encontrada" });
            }
            return Ok(ins);
        }

        [HttpPut("{id:guid}/pago")]
        public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] ReviewPaymentRequest payload)
        {
            if (string.IsNullOrWhiteSpace(payload.EstadoPago))
            {
                return BadRequest(new { error = "El estado de pago es obligatorio ('Pagado', 'Rechazado' o 'Pago en verificación')" });
            }

            Guid? auditorId = null;
            if (HttpContext.Items.TryGetValue("userID", out var val) && val is string idStr && Guid.TryParse(idStr, out var parsedAuditor))
            {
                auditorId = parsedAuditor;
            }

            var updated = await _repo.UpdatePaymentStatusAsync(id, payload.EstadoPago, auditorId, payload.Observaciones);
            if (!updated)
            {
                return NotFound(new { error = "Inscripción no encontrada para actualización de pago" });
            }

            var ins = await _repo.GetRegistrationByIdAsync(id);

            return Ok(new
            {
                mensaje = $"Estado de pago actualizado a '{payload.EstadoPago}' con éxito",
                inscripcion = ins
            });
        }

        [HttpPost("{id:guid}/comprobante")]
        public async Task<IActionResult> UploadComprobante(Guid id, [FromBody] UploadComprobanteRequest payload)
        {
            if (string.IsNullOrWhiteSpace(payload.ComprobanteUrl))
            {
                return BadRequest(new { error = "La URL del comprobante es obligatoria" });
            }

            var ins = await _repo.GetRegistrationByIdAsync(id);
            if (ins == null)
            {
                return NotFound(new { error = "Inscripción no encontrada" });
            }

            ins.ComprobanteUrl = payload.ComprobanteUrl;
            var updated = await _repo.UpdatePaymentStatusAsync(id, EstadosPago.PagoEnVerificacion, null, payload.Observaciones);
            if (!updated)
            {
                return StatusCode(500, new { error = "No fue posible actualizar el estado de la inscripción" });
            }

            var updatedIns = await _repo.GetRegistrationByIdAsync(id);

            // Disparar notificación inmediata al bot del encargado de validar pagos
            NotificationResponse? notif = null;
            if (updatedIns != null)
            {
                notif = await _notificationService.SendPaymentAlertAsync(updatedIns, "Nuevo comprobante de pago subido por participante");
            }

            return Ok(new
            {
                mensaje = "Comprobante recibido con éxito. Su pago ha pasado a 'Pago en verificación'.",
                inscripcion = updatedIns,
                notificacion = notif
            });
        }

        [HttpPatch("{id:guid}/revision")]
        public async Task<IActionResult> ReviewRegistration(Guid id, [FromBody] ReviewRegistrationRequest payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Estado))
            {
                return BadRequest(new { error = "El estado de resolución es obligatorio (CONFIRMADA o CANCELADA)" });
            }

            Guid? auditorId = null;
            if (HttpContext.Items.TryGetValue("userID", out var val) && val is string idStr && Guid.TryParse(idStr, out var parsedAuditor))
            {
                auditorId = parsedAuditor;
            }

            var updated = await _repo.UpdateRegistrationStatusAsync(id, payload.Estado, auditorId);
            if (!updated)
            {
                return NotFound(new { error = "Inscripción no encontrada para revisión" });
            }

            return Ok(new
            {
                mensaje = "Estado de inscripción actualizado",
                nuevo_estado = payload.Estado
            });
        }
    }
}
