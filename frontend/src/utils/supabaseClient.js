/**
 * Configuración e integración de cliente Supabase
 * Permite interactuar con la API REST y servicios de Supabase (Auth, Storage, Database)
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xoqzmiqdsgtxlhhpandb.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4U2aMYbFJd50FFsx04n35Q_iUKuxIT6';

/**
 * Helper para realizar peticiones directas a la API REST de Supabase (PostgREST)
 * @param {string} endpoint - Ruta relativa de la API (ej: 'eventos', 'rpc/mi_funcion')
 * @param {RequestInit} [options] - Opciones estándar de fetch
 * @returns {Promise<Response>}
 */
export const supabaseFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${SUPABASE_URL}/rest/v1/${cleanEndpoint}`;

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

