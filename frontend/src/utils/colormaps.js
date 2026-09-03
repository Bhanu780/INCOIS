/**
 * Client-side colormap utilities.
 *
 * Blueprint row 11: Colorbar editor — palette, min/max, log/linear.
 * These functions are applied as shader uniforms (or canvas pixel ops)
 * on the client side — recoloring is instant, no backend round-trip.
 */

// ── Palette definitions ───────────────────────────────────────────────────
// Each palette is an array of [position, [r, g, b]] stops (all in [0,1])

export const PALETTES = {
  thermal: [
    [0.00, [0.04, 0.03, 0.27]],
    [0.25, [0.32, 0.07, 0.57]],
    [0.50, [0.72, 0.22, 0.42]],
    [0.75, [0.97, 0.56, 0.14]],
    [1.00, [0.99, 0.99, 0.60]],
  ],
  viridis: [
    [0.00, [0.267, 0.005, 0.329]],
    [0.25, [0.283, 0.361, 0.596]],
    [0.50, [0.129, 0.565, 0.553]],
    [0.75, [0.369, 0.788, 0.384]],
    [1.00, [0.993, 0.906, 0.144]],
  ],
  plasma: [
    [0.00, [0.051, 0.031, 0.529]],
    [0.25, [0.494, 0.012, 0.659]],
    [0.50, [0.800, 0.157, 0.463]],
    [0.75, [0.973, 0.463, 0.216]],
    [1.00, [0.941, 0.973, 0.129]],
  ],
  jet: [
    [0.00, [0.0, 0.0, 0.5]],
    [0.25, [0.0, 0.5, 1.0]],
    [0.50, [0.0, 1.0, 0.0]],
    [0.75, [1.0, 0.5, 0.0]],
    [1.00, [0.5, 0.0, 0.0]],
  ],
  rdbu: [
    [0.00, [0.698, 0.094, 0.169]],
    [0.25, [0.957, 0.647, 0.510]],
    [0.50, [0.969, 0.969, 0.969]],
    [0.75, [0.573, 0.773, 0.871]],
    [1.00, [0.192, 0.510, 0.741]],
  ],
};

export const PALETTE_NAMES = Object.keys(PALETTES);

// ── Default ranges per variable ───────────────────────────────────────────

export const DEFAULT_RANGES = {
  Temperature: { vmin: 2,    vmax: 30,   unit: '°C'  },
  Salinity:    { vmin: 33.0, vmax: 37.0, unit: 'PSU' },
  Currents:    { vmin: 0,    vmax: 1.8,  unit: 'm/s' },
};

// ── Normalization ─────────────────────────────────────────────────────────

/**
 * Map value → [0, 1] using linear or log normalization.
 * @param {number} value
 * @param {number} vmin
 * @param {number} vmax
 * @param {'linear'|'log'} scale
 */
export function normalize(value, vmin, vmax, scale = 'linear') {
  if (vmin === vmax) return 0.5;
  let t;
  if (scale === 'log') {
    const safeMin = Math.max(vmin, 1e-10);
    const safeMax = Math.max(vmax, 1e-10);
    const safeVal = Math.max(value, 1e-10);
    t = (Math.log10(safeVal) - Math.log10(safeMin)) /
        (Math.log10(safeMax) - Math.log10(safeMin));
  } else {
    t = (value - vmin) / (vmax - vmin);
  }
  return Math.max(0, Math.min(1, t));
}

// ── Color interpolation ───────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Map normalised t ∈ [0,1] → [r, g, b] each in [0,1].
 * @param {number} t - normalised value
 * @param {string} paletteName - key of PALETTES
 */
export function paletteColor(t, paletteName = 'thermal') {
  const stops = PALETTES[paletteName] ?? PALETTES.thermal;
  if (t <= stops[0][0]) return stops[0][1];
  if (t >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const lt = (t - p0) / (p1 - p0);
      return [lerp(c0[0], c1[0], lt), lerp(c0[1], c1[1], lt), lerp(c0[2], c1[2], lt)];
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Full pipeline: value → CSS rgba() string.
 *
 * @param {number} value
 * @param {string} variable - Temperature | Salinity | Currents
 * @param {object} opts
 * @param {string}  opts.palette  - palette name
 * @param {number}  opts.vmin     - override min
 * @param {number}  opts.vmax     - override max
 * @param {'linear'|'log'} opts.scale
 * @param {number}  opts.alpha    - CSS alpha (0-1)
 */
export function valueToRgba(value, variable = 'Temperature', opts = {}) {
  const defaults = DEFAULT_RANGES[variable] ?? DEFAULT_RANGES.Temperature;
  const {
    palette = 'thermal',
    vmin = defaults.vmin,
    vmax = defaults.vmax,
    scale = 'linear',
    alpha = 0.7,
  } = opts;

  const t = normalize(value, vmin, vmax, scale);
  const [r, g, b] = paletteColor(t, palette);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`;
}

/**
 * Return a Cesium.Color from a variable value.
 * Requires Cesium to be imported by the caller.
 */
export function valueToCesiumColor(Cesium, value, variable = 'Temperature', opts = {}) {
  const defaults = DEFAULT_RANGES[variable] ?? DEFAULT_RANGES.Temperature;
  const {
    palette = 'thermal',
    vmin = defaults.vmin,
    vmax = defaults.vmax,
    scale = 'linear',
    alpha = 0.5,
  } = opts;

  const t = normalize(value, vmin, vmax, scale);
  const [r, g, b] = paletteColor(t, palette);
  return new Cesium.Color(r, g, b, alpha);
}

/**
 * Generate a CSS gradient string for a colorbar legend strip.
 */
export function buildGradient(paletteName = 'thermal') {
  const stops = PALETTES[paletteName] ?? PALETTES.thermal;
  const parts = stops.map(([pos, [r, g, b]]) => {
    const pct = Math.round(pos * 100);
    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)}) ${pct}%`;
  });
  return `linear-gradient(to right, ${parts.join(', ')})`;
}
