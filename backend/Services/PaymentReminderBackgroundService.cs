using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UleamEventos.Api.Models;
using UleamEventos.Api.Repositories;

namespace UleamEventos.Api.Services
{
    public class PaymentReminderBackgroundService : BackgroundService
    {
        private readonly IEventRepository _repo;
        private readonly IPaymentNotificationService _notificationService;
        private readonly ILogger<PaymentReminderBackgroundService> _logger;

        public PaymentReminderBackgroundService(
            IEventRepository repo,
            IPaymentNotificationService notificationService,
            ILogger<PaymentReminderBackgroundService> logger)
        {
            _repo = repo;
            _notificationService = notificationService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[SERVICIO PERSISTENTE] Servicio de recordatorios de pagos iniciado.");

            // Breve espera de 5 segundos para arranque en frío de la API
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var botConfig = await _repo.GetBotConfigAsync();

                    if (botConfig.RecordatoriosActivos)
                    {
                        var pendientes = (await _repo.GetRegistrationsByPaymentStatusAsync(EstadosPago.PagoEnVerificacion)).ToList();

                        if (pendientes.Count > 0)
                        {
                            var now = DateTime.UtcNow;
                            var intervalMinutes = botConfig.IntervaloMinutos > 0 ? botConfig.IntervaloMinutos : 15;

                            bool shouldSend = false;
                            if (botConfig.UltimoEnvioAt == null)
                            {
                                shouldSend = true;
                            }
                            else
                            {
                                var elapsed = (now - botConfig.UltimoEnvioAt.Value).TotalMinutes;
                                if (elapsed >= intervalMinutes)
                                {
                                    shouldSend = true;
                                }
                            }

                            if (shouldSend)
                            {
                                _logger.LogInformation("[SERVICIO PERSISTENTE] Enviando recordatorio para {Count} comprobantes en 'Pago en verificacion'", pendientes.Count);
                                await _notificationService.SendPendingPaymentsBatchReminderAsync(pendientes);
                            }
                        }
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "[SERVICIO PERSISTENTE] Error en el ciclo de verificacion de recordatorios");
                }

                // Verificación cada 30 segundos
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("[SERVICIO PERSISTENTE] Servicio de recordatorios de pagos detenido.");
        }
    }
}
