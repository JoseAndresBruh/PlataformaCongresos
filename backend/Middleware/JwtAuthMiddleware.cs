using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using UleamEventos.Api.Security;

namespace UleamEventos.Api.Middleware
{
    public class JwtAuthMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, JwtService jwtService)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                var principal = jwtService.ValidateToken(token);
                if (principal != null)
                {
                    context.User = principal;
                    var userIdClaim = principal.FindFirst("user_id")?.Value;
                    var roleClaim = principal.FindFirst(ClaimTypes.Role)?.Value;

                    if (!string.IsNullOrEmpty(userIdClaim))
                        context.Items["userID"] = userIdClaim;
                    if (!string.IsNullOrEmpty(roleClaim))
                        context.Items["userRole"] = roleClaim;
                }
            }

            await _next(context);
        }
    }
}
