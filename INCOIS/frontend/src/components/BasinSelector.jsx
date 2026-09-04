import useMapStore from '../stores/useMapStore';
import { BASINS } from '../data/indiaBasins';
import { ANCHOR_TYPE_LABELS } from '../data/tacticalAnchors';

/**
 * Hierarchical basin → sub-region → tactical anchor selector.
 */
export default function BasinSelector() {
  const selectedBasin = useMapStore((s) => s.selectedBasin);
  const selectedSubRegion = useMapStore((s) => s.selectedSubRegion);
  const selectedAnchor = useMapStore((s) => s.selectedAnchor);
  const selectBasin = useMapStore((s) => s.selectBasin);
  const selectSubRegion = useMapStore((s) => s.selectSubRegion);
  const selectAnchor = useMapStore((s) => s.selectAnchor);
  const resetToIndia = useMapStore((s) => s.resetToIndia);
  const getVisibleAnchors = useMapStore((s) => s.getVisibleAnchors);
  const getActiveAnchor = useMapStore((s) => s.getActiveAnchor);

  const activeBasin = BASINS.find((b) => b.id === selectedBasin);
  const anchors = getVisibleAnchors();
  const activeAnchor = getActiveAnchor();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <select
          id="basin-select"
          value={selectedBasin ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val) selectBasin(val);
            else resetToIndia();
          }}
          className="w-full appearance-none rounded-lg bg-ocean-700 border border-ocean-600/50
                     text-sm text-ocean-100 px-3 py-2.5 pr-8
                     focus:outline-none focus:ring-2 focus:ring-accent-cyan/40
                     transition-colors cursor-pointer hover:bg-ocean-600"
        >
          <option value="">🇮🇳 India (EEZ Overview)</option>
          {BASINS.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </div>

      {activeBasin && (
        <div className="relative">
          <select
            id="subregion-select"
            value={selectedSubRegion ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) selectSubRegion(val);
            }}
            className="w-full appearance-none rounded-lg bg-ocean-700/80 border border-ocean-600/50
                       text-sm text-ocean-100 px-3 py-2.5 pr-8
                       focus:outline-none focus:ring-2 focus:ring-accent-teal/40
                       transition-colors cursor-pointer hover:bg-ocean-600"
          >
            <option value="">Select sub-region…</option>
            {activeBasin.subRegions.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </div>
      )}

      {selectedSubRegion && anchors.length > 0 && (
        <div className="relative">
          <select
            id="anchor-select"
            value={selectedAnchor ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) selectAnchor(val);
            }}
            className="w-full appearance-none rounded-lg bg-ocean-700/80 border border-ocean-600/50
                       text-sm text-ocean-100 px-3 py-2.5 pr-8
                       focus:outline-none focus:ring-2 focus:ring-amber-400/40
                       transition-colors cursor-pointer hover:bg-ocean-600"
          >
            <option value="">Select tactical anchor…</option>
            {anchors.map((anchor) => (
              <option key={anchor.id} value={anchor.id}>{anchor.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </div>
      )}

      <div className="rounded-lg bg-ocean-700/40 border border-ocean-600/30 px-3 py-2 text-[11px] text-ocean-400 space-y-1">
        {activeBasin ? (
          <>
            <p>Basin: <span className="text-accent-cyan font-medium">{activeBasin.label}</span></p>
            {selectedSubRegion && (
              <p>Sub-region: <span className="text-accent-teal font-medium">
                {activeBasin.subRegions.find((s) => s.id === selectedSubRegion)?.label}
              </span></p>
            )}
            {activeAnchor && (
              <p>Anchor: <span className="text-amber-300 font-medium">{activeAnchor.label}</span>
                <span className="text-ocean-500"> · {ANCHOR_TYPE_LABELS[activeAnchor.type]}</span>
              </p>
            )}
            {selectedSubRegion && !selectedAnchor && (
              <p className="text-ocean-500 italic">{anchors.length} tactical anchors available — tap popup or map pins</p>
            )}
          </>
        ) : (
          <p className="text-ocean-500 italic">Preset view — India EEZ with neon borders</p>
        )}
      </div>
    </div>
  );
}
