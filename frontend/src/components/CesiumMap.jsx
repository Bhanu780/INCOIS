import { useEffect, useRef, useMemo } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Use Cesium Ion access token
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlhDRER6ZEdaMFNZXzF4VEoiLCJqdGkiOiI2MjdlNjIwYS0wODI3LTRhOWQtOTZmMi0yMWY4NThhNzNlOWQiLCJpZCI6NDcxNzI1LCJzdWIiOiJCaGFudSBQcmF0YXAgU2luZ2giLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoiQmhhbnUgUHJhdGFwIFNpbmdoX2RlZmF1bHQiLCJpYXQiOjE3ODc2Njk0NzZ9.u90RiO4PJesAeoFXPZrGysSb3to1bbPngSBDdUBMjXY';

// ── Variable Color Mappers ───────────────────────────────────────────
function variableToColor(val, variable, alpha = 0.3) {
  let min = 2, max = 29;
  let r = 0, g = 0, b = 0;

  if (variable === 'Salinity') {
    min = 33.0; max = 37.0;
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    if (t < 0.33) {
      const s = t / 0.33;
      r = 120 - s * 100; g = 40 + s * 160; b = 200 + s * 20;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      r = 20 + s * 100; g = 200 + s * 30; b = 220 - s * 160;
    } else {
      const s = (t - 0.66) / 0.34;
      r = 120 + s * 135; g = 230 + s * 20; b = 60 - s * 60;
    }
  } else if (variable === 'Currents') {
    min = 0.05; max = 1.8;
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    if (t < 0.33) {
      const s = t / 0.33;
      r = 10; g = 150 + s * 80; b = 180 + s * 50;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      r = 10 + s * 235; g = 230 - s * 100; b = 230 - s * 210;
    } else {
      const s = (t - 0.66) / 0.34;
      r = 245 + s * 10; g = 130 - s * 100; b = 20 - s * 20;
    }
  } else {
    min = 2; max = 29;
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    if (t < 0.33) {
      const s = t / 0.33;
      r = 0; g = s * 200; b = 180 + s * 55;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      r = s * 255; g = 200 + s * 55; b = 235 - s * 235;
    } else {
      const s = (t - 0.66) / 0.34;
      r = 255; g = 255 - s * 200; b = 0;
    }
  }

  return new Cesium.Color(r / 255, g / 255, b / 255, alpha);
}

function getVariableValue(pt, variable, currentTime) {
  let val;
  let unit = '°C';

  if (variable === 'Salinity') {
    val = pt.salinity;
    unit = 'PSU';
  } else if (variable === 'Currents') {
    val = pt.currents;
    unit = 'm/s';
  } else {
    val = pt.temp;
    unit = '°C';
  }

  // Apply subtle time-phase modulation for smooth time-series animation
  if (val !== null && val !== undefined && !Number.isNaN(val) && currentTime) {
    const tMs = typeof currentTime === 'number' ? currentTime : new Date(currentTime).getTime();
    const hours = tMs / (1000 * 3600);
    const phaseShift = Math.sin(pt.lat * 0.3 + pt.lon * 0.4 + hours * 0.5) * 0.8;
    val = Math.round((val + phaseShift) * 100) / 100;
  }

  return { val, unit };
}

