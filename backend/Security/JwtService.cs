using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using UleamEventos.Api.Configuration;
using UleamEventos.Api.Models;

namespace UleamEventos.Api.Security
{
    public class JwtService
    {
        private readonly AppConfig _config;

        public JwtService(AppConfig config)
        {
            _config = config;
        }

        public string GenerateToken(Usuario usuario)
        {
            var now = DateTimeOffset.UtcNow;
            var exp = now.AddHours(_config.JwtExpirationHours);

            var header = new { alg = "HS256", typ = "JWT" };
            var payload = new Dictionary<string, object>
            {
                { "user_id", usuario.Id.ToString() },
                { "email", usuario.Correo },
                { "role", usuario.Rol },
                { "nombres", $"{usuario.Nombres} {usuario.Apellidos}".Trim() },
                { "exp", exp.ToUnixTimeSeconds() },
                { "iat", now.ToUnixTimeSeconds() }
            };

            var headerJson = JsonSerializer.Serialize(header);
            var payloadJson = JsonSerializer.Serialize(payload);

            var headerB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
            var payloadB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

            var stringToSign = $"{headerB64}.{payloadB64}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_config.JwtSecret));
            var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
            var signatureB64 = Base64UrlEncode(signatureBytes);

            return $"{stringToSign}.{signatureB64}";
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var parts = token.Split('.');
            if (parts.Length != 3)
                return null;

            var stringToSign = $"{parts[0]}.{parts[1]}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_config.JwtSecret));
            var expectedSignature = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign)));

            if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(parts[2]),
                Encoding.UTF8.GetBytes(expectedSignature)))
            {
                return null;
            }

            try
            {
                var payloadBytes = Base64UrlDecode(parts[1]);
                var payloadJson = Encoding.UTF8.GetString(payloadBytes);
                using var doc = JsonDocument.Parse(payloadJson);
                var root = doc.RootElement;

                // Verificar expiración
                if (root.TryGetProperty("exp", out var expElement))
                {
                    var expUnix = expElement.GetInt64();
                    if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expUnix)
                    {
                        return null; // Token expirado
                    }
                }

                var claims = new List<Claim>();
                if (root.TryGetProperty("user_id", out var userId))
                    claims.Add(new Claim("user_id", userId.GetString() ?? string.Empty));
                if (root.TryGetProperty("email", out var email))
                    claims.Add(new Claim(ClaimTypes.Email, email.GetString() ?? string.Empty));
                if (root.TryGetProperty("role", out var role))
                    claims.Add(new Claim(ClaimTypes.Role, role.GetString() ?? string.Empty));
                if (root.TryGetProperty("nombres", out var nombres))
                    claims.Add(new Claim(ClaimTypes.Name, nombres.GetString() ?? string.Empty));

                var identity = new ClaimsIdentity(claims, "Bearer");
                return new ClaimsPrincipal(identity);
            }
            catch
            {
                return null;
            }
        }

        private static string Base64UrlEncode(byte[] input)
        {
            var output = Convert.ToBase64String(input);
            output = output.Split('=')[0]; // Eliminar padding
            output = output.Replace('+', '-'); // 62º carácter
            output = output.Replace('/', '_'); // 63º carácter
            return output;
        }

        private static byte[] Base64UrlDecode(string input)
        {
            var output = input.Replace('-', '+').Replace('_', '/');
            switch (output.Length % 4)
            {
                case 2: output += "=="; break;
                case 3: output += "="; break;
            }
            return Convert.FromBase64String(output);
        }
    }
}
