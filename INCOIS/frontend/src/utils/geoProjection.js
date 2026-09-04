/** Equirectangular projection centered on India (68°E–97°E, 4°N–37°N). */

export const PROJECTION = {
  centerLon: 78,
  centerLat: 20,
  scale: 3.8,
};

/** Convert [lon, lat] to scene [x, y] on the Z=0 plane. */
export function project(lon, lat, { centerLon, centerLat, scale } = PROJECTION) {
  return [
    (lon - centerLon) * scale,
    (lat - centerLat) * scale,
  ];
}

/** Convert a ring of [lon, lat] pairs to projected [x, y] pairs. */
export function projectRing(ring) {
  return ring.map(([lon, lat]) => project(lon, lat));
}

/** Bbox { minLon, maxLon, minLat, maxLat } → rectangular polygon ring. */
export function bboxToRing(bbox) {
  const { minLon, maxLon, minLat, maxLat } = bbox;
  return [
    [minLon, minLat],
    [maxLon, minLat],
    [maxLon, maxLat],
    [minLon, maxLat],
    [minLon, minLat],
  ];
}

/** Centroid of a bbox for camera focus and marker placement. */
export function bboxCenter(bbox) {
  return {
    lon: (bbox.minLon + bbox.maxLon) / 2,
    lat: (bbox.minLat + bbox.maxLat) / 2,
  };
}

/** Camera height (orthographic zoom) from bbox span in degrees. */
export function bboxZoom(bbox) {
  const span = Math.max(
    bbox.maxLon - bbox.minLon,
    bbox.maxLat - bbox.minLat,
  );
  if (span > 35) return 1;
  if (span > 20) return 1.6;
  if (span > 10) return 2.4;
  if (span > 5) return 3.2;
  return 4.2;
}
