using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class InscripcionesController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public InscripcionesController(IEventRepository repo)
        {
            _repo = repo;
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

            var estado = EstadosInscripcion.Confirmada;
            Comprobante? comp = null;

            if (req.CategoriaPrecio > 0 || !string.IsNullOrEmpty(req.ComprobanteUrl))
            {
                estado = EstadosInscripcion.PendienteRevision;
                var url = !string.IsNullOrEmpty(req.ComprobanteUrl)
                    ? req.ComprobanteUrl
                    : "https://storage.uleam.edu.ec/comprobantes/transferencia.pdf";

                comp = new Comprobante
                {
                    UrlArchivo = url,
                    EstadoRevision = EstadosComprobante.EnRevision
                };
            }

            var ins = new Inscripcion
            {
                Id = Guid.NewGuid(),
                EventoId = evId,
                UsuarioId = usrId,
                CategoriaId = catId,
                Estado = estado,
                UsuarioNombre = req.UsuarioNombre,
                UsuarioCorreo = req.UsuarioCorreo,
                CategoriaNombre = req.CategoriaNombre,
                CategoriaPrecio = req.CategoriaPrecio
            };

            var cred = await _repo.CreateRegistrationAsync(ins, comp);

            return Created(string.Empty, new
            {
                mensaje = "Inscripción registrada con éxito",
                inscripcion = ins,
                credencial = cred,
                plazo_revision_horas = 24
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetRegistrations([FromQuery(Name = "evento_id")] string? eventoIdStr)
        {
            Guid? evId = null;
            if (!string.IsNullOrEmpty(eventoIdStr) && Guid.TryParse(eventoIdStr, out var parsed))
            {
                evId = parsed;
            }

            var list = await _repo.GetRegistrationsByEventAsync(evId);
            return Ok(list);
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
