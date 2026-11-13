using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHealth()
        {
            return Ok(new HealthResponse
            {
                Status = "online",
                Sistema = "ULEAM-EVENTOS API (.NET 9 / C#)",
                Version = "1.0.0",
                PostgresDb = false
            });
        }
    }
}
