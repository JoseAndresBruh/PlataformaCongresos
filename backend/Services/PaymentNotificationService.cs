using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using UleamEventos.Api.Configuration;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Services
{
    public class PaymentNotificationService : IPaymentNotificationService
    {
        private readonly HttpClient _httpClient;
        private readonly IEventRepository _repo;
        private readonly AppConfig _config;
        private readonly ILogger<PaymentNotificationService> _logger;

        public PaymentNotificationService(
            HttpClient httpClient,
            IEventRepository repo,
            AppConfig config,
            ILogger<PaymentNotificationService> logger)
        {
            _httpClient = httpClient;
            _repo = repo;
            _config = config;
            _logger = logger;
        }

        public async Task<NotificationResponse> SendPaymentAlertAsync(Inscripcion inscripcion, string motivo)
        {
            var botConfig = await _repo.GetBotConfigAsync();

            var sb = new StringBuilder();
            sb.AppendLine("<b>[ULEAM EVENTOS - AUDITORIA DE PAGOS]</b>");
            sb.AppendLine($"<b>Asunto:</b> {motivo}");
            sb.AppendLine($"<b>Participante:</b> {inscripcion.UsuarioNombre}");
            sb.AppendLine($"<b>Correo:</b> {inscripcion.UsuarioCorreo}");
            sb.AppendLine($"<b>Evento:</b> {inscripcion.EventoNombre}");
            sb.AppendLine($"<b>Monto:</b> ${inscripcion.CategoriaPrecio:F2} USD");
            sb.AppendLine($"<b>Estado Actual:</b> {inscripcion.EstadoPago}");
            sb.AppendLine($"<b>SLA Maximo:</b> 24 horas");
            if (!string.IsNullOrEmpty(inscripcion.ComprobanteUrl))
            {
                sb.AppendLine($"<b>Comprobante:</b> <a href=\"{inscripcion.ComprobanteUrl}\">Ver Documento</a>");
            }
            sb.AppendLine();
            sb.AppendLine("<i>Accion requerida: Ingrese al modulo de Finanzas para validar (Pagado) o rechazar el comprobante.</i>");

            var plainText = sb.ToString()
                .Replace("<b>", "").Replace("</b>", "")
                .Replace("<i>", "").Replace("</i>", "")
                .Replace("<a href=\"", "").Replace("\">Ver Documento</a>", "");

            bool telegramSent = false;
            string telegramError = string.Empty;

            var token = !string.IsNullOrEmpty(botConfig.TelegramBotToken) 
                ? botConfig.TelegramBotToken 
                : (!string.IsNullOrEmpty(_config.TelegramBotToken) ? _config.TelegramBotToken : "9190712678:AAFZQ9Al_IxHRY-VEHTlEHty0jr6hfRcRjM");
            var chatId = !string.IsNullOrEmpty(botConfig.TelegramChatId) ? botConfig.TelegramChatId : _config.TelegramChatId;

            if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(chatId))
            {
                try
                {
                    var endpoint = $"https://api.telegram.org/bot{token}/sendMessage";
                    var body = new
                    {
                        chat_id = chatId,
                        text = sb.ToString(),
                        parse_mode = "HTML"
                    };
                    var jsonContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                    var response = await _httpClient.PostAsync(endpoint, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        telegramSent = true;
                        await _repo.RecordNotificationSentAsync();
                        _logger.LogInformation("[NOTIFICACIONES] Alerta de pago enviada exitosamente a Telegram (Chat ID: {ChatId})", chatId);
                    }
                    else
                    {
                        telegramError = $"Error Telegram HTTP: {response.StatusCode}";
                        _logger.LogWarning("[NOTIFICACIONES] Error al enviar a Telegram: {StatusCode}", response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    telegramError = ex.Message;
                    _logger.LogWarning(ex, "[NOTIFICACIONES] Excepcion al conectar con Telegram API");
                }
            }
            else if (string.IsNullOrEmpty(chatId))
            {
                telegramError = "Chat ID no configurado. Abra @uleam_eventos_pagos_bot, pulse /start y detecte su Chat ID.";
            }

            return new NotificationResponse
            {
                Exito = telegramSent,
                Canal = "telegram",
                Mensaje = telegramSent 
                    ? "Alerta enviada exitosamente al Bot de Telegram (@uleam_eventos_pagos_bot) del encargado de Finanzas."
                    : $"Notificación de Telegram: {telegramError}",
                UrlWhatsApp = null
            };
        }

        public async Task<NotificationResponse> SendPendingPaymentsBatchReminderAsync(IEnumerable<Inscripcion> pendientes)
        {
            var list = pendientes.ToList();
            if (list.Count == 0)
            {
                return new NotificationResponse
                {
                    Exito = true,
                    Canal = "sistema",
                    Mensaje = "No existen pagos pendientes en estado 'Pago en verificación'"
                };
            }

            var botConfig = await _repo.GetBotConfigAsync();

            var sb = new StringBuilder();
            sb.AppendLine("<b>[ULEAM EVENTOS - RECORDATORIO PERSISTENTE DE PAGOS]</b>");
            sb.AppendLine($"<b>Atencion:</b> Existen {list.Count} comprobantes en estado <code>Pago en verificación</code> pendientes de auditoria.");
            sb.AppendLine();
            sb.AppendLine("<b>Lista de pagos pendientes:</b>");

            int index = 1;
            foreach (var item in list.Take(10))
            {
                sb.AppendLine($"{index}. <b>{item.UsuarioNombre}</b> (${item.CategoriaPrecio:F2}) - {item.HorasRestantes}h restantes [SLA: {item.EstadoSla}]");
                index++;
            }

            if (list.Count > 10)
            {
                sb.AppendLine($"... y {list.Count - 10} pagos mas pendientes de revision.");
            }

            sb.AppendLine();
            sb.AppendLine($"<i>Este recordatorio persistira periodicamente cada {botConfig.IntervaloMinutos} minutos hasta que cada pago sea revisado y pase a estado Pagado o Rechazado.</i>");

            var plainText = sb.ToString()
                .Replace("<b>", "").Replace("</b>", "")
                .Replace("<i>", "").Replace("</i>", "")
                .Replace("<code>", "").Replace("</code>", "");

            bool telegramSent = false;
            string telegramError = string.Empty;

            var token = !string.IsNullOrEmpty(botConfig.TelegramBotToken) 
                ? botConfig.TelegramBotToken 
                : (!string.IsNullOrEmpty(_config.TelegramBotToken) ? _config.TelegramBotToken : "9190712678:AAFZQ9Al_IxHRY-VEHTlEHty0jr6hfRcRjM");
            var chatId = !string.IsNullOrEmpty(botConfig.TelegramChatId) ? botConfig.TelegramChatId : _config.TelegramChatId;

            if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(chatId))
            {
                try
                {
                    var endpoint = $"https://api.telegram.org/bot{token}/sendMessage";
                    var body = new
                    {
                        chat_id = chatId,
                        text = sb.ToString(),
                        parse_mode = "HTML"
                    };
                    var jsonContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                    var response = await _httpClient.PostAsync(endpoint, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        telegramSent = true;
                        await _repo.RecordNotificationSentAsync();
                        _logger.LogInformation("[RECORDATORIOS] Recordatorio persistente enviado a Telegram ({Count} pagos pendientes)", list.Count);
                    }
                    else
                    {
                        telegramError = $"Error Telegram HTTP: {response.StatusCode}";
                        _logger.LogWarning("[RECORDATORIOS] Telegram respondio: {StatusCode}", response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    telegramError = ex.Message;
                    _logger.LogWarning(ex, "[RECORDATORIOS] Error al conectar con Telegram");
                }
            }
            else if (string.IsNullOrEmpty(chatId))
            {
                telegramError = "Chat ID no configurado. Abra @uleam_eventos_pagos_bot y pulse /start.";
            }

            return new NotificationResponse
            {
                Exito = telegramSent,
                Canal = "telegram",
                Mensaje = telegramSent
                    ? $"Recordatorio persistente de {list.Count} pagos enviado exitosamente por Telegram al chat {chatId}."
                    : $"Recordatorio Telegram: {telegramError}",
                UrlWhatsApp = null
            };
        }

        public async Task<NotificationResponse> TestNotificationAsync(string? canal, string? mensaje)
        {
            var botConfig = await _repo.GetBotConfigAsync();
            var texto = !string.IsNullOrWhiteSpace(mensaje)
                ? mensaje
                : "Prueba de conexion operativa del Bot de Notificaciones ULEAM-EVENTOS. La sincronizacion con Finanzas esta activa.";

            var sb = new StringBuilder();
            sb.AppendLine("<b>[ULEAM EVENTOS - PRUEBA DE CONEXION INSTITUCIONAL]</b>");
            sb.AppendLine(texto);
            sb.AppendLine();
            sb.AppendLine($"<i>Fecha y hora del servidor: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</i>");

            var token = !string.IsNullOrEmpty(botConfig.TelegramBotToken) 
                ? botConfig.TelegramBotToken 
                : (!string.IsNullOrEmpty(_config.TelegramBotToken) ? _config.TelegramBotToken : "9190712678:AAFZQ9Al_IxHRY-VEHTlEHty0jr6hfRcRjM");
            var chatId = !string.IsNullOrEmpty(botConfig.TelegramChatId) ? botConfig.TelegramChatId : _config.TelegramChatId;

            bool telegramSent = false;
            string telegramDetalle = "No ejecutado";

            if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(chatId))
            {
                try
                {
                    var endpoint = $"https://api.telegram.org/bot{token}/sendMessage";
                    var body = new
                    {
                        chat_id = chatId,
                        text = sb.ToString(),
                        parse_mode = "HTML"
                    };
                    var jsonContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                    var response = await _httpClient.PostAsync(endpoint, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        telegramSent = true;
                        telegramDetalle = "Enviado con exito a Telegram";
                        await _repo.RecordNotificationSentAsync();
                    }
                    else
                    {
                        telegramDetalle = $"Error HTTP {(int)response.StatusCode}: {response.ReasonPhrase}";
                    }
                }
                catch (Exception ex)
                {
                    telegramDetalle = $"Excepcion de conexion: {ex.Message}";
                }
            }
            else
            {
                telegramDetalle = "Telegram Bot Token o Chat ID no configurados en el sistema";
            }

            return new NotificationResponse
            {
                Exito = telegramSent,
                Canal = "telegram",
                Mensaje = telegramSent
                    ? $"Mensaje de prueba enviado con exito por Telegram al chat {chatId}"
                    : $"Detalle de Telegram: {telegramDetalle}",
                UrlWhatsApp = null
            };
        }

        public string GenerateWhatsAppUrl(string mensaje, string? phone = null)
        {
            var targetPhone = !string.IsNullOrWhiteSpace(phone) ? phone : _config.WhatsAppPhone;
            var cleanPhone = new string(targetPhone.Where(char.IsDigit).ToArray());

            var encoded = Uri.EscapeDataString(mensaje.Trim());
            if (string.IsNullOrEmpty(cleanPhone))
            {
                return $"https://wa.me/?text={encoded}";
            }
            return $"https://wa.me/{cleanPhone}?text={encoded}";
        }
    }
}
