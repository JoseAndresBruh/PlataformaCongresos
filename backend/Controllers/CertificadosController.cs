using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CertificadosController : ControllerBase
    {
        private readonly IEventRepository _repo;

        public CertificadosController(IEventRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetCertificates([FromQuery(Name = "usuario_id")] string? usuarioIdStr)
        {
            Guid? usrId = null;
            if (!string.IsNullOrEmpty(usuarioIdStr) && Guid.TryParse(usuarioIdStr, out var parsed))
            {
                usrId = parsed;
            }

            var certs = await _repo.GetCertificatesByUserAsync(usrId);
            return Ok(certs);
        }
    }
}
