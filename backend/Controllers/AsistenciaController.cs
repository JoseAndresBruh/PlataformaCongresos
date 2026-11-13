using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AsistenciaController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public AsistenciaController(IEventRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.TokenQr))
            {
                return BadRequest(new { error = "El token QR o código de credencial es obligatorio" });
            }

            Guid? sesId = null;
            if (!string.IsNullOrEmpty(req.SesionId) && Guid.TryParse(req.SesionId, out var parsedSes))
            {
                sesId = parsedSes;
            }

            Guid? staffId = null;
            if (!string.IsNullOrEmpty(req.EscaneadoPor) && Guid.TryParse(req.EscaneadoPor, out var parsedStaff))
            {
                staffId = parsedStaff;
            }

            var (asistencia, usuario, mensaje, exito) = await _repo.ProcessCheckInAsync(req.TokenQr.Trim(), sesId, staffId);

            if (!exito)
            {
                return StatusCode(403, new
                {
                    acceso = false,
                    mensaje,
                    error = "credencial_rechazada"
                });
            }

            return Ok(new
            {
                acceso = true,
                mensaje,
                asistencia,
                participante = usuario,
                hora = DateTime.UtcNow.ToString("HH:mm:ss")
            });
        }
    }
}
