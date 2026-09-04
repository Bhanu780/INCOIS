/**
 * VerticalExaggerationControl — scales Z-axis (depth) of the whole scene.
 *
 * Blueprint row 14: Vertical exaggeration slider.
 * Extracted from Sidebar.jsx into a dedicated component.
 */

export default function VerticalExaggerationControl({
  verticalExaggeration,
  onVerticalExaggerationChange,
  className = '',
}) {
  const presets = [
    { label: '10×', value: 10 },
    { label: '50×', value: 50 },
    { label: '100×', value: 100 },
    { label: '200×', value: 200 },
    { label: '300×', value: 300 },
  ];

  return (
    <section className={className}>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-3">
        Vertical Exaggeration
      </h2>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-ocean-400">Scale factor</span>
        <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30
                         text-accent-cyan text-xs font-semibold tabular-nums">
          {verticalExaggeration}×
        </span>
      </div>

      {/* Slider */}
      <input
        id="exaggeration-slider"
        type="range"
        min={10}
        max={300}
        step={10}
        value={verticalExaggeration}
        onChange={(e) => onVerticalExaggerationChange(Number(e.target.value))}
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

      <div className="flex justify-between text-[10px] text-ocean-500 mt-1 px-0.5">
        <span>10× Subtle</span>
        <span>150×</span>
        <span>300× High</span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1 mt-2.5">
        {presets.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onVerticalExaggerationChange(value)}
            className={`flex-1 py-1 rounded text-[10px] font-semibold border transition-all
              ${verticalExaggeration === value
                ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
                : 'bg-ocean-700/50 border-ocean-600/30 text-ocean-400 hover:text-white hover:bg-ocean-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-ocean-500 text-center">
        {verticalExaggeration < 30
          ? 'True-scale depth columns'
          : verticalExaggeration > 150
          ? 'Strongly exaggerated — great for demos'
          : 'Moderate exaggeration'}
      </p>
    </section>
  );
}
