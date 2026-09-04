/**
 * Centralised API service layer.
 *
 * Blueprint row 15/16: All backend fetch calls live here.
 * UI components import from this module rather than calling fetch() directly.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

// ── Generic helper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Health / Status ───────────────────────────────────────────────────────

export const fetchStatus = () => apiFetch('/');

// ── Ocean Grid ────────────────────────────────────────────────────────────

/** Full 3-D grid (all depths, all variables) */
export const fetchOceanGrid = (bbox = null) => {
  const params = new URLSearchParams();
  if (bbox) {
    params.set('min_lon', bbox.minLon);
    params.set('max_lon', bbox.maxLon);
    params.set('min_lat', bbox.minLat);
    params.set('max_lat', bbox.maxLat);
  }
  const qs = params.toString();
  return apiFetch(`/api/ocean-grid${qs ? `?${qs}` : ''}`);
};

/** Single depth-slice for a specific variable */
export const fetchDepthSlice = (depth, variable = 'temperature') =>
  apiFetch(`/api/ocean-grid/slice?depth=${depth}&variable=${variable}`);

/** Dataset metadata (variables, depths, times, coords) */
export const fetchGridInfo = () => apiFetch('/api/ocean-grid/info');

/** Available depth levels */
export const fetchDepths = () => apiFetch('/api/ocean-grid/depths');

/** Available time steps */
export const fetchTimes = () => apiFetch('/api/ocean-grid/times');

/** Trigger manual cache refresh */
export const triggerGridRefresh = () =>
  apiFetch('/api/ocean-grid/refresh', { method: 'POST' });

/**
 * Extract isosurface mesh for a scalar field.
 * @param {string} variable - e.g. "temperature"
 * @param {number} isoLevel - e.g. 20 (for 20°C isotherm)
 */
export const fetchIsosurface = (variable, isoLevel) =>
  apiFetch(`/api/ocean-grid/isosurface?variable=${variable}&iso_level=${isoLevel}`);

// ── Instruments ───────────────────────────────────────────────────────────

/** Active Argo float positions */
export const fetchArgoFloats = (daysBack = 30, refresh = false, bbox = null) => {
  const params = new URLSearchParams({ days_back: daysBack, refresh });
  if (bbox) {
    params.set('min_lon', bbox.minLon);
    params.set('max_lon', bbox.maxLon);
    params.set('min_lat', bbox.minLat);
    params.set('max_lat', bbox.maxLat);
  }
  return apiFetch(`/api/argo-floats?${params.toString()}`);
};
/** Depth-profile for a specific Argo float */
export const fetchFloatProfile = (floatId) =>
  apiFetch(`/api/float-profile/${encodeURIComponent(floatId)}`);

/** Instruments by type (argo | glider | ctd) */
export const fetchInstruments = (sourceType = 'argo') =>
  apiFetch(`/api/instruments?source_type=${sourceType}`);

/** Depth-profile for any instrument type */
export const fetchInstrumentProfile = (sourceType, instrumentId) =>
  apiFetch(`/api/instrument-profile/${sourceType}/${encodeURIComponent(instrumentId)}`);

// ── Metadata ──────────────────────────────────────────────────────────────

/** Full metadata: variables, depths, times, bbox */
export const fetchMeta = () => apiFetch('/api/meta');

/** Bounding box */
export const fetchBbox = () => apiFetch('/api/meta/bbox');

// ── OGC / Standards ───────────────────────────────────────────────────────

/** WMS GetCapabilities (JSON) */
export const fetchWMSCapabilities = () => apiFetch('/api/ogc/wms');

/** Colorbar palettes + default range for a variable */
export const fetchColorbarInfo = (variable) =>
  apiFetch(`/api/ogc/colorbar${variable ? `?variable=${variable}` : ''}`);
