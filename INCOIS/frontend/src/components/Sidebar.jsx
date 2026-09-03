import BasinSelector from './BasinSelector';
import useMapStore from '../stores/useMapStore';

const VARIABLES = ['Temperature', 'Salinity', 'Currents'];

export default function Sidebar({
  variable, onVariableChange,
  showFloats, onShowFloatsChange,
  colorbarConfig, onColorbarConfigChange,
  floatCount,
  floatsLoading = false,
  subRegionSelected = false,
  dataSourceStatus,
}) {
  const resetToIndia = useMapStore((s) => s.resetToIndia);

  return (
    <aside
      className="fixed inset-y-0 left-0 top-14 z-40 w-75 overflow-y-auto
                 border-r border-white/10 bg-ocean-900/95 shadow-[12px_0_36px_rgba(0,0,0,0.28)]
                 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 p-4 pb-8">

        {/* ── Basin / Sub-region Selector ────────────────────── */}
        <section>
          <SectionLabel>Sea Basin &amp; Sub-region</SectionLabel>
          <BasinSelector />
          <button
            type="button"
            onClick={resetToIndia}
            className="mt-2 w-full text-[11px] text-ocean-400 hover:text-accent-cyan transition-colors py-1"
          >
            Reset to India EEZ preset
          </button>
        </section>

        {/* ── Variable Selector ─────────────────────────────── */}
        <section>
          <SectionLabel>Variable</SectionLabel>

          <div className="relative rounded-xl border border-white/10 bg-ocean-800/70 p-2 shadow-inner shadow-black/10">
            <select
              id="variable-select"
              value={variable}
              onChange={(e) => onVariableChange(e.target.value)}
              className="w-full appearance-none rounded-lg bg-ocean-700 border border-ocean-600/50
                           text-sm text-ocean-100 px-3 py-2.5 pr-10
                         focus:outline-none focus:ring-2 focus:ring-accent-cyan/40
                         transition-colors cursor-pointer hover:bg-ocean-600"
            >
              {VARIABLES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Chevron icon */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path
                fillRule="evenodd" clipRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              />
            </svg>
          </div>

          {/* Active indicator pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-[11px] text-ocean-400">
              Showing <span className="text-ocean-200 font-medium">{variable}</span> layer
            </span>
          </div>
        </section>

        {/* ── Show Argo Floats Toggle ────────────────────────── */}
        <section>
          <SectionLabel>Argo Float Layer</SectionLabel>

          <label
            htmlFor="float-toggle"
            className="flex items-center justify-between gap-3 cursor-pointer group
                       rounded-lg bg-ocean-700/50 border border-ocean-600/30 px-4 py-3
                       hover:bg-ocean-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M12 11v8" strokeLinecap="round" />
                <path d="M9 15h6" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-ocean-200 group-hover:text-white transition-colors">
                Show Argo Floats
              </span>
            </div>

            {/* Toggle switch */}
            <div className="relative">
              <input
                id="float-toggle"
                type="checkbox"
                checked={showFloats}
                onChange={(e) => onShowFloatsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-10 h-5.5 rounded-full transition-colors duration-300
                           bg-ocean-600 peer-checked:bg-accent-teal/30
                           border border-ocean-500 peer-checked:border-accent-teal/50"
              />
              <div
                className="absolute top-0.75 left-0.75 w-4 h-4 rounded-full
                           bg-ocean-300 peer-checked:bg-accent-teal
                           peer-checked:translate-x-4.5
                           transition-all duration-300
                           shadow-[0_0_6px_rgba(0,0,0,0.3)]
                           peer-checked:shadow-[0_0_8px_rgba(45,212,191,0.4)]"
              />
            </div>
          </label>

          <p className="mt-2 text-[11px] text-ocean-500">
            {!subRegionSelected
              ? 'Select a sub-region to load geofenced Argo floats'
              : floatsLoading
                ? 'Loading floats for sub-region…'
                : showFloats
                  ? `${floatCount} float${floatCount === 1 ? '' : 's'} inside sub-region geofence`
                  : 'Float markers hidden'}
          </p>
        </section>

        {/* ── Data Source Status ────────────────────────── */}
        <section>
          <SectionLabel>Data Source</SectionLabel>
          <div className="rounded-xl border border-white/10 bg-ocean-800/70 p-3.5 text-xs text-ocean-300 shadow-inner shadow-black/10 space-y-2">
            {dataSourceStatus ? (
              <>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    dataSourceStatus.argovis?.data_source === 'argovis'
                      ? 'bg-green-400'
                      : dataSourceStatus.argovis?.data_source === 'cache'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  }`} />
                  <span className="text-ocean-200 font-medium">Argo Floats</span>
                </div>
                <p className="pl-4 text-ocean-400">
                  {dataSourceStatus.argovis?.data_source === 'argovis'
                    ? `Live from Argovis (${dataSourceStatus.argovis.float_count} floats)`
                    : dataSourceStatus.argovis?.data_source === 'cache'
                      ? `Cached data (${dataSourceStatus.argovis.float_count} floats)`
                      : 'No data available'
                  }
                </p>
                {dataSourceStatus.argovis?.last_fetch && (
                  <p className="pl-4 text-ocean-500">
                    Updated: {new Date(dataSourceStatus.argovis.last_fetch).toLocaleTimeString()}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    dataSourceStatus.cmems_cache_ready ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-ocean-200 font-medium">Ocean Grid</span>
                </div>
                <p className="pl-4 text-ocean-400">
                  {dataSourceStatus.cmems_cache_ready
                    ? `Loaded (${dataSourceStatus.grid_info?.variables?.join(', ') || 'data'})`
                    : 'Warming up...'}
                </p>
                {dataSourceStatus.grid_info?.last_refresh && (
                  <p className="pl-4 text-ocean-500">
                    Updated: {new Date(dataSourceStatus.grid_info.last_refresh).toLocaleTimeString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-ocean-500">Loading status...</p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

/* ── Reusable section heading ──────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ocean-400">
      {children}
    </h2>
  );
}
