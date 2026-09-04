import { useMemo } from 'react';
import { DEFAULT_RANGES, buildGradient } from '../utils/colormaps';

export default function ColorLegend({ depthSlice = 0, variable = 'Temperature', colorbarConfig }) {
  const defaults = DEFAULT_RANGES[variable] ?? DEFAULT_RANGES.Temperature;

  const vmin = colorbarConfig?.vmin ?? defaults.vmin;
  const vmax = colorbarConfig?.vmax ?? defaults.vmax;
  const palette = colorbarConfig?.palette ?? 'thermal';
  const unit = defaults.unit;

  const gradient = useMemo(() => {
    return buildGradient(palette);
  }, [palette]);

  return (
    <div
      className="fixed bottom-[224px] right-4 z-30 w-72
                 bg-ocean-800/80 backdrop-blur-md rounded-xl
                 border border-ocean-600/40 p-4 shadow-xl text-ocean-100 font-sans"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ocean-400">
          {variable} Legend
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan font-semibold">
          {depthSlice} m
        </span>
      </div>

      {/* ── Gradient bar ────────────────────────────────────────── */}
      <div
        className="h-3.5 rounded-md border border-white/10 shadow-inner mb-2"
        style={{ background: gradient }}
      />

      {/* ── Min / Max labels ────────────────────────────────────── */}
      <div className="flex justify-between items-center text-xs font-semibold text-ocean-300">
        <span>{vmin} {unit}</span>
        <span className="text-[10px] font-normal text-ocean-500">{palette}</span>
        <span>{vmax} {unit}</span>
      </div>
    </div>
  );
}
