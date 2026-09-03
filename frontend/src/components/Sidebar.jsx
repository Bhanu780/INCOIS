import DepthSlider from './DepthSlider';
import LayerOpacityControl from './LayerOpacityControl';
import VerticalExaggerationControl from './VerticalExaggerationControl';
import RegionSelector from './RegionSelector';

const VARIABLES = ['Temperature', 'Salinity', 'Currents'];

export default function Sidebar({
  variable, onVariableChange,
  depthSlice, onDepthSliceChange,
  showFloats, onShowFloatsChange,
  showGrid, onShowGridChange,
  gridOpacity, onGridOpacityChange,
  renderMode, onRenderModeChange,
  verticalExaggeration, onVerticalExaggerationChange,
  colorbarConfig, onColorbarConfigChange,
  floatCount,
  dataSourceStatus,
  selectedRegion, onRegionChange,
}) {
  return (
    <aside
      className="fixed top-[56px] left-0 bottom-0 w-[300px] z-40 overflow-y-auto
                 bg-ocean-800/60 backdrop-blur-md border-r border-ocean-600/40"
    >
      <div className="p-5 flex flex-col gap-7">

        {/* ── Ocean Region Selector ──────────────────────────── */}
        <section>
          <SectionLabel>Ocean Region</SectionLabel>
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionChange={onRegionChange}
          />
        </section>

        {/* ── Variable Selector ─────────────────────────────── */}
        <section>
          <SectionLabel>Variable</SectionLabel>

          <div className="relative">
            <select
              id="variable-select"
              value={variable}
              onChange={(e) => onVariableChange(e.target.value)}
              className="w-full appearance-none rounded-lg bg-ocean-700 border border-ocean-600/50
                         text-sm text-ocean-100 px-4 py-2.5 pr-10
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

        {/* ── Render Mode Toggle ─────────────────────────────── */}
        <section>
          <SectionLabel>Visualization Mode</SectionLabel>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-ocean-700/50 border border-ocean-600/30">
            <button
              onClick={() => onRenderModeChange('volumetric')}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                renderMode === 'volumetric'
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-sm'
                  : 'text-ocean-300 hover:text-white hover:bg-ocean-600/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              3D Volumetric
            </button>
            <button
              onClick={() => onRenderModeChange('slice')}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                renderMode === 'slice'
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-sm'
                  : 'text-ocean-300 hover:text-white hover:bg-ocean-600/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3"></rect>
                <path d="M3 12h18"></path>
              </svg>
              2D Slice
            </button>
          </div>
        </section>

        {/* ── Vertical Exaggeration ──────────────────────────── */}
        {renderMode === 'volumetric' && (
          <VerticalExaggerationControl
            verticalExaggeration={verticalExaggeration}
            onVerticalExaggerationChange={onVerticalExaggerationChange}
          />
        )}

        {/* ── Depth Slider ───────────────────────────────────── */}
        <DepthSlider
          depthSlice={depthSlice}
          onDepthSliceChange={onDepthSliceChange}
        />

        {/* ── Layer Opacity ──────────────────────────────────── */}
        <LayerOpacityControl
          gridOpacity={gridOpacity}
          onGridOpacityChange={onGridOpacityChange}
          showGrid={showGrid}
          onShowGridChange={onShowGridChange}
        />

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
                className="w-10 h-[22px] rounded-full transition-colors duration-300
                           bg-ocean-600 peer-checked:bg-accent-teal/30
                           border border-ocean-500 peer-checked:border-accent-teal/50"
              />
              <div
                className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full
                           bg-ocean-300 peer-checked:bg-accent-teal
                           peer-checked:translate-x-[18px]
                           transition-all duration-300
                           shadow-[0_0_6px_rgba(0,0,0,0.3)]
                           peer-checked:shadow-[0_0_8px_rgba(45,212,191,0.4)]"
              />
            </div>
          </label>

          <p className="mt-2 text-[11px] text-ocean-500">
            {showFloats
              ? `${floatCount} floats visible on globe`
              : 'Float markers hidden'}
          </p>
        </section>

        {/* ── Data Source Status ────────────────────────── */}
        <section>
          <SectionLabel>Data Source</SectionLabel>
          <div className="rounded-xl bg-ocean-700/50 border border-ocean-600/30 p-3.5 text-xs text-ocean-300 space-y-2">
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
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-3">
      {children}
    </h2>
  );
}
