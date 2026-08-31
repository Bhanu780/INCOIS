import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CesiumMap from './components/CesiumMap';
import FloatProfilePanel from './components/FloatProfilePanel';
import ColorLegend from './components/ColorLegend';
import TimeSlider from './components/TimeSlider';
import OutreachMode from './components/OutreachMode';
import {
  fetchArgoFloats,
  fetchOceanGrid,
  fetchStatus,
} from './services/api';

export default function App() {
  // ── Core visualization state ──────────────────────────────────────────
  const [variable, setVariable]             = useState('Temperature');
  const [depthSlice, setDepthSlice]         = useState(0);
  const [showFloats, setShowFloats]         = useState(true);
  const [showGrid, setShowGrid]             = useState(true);
  const [gridOpacity, setGridOpacity]       = useState(30);
  const [renderMode, setRenderMode]         = useState('volumetric');
  const [verticalExaggeration, setVerticalExaggeration] = useState(100);
  const [currentTime, setCurrentTime]       = useState(null);

  // ── Colorbar config (palette, vmin, vmax, scale) ────────────────────
  const [colorbarConfig, setColorbarConfig] = useState({
    palette: 'thermal',
    vmin: null,
    vmax: null,
    scale: 'linear',
  });

  // ── Outreach mode ─────────────────────────────────────────────────────
  const [outreachOpen, setOutreachOpen] = useState(false);

  const handlePreset = useCallback((preset) => {
    setVariable(preset.variable);
    setDepthSlice(preset.depth);
    setRenderMode(preset.renderMode);
    setShowFloats(preset.id === 'argo-floats');
    setOutreachOpen(false);
  }, []);

  // ── Argo float data ───────────────────────────────────────────────────
  const [floats, setFloats] = useState([]);

  useEffect(() => {
    fetchArgoFloats()
      .then((data) => {
        console.log('Argo floats loaded:', data?.length || 0, 'floats');
        setFloats(data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch Argo floats:', err);
        setFloats([]);
      });
  }, []);

  // ── Ocean grid data ───────────────────────────────────────────────────
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    fetchOceanGrid()
      .then((data) => {
        console.log('Ocean grid loaded:', data?.length || 0, 'points');
        setGridData(data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch ocean grid:', err);
        setGridData([]);
      });
  }, []);

  // ── Status ────────────────────────────────────────────────────────────
  const [dataSourceStatus, setDataSourceStatus] = useState(null);

  useEffect(() => {
    fetchStatus()
      .then(setDataSourceStatus)
      .catch((err) => console.error('Failed to fetch status:', err));
  }, []);

  // ── Selected float for profile panel ─────────────────────────────────
  const [selectedFloat, setSelectedFloat] = useState(null);

  return (
    <>
      <Navbar onOutreachClick={() => setOutreachOpen(true)} />

      <Sidebar
        variable={variable}                         onVariableChange={setVariable}
        depthSlice={depthSlice}                     onDepthSliceChange={setDepthSlice}
        showFloats={showFloats}                     onShowFloatsChange={setShowFloats}
        showGrid={showGrid}                         onShowGridChange={setShowGrid}
        gridOpacity={gridOpacity}                   onGridOpacityChange={setGridOpacity}
        renderMode={renderMode}                     onRenderModeChange={setRenderMode}
        verticalExaggeration={verticalExaggeration} onVerticalExaggerationChange={setVerticalExaggeration}
        colorbarConfig={colorbarConfig}             onColorbarConfigChange={setColorbarConfig}
        floatCount={floats.length}
        dataSourceStatus={dataSourceStatus}
      />

      <CesiumMap
        floats={floats}
        showFloats={showFloats}
        onFloatClick={(id) => setSelectedFloat(id)}
        gridData={gridData}
        depthSlice={depthSlice}
        variable={variable}
        showGrid={showGrid}
        gridOpacity={gridOpacity}
        renderMode={renderMode}
        verticalExaggeration={verticalExaggeration}
        colorbarConfig={colorbarConfig}
        currentTime={currentTime}
      />

      <FloatProfilePanel
        floatId={selectedFloat}
        onClose={() => setSelectedFloat(null)}
      />

      <ColorLegend
        depthSlice={depthSlice}
        variable={variable}
        colorbarConfig={colorbarConfig}
      />

      {/* Time slider — fixed to bottom of the map area */}
      <div className="fixed bottom-4 right-4 z-30 w-72
                      bg-ocean-800/80 backdrop-blur-md rounded-xl
                      border border-ocean-600/40 p-4 shadow-xl">
        <TimeSlider
          onTimeChange={setCurrentTime}
          currentTime={currentTime}
        />
      </div>

      {/* Outreach mode overlay */}
      {outreachOpen && (
        <OutreachMode
          onApplyPreset={handlePreset}
          onClose={() => setOutreachOpen(false)}
        />
      )}
    </>
  );
}
