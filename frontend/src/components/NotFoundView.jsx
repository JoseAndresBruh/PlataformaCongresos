import React, { useState } from 'react';

export default function NotFoundView({
  currentPath = window.location.pathname,
  onNavigate,
  onSearch,
  onOpenHelp,
}) {
  const [internalQuery, setInternalQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(internalQuery);
    } else if (onNavigate) {
      onNavigate('explorar', '/explorar', internalQuery);
    }
  };

  return (
    <main className="main-container not-found-page" style={{ padding: '60px 20px', minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Migas de pan / Breadcrumb */}
      <nav style={{ alignSelf: 'flex-start', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <button
          onClick={() => onNavigate && onNavigate('explorar', '/explorar')}
          style={{ background: 'none', border: 'none', color: 'var(--primary-container)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
        >
          Inicio
        </button>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Error 404</span>
      </nav>

      {/* Contenedor Principal de la Tarjeta 404 */}
      <div
        className="not-found-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-level-2)',
          border: '1px solid rgba(0, 47, 108, 0.1)',
          padding: 'clamp(28px, 5vw, 56px)',
          maxWidth: '820px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Banda decorativa superior ULEAM */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, var(--primary-container) 0%, var(--secondary) 50%, var(--primary-dark) 100%)',
          }}
        />

        {/* Ilustración Numérica 404 con Estilo Institucional */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <span
            style={{
              fontSize: 'clamp(4.5rem, 14vw, 7.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: 'var(--font-family)',
              background: 'linear-gradient(135deg, var(--primary-container) 0%, var(--primary-dark) 60%, var(--secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </span>
          <div
            style={{
              width: 'clamp(50px, 10vw, 72px)',
              height: 'clamp(50px, 10vw, 72px)',
              borderRadius: '50%',
              background: 'rgba(187, 0, 30, 0.08)',
              border: '2px solid rgba(187, 0, 30, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary)',
              marginLeft: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 'clamp(28px, 6vw, 42px)' }}>
              explore_off
            </span>
          </div>
        </div>

        {/* Badge de Alerta Académica */}
        <div style={{ marginBottom: '16px' }}>
          <span
            className="chip chip-urgent"
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            RECURSO O ENLACE NO LOCALIZADO
          </span>
        </div>

        {/* Título y Mensaje Explicativo */}
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            color: 'var(--primary-dark)',
            fontWeight: 800,
            marginBottom: '14px',
            lineHeight: 1.25,
          }}
        >
          Página o Recurso No Encontrado
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 20px',
            lineHeight: 1.6,
          }}
        >
          No pudimos localizar la ruta solicitada:{' '}
          <code
            style={{
              background: 'rgba(0, 47, 108, 0.08)',
              color: 'var(--primary-container)',
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.9em',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            {currentPath || '/ruta-desconocida'}
          </code>
          . Es posible que la dirección web haya cambiado, contenga un error de escritura o el evento buscado ya no esté disponible en el catálogo activo de la ULEAM.
        </p>

        {/* Formulario de Búsqueda Rápida integrado en la Pantalla 404 */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            maxWidth: '560px',
            margin: '0 auto 32px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 260px)' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              search
            </span>
            <input
              type="text"
              className="input-control"
              placeholder="Buscar congreso, ponente o temática en el portal..."
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              style={{ paddingLeft: '44px', width: '100%', height: '48px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '48px', padding: '0 24px', flexShrink: 0 }}
          >
            <span className="material-symbols-outlined">search</span>
            Buscar
          </button>
        </form>

        {/* Accesos Rápidos Recomendados */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h2
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-container)' }}>
              quick_reference_all
            </span>
            Secciones Oficiales Disponibles:
          </h2>

          <div
            className="not-found-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '14px',
            }}
          >
            <button
              onClick={() => onNavigate && onNavigate('explorar', '/explorar')}
              className="not-found-quick-btn"
              style={{
                background: 'var(--surface-bg)',
                border: '1px solid rgba(0, 47, 108, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-container)', fontWeight: 700, fontSize: '0.95rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>explore</span>
                Catálogo de Eventos
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Explora congresos, simposios y jornadas vigentes.
              </p>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('mis_eventos', '/mis-eventos')}
              className="not-found-quick-btn"
              style={{
                background: 'var(--surface-bg)',
                border: '1px solid rgba(0, 47, 108, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-container)', fontWeight: 700, fontSize: '0.95rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>badge</span>
                Mis Credenciales
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Consulta tus eventos inscritos y tu código QR de acceso.
              </p>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('certificados', '/certificados')}
              className="not-found-quick-btn"
              style={{
                background: 'var(--surface-bg)',
                border: '1px solid rgba(0, 47, 108, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-container)', fontWeight: 700, fontSize: '0.95rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>workspace_premium</span>
                Validar Certificados
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Verifica certificados oficiales con código criptográfico.
              </p>
            </button>

            <button
              onClick={() => onOpenHelp && onOpenHelp()}
              className="not-found-quick-btn"
              style={{
                background: 'var(--surface-bg)',
                border: '1px solid rgba(0, 47, 108, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.95rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>live_help</span>
                Mesa de Ayuda
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Soporte técnico y preguntas frecuentes universitarias.
              </p>
            </button>
          </div>
        </div>

        {/* Botones Principales de Retorno */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('explorar', '/explorar')}
            style={{ minHeight: '44px', padding: '10px 28px' }}
          >
            <span className="material-symbols-outlined">home</span>
            Regresar al Catálogo Principal
          </button>
          <button
            className="btn btn-outline"
            onClick={() => window.history.length > 1 ? window.history.back() : (onNavigate && onNavigate('explorar', '/explorar'))}
            style={{ minHeight: '44px', padding: '10px 22px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Página Anterior
          </button>
        </div>
      </div>
    </main>
  );
}
