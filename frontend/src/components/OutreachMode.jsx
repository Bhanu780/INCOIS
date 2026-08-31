/**
 * OutreachMode — simplified public / education UI.
 *
 * Blueprint row 22: Public outreach / science communication / e-learning.
 * Preset views, guided tour, simplified controls for exhibitions.
 */

import { useState } from 'react';

const PRESETS = [
  {
    id: 'surface-temp',
    icon: '🌡️',
    label: 'Sea Surface Temperature',
    description: 'Colour shows how warm or cold the ocean surface is. Warm (red/yellow) near the equator, cool (blue) in the deep Arabian Sea.',
    variable: 'Temperature',
    depth: 0,
    renderMode: 'slice',
  },
  {
    id: 'deep-salinity',
    icon: '🧂',
    label: 'Deep Salinity',
    description: 'Salt content changes with depth. The Bay of Bengal (east) is fresher due to river runoff. The Arabian Sea (west) is saltier.',
    variable: 'Salinity',
    depth: 200,
    renderMode: 'slice',
  },
  {
    id: 'ocean-currents',
    icon: '🌊',
    label: 'Ocean Currents',
    description: 'Arrows show how water moves. Monsoon winds drive strong seasonal current reversals — unique to the Indian Ocean.',
    variable: 'Currents',
    depth: 0,
    renderMode: 'slice',
  },
  {
    id: '3d-thermocline',
    icon: '🏔️',
    label: '3D Thermocline',
    description: 'The thermocline is where temperature drops sharply with depth. Explore the full 3D volume — deeper layers are much colder.',
    variable: 'Temperature',
    depth: 100,
    renderMode: 'volumetric',
  },
  {
    id: 'argo-floats',
    icon: '🛟',
    label: 'Argo Float Network',
    description: 'These robotic floats drift with ocean currents, diving to 2 km and surfacing to beam data via satellite. Over 4000 are active globally.',
    variable: 'Temperature',
    depth: 0,
    renderMode: 'slice',
  },
];

const TOUR_STEPS = [
  {
    title: 'Welcome to the 3D Ocean',
    body: 'This platform shows real ocean data from the Arabian Sea and Bay of Bengal — the waters around India. You\'re looking at a live 3D view of the ocean.',
  },
  {
    title: 'Temperature',
    body: 'Colors show ocean temperature. Red and yellow mean warm (up to 30°C near the surface). Blue means cold — drop below 500 m and the ocean is near-freezing.',
  },
  {
    title: 'Argo Floats',
    body: 'The glowing dots are robotic floats. They sink to 2 km, drift for days, then rise again — measuring temperature and saltiness throughout the water column. Click one to see its data!',
  },
  {
    title: 'Salinity',
    body: 'The ocean isn\'t equally salty everywhere. The Bay of Bengal (east side) is fresher because rivers like the Ganga and Brahmaputra pour fresh water into it.',
  },
  {
    title: 'Why does this matter?',
    body: 'Understanding the ocean helps predict monsoons, guide fishing fleets, track typhoons, and understand climate change. Every measurement you see is real data from sensors in the ocean right now.',
  },
];

export default function OutreachMode({ onApplyPreset, onClose }) {
  const [tourStep, setTourStep] = useState(null); // null = not in tour
  const [activePreset, setActivePreset] = useState(null);

  function handlePreset(preset) {
    setActivePreset(preset.id);
    onApplyPreset?.(preset);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-ocean-600/40
                      bg-ocean-800/90 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-ocean-600/30 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🌏 Ocean Explorer</h1>
            <p className="text-xs text-ocean-400 mt-0.5">Science communication & outreach mode</p>
          </div>
          <button
            onClick={onClose}
            className="text-ocean-400 hover:text-white transition-colors p-1 rounded-lg
                       hover:bg-ocean-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        {tourStep !== null ? (
          /* ── Guided tour ── */
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= tourStep ? 'bg-accent-cyan' : 'bg-ocean-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-ocean-500 mb-4">
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </p>
            <h2 className="text-base font-bold text-white mb-2">
              {TOUR_STEPS[tourStep].title}
            </h2>
            <p className="text-sm text-ocean-300 leading-relaxed">
              {TOUR_STEPS[tourStep].body}
            </p>
            <div className="flex gap-3 mt-6">
              {tourStep > 0 && (
                <button
                  onClick={() => setTourStep((p) => p - 1)}
                  className="flex-1 py-2.5 rounded-lg border border-ocean-600/40
                             bg-ocean-700 text-ocean-200 text-sm hover:bg-ocean-600 transition-colors"
                >
                  ← Back
                </button>
              )}
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  onClick={() => setTourStep((p) => p + 1)}
                  className="flex-1 py-2.5 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40
                             text-accent-cyan font-semibold text-sm hover:bg-accent-cyan/30 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setTourStep(null)}
                  className="flex-1 py-2.5 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40
                             text-accent-cyan font-semibold text-sm hover:bg-accent-cyan/30 transition-colors"
                >
                  ✓ Done
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Preset views ── */
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Guided tour CTA */}
            <button
              onClick={() => setTourStep(0)}
              className="w-full py-3 rounded-xl border border-accent-cyan/30
                         bg-accent-cyan/10 text-accent-cyan font-semibold text-sm
                         hover:bg-accent-cyan/20 transition-all flex items-center justify-center gap-2"
            >
              <span>🧭</span> Take the Guided Tour
            </button>

            <p className="text-[11px] text-ocean-500 text-center uppercase tracking-wider">
              — or choose a preset view —
            </p>

            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                  ${activePreset === preset.id
                    ? 'border-accent-cyan/50 bg-accent-cyan/10'
                    : 'border-ocean-600/30 bg-ocean-700/40 hover:border-ocean-500 hover:bg-ocean-700'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">{preset.icon}</span>
                  <span className="font-semibold text-sm text-ocean-100">{preset.label}</span>
                  {activePreset === preset.id && (
                    <span className="ml-auto text-[10px] bg-accent-cyan/20 border border-accent-cyan/30
                                     text-accent-cyan px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>
                <p className="text-xs text-ocean-400 leading-relaxed pl-9">
                  {preset.description}
                </p>
              </button>
            ))}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg border border-ocean-600/40
                         bg-ocean-700/50 text-ocean-300 text-sm hover:bg-ocean-700 transition-colors"
            >
              Switch to Expert Mode →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
