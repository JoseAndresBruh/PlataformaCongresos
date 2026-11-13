using System;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UleamEventos.Api.Configuration;
using UleamEventos.Api.Middleware;
using UleamEventos.Api.Repositories;
using UleamEventos.Api.Security;

// 1. Cargar variables de entorno desde .env si existe
EnvLoader.Load();

var builder = WebApplication.CreateBuilder(args);

// 2. Cargar configuración unificada (AppConfig)
var config = AppConfig.Load(builder.Configuration);

// 3. Configurar Kestrel para escuchar en 0.0.0.0 y [::] en el puerto configurado (8080 por defecto)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(IPAddress.Any, config.Port);
});

// 4. Inyección de Dependencias
builder.Services.AddSingleton(config);
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<IEventRepository, EventRepository>();

// 5. Configurar CORS permisivo para desarrollo y red local
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 6. Configurar Controladores y Serialización JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.WriteIndented = false;
    });

var app = builder.Build();

// 7. Pipeline HTTP
app.UseCors("AllowAll");
app.UseMiddleware<JwtAuthMiddleware>();
app.MapControllers();

// 8. Mensaje de bienvenida en consola institucional
Console.WriteLine("=====================================================");
Console.WriteLine($"SERVIDOR ULEAM-EVENTOS (.NET 9 / C#) INICIADO EN PUERTO {config.Port}");
Console.WriteLine($"URL Base: http://localhost:{config.Port}/api/v1");
Console.WriteLine($"Modo: {config.Env} | Repositorio: Autonomo en Memoria (PostgreSQL Ready)");
Console.WriteLine("=====================================================");

app.Run();
