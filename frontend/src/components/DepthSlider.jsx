/**
 * DepthSlider — depth-slice navigation component.
 *
 * Blueprint row 5: Depth-slice views.
 * Extracted from Sidebar.jsx into a reusable standalone component.
 */

export default function DepthSlider({ depthSlice, onDepthSliceChange, className = '' }) {
  const ticks = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return (
    <section className={className}>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-3">
        Depth Slice
      </h2>

      {/* Current value badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-ocean-400">Surface</span>
        <span className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30
                         text-accent-cyan text-sm font-semibold tabular-nums">
          {depthSlice} m
        </span>
        <span className="text-xs text-ocean-400">1 000 m</span>
      </div>

      {/* Range slider */}
      <input
        id="depth-slider"
        type="range"
        min={0}
        max={1000}
        step={50}
        value={depthSlice}
        onChange={(e) => onDepthSliceChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer
                   bg-ocean-600 accent-[#22d3ee]
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent-cyan
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.5)]
                   [&::-webkit-slider-thumb]:transition-transform
                   [&::-webkit-slider-thumb]:hover:scale-125"
      />

      {/* Depth preset buttons */}
      <div className="grid grid-cols-5 gap-1 mt-2.5">
        {[0, 100, 200, 500, 1000].map((d) => (
          <button
            key={d}
            onClick={() => onDepthSliceChange(d)}
            className={`py-1 rounded text-[10px] font-semibold transition-all border
              ${depthSlice === d
                ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
                : 'bg-ocean-700/50 border-ocean-600/30 text-ocean-400 hover:text-white hover:bg-ocean-700'}`}
          >
            {d}m
          </button>
        ))}
      </div>

      {/* Tick progression bar */}
      <div className="flex justify-between mt-2 px-0.5">
        {ticks.map((d) => (
          <span
            key={d}
            className={`w-0.5 rounded-full transition-all duration-200 ${
              d <= depthSlice ? 'h-2 bg-accent-cyan/60' : 'h-1.5 bg-ocean-600'
            }`}
          />
        ))}
      </div>

      <p className="mt-2 text-[10px] text-ocean-500 text-center">
        {depthSlice === 0 ? 'Sea surface' : `${depthSlice} m below surface`}
      </p>
    </section>
  );
}
