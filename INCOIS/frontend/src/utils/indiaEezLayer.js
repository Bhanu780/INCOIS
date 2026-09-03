import * as Cesium from 'cesium';

const EEZ_FILL = '#0c2d6b';
const NEON_WHITE = '#ffffff';
const KML_URLS = [
  { url: '/data/MarineRegions-eez.kml', name: 'India EEZ' },
  { url: '/data/MarineRegions-eez-andaman.kml', name: 'Andaman-Nicobar EEZ' },
];

/** Pulsing glow material for neon edge. */
function neonGlowMaterial(baseAlpha = 1) {
  const base = Cesium.Color.fromCssColorString(NEON_WHITE);
  return new Cesium.PolylineGlowMaterialProperty({
    glowPower: 0.28,
    taperPower: 0.45,
    color: new Cesium.CallbackProperty(() => {
      const pulse = 0.5 + Math.sin(Date.now() * 0.0035) * 0.4;
      return base.withAlpha(baseAlpha * pulse);
    }, false),
  });
}

/** Sharp animated core stroke. */
function neonCoreMaterial(baseAlpha = 1) {
  const base = Cesium.Color.fromCssColorString(NEON_WHITE);
  return new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(() => {
      const pulse = 0.7 + Math.sin(Date.now() * 0.0035 + 0.6) * 0.25;
      return base.withAlpha(baseAlpha * pulse);
    }, false),
  );
}

/** Moving dash overlay for a travelling-light edge effect. */
function neonDashMaterial() {
  return new Cesium.PolylineDashMaterialProperty({
    color: new Cesium.CallbackProperty(() => {
      const pulse = 0.65 + Math.sin(Date.now() * 0.004) * 0.35;
      return Cesium.Color.fromCssColorString('#22d3ee').withAlpha(pulse);
    }, false),
    gapColor: Cesium.Color.TRANSPARENT,
    dashLength: new Cesium.CallbackProperty(() => {
      return 18 + Math.sin(Date.now() * 0.002) * 6;
    }, false),
  });
}

function addNeonBorder(viewer, positions, opacity = 1) {
  if (!positions || positions.length < 2) return [];

  const closed = [...positions];
  if (!Cesium.Cartesian3.equals(closed[0], closed[closed.length - 1])) {
    closed.push(closed[0]);
  }

  const tag = { _isEezBorder: true };

  const glow = viewer.entities.add({
    polyline: {
      positions: closed,
      width: 8,
      clampToGround: true,
      material: neonGlowMaterial(opacity),
    },
  });
  Object.assign(glow, tag);

  const dash = viewer.entities.add({
    polyline: {
      positions: closed,
      width: 3,
      clampToGround: true,
      material: neonDashMaterial(),
    },
  });
  Object.assign(dash, tag);

  const core = viewer.entities.add({
    polyline: {
      positions: closed,
      width: 1.5,
      clampToGround: true,
      material: neonCoreMaterial(opacity),
    },
  });
  Object.assign(core, tag);

  return [glow, dash, core];
}

function stylePolygonEntity(viewer, entity, borderEntities, fillOpacity) {
  if (!entity.polygon) return;

  const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
  if (!hierarchy?.positions?.length) return;

  entity.polygon.material = Cesium.Color.fromCssColorString(EEZ_FILL).withAlpha(fillOpacity);
  entity.polygon.outline = false;
  entity.polygon.height = 0;
  entity.polygon.classificationType = Cesium.ClassificationType.BOTH;

  borderEntities.push(...addNeonBorder(viewer, hierarchy.positions, 1));

  if (hierarchy.holes?.length) {
    hierarchy.holes.forEach((hole) => {
      if (hole.positions?.length) {
        borderEntities.push(...addNeonBorder(viewer, hole.positions, 0.55));
      }
    });
  }
}

/**
 * Load MarineRegions India EEZ KML onto the Cesium globe with deep-blue fill
 * and animated neon border edges. Returns cleanup fn.
 */
export async function loadIndiaEezLayer(viewer, { fillOpacity = 0.48 } = {}) {
  const borderEntities = [];
  const dataSources = await Promise.all(KML_URLS.map(async ({ url, name }) => {
    const dataSource = await Cesium.KmlDataSource.load(url, {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
    });

    dataSource.name = name;
    dataSource._isIndiaEez = true;
    viewer.dataSources.add(dataSource);

    dataSource.entities.values.forEach((entity) => {
      stylePolygonEntity(viewer, entity, borderEntities, fillOpacity);
    });

    dataSource.entities.collectionChanged.addEventListener((_col, added) => {
      added.forEach((entity) => {
        stylePolygonEntity(viewer, entity, borderEntities, fillOpacity);
      });
    });

    return dataSource;
  }));

  return () => {
    if (!viewer.isDestroyed()) {
      borderEntities.forEach((e) => viewer.entities.remove(e));
      dataSources.forEach((dataSource) => viewer.dataSources.remove(dataSource, true));
    }
  };
}

/** Fly camera to the KML LookAt / entity view. */
export function flyToIndiaEez(viewer, dataSource, { duration = 2.0 } = {}) {
  if (viewer.isDestroyed() || !dataSource) return;

  viewer.flyTo(dataSource.entities, {
    duration,
    offset: new Cesium.HeadingPitchRange(
      0,
      Cesium.Math.toRadians(-90),
      0,
    ),
  });
}