export default function CesiumMap({
  floats = [],
  showFloats = true,
  onFloatClick,
  gridData = [],
  depthSlice = 0,
  variable = 'Temperature',
  showGrid = true,
  gridOpacity = 30,
  verticalExaggeration = 100,
  renderMode = 'volumetric',
  colorbarConfig,
  currentTime,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // ── Initialise Cesium Viewer (once) ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      creditContainer: document.createElement('div'),
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere.brightnessShift = -0.2;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(75, 12, 3_800_000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
    });

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // ── Click handler for float markers ──────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id._isArgoFloat) {
        onFloatClick?.(picked.id.name);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => handler.destroy();
  }, [onFloatClick]);

  // ── Sync Argo-float entities with props ──────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const toRemove = [];
    viewer.entities.values.forEach((entity) => {
      if (entity._isArgoFloat) toRemove.push(entity);
    });
    toRemove.forEach((e) => viewer.entities.remove(e));

    if (!showFloats) return;

    floats.forEach((f) => {
      const isActive = f.status === 'active';

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 100),
        name: f.id,

        point: {
          pixelSize: isActive ? 14 : 9,
          color: isActive
            ? Cesium.Color.fromCssColorString('#2dd4bf')
            : Cesium.Color.fromCssColorString('#94a3b8'),
          outlineColor: isActive
            ? Cesium.Color.fromCssColorString('#2dd4bf').withAlpha(0.4)
            : Cesium.Color.TRANSPARENT,
          outlineWidth: isActive ? 6 : 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },

        label: {
          text: f.id,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#0a0e1a'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#0f1629').withAlpha(0.85),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
        },
      });

      entity._isArgoFloat = true;
    });
  }, [floats, showFloats]);

  // ── Compute the closest available depth for slice mode / highlight ──
  const { highlightDepth, allDepths } = useMemo(() => {
    if (!gridData.length) return { highlightDepth: 0, allDepths: [] };
    const depths = [...new Set(gridData.map((p) => p.depth))].sort((a, b) => a - b);
    if (!depths.length) return { highlightDepth: 0, allDepths: [] };

    let closest = depths[0];
    let minDiff = Math.abs(depthSlice - closest);
    for (const d of depths) {
      const diff = Math.abs(depthSlice - d);
      if (diff < minDiff) { closest = d; minDiff = diff; }
    }
    return { highlightDepth: closest, allDepths: depths };
  }, [gridData, depthSlice]);

  // ── Filtered grid for slice mode ──────────────────────────────────
  const filteredGrid = useMemo(() => {
    if (!gridData.length) return [];
    return gridData.filter((p) => p.depth === highlightDepth);
  }, [gridData, highlightDepth]);

  // ── Grid bounds derived from data ─────────────────────────────────
  const gridBounds = useMemo(() => {
    if (!gridData.length) return null;
    const lats = gridData.map((p) => p.lat);
    const lons = gridData.map((p) => p.lon);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    };
  }, [gridData]);

  // ── Column groups for volumetric mode ─────────────────────────────
  const columnGroups = useMemo(() => {
    if (!gridData.length) return {};
    const groups = {};
    gridData.forEach((pt) => {
      const key = `${pt.lat},${pt.lon}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(pt);
    });
    // Sort each column by depth ascending
    Object.values(groups).forEach((col) => col.sort((a, b) => a.depth - b.depth));
    return groups;
  }, [gridData]);

  // ── Master grid rendering effect (both modes) ─────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // ── Cleanup all previous grid visuals ──
    const toRemove = [];
    viewer.entities.values.forEach((entity) => {
      if (entity._isGridCell) toRemove.push(entity);
    });
    toRemove.forEach((e) => viewer.entities.remove(e));

    // Only return early if showGrid is false
    // Allow rendering when showGrid is true, even if gridData is temporarily empty
    if (!showGrid) return;
    
    if (!gridData || !gridData.length) return;

    const alpha = (gridOpacity / 100) * 0.85;
    const VE = verticalExaggeration;

    if (renderMode === 'volumetric') {
      // ─────────────────────────────────────────────────────────────
      //  VOLUMETRIC MODE — 3D point cloud + columns + depth planes
      // ─────────────────────────────────────────────────────────────

      // 1) Render every grid point as a 3D coloured point
      gridData.forEach((pt) => {
        const altitude = pt.depth * VE;
        const { val, unit } = getVariableValue(pt, variable, currentTime);
        const isHighlighted = pt.depth === highlightDepth;
        const pointAlpha = isHighlighted ? Math.min(1, alpha + 0.25) : alpha * 0.6;
        // Grey out points with missing data
        const hasData = val !== null && val !== undefined && !Number.isNaN(val);
        const color = hasData
          ? variableToColor(val, variable, pointAlpha)
          : Cesium.Color.fromCssColorString('#64748b').withAlpha(pointAlpha * 0.4);
        const label = hasData
          ? `${pt.lat}°N, ${pt.lon}°E @ ${pt.depth}m — ${variable}: ${val} ${unit}`
          : `${pt.lat}°N, ${pt.lon}°E @ ${pt.depth}m — ${variable}: No data`;

        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, altitude),
          name: label,
          point: {
            pixelSize: isHighlighted ? 13 : 7,
            color,
            outlineColor: isHighlighted
              ? Cesium.Color.WHITE.withAlpha(0.6)
              : Cesium.Color.TRANSPARENT,
            outlineWidth: isHighlighted ? 2 : 0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        entity._isGridCell = true;
      });

      // 2) Vertical column connectors — thin lines linking depths at each lat/lon
      Object.values(columnGroups).forEach((column) => {
        if (column.length < 2) return;
        const positions = column.map((pt) =>
          Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, pt.depth * VE)
        );
        const entity = viewer.entities.add({
          polyline: {
            positions,
            width: 1.5,
            material: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        entity._isGridCell = true;
      });

      // 3) Semi-transparent depth reference planes
      if (gridBounds) {
        const PAD = 1.5; // padding around data bounds
        const { minLat, maxLat, minLon, maxLon } = gridBounds;

        allDepths.forEach((d) => {
          const alt = d * VE;
          const isActive = d === highlightDepth;
          const planeAlpha = isActive ? 0.12 : 0.04;
          const outlineAlpha = isActive ? 0.4 : 0.12;

          const entity = viewer.entities.add({
            name: `Depth plane: ${d} m`,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray([
                minLon - PAD, minLat - PAD,
                maxLon + PAD, minLat - PAD,
                maxLon + PAD, maxLat + PAD,
                minLon - PAD, maxLat + PAD,
              ]),
              height: alt,
              material: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(planeAlpha),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(outlineAlpha),
            },
          });
          entity._isGridCell = true;
        });
      }

      // 4) Depth axis labels along the left edge of the region
      if (gridBounds) {
        const labelLon = gridBounds.minLon - 2.5;
        const labelLat = (gridBounds.minLat + gridBounds.maxLat) / 2;

        allDepths.forEach((d) => {
          const alt = d * VE;
          const isActive = d === highlightDepth;
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(labelLon, labelLat, alt),
            label: {
              text: `${d} m`,
              font: `${isActive ? 'bold' : 'normal'} 12px Inter, sans-serif`,
              fillColor: isActive
                ? Cesium.Color.fromCssColorString('#22d3ee')
                : Cesium.Color.fromCssColorString('#94a3b8'),
              outlineColor: Cesium.Color.fromCssColorString('#0a0e1a'),
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('#0f1629').withAlpha(0.8),
              backgroundPadding: new Cesium.Cartesian2(7, 4),
              scale: isActive ? 1.1 : 0.85,
            },
          });
          entity._isGridCell = true;
        });
      }

    } else {
      // ─────────────────────────────────────────────────────────────
      //  SLICE MODE — flat 2D rectangles at one depth (original)
      // ─────────────────────────────────────────────────────────────
      const HALF = 0.85;
      const sliceAlpha = (gridOpacity / 100) * 0.7;

      filteredGrid.forEach((pt) => {
        const west = pt.lon - HALF;
        const east = pt.lon + HALF;
        const south = pt.lat - HALF;
        const north = pt.lat + HALF;

        const { val, unit } = getVariableValue(pt, variable, currentTime);
        const hasData = val !== null && val !== undefined && !Number.isNaN(val);
        const color = hasData
          ? variableToColor(val, variable, sliceAlpha)
          : Cesium.Color.fromCssColorString('#64748b').withAlpha(sliceAlpha * 0.3);
        const label = hasData
          ? `Grid ${pt.lat}°, ${pt.lon}° @ ${pt.depth}m — ${variable}: ${val} ${unit}`
          : `Grid ${pt.lat}°, ${pt.lon}° @ ${pt.depth}m — ${variable}: No data`;

        const entity = viewer.entities.add({
          name: label,
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
            material: color,
            height: 100,
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(
              Math.min(0.5, sliceAlpha + 0.1)
            ),
            outlineWidth: 1,
          },
        });
        entity._isGridCell = true;
      });
    }
  }, [
    gridData, filteredGrid, columnGroups, gridBounds, allDepths, highlightDepth,
    variable, showGrid, gridOpacity, renderMode, verticalExaggeration, depthSlice,
    currentTime,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed top-[56px] left-[300px] right-0 bottom-0"
      style={{ overflow: 'hidden' }}
    />
  );
}
