import { REGIONS } from '../data/regions';

/**
 * RegionSelector — styled ocean-region dropdown.
 *
 * Matches the Variable selector design language:
 *   dark ocean-700 bg, accent-cyan focus ring, chevron icon.
 */
export default function RegionSelector({ selectedRegion, onRegionChange }) {
  const active = REGIONS.find((r) => r.id === selectedRegion) ?? REGIONS[0];
  const { bbox } = active;

  /** Format decimal degrees into a human-readable extent label. */
  function formatBbox(b) {
    if (!b) return null;
    const latStr = `${Math.abs(b.minLat)}°${b.minLat < 0 ? 'S' : 'N'}–${Math.abs(b.maxLat)}°${b.maxLat < 0 ? 'S' : 'N'}`;
    const lonNorm = (v) => {
      if (v > 180) v -= 360;
      return v < 0 ? `${Math.abs(v)}°W` : `${v}°E`;
    };
    const lonStr = `${lonNorm(b.minLon)}–${lonNorm(b.maxLon)}`;
    return `${latStr} | ${lonStr}`;
  }

  const bboxLabel = formatBbox(bbox);

  return (
    <div>
      {/* Dropdown row */}
      <div className="relative flex items-center gap-2">
        {/* Globe icon */}
        <svg
          className="shrink-0 w-4 h-4 text-accent-cyan"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        <div className="relative flex-1">
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="
              w-full appearance-none rounded-lg
              bg-ocean-700 border border-ocean-600/50
              text-sm text-ocean-100 px-3 py-2.5 pr-8
              focus:outline-none focus:ring-2 focus:ring-accent-cyan/40
              transition-colors cursor-pointer hover:bg-ocean-600
            "
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Chevron */}
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            />
          </svg>
        </div>
      </div>

      {/* Bbox caption */}
      <div className="mt-2 flex items-center gap-2 min-h-4">
        {bbox ? (
          <>
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse"
              style={{ background: 'var(--color-accent-cyan, #22d3ee)' }}
            />
            <span className="text-[11px] text-ocean-400 font-mono tracking-tight">
              {bboxLabel}
            </span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-ocean-500 shrink-0" />
            <span className="text-[11px] text-ocean-500 italic">Entire globe</span>
          </>
        )}
      </div>
    </div>
  );
}
