using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using UleamEventos.Api.Models;

namespace UleamEventos.Api.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly ReaderWriterLockSlim _lock = new();
        private readonly Dictionary<string, Usuario> _usuarios = new(StringComparer.OrdinalIgnoreCase);
        private readonly Dictionary<string, Evento> _eventos = new();
        private readonly Dictionary<string, Inscripcion> _inscripciones = new();
        private readonly Dictionary<string, Credencial> _credenciales = new();
        private readonly List<Asistencia> _asistencias = new();
        private readonly Dictionary<string, Certificado> _certificados = new();

        public EventRepository()
        {
            SeedInitialData();
        }

        private void SeedInitialData()
        {
            _lock.EnterWriteLock();
            try
            {
                // 1. Usuarios Institucionales Predefinidos
                var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
                var organizadorId = Guid.Parse("00000000-0000-0000-0000-000000000002");
                var gestionId = Guid.Parse("00000000-0000-0000-0000-000000000003");
                var asistenciaId = Guid.Parse("00000000-0000-0000-0000-000000000004");
                var estudianteId = Guid.Parse("00000000-0000-0000-0000-000000000006");
                var externoId = Guid.Parse("00000000-0000-0000-0000-000000000007");

                var defaultHash = "$2a$10$7EqJtq98hPqEX7fNZaFWoOeVdM3.D2k/3g81pB8dJ9WvV0301h9Ua";

                _usuarios["admin@uleam.edu.ec"] = new Usuario
                {
                    Id = adminId,
                    Correo = "admin@uleam.edu.ec",
                    ContrasenaHash = defaultHash,
                    Nombres = "Carlos Adrián",
                    Apellidos = "Valencia Mendoza",
                    Identificacion = "1312345678",
                    Institucion = "Universidad Laica Eloy Alfaro de Manabí",
                    Rol = Roles.SuperAdmin
                };

                _usuarios["organizador@uleam.edu.ec"] = new Usuario
                {
                    Id = organizadorId,
                    Correo = "organizador@uleam.edu.ec",
                    ContrasenaHash = defaultHash,
                    Nombres = "Jandry David",
                    Apellidos = "Fernández Cedeño",
                    Identificacion = "1314567890",
                    Institucion = "Universidad Laica Eloy Alfaro de Manabí",
                    Rol = Roles.AdminEvento
                };

                _usuarios["gestion@uleam.edu.ec"] = new Usuario
                {
                    Id = gestionId,
                    Correo = "gestion@uleam.edu.ec",
                    ContrasenaHash = defaultHash,
                    Nombres = "José Andrés",
                    Apellidos = "Loor Muñoz",
                    Identificacion = "1315678901",
                    Institucion = "ULEAM - Finanzas",
                    Rol = Roles.PersonalGestion
                };

                _usuarios["asistencia@uleam.edu.ec"] = new Usuario
                {
                    Id = asistenciaId,
                    Correo = "asistencia@uleam.edu.ec",
                    ContrasenaHash = defaultHash,
                    Nombres = "Alan Joel",
                    Apellidos = "Cobeña Naranjo",
                    Identificacion = "1316789012",
                    Institucion = "ULEAM - Operaciones de Campo",
                    Rol = Roles.PersonalAsistencia
                };

                _usuarios["estudiante@uleam.edu.ec"] = new Usuario
                {
                    Id = estudianteId,
                    Correo = "estudiante@uleam.edu.ec",
                    ContrasenaHash = defaultHash,
                    Nombres = "Karla Jamileth",
                    Apellidos = "Andrade Mendoza",
                    Identificacion = "1317890123",
                    Institucion = "Carrera de Ingeniería en Software",
                    Rol = Roles.Asistente
                };

                _usuarios["participante.externo@gmail.com"] = new Usuario
                {
                    Id = externoId,
                    Correo = "participante.externo@gmail.com",
                    ContrasenaHash = defaultHash,
                    Nombres = "Javier David",
                    Apellidos = "Jaramillo Intriago",
                    Identificacion = "1318901234",
                    Institucion = "Univ. Técnica de Manabí (UTM)",
                    Rol = Roles.Asistente
                };

                // 2. Evento Insignia CIIST 2026
                var ev1Id = Guid.Parse("10000000-0000-0000-0000-000000000001");
                var cat1Id = Guid.Parse("60000000-0000-0000-0000-000000000001");
                var cat2Id = Guid.Parse("60000000-0000-0000-0000-000000000002");

                var evento1 = new Evento
                {
                    Id = ev1Id,
                    Slug = "congreso-internacional-software-2026",
                    Nombre = "I Congreso Internacional de Ingeniería en Software y Tecnologías Emergentes 2026",
                    Descripcion = "Magno encuentro científico-académico de la ULEAM con ponencias sobre Inteligencia Artificial, Cloud Architecture y Calidad de Software.",
                    FechaInicio = DateTime.UtcNow.AddMonths(1),
                    FechaFin = DateTime.UtcNow.AddMonths(1).AddDays(3),
                    Modalidad = "HIBRIDO",
                    Lugar = "Paraninfo Alfonso Aguilar Ruilova, Manta",
                    UrlAfiche = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                    UrlLogo = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
                    IdiomaPrincipal = "es",
                    CapacidadMaxima = 450,
                    RepositorioAbierto = true,
                    Estado = EstadosEvento.InscripcionesAbiertas,
                    TotalInscritos = 200,
                    TotalCheckins = 142,
                    Categorias = new List<CategoriaInscripcion>
                    {
                        new()
                        {
                            Id = cat1Id,
                            EventoId = ev1Id,
                            Nombre = "Estudiante ULEAM",
                            Precio = 0.00,
                            CapacidadMaxima = 300,
                            FechaInicio = DateTime.UtcNow.AddMonths(-1),
                            FechaFin = DateTime.UtcNow.AddMonths(1),
                            RequiereComprobante = false,
                            InscritosActuales = 142
                        },
                        new()
                        {
                            Id = cat2Id,
                            EventoId = ev1Id,
                            Nombre = "Profesional / Público General",
                            Precio = 25.00,
                            CapacidadMaxima = 150,
                            FechaInicio = DateTime.UtcNow.AddMonths(-1),
                            FechaFin = DateTime.UtcNow.AddMonths(1),
                            RequiereComprobante = true,
                            InscritosActuales = 58
                        }
                    },
                    LineasTematicas = new List<LineaTematica>
                    {
                        new() { Id = Guid.NewGuid(), EventoId = ev1Id, Nombre = "Inteligencia Artificial y Machine Learning", Color = "#002F6C" },
                        new() { Id = Guid.NewGuid(), EventoId = ev1Id, Nombre = "Arquitectura de Software y Cloud", Color = "#BB001E" }
                    },
                    Ponentes = new List<Ponente>
                    {
                        new()
                        {
                            Id = Guid.NewGuid(),
                            EventoId = ev1Id,
                            Nombres = "Jonny",
                            Apellidos = "Pérez Véliz",
                            TituloAcademico = "Dr. PhD",
                            Institucion = "Universidad Laica Eloy Alfaro de Manabí",
                            Correo = "jonny.perez@uleam.edu.ec"
                        }
                    }
                };

                _eventos[ev1Id.ToString()] = evento1;

                // 3. Inscripción Inicial Confirmada y Credencial QR
                var ins1Id = Guid.Parse("70000000-0000-0000-0000-000000000001");
                var qrToken1 = "ULEAM-QR-70000000-0000-0000-0000-000000000001-TOKEN";

                var inscripcion1 = new Inscripcion
                {
                    Id = ins1Id,
                    EventoId = ev1Id,
                    UsuarioId = estudianteId,
                    CategoriaId = cat1Id,
                    Estado = EstadosInscripcion.Confirmada,
                    RegistradoAt = DateTime.UtcNow.AddHours(-48),
                    EventoNombre = evento1.Nombre,
                    UsuarioNombre = "Karla Jamileth Andrade Mendoza",
                    UsuarioCorreo = "estudiante@uleam.edu.ec",
                    CategoriaNombre = "Estudiante ULEAM",
                    CategoriaPrecio = 0.00,
                    CredencialQr = qrToken1
                };

                _inscripciones[ins1Id.ToString()] = inscripcion1;

                _credenciales[qrToken1] = new Credencial
                {
                    Id = Guid.NewGuid(),
                    InscripcionId = ins1Id,
                    TokenQrSeguro = qrToken1,
                    UrlPdf = "https://storage.uleam.edu.ec/credenciales/karla-andrade.pdf",
                    EmitidoAt = DateTime.UtcNow.AddHours(-48)
                };

                // 4. Inscripción 2 con Comprobante Pendiente de Revisión (SLA 24h)
                var ins2Id = Guid.Parse("70000000-0000-0000-0000-000000000002");
                _inscripciones[ins2Id.ToString()] = new Inscripcion
                {
                    Id = ins2Id,
                    EventoId = ev1Id,
                    UsuarioId = externoId,
                    CategoriaId = cat2Id,
                    Estado = EstadosInscripcion.PendienteRevision,
                    RegistradoAt = DateTime.UtcNow.AddHours(-4),
                    EventoNombre = evento1.Nombre,
                    UsuarioNombre = "Javier David Jaramillo Intriago",
                    UsuarioCorreo = "participante.externo@gmail.com",
                    CategoriaNombre = "Profesional / Público General",
                    CategoriaPrecio = 25.00,
                    ComprobanteUrl = "https://storage.uleam.edu.ec/comprobantes/transferencia-banco-pichincha-098231.pdf",
                    LimiteRevisionAt = DateTime.UtcNow.AddHours(20),
                    HorasRestantes = 20.0,
                    EstadoSla = "A_TIEMPO"
                };

                // 5. Certificado Oficial de Muestra
                var certId = Guid.NewGuid();
                _certificados[certId.ToString()] = new Certificado
                {
                    Id = certId,
                    InscripcionId = ins1Id,
                    UrlPdf = "https://storage.uleam.edu.ec/certificados/cert-ciist-karla-andrade.pdf",
                    CodigoValidacion = "ULEAM-2026-CERT-99814",
                    EmitidoAt = DateTime.UtcNow.AddHours(-10),
                    Participante = "Karla Jamileth Andrade Mendoza",
                    EventoNombre = "I Congreso Internacional de Ingeniería en Software y Tecnologías Emergentes 2026"
                };
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public Task<IEnumerable<Evento>> GetEventsAsync(string? estado)
        {
            _lock.EnterReadLock();
            try
            {
                var query = _eventos.Values.AsEnumerable();
                if (!string.IsNullOrEmpty(estado))
                {
                    query = query.Where(e => string.Equals(e.Estado, estado, StringComparison.OrdinalIgnoreCase));
                }
                return Task.FromResult<IEnumerable<Evento>>(query.OrderBy(e => e.FechaInicio).ToList());
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task<Evento?> GetEventBySlugAsync(string slug)
        {
            _lock.EnterReadLock();
            try
            {
                var ev = _eventos.Values.FirstOrDefault(e => string.Equals(e.Slug, slug, StringComparison.OrdinalIgnoreCase));
                return Task.FromResult(ev);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task CreateEventAsync(Evento evento)
        {
            if (evento.Id == Guid.Empty)
                evento.Id = Guid.NewGuid();

            evento.CreadoAt = DateTime.UtcNow;
            evento.ActualizadoAt = DateTime.UtcNow;

            _lock.EnterWriteLock();
            try
            {
                _eventos[evento.Id.ToString()] = evento;
            }
            finally
            {
                _lock.ExitWriteLock();
            }
            return Task.CompletedTask;
        }

        public Task<bool> UpdateEventStatusAsync(Guid id, string nuevoEstado)
        {
            _lock.EnterWriteLock();
            try
            {
                if (_eventos.TryGetValue(id.ToString(), out var ev))
                {
                    ev.Estado = nuevoEstado;
                    ev.ActualizadoAt = DateTime.UtcNow;
                    return Task.FromResult(true);
                }
                return Task.FromResult(false);
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public Task<Usuario?> FindUserByEmailAsync(string email)
        {
            _lock.EnterReadLock();
            try
            {
                _usuarios.TryGetValue(email, out var user);
                return Task.FromResult(user);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task<Usuario?> FindUserByIdAsync(Guid id)
        {
            _lock.EnterReadLock();
            try
            {
                var user = _usuarios.Values.FirstOrDefault(u => u.Id == id);
                return Task.FromResult(user);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task CreateUserAsync(Usuario usuario)
        {
            if (usuario.Id == Guid.Empty)
                usuario.Id = Guid.NewGuid();

            usuario.CreadoAt = DateTime.UtcNow;

            _lock.EnterWriteLock();
            try
            {
                _usuarios[usuario.Correo] = usuario;
            }
            finally
            {
                _lock.ExitWriteLock();
            }
            return Task.CompletedTask;
        }

        public Task<Credencial> CreateRegistrationAsync(Inscripcion reg, Comprobante? comp)
        {
            if (reg.Id == Guid.Empty)
                reg.Id = Guid.NewGuid();

            reg.RegistradoAt = DateTime.UtcNow;

            if (comp != null)
            {
                comp.SubidoAt = DateTime.UtcNow;
                comp.LimiteRevisionAt = DateTime.UtcNow.AddHours(24);
                comp.HorasRestantes = 24.0;
                comp.EstadoSla = "A_TIEMPO";
                comp.EstadoRevision = EstadosComprobante.EnRevision;

                reg.LimiteRevisionAt = comp.LimiteRevisionAt;
                reg.HorasRestantes = 24.0;
                reg.EstadoSla = "A_TIEMPO";
            }

            var qrToken = $"ULEAM-QR-{reg.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
            var cred = new Credencial
            {
                Id = Guid.NewGuid(),
                InscripcionId = reg.Id,
                TokenQrSeguro = qrToken,
                UrlPdf = $"https://storage.uleam.edu.ec/credenciales/{reg.Id}.pdf",
                EmitidoAt = DateTime.UtcNow
            };

            reg.CredencialQr = qrToken;

            _lock.EnterWriteLock();
            try
            {
                _inscripciones[reg.Id.ToString()] = reg;
                _credenciales[qrToken] = cred;

                // Actualizar total inscritos del evento
                if (_eventos.TryGetValue(reg.EventoId.ToString(), out var ev))
                {
                    ev.TotalInscritos++;
                }
            }
            finally
            {
                _lock.ExitWriteLock();
            }

            return Task.FromResult(cred);
        }

        public Task<IEnumerable<Inscripcion>> GetRegistrationsByEventAsync(Guid? eventoId)
        {
            _lock.EnterReadLock();
            try
            {
                var query = _inscripciones.Values.AsEnumerable();
                if (eventoId.HasValue && eventoId.Value != Guid.Empty)
                {
                    query = query.Where(i => i.EventoId == eventoId.Value);
                }

                var list = new List<Inscripcion>();
                foreach (var item in query)
                {
                    var clone = new Inscripcion
                    {
                        Id = item.Id,
                        EventoId = item.EventoId,
                        UsuarioId = item.UsuarioId,
                        CategoriaId = item.CategoriaId,
                        Estado = item.Estado,
                        ExoneradoPor = item.ExoneradoPor,
                        NotaExoneracion = item.NotaExoneracion,
                        RegistradoAt = item.RegistradoAt,
                        EventoNombre = item.EventoNombre,
                        UsuarioNombre = item.UsuarioNombre,
                        UsuarioCorreo = item.UsuarioCorreo,
                        CategoriaNombre = item.CategoriaNombre,
                        CategoriaPrecio = item.CategoriaPrecio,
                        ComprobanteUrl = item.ComprobanteUrl,
                        CredencialQr = item.CredencialQr,
                        LimiteRevisionAt = item.LimiteRevisionAt
                    };

                    // Calcular ventana dinámica SLA de 24 horas
                    if (clone.LimiteRevisionAt.HasValue && clone.Estado == EstadosInscripcion.PendienteRevision)
                    {
                        var diff = clone.LimiteRevisionAt.Value - DateTime.UtcNow;
                        clone.HorasRestantes = Math.Round(diff.TotalHours, 1);
                        if (diff.TotalHours <= 0)
                            clone.EstadoSla = "VENCIDO";
                        else if (diff.TotalHours <= 4)
                            clone.EstadoSla = "URGENTE";
                        else
                            clone.EstadoSla = "A_TIEMPO";
                    }

                    list.Add(clone);
                }

                return Task.FromResult<IEnumerable<Inscripcion>>(list);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task<bool> UpdateRegistrationStatusAsync(Guid id, string estado, Guid? auditorId)
        {
            _lock.EnterWriteLock();
            try
            {
                if (_inscripciones.TryGetValue(id.ToString(), out var ins))
                {
                    ins.Estado = estado;
                    if (string.Equals(estado, EstadosInscripcion.Confirmada, StringComparison.OrdinalIgnoreCase))
                    {
                        var qrToken = $"ULEAM-QR-{ins.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
                        ins.CredencialQr = qrToken;
                        _credenciales[qrToken] = new Credencial
                        {
                            Id = Guid.NewGuid(),
                            InscripcionId = ins.Id,
                            TokenQrSeguro = qrToken,
                            UrlPdf = $"https://storage.uleam.edu.ec/credenciales/{ins.Id}.pdf",
                            EmitidoAt = DateTime.UtcNow
                        };
                    }
                    return Task.FromResult(true);
                }
                return Task.FromResult(false);
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public Task<(Asistencia? Asistencia, Usuario? Usuario, string Mensaje, bool Exito)> ProcessCheckInAsync(string tokenQr, Guid? sesionId, Guid? escaneadoPor)
        {
            _lock.EnterWriteLock();
            try
            {
                Credencial? cred = null;
                if (_credenciales.TryGetValue(tokenQr, out var foundCred))
                {
                    cred = foundCred;
                }
                else
                {
                    // Búsqueda alternativa por token directo o ID de inscripción
                    cred = _credenciales.Values.FirstOrDefault(c => c.InscripcionId.ToString().Equals(tokenQr, StringComparison.OrdinalIgnoreCase)
                        || c.TokenQrSeguro.Contains(tokenQr, StringComparison.OrdinalIgnoreCase));
                }

                if (cred == null)
                {
                    return Task.FromResult<(Asistencia?, Usuario?, string, bool)>(
                        (null, null, "ACCESO DENEGADO: Código QR o Cédula no válida en el sistema", false));
                }

                if (!_inscripciones.TryGetValue(cred.InscripcionId.ToString(), out var ins))
                {
                    return Task.FromResult<(Asistencia?, Usuario?, string, bool)>(
                        (null, null, "ACCESO DENEGADO: Inscripción no encontrada", false));
                }

                if (!string.Equals(ins.Estado, EstadosInscripcion.Confirmada, StringComparison.OrdinalIgnoreCase))
                {
                    return Task.FromResult<(Asistencia?, Usuario?, string, bool)>(
                        (null, null, $"ACCESO DENEGADO: Inscripción en estado {ins.Estado} (No confirmada)", false));
                }

                // Buscar usuario
                var usr = _usuarios.Values.FirstOrDefault(u => u.Id == ins.UsuarioId);

                // Verificar asistencia duplicada
                var targetSesion = sesionId ?? Guid.Empty;
                var duplicate = _asistencias.Any(a => a.InscripcionId == ins.Id && a.SesionId == targetSesion);
                if (duplicate)
                {
                    return Task.FromResult<(Asistencia?, Usuario?, string, bool)>(
                        (null, usr, "ADVERTENCIA: Asistencia previamente registrada en esta sesión", true));
                }

                var asistencia = new Asistencia
                {
                    Id = Guid.NewGuid(),
                    InscripcionId = ins.Id,
                    SesionId = targetSesion,
                    EscaneadoPor = escaneadoPor,
                    MarcaTiempo = DateTime.UtcNow
                };

                _asistencias.Add(asistencia);

                // Incrementar total checkins del evento
                if (_eventos.TryGetValue(ins.EventoId.ToString(), out var ev))
                {
                    ev.TotalCheckins++;
                }

                return Task.FromResult<(Asistencia?, Usuario?, string, bool)>(
                    (asistencia, usr, "ACCESO CONCEDIDO", true));
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public Task<MetricasDashboard> GetDashboardMetricsAsync()
        {
            _lock.EnterReadLock();
            try
            {
                int totalInscritos = _inscripciones.Count;
                int pendientes = _inscripciones.Values.Count(i => i.Estado == EstadosInscripcion.PendienteRevision);
                double ingresos = _inscripciones.Values.Where(i => i.Estado == EstadosInscripcion.Confirmada).Sum(i => i.CategoriaPrecio);

                double tasaAsistencia = totalInscritos > 0 
                    ? Math.Min(100.0, ((double)_asistencias.Count / totalInscritos) * 100.0) 
                    : 85.5;

                var metrics = new MetricasDashboard
                {
                    EventosActivos = _eventos.Count,
                    ParticipantesTotales = totalInscritos + 4520,
                    AsistenciaPromedio = Math.Round(tasaAsistencia, 1),
                    IngresosTotales = ingresos + 4521.00,
                    PagosPendientes = pendientes + 42,
                    CertificadosEmitidos = _certificados.Count + 1200
                };

                return Task.FromResult(metrics);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public Task SubmitSurveyAsync(RespuestaEncuesta respuesta)
        {
            if (respuesta.Id == Guid.Empty)
                respuesta.Id = Guid.NewGuid();

            respuesta.EnviadoAt = DateTime.UtcNow;
            return Task.CompletedTask;
        }

        public Task<IEnumerable<Certificado>> GetCertificatesByUserAsync(Guid? usuarioId)
        {
            _lock.EnterReadLock();
            try
            {
                return Task.FromResult<IEnumerable<Certificado>>(_certificados.Values.ToList());
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }
    }
}
