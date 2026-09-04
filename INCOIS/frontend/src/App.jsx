import { useState, useEffect, useCallback } from 'react';

import Navbar from './components/Navbar';

import Sidebar from './components/Sidebar';

import CesiumMap from './components/CesiumMap';

import BasinSearchPopup from './components/BasinSearchPopup';

import FloatProfilePanel from './components/FloatProfilePanel';

import OutreachMode from './components/OutreachMode';

import useMapStore from './stores/useMapStore';

import {

  fetchArgoFloats,

  fetchStatus,

} from './services/api';

import { getSubRegionBorder } from './data/maritimeSubRegions';

import { polygonToBbox, bboxWithPadding, filterArgoFloatsForSubRegion } from './utils/geofence';



export default function App() {

  const [variable, setVariable]             = useState('Temperature');

  const [showFloats, setShowFloats]         = useState(true);

  const selectedBasin = useMapStore((s) => s.selectedBasin);

  const selectedSubRegion = useMapStore((s) => s.selectedSubRegion);

  const selectedAnchor = useMapStore((s) => s.selectedAnchor);

  const selectBasin = useMapStore((s) => s.selectBasin);

  const regionKey = `${selectedBasin ?? 'india'}-${selectedSubRegion ?? 'all'}-${selectedAnchor ?? 'none'}`;



  const [colorbarConfig, setColorbarConfig] = useState({

    palette: 'thermal',

    vmin: null,

    vmax: null,

    scale: 'linear',

  });



  const [outreachOpen, setOutreachOpen] = useState(false);



  const handlePreset = useCallback((preset) => {

    setVariable(preset.variable);

    setShowFloats(preset.id === 'argo-floats');

    if (preset.region) {

      selectBasin(preset.region === 'bay-of-bengal' ? 'bay-of-bengal-basin' : 'arabian-sea-basin');

    }

    setOutreachOpen(false);

  }, [selectBasin]);



  const [floats, setFloats] = useState([]);

  const [floatsLoading, setFloatsLoading] = useState(false);

  const [selectedFloat, setSelectedFloat] = useState(null);



  // Fetch Argo floats only when a sub-region is selected; geofence after bbox chunk fetch.
  useEffect(() => {

    if (!selectedBasin || !selectedSubRegion) {

      setFloats([]);

      return;

    }



    const border = getSubRegionBorder(selectedBasin, selectedSubRegion);

    if (!border) {

      setFloats([]);

      return;

    }



    const fetchBbox = bboxWithPadding(polygonToBbox(border), 0.75);
    if (!fetchBbox) {
      setFloats([]);
      return;
    }

    let cancelled = false;

    setFloatsLoading(true);



    fetchArgoFloats(180, true, fetchBbox)

      .then((data) => {

        if (cancelled) return;

        const filtered = filterArgoFloatsForSubRegion(data || [], border);

        console.log(

          'Argo floats in sub-region:',

          filtered.length,

          '/',

          data?.length ?? 0,

          'fetched in bbox chunk',

        );

        setFloats(filtered);

      })

      .catch((err) => {

        if (!cancelled) {

          console.error('Failed to fetch Argo floats:', err);

          setFloats([]);

        }

      })

      .finally(() => {

        if (!cancelled) setFloatsLoading(false);

      });



    return () => { cancelled = true; };

  }, [selectedBasin, selectedSubRegion]);



  // Clear float profile when sub-region changes
  useEffect(() => {
    setSelectedFloat(null);
  }, [selectedBasin, selectedSubRegion]);



  const [dataSourceStatus, setDataSourceStatus] = useState(null);



  useEffect(() => {

    fetchStatus()

      .then(setDataSourceStatus)

      .catch((err) => console.error('Failed to fetch status:', err));

  }, []);



  return (

    <>

      <Navbar onOutreachClick={() => setOutreachOpen(true)} />



      <Sidebar

        variable={variable}                         onVariableChange={setVariable}

        showFloats={showFloats}                     onShowFloatsChange={setShowFloats}
        colorbarConfig={colorbarConfig}             onColorbarConfigChange={setColorbarConfig}

        floatCount={floats.length}

        floatsLoading={floatsLoading}

        subRegionSelected={Boolean(selectedSubRegion)}

        dataSourceStatus={dataSourceStatus}

      />



      <CesiumMap

        floats={floats}

        showFloats={showFloats}

        onFloatClick={(id) => setSelectedFloat(id)}

        variable={variable}

        colorbarConfig={colorbarConfig}

      />



      <BasinSearchPopup />



      <FloatProfilePanel

        floatId={selectedFloat}

        variable={variable}

        onClose={() => setSelectedFloat(null)}

      />



      {outreachOpen && (

        <OutreachMode

          onApplyPreset={handlePreset}

          onClose={() => setOutreachOpen(false)}

        />

      )}

    </>

  );

}


