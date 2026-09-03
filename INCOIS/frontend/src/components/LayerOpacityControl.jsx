/**
 * LayerOpacityControl — per-layer opacity slider + toggle.
 *
 * The toggle uses explicit React state (showGrid prop) for inline styles
 * instead of Tailwind peer-checked classes, which can be unreliable in
 * Tailwind v4 when dynamic class names aren't in the content scan.
 */

export default function LayerOpacityControl({
  gridOpacity,
  onGridOpacityChange,
  showGrid,
  onShowGridChange,
  className = '',
}) {
  const trackBg    = showGrid ? 'rgba(34,211,238,0.25)' : '#1b2747';
  const trackBorder = showGrid ? 'rgba(34,211,238,0.5)' : '#243456';
  const knobBg     = showGrid ? '#22d3ee' : '#5a7aad';
  const knobShadow = showGrid ? '0 0 8px rgba(34,211,238,0.45)' : '0 0 6px rgba(0,0,0,0.3)';
  const knobX      = showGrid ? '18px' : '3px';

  return (
    <section className={className}>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-3">
        Layer Opacity
      </h2>

      {/* Grid Layer */}
      <div className="space-y-3">
        <div className="rounded-lg bg-ocean-700/50 border border-ocean-600/30 p-3">
          <div className="flex items-center justify-between mb-2">
            {/* Label — clicking it also toggles */}
            <label
              htmlFor="grid-opacity-toggle"
              className="flex items-center gap-2 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                style={{ color: showGrid ? '#22d3ee' : '#5a7aad' }}
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
              </svg>
              <span
                className="text-sm transition-colors"
                style={{ color: showGrid ? '#b8d4f0' : '#5a7aad' }}
              >
                Ocean Grid
              </span>
            </label>

            {/* Toggle — rendered with inline styles for reliability */}
            <button
              id="grid-opacity-toggle"
              type="button"
              role="switch"
              aria-checked={showGrid}
              onClick={() => onShowGridChange(!showGrid)}
              style={{
                position: 'relative',
                width: '36px',
                height: '20px',
                borderRadius: '9999px',
                background: trackBg,
                border: `1px solid ${trackBorder}`,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.25s, border-color 0.25s',
                outline: 'none',
                padding: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: knobX,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: knobBg,
                  boxShadow: knobShadow,
                  transition: 'left 0.25s, background 0.25s, box-shadow 0.25s',
                }}
              />
            </button>
          </div>

          {/* Opacity slider — only shown when grid is on */}
          {showGrid && (
            <div>
              <div className="flex justify-between items-center text-[10px] text-ocean-400 mb-1">
                <span>Opacity</span>
                <span className="text-accent-cyan font-semibold tabular-nums">{gridOpacity}%</span>
              </div>
              <input
                id="grid-opacity-slider"
                type="range"
                min={10}
                max={100}
                step={5}
                value={gridOpacity}
                onChange={(e) => onGridOpacityChange(Number(e.target.value))}
                className="w-full h-1 rounded bg-ocean-600 accent-[#22d3ee] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-ocean-600 mt-0.5">
                <span>Ghost</span>
                <span>Solid</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
