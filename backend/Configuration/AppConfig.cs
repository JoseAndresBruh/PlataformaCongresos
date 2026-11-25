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
        public string TelegramBotToken { get; set; } = string.Empty;
        public string TelegramChatId { get; set; } = string.Empty;
        public string WhatsAppPhone { get; set; } = string.Empty;
        public int NotificationIntervalMinutes { get; set; } = 15;
        public string SupabaseUrl { get; set; } = "https://xoqzmiqdsgtxlhhpandb.supabase.co";
        public string SupabaseKey { get; set; } = string.Empty;
        public string SupabaseBucket { get; set; } = "comprobantes";
        public string GoogleClientId { get; set; } = string.Empty;
        public string GoogleClientSecret { get; set; } = string.Empty;

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

            // Telegram & WhatsApp Notifications
            config.TelegramBotToken = Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN") 
                ?? configuration.GetValue<string>("Notifications:TelegramBotToken") 
                ?? string.Empty;

            config.TelegramChatId = Environment.GetEnvironmentVariable("TELEGRAM_CHAT_ID") 
                ?? configuration.GetValue<string>("Notifications:TelegramChatId") 
                ?? string.Empty;

            config.WhatsAppPhone = Environment.GetEnvironmentVariable("WHATSAPP_PHONE") 
                ?? configuration.GetValue<string>("Notifications:WhatsAppPhone") 
                ?? string.Empty;

            var envInterval = Environment.GetEnvironmentVariable("NOTIFICATION_INTERVAL_MINUTES");
            if (!string.IsNullOrEmpty(envInterval) && int.TryParse(envInterval, out var interval))
            {
                config.NotificationIntervalMinutes = interval;
            }
            else
            {
                config.NotificationIntervalMinutes = configuration.GetValue<int>("Notifications:IntervalMinutes", 15);
            }

            // Supabase Storage & Project Config
            config.SupabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL") 
                ?? configuration.GetValue<string>("Supabase:Url") 
                ?? "https://xoqzmiqdsgtxlhhpandb.supabase.co";

            config.SupabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY") 
                ?? Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") 
                ?? configuration.GetValue<string>("Supabase:Key") 
                ?? string.Empty;

            config.SupabaseBucket = Environment.GetEnvironmentVariable("SUPABASE_BUCKET") 
                ?? configuration.GetValue<string>("Supabase:Bucket") 
                ?? "comprobantes";

            // Google OAuth Config
            config.GoogleClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") 
                ?? configuration.GetValue<string>("Google:ClientId") 
                ?? string.Empty;

            config.GoogleClientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") 
                ?? configuration.GetValue<string>("Google:ClientSecret") 
                ?? string.Empty;

            return config;
        }
    }
}
