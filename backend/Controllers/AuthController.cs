using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;
using UleamEventos.Api.Security;

namespace UleamEventos.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IEventRepository _repo;
        private readonly JwtService _jwtService;

        public AuthController(IEventRepository repo, JwtService jwtService)
        {
            _repo = repo;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Correo) || string.IsNullOrWhiteSpace(req.Contrasena))
            {
                return BadRequest(new { error = "Credenciales incompletas o formato inválido" });
            }

            var user = await _repo.FindUserByEmailAsync(req.Correo);
            if (user == null)
            {
                // CA2: Prevención de enumeración de usuarios
                return Unauthorized(new { error = "Credenciales inválidas" });
            }

            if (!PasswordHasher.VerifyPassword(req.Contrasena, user.ContrasenaHash))
            {
                return Unauthorized(new { error = "Credenciales inválidas" });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                usuario = new
                {
                    id = user.Id,
                    correo = user.Correo,
                    nombres = user.Nombres,
                    apellidos = user.Apellidos,
                    rol = user.Rol,
                    institucion = user.Institucion,
                    identificacion = user.Identificacion
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nombres) ||
                string.IsNullOrWhiteSpace(req.Apellidos) ||
                string.IsNullOrWhiteSpace(req.Correo) ||
                string.IsNullOrWhiteSpace(req.Contrasena) ||
                string.IsNullOrWhiteSpace(req.Identificacion) ||
                string.IsNullOrWhiteSpace(req.Institucion))
            {
                return BadRequest(new { error = "Todos los campos obligatorios deben ser proporcionados" });
            }

            if (req.Contrasena.Length < 6)
            {
                return BadRequest(new { error = "La contraseña debe tener al menos 6 caracteres" });
            }

            var existing = await _repo.FindUserByEmailAsync(req.Correo);
            if (existing != null)
            {
                return Conflict(new { error = "El correo electrónico ya se encuentra registrado" });
            }

            var newUser = new Usuario
            {
                Id = Guid.NewGuid(),
                Correo = req.Correo.Trim(),
                ContrasenaHash = PasswordHasher.HashPassword(req.Contrasena),
                Nombres = req.Nombres.Trim(),
                Apellidos = req.Apellidos.Trim(),
                Identificacion = req.Identificacion.Trim(),
                Institucion = req.Institucion.Trim(),
                Telefono = req.Telefono?.Trim(),
                CorreoVerificado = true,
                Rol = Roles.Asistente,
                CreadoAt = DateTime.UtcNow
            };

            await _repo.CreateUserAsync(newUser);

            return Created(string.Empty, new
            {
                mensaje = "Cuenta registrada exitosamente",
                usuario = newUser
            });
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Correo))
            {
                return BadRequest(new { error = "El correo electrónico de Google es obligatorio" });
            }

            var user = await _repo.FindUserByEmailAsync(req.Correo.Trim());
            if (user == null)
            {
                var fullName = (req.Nombres ?? "").Trim();
                var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var nombres = parts.Length > 0 ? parts[0] : "Participante";
                var apellidos = !string.IsNullOrWhiteSpace(req.Apellidos) 
                    ? req.Apellidos.Trim() 
                    : (parts.Length > 1 ? parts[1] : "Google");

                user = new Usuario
                {
                    Id = Guid.NewGuid(),
                    Correo = req.Correo.Trim().ToLowerInvariant(),
                    ContrasenaHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString("N")),
                    Nombres = nombres,
                    Apellidos = apellidos,
                    Identificacion = "G-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
                    Institucion = "Google Workspace / Gmail",
                    UrlFotoPerfil = req.UrlFotoPerfil,
                    CorreoVerificado = true,
                    Rol = Roles.Asistente,
                    CreadoAt = DateTime.UtcNow
                };

                await _repo.CreateUserAsync(user);
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                usuario = new
                {
                    id = user.Id,
                    correo = user.Correo,
                    nombres = user.Nombres,
                    apellidos = user.Apellidos,
                    rol = user.Rol,
                    institucion = user.Institucion,
                    identificacion = user.Identificacion,
                    url_foto_perfil = user.UrlFotoPerfil
                }
            });
        }
    }
}
