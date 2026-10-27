import React from 'react';

export default function Search404State({
  query = '',
  modality = 'TODAS',
  onReset,
  onSuggestionClick,
  onOpenHelp,
}) {
  const suggestions = [
    'Software',
    'Inteligencia Artificial',
    'Ciberseguridad',
    'Ética',
    'Cloud Computing',
    'Posgrado',
  ];

  return (
    <div
      className="empty-search-state search-404-container"
      style={{
        background: 'var(--surface-card)',
        borderRadius: '20px',
        padding: 'clamp(28px, 5vw, 48px) clamp(16px, 4vw, 36px)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-level-1)',
        margin: '28px auto',
        maxWidth: '720px',
        border: '1px solid rgba(0, 47, 108, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Indicador de Código 404 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary-container) 100%)',
        }}
      />

      {/* Icono de búsqueda no encontrada */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'rgba(187, 0, 30, 0.08)',
          color: 'var(--secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '2px solid rgba(187, 0, 30, 0.2)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>
          search_off
        </span>
      </div>

      {/* Chip de Error 404 */}
      <div style={{ marginBottom: '12px' }}>
        <span
          className="chip chip-urgent"
          style={{
            fontSize: '0.8rem',
            padding: '5px 14px',
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          ERROR 404 • RECURSO NO ENCONTRADO
        </span>
      </div>

      {/* Título */}
      <h3
        style={{
          fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)',
          color: 'var(--primary-dark)',
          marginBottom: '12px',
          fontWeight: 800,
          lineHeight: 1.3,
        }}
      >
        {query
          ? `404 — No se encontraron eventos para "${query}"`
          : modality !== 'TODAS'
          ? `404 — No hay eventos registrados en modalidad ${modality.toLowerCase()}`
          : '404 — Catálogo de eventos no disponible'}
      </h3>

      {/* Explicación */}
      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '520px',
          margin: '0 auto 20px',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        No encontramos ningún congreso, simposio o taller que coincida con tus criterios de búsqueda. Revisa la ortografía, prueba con términos más generales o explora nuestras temáticas recomendadas.
      </p>

      {/* Píldoras de Sugerencias de Búsqueda */}
      <div style={{ marginBottom: '24px' }}>
        <span
          style={{
            display: 'block',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px',
          }}
        >
          Temáticas populares sugeridas:
        </span>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onSuggestionClick && onSuggestionClick(sug)}
              style={{
                background: 'rgba(0, 47, 108, 0.05)',
                border: '1px solid rgba(0, 47, 108, 0.15)',
                color: 'var(--primary-container)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-container)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 47, 108, 0.05)';
                e.currentTarget.style.color = 'var(--primary-container)';
              }}
            >
              + {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Botones de Acción */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-primary"
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '44px',
          }}
        >
          <span className="material-symbols-outlined">filter_alt_off</span>
          Restablecer Filtros y Ver Todos
        </button>

        {onOpenHelp && (
          <button
            className="btn btn-outline"
            onClick={onOpenHelp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              minHeight: '44px',
            }}
          >
            <span className="material-symbols-outlined">help</span>
            Solicitar Información en Mesa de Ayuda
          </button>
        )}
      </div>
    </div>
  );
}
