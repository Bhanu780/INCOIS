import * as Cesium from 'cesium';

function ringToPositions(ring) {
  const flat = ring.flatMap(([lon, lat]) => [lon, lat]);
  return Cesium.Cartesian3.fromDegreesArray(flat);
}

function neonBorderMaterial(colorHex, animated = true) {
  const base = Cesium.Color.fromCssColorString(colorHex);
  if (!animated) return new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.2, color: base });
  return new Cesium.PolylineGlowMaterialProperty({
    glowPower: 0.2,
    color: new Cesium.CallbackProperty(() => {
      const pulse = 0.55 + Math.sin(Date.now() * 0.003) * 0.35;
      return base.withAlpha(pulse);
    }, false),
  });
}

/** Draw geofence border for the active sub-region (outline only). */
export function syncSubRegionGeofence(viewer, borderCoordinates, { fillColor = '#22d3ee', visible = true } = {}) {
  const existing = [];
  viewer.entities.values.forEach((e) => {
    if (e._isSubRegionGeofence) existing.push(e);
  });
  existing.forEach((e) => viewer.entities.remove(e));

  if (!visible || !borderCoordinates?.length) return;

  const positions = ringToPositions(borderCoordinates);

  const border = viewer.entities.add({
    polyline: {
      positions,
      width: 3,
      clampToGround: true,
      material: neonBorderMaterial(fillColor),
    },
  });
  border._isSubRegionGeofence = true;
}
