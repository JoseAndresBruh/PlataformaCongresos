using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public AdminController(IEventRepository repo)
        {
            _repo = repo;
        }

        private IActionResult? CheckAdminRole()
        {
            var userRole = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value 
                ?? HttpContext.Items["userRole"] as string;

            if (string.IsNullOrEmpty(userRole))
            {
                return Unauthorized(new { error = "Encabezado de autorización ausente o token inválido" });
            }

            var allowed = new[] { Roles.SuperAdmin, Roles.AdminEvento, Roles.PersonalGestion };
            if (!allowed.Contains(userRole, StringComparer.OrdinalIgnoreCase))
            {
                return StatusCode(403, new
                {
                    error = "Acceso denegado: permisos insuficientes para este recurso",
                    tu_rol = userRole,
                    exigido = allowed
                });
            }

            return null;
        }

        [HttpPost("eventos")]
        public async Task<IActionResult> CreateEventAdmin([FromBody] Evento ev)
        {
            var authCheck = CheckAdminRole();
            if (authCheck != null) return authCheck;

            if (string.IsNullOrWhiteSpace(ev.Nombre))
            {
                return BadRequest(new { error = "El nombre del congreso o evento es obligatorio" });
            }

            if (ev.Id == Guid.Empty)
                ev.Id = Guid.NewGuid();

            if (string.IsNullOrWhiteSpace(ev.Slug))
                ev.Slug = "evento-" + ev.Id.ToString().Substring(0, 8);

            await _repo.CreateEventAsync(ev);
            return StatusCode(201, ev);
        }

        [HttpPatch("eventos/{id:guid}/estado")]
        public async Task<IActionResult> UpdateEventStatusAdmin(Guid id, [FromBody] UpdateStatusRequest payload)
        {
            var authCheck = CheckAdminRole();
            if (authCheck != null) return authCheck;

            if (string.IsNullOrWhiteSpace(payload.Estado))
            {
                return BadRequest(new { error = "El estado es obligatorio" });
            }

            var updated = await _repo.UpdateEventStatusAsync(id, payload.Estado);
            if (!updated)
            {
                return NotFound(new { error = "Evento no encontrado" });
            }

            return Ok(new
            {
                mensaje = "Estado actualizado exitosamente",
                nuevo_estado = payload.Estado
            });
        }

        [HttpPatch("inscripciones/{id:guid}/revision")]
        public async Task<IActionResult> ReviewRegistrationAdmin(Guid id, [FromBody] ReviewRegistrationRequest payload)
        {
            var authCheck = CheckAdminRole();
            if (authCheck != null) return authCheck;

            if (string.IsNullOrWhiteSpace(payload.Estado))
            {
                return BadRequest(new { error = "El estado es requerido" });
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
