using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class EncuestasController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public EncuestasController(IEventRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("responder")]
        public async Task<IActionResult> SubmitSurvey([FromBody] RespuestaEncuesta resp)
        {
            await _repo.SubmitSurveyAsync(resp);
            return StatusCode(201, new
            {
                mensaje = "Encuesta enviada exitosamente. ¡Gracias por tu retroalimentación!"
            });
        }
    }
}
