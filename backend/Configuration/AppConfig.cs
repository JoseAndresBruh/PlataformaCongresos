using System;
using Microsoft.Extensions.Configuration;

namespace UleamEventos.Api.Configuration
{
    public class AppConfig
    {
        public int Port { get; set; } = 8080;
        public string DatabaseUrl { get; set; } = string.Empty;
        public string JwtSecret { get; set; } = "uleam_eventos_secret_2026_ciist_secure_key";
        public int JwtExpirationHours { get; set; } = 24;
        public string CorsAllowedOrigins { get; set; } = "*";
        public string Env { get; set; } = "development";

        public static AppConfig Load(IConfiguration configuration)
        {
            var config = new AppConfig();

            // Port
            var envPort = Environment.GetEnvironmentVariable("PORT");
            if (!string.IsNullOrEmpty(envPort) && int.TryParse(envPort, out var p))
            {
                config.Port = p;
            }
            else if (configuration.GetValue<int>("Server:Port") > 0)
            {
                config.Port = configuration.GetValue<int>("Server:Port");
            }

            // DatabaseURL
            config.DatabaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
                ?? configuration.GetConnectionString("DefaultConnection") 
                ?? string.Empty;

            // JWT Secret
            config.JwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? configuration.GetValue<string>("Jwt:Secret") 
                ?? "uleam_eventos_secret_2026_ciist_secure_key";

            // JWT Expiration Hours
            var envExp = Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS");
            if (!string.IsNullOrEmpty(envExp) && int.TryParse(envExp, out var exp))
            {
                config.JwtExpirationHours = exp;
            }
            else
            {
                config.JwtExpirationHours = configuration.GetValue<int>("Jwt:ExpirationHours", 24);
            }

            // CORS Allowed Origins
            config.CorsAllowedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS") 
                ?? configuration.GetValue<string>("Cors:AllowedOrigins") 
                ?? "*";

            // Environment
            config.Env = Environment.GetEnvironmentVariable("ENV") ?? "development";

            return config;
        }
    }
}
