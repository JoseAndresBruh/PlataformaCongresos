using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public DashboardController(IEventRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("metricas")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            var metrics = await _repo.GetDashboardMetricsAsync();
            return Ok(metrics);
        }
    }
}
