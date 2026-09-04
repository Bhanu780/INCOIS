import useMapStore from '../stores/useMapStore';
import { BASINS } from '../data/indiaBasins';
import { ANCHOR_TYPE_COLORS, ANCHOR_TYPE_LABELS } from '../data/tacticalAnchors';

/**
 * Bottom-up search popup: basin → sub-region → tactical anchor.
 */
export default function BasinSearchPopup() {
  const popupExpanded = useMapStore((s) => s.popupExpanded);
  const selectedBasin = useMapStore((s) => s.selectedBasin);
  const selectedSubRegion = useMapStore((s) => s.selectedSubRegion);
  const selectedAnchor = useMapStore((s) => s.selectedAnchor);
  const anchorSearchQuery = useMapStore((s) => s.anchorSearchQuery);
  const mapView = useMapStore((s) => s.mapView);
  const togglePopup = useMapStore((s) => s.togglePopup);
  const selectBasin = useMapStore((s) => s.selectBasin);
  const selectSubRegion = useMapStore((s) => s.selectSubRegion);
  const selectAnchor = useMapStore((s) => s.selectAnchor);
  const setAnchorSearchQuery = useMapStore((s) => s.setAnchorSearchQuery);
  const resetToIndia = useMapStore((s) => s.resetToIndia);
  const getFilteredAnchors = useMapStore((s) => s.getFilteredAnchors);
  const getActiveAnchor = useMapStore((s) => s.getActiveAnchor);

  const activeBasin = BASINS.find((b) => b.id === selectedBasin);
  const activeSub = activeBasin?.subRegions.find((s) => s.id === selectedSubRegion);
  const activeAnchor = getActiveAnchor();
  const filteredAnchors = getFilteredAnchors();

  const showBasinPicker = !selectedBasin && (mapView === 'india' || popupExpanded);
  const showSubPicker = selectedBasin && !selectedSubRegion && (mapView === 'basin' || popupExpanded);
  const showAnchorPicker = selectedSubRegion && (mapView === 'subregion' || mapView === 'anchor' || popupExpanded);

  const breadcrumb = [
    activeBasin?.label,
    activeSub?.label,
    activeAnchor?.label,
  ].filter(Boolean).join(' → ');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center pl-0 sm:left-75 sm:pl-0">
      {!popupExpanded && (
        <button
          type="button"
          onClick={togglePopup}
          className="pointer-events-auto mb-0 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-white/10
                     bg-ocean-900/95 px-4 py-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl
                     text-sm text-ocean-200 hover:text-white hover:border-accent-cyan/40
                     transition-all duration-300 truncate"
        >
          <svg className="w-4 h-4 shrink-0 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="truncate">{breadcrumb || 'Select Sea Basin'}</span>
          <svg className="w-4 h-4 shrink-0 text-ocean-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M14.77 9.25a.75.75 0 011.06.02l4.25 4.5a.75.75 0 11-1.08 1.04L15 11.168l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </button>
      )}

      <div
        className={`pointer-events-auto mx-4 mb-3 w-full max-w-3xl overflow-hidden
              rounded-2xl border border-white/10 bg-ocean-900/95 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl
                    transition-all duration-500 ease-out
                    ${popupExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 h-0 border-0'}`}
      >
        {(activeBasin || activeSub || activeAnchor) && (
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-ocean-600/40 bg-ocean-900/50">
            {activeBasin && (
              <span className="inline-flex px-2.5 py-1 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-xs text-accent-cyan">
                {activeBasin.label}
              </span>
            )}
            {activeSub && (
              <span className="inline-flex px-2.5 py-1 rounded-full bg-accent-teal/15 border border-accent-teal/30 text-xs text-accent-teal">
                {activeSub.label}
              </span>
            )}
            {activeAnchor && (
              <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-xs text-amber-300">
                {activeAnchor.label}
              </span>
            )}
            <button
              type="button"
              onClick={resetToIndia}
              className="ml-auto text-[11px] text-ocean-500 hover:text-ocean-200 transition-colors"
            >
              Reset to India
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ocean-100">
              {showBasinPicker && 'Which sea basin?'}
              {showSubPicker && 'Select a sub-region'}
              {showAnchorPicker && 'Tactical Anchors — ports, harbors & stations'}
            </h3>
            <button
              type="button"
              onClick={togglePopup}
              className="p-1.5 rounded-lg text-ocean-400 hover:text-white hover:bg-ocean-700 transition-colors"
              aria-label="Collapse"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
          </div>

          {showBasinPicker && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BASINS.map((basin) => (
                <button
                  key={basin.id}
                  type="button"
                  onClick={() => selectBasin(basin.id)}
                  className="text-left p-4 rounded-xl border bg-ocean-700/50 border-ocean-600/40 hover:border-accent-cyan/30 hover:bg-ocean-700 transition-all"
                >
                  <p className="text-sm font-semibold text-ocean-100">{basin.label}</p>
                  <p className="mt-1 text-[11px] text-ocean-400">{basin.subRegions.length} sub-regions</p>
                </button>
              ))}
            </div>
          )}

          {showSubPicker && activeBasin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
              {activeBasin.subRegions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSubRegion(sub.id)}
                  className="text-left px-3 py-2.5 rounded-lg border text-xs bg-ocean-700/40 border-ocean-600/30 text-ocean-200 hover:border-accent-teal/30 transition-all"
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {showAnchorPicker && (
            <>
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={anchorSearchQuery}
                  onChange={(e) => setAnchorSearchQuery(e.target.value)}
                  placeholder="Search ports, naval bases, harbors…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ocean-700/80 border border-ocean-600/50
                             text-sm text-ocean-100 placeholder:text-ocean-500
                             focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
                {filteredAnchors.map((anchor) => (
                  <button
                    key={anchor.id}
                    type="button"
                    onClick={() => selectAnchor(anchor.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all
                      ${selectedAnchor === anchor.id
                        ? 'bg-amber-500/15 border-amber-400/40'
                        : 'bg-ocean-700/40 border-ocean-600/30 hover:border-accent-cyan/30'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full shrink-0"
                        style={{ background: ANCHOR_TYPE_COLORS[anchor.type] }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-ocean-100">{anchor.label}</p>
                        <p className="text-[10px] text-ocean-400 mt-0.5">
                          {ANCHOR_TYPE_LABELS[anchor.type]} · {anchor.lat.toFixed(3)}°N, {anchor.lon.toFixed(3)}°E
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {!filteredAnchors.length && (
                  <p className="text-xs text-ocean-500 italic py-4 text-center">No anchors match your search.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
