using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class EventosController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public EventosController(IEventRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetEvents([FromQuery] string? estado)
        {
            var eventos = await _repo.GetEventsAsync(estado);
            return Ok(eventos);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetEventBySlug(string slug)
        {
            var evento = await _repo.GetEventBySlugAsync(slug);
            if (evento == null)
            {
                return NotFound(new { error = "Evento no encontrado" });
            }
            return Ok(evento);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] Evento ev)
        {
            if (string.IsNullOrWhiteSpace(ev.Nombre))
            {
                return BadRequest(new { error = "El nombre del congreso o evento es obligatorio" });
            }

            if (ev.Id == Guid.Empty)
                ev.Id = Guid.NewGuid();

            if (string.IsNullOrWhiteSpace(ev.Slug))
                ev.Slug = "evento-" + ev.Id.ToString().Substring(0, 8);

            if (string.IsNullOrWhiteSpace(ev.Estado))
                ev.Estado = EstadosEvento.InscripcionesAbiertas;

            if (string.IsNullOrWhiteSpace(ev.UrlAfiche))
                ev.UrlAfiche = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";

            if (string.IsNullOrWhiteSpace(ev.UrlLogo))
                ev.UrlLogo = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200";

            if (string.IsNullOrWhiteSpace(ev.IdiomaPrincipal))
                ev.IdiomaPrincipal = "es";

            if (ev.FechaInicio == default)
                ev.FechaInicio = DateTime.UtcNow.AddMonths(1);

            if (ev.FechaFin == default)
                ev.FechaFin = DateTime.UtcNow.AddMonths(1).AddDays(3);

            if (ev.CapacidadMaxima <= 0)
                ev.CapacidadMaxima = 150;

            if (ev.Categorias == null || ev.Categorias.Count == 0)
            {
                ev.Categorias = new List<CategoriaInscripcion>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        EventoId = ev.Id,
                        Nombre = "Estudiante ULEAM (Beca 100%)",
                        Precio = 0.00,
                        CapacidadMaxima = ev.CapacidadMaxima / 2,
                        RequiereComprobante = false
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        EventoId = ev.Id,
                        Nombre = "Profesional / Externo",
                        Precio = 25.00,
                        CapacidadMaxima = ev.CapacidadMaxima / 2,
                        RequiereComprobante = true
                    }
                };
            }

            await _repo.CreateEventAsync(ev);
            return CreatedAtAction(nameof(GetEventBySlug), new { slug = ev.Slug }, ev);
        }

        [HttpPatch("{id:guid}/estado")]
        public async Task<IActionResult> UpdateEventStatus(Guid id, [FromBody] UpdateStatusRequest payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Estado))
            {
                return BadRequest(new { error = "El nuevo estado es requerido" });
            }

            var updated = await _repo.UpdateEventStatusAsync(id, payload.Estado);
            if (!updated)
            {
                return NotFound(new { error = "Evento no encontrado para actualizar estado" });
            }

            return Ok(new
            {
                mensaje = "Estado actualizado exitosamente",
                nuevo_estado = payload.Estado
            });
        }
    }
}
