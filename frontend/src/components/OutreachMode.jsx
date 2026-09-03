/**
 * OutreachMode — Premium & minimal Ocean Explorer component.
 *
 * Provides curated preset views and a simple guided tour for
 * public outreach, science communication, and exhibitions.
 */

import { useState } from 'react';

const PRESETS = [
  {
    id: 'surface-temp',
    iconType: 'temp',
    label: 'Sea Surface Temperature',
    description: 'Visualizes thermal gradients across upper ocean layers.',
    variable: 'Temperature',
    depth: 0,
    renderMode: 'slice',
  },
  {
    id: 'deep-salinity',
    iconType: 'salinity',
    label: 'Salinity Distribution',
    description: 'Displays salt concentration differences influenced by evaporation and river runoff.',
    variable: 'Salinity',
    depth: 200,
    renderMode: 'slice',
  },
  {
    id: 'ocean-currents',
    iconType: 'currents',
    label: 'Surface Currents',
    description: 'Shows ocean current velocity magnitude and directional flow.',
    variable: 'Currents',
    depth: 0,
    renderMode: 'slice',
  },
  {
    id: '3d-thermocline',
    iconType: 'layers',
    label: '3D Thermocline Structure',
    description: 'Explores 3D temperature column layers from surface to deep water.',
    variable: 'Temperature',
    depth: 100,
    renderMode: 'volumetric',
  },
  {
    id: 'argo-floats',
    iconType: 'float',
    label: 'Argo Float Sentinel Array',
    description: 'Displays live positions of autonomous robotic floats measuring CTD profiles.',
    variable: 'Temperature',
    depth: 0,
    renderMode: 'slice',
  },
];

const TOUR_STEPS = [
  {
    title: 'Welcome to Apna Sagar',
    body: 'Apna Sagar is an interactive 3D ocean visualizer integrating real-time Argo float profiles (Argovis API) and Copernicus Marine Service (CMEMS) 3D gridded physical oceanography data.',
  },
  {
    title: '3D Ocean Grids',
    body: 'Colors represent oceanographic variables such as Temperature, Salinity, and Velocity. Use the sidebar controls to adjust depth levels, opacity, and rendering modes.',
  },
  {
    title: 'Live Argo Float Array',
    body: 'The glowing markers indicate active autonomous Argo floats. Click any float marker on the globe to open its live depth-vs-temperature/salinity profile chart.',
  },
  {
    title: 'Regional Ocean Basins',
    body: 'Use the Region Selector to focus on specific marine domains including the Arabian Sea, Bay of Bengal, Indian Ocean, Pacific, and Atlantic basins.',
  },
];

function PresetIcon({ type }) {
  switch (type) {
    case 'temp':
      return (
        <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      );
    case 'salinity':
      return (
        <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case 'currents':
      return (
        <svg className="w-4 h-4 text-teal-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M17 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'layers':
      return (
        <svg className="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'float':
      return (
        <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function OutreachMode({ onApplyPreset, onClose }) {
  const [tourStep, setTourStep] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  function handlePreset(preset) {
    setActivePreset(preset.id);
    onApplyPreset?.(preset);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7, 11, 22, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-ocean-600/40 bg-ocean-800/95 shadow-2xl overflow-hidden flex flex-col">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-ocean-600/30 flex items-center justify-between bg-ocean-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Ocean Explorer</h1>
              <p className="text-[11px] text-ocean-400">Curated oceanographic views & guided tour</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ocean-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-ocean-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        {/* ── Content Body ───────────────────────────────────── */}
        {tourStep !== null ? (
          /* Guided Tour View */
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-1.5 mb-2">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= tourStep ? 'bg-accent-cyan' : 'bg-ocean-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-ocean-400 uppercase tracking-widest font-semibold">
              Guide Step {tourStep + 1} of {TOUR_STEPS.length}
            </p>
            <h2 className="text-base font-bold text-white">
              {TOUR_STEPS[tourStep].title}
            </h2>
            <p className="text-xs text-ocean-300 leading-relaxed">
              {TOUR_STEPS[tourStep].body}
            </p>

            <div className="flex gap-3 pt-4">
              {tourStep > 0 && (
                <button
                  onClick={() => setTourStep((p) => p - 1)}
                  className="flex-1 py-2 rounded-lg border border-ocean-600/40 bg-ocean-700/60
                             text-xs font-semibold text-ocean-200 hover:bg-ocean-700 transition-colors"
                >
                  ← Back
                </button>
              )}
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  onClick={() => setTourStep((p) => p + 1)}
                  className="flex-1 py-2 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40
                             text-accent-cyan font-semibold text-xs hover:bg-accent-cyan/30 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setTourStep(null)}
                  className="flex-1 py-2 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40
                             text-accent-cyan font-semibold text-xs hover:bg-accent-cyan/30 transition-colors"
                >
                  Finish Tour
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Preset Views List */
          <div className="p-5 space-y-3.5 max-h-[65vh] overflow-y-auto">
            {/* Guided Tour Banner */}
            <button
              onClick={() => setTourStep(0)}
              className="w-full py-2.5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10
                         text-accent-cyan font-semibold text-xs hover:bg-accent-cyan/20 transition-all
                         flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Start Guided Tour</span>
            </button>

            <p className="text-[10px] text-ocean-400 text-center uppercase tracking-widest font-semibold pt-1">
              — Quick Preset Views —
            </p>

            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3
                  ${activePreset === preset.id
                    ? 'border-accent-cyan/50 bg-accent-cyan/10'
                    : 'border-ocean-600/30 bg-ocean-700/40 hover:border-ocean-500 hover:bg-ocean-700/70'}`}
              >
                <div className="mt-0.5">
                  <PresetIcon type={preset.iconType} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-ocean-100">{preset.label}</span>
                    {activePreset === preset.id && (
                      <span className="text-[9px] bg-accent-cyan/20 text-accent-cyan px-2 py-0.5 rounded-full border border-accent-cyan/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ocean-400 mt-0.5 leading-snug">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="p-3.5 border-t border-ocean-600/30 bg-ocean-900/40 flex justify-between items-center text-[11px]">
          <span className="text-ocean-400">INCOIS Ocean Data Platform</span>
          <button
            onClick={onClose}
            className="text-ocean-300 hover:text-white transition-colors"
          >
            Close & Explore Map →
          </button>
        </div>
      </div>
    </div>
  );
}
