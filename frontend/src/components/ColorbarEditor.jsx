/**
 * ColorbarEditor — palette selection, min/max override, log/linear scale.
 *
 * Blueprint row 11: Client-side control writing to a shared colormap util,
 * applied as a shader uniform — recoloring is instant, no backend round-trip.
 */

import { useState } from 'react';
import { PALETTE_NAMES, DEFAULT_RANGES, buildGradient } from '../utils/colormaps';

export default function ColorbarEditor({ variable, colorbarConfig, onConfigChange, className = '' }) {
  const defaults = DEFAULT_RANGES[variable] ?? DEFAULT_RANGES.Temperature;
  const cfg = colorbarConfig ?? {
    palette: 'thermal',
    vmin: defaults.vmin,
    vmax: defaults.vmax,
    scale: 'linear',
  };

  const [localMin, setLocalMin] = useState(String(cfg.vmin));
  const [localMax, setLocalMax] = useState(String(cfg.vmax));

  function update(patch) {
    onConfigChange?.({ ...cfg, ...patch });
  }

  function applyRange() {
    const vmin = parseFloat(localMin);
    const vmax = parseFloat(localMax);
    if (!isNaN(vmin) && !isNaN(vmax) && vmin < vmax) {
      update({ vmin, vmax });
    }
  }

  function resetRange() {
    const d = DEFAULT_RANGES[variable] ?? DEFAULT_RANGES.Temperature;
    setLocalMin(String(d.vmin));
    setLocalMax(String(d.vmax));
    update({ vmin: d.vmin, vmax: d.vmax });
  }

  // Re-sync local inputs when variable changes
  if (String(cfg.vmin) !== localMin && document.activeElement?.id !== 'cb-min') {
    setLocalMin(String(cfg.vmin));
  }
  if (String(cfg.vmax) !== localMax && document.activeElement?.id !== 'cb-max') {
    setLocalMax(String(cfg.vmax));
  }

  return (
    <section className={className}>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-3">
        Colorbar Editor
      </h2>

      {/* Gradient preview strip */}
      <div
        className="h-4 w-full rounded-md mb-2 shadow-sm ring-1 ring-white/10"
        style={{ background: buildGradient(cfg.palette) }}
        aria-label={`${cfg.palette} palette preview`}
      />

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] text-ocean-400 mb-3 px-0.5">
        <span>{cfg.vmin} {defaults.unit}</span>
        <span>{cfg.vmax} {defaults.unit}</span>
      </div>

      {/* Palette selector */}
      <div className="mb-3">
        <p className="text-[10px] text-ocean-400 mb-1.5 uppercase tracking-wider">Palette</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PALETTE_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => update({ palette: name })}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border
                          transition-all text-[10px] font-semibold
                          ${cfg.palette === name
                            ? 'border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan'
                            : 'border-ocean-600/30 bg-ocean-700/40 text-ocean-400 hover:border-ocean-500 hover:text-ocean-200'}`}
            >
              <div
                className="w-full h-2.5 rounded"
                style={{ background: buildGradient(name) }}
              />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Min / Max override */}
      <div className="mb-3">
        <p className="text-[10px] text-ocean-400 mb-1.5 uppercase tracking-wider">Range</p>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label htmlFor="cb-min" className="text-[9px] text-ocean-500 block mb-0.5">Min</label>
            <input
              id="cb-min"
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={applyRange}
              onKeyDown={(e) => e.key === 'Enter' && applyRange()}
              className="w-full bg-ocean-700 border border-ocean-600/40 rounded px-2 py-1
                         text-xs text-ocean-100 focus:outline-none focus:ring-1 focus:ring-accent-cyan/40"
            />
          </div>
          <span className="text-ocean-500 text-xs mt-3">–</span>
          <div className="flex-1">
            <label htmlFor="cb-max" className="text-[9px] text-ocean-500 block mb-0.5">Max</label>
            <input
              id="cb-max"
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={applyRange}
              onKeyDown={(e) => e.key === 'Enter' && applyRange()}
              className="w-full bg-ocean-700 border border-ocean-600/40 rounded px-2 py-1
                         text-xs text-ocean-100 focus:outline-none focus:ring-1 focus:ring-accent-cyan/40"
            />
          </div>
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <button
            onClick={applyRange}
            className="flex-1 py-1 rounded text-[10px] bg-accent-cyan/10 border border-accent-cyan/30
                       text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={resetRange}
            className="flex-1 py-1 rounded text-[10px] bg-ocean-700 border border-ocean-600/30
                       text-ocean-400 hover:text-white hover:bg-ocean-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Log / Linear toggle */}
      <div>
        <p className="text-[10px] text-ocean-400 mb-1.5 uppercase tracking-wider">Scale</p>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-ocean-700/50 border border-ocean-600/30">
          {['linear', 'log'].map((s) => (
            <button
              key={s}
              onClick={() => update({ scale: s })}
              className={`py-1.5 rounded-md text-xs font-semibold transition-all
                ${cfg.scale === s
                  ? 'bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan shadow-sm'
                  : 'text-ocean-300 hover:text-white hover:bg-ocean-600/40'}`}
            >
              {s === 'linear' ? '⟶ Linear' : '⌇ Log'}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
