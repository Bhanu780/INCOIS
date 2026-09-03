/**
 * Point-in-polygon geofencing utilities.
 * Polygons use [longitude, latitude] rings.
 */

export function polygonToBbox(ring) {
  if (!ring?.length) return null;
  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

/** Ray-casting point-in-polygon test. */
export function isPointInPolygon(lon, lat, ring) {
  if (!ring || ring.length < 3) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Keep only items whose lon/lat fall inside the polygon ring. */
export function filterByPolygon(items, ring, getLon, getLat) {
  if (!ring?.length) return [];
  return items.filter((item) => {
    const lon = getLon(item);
    const lat = getLat(item);
    if (lon == null || lat == null || Number.isNaN(lon) || Number.isNaN(lat)) {
      return false;
    }
    return isPointInPolygon(lon, lat, ring);
  });
}

export function filterArgoFloatsInPolygon(floats, ring) {
  return filterByPolygon(floats, ring, (f) => f.lon, (f) => f.lat);
}

/** Pad bbox for wider backend chunk requests. */
export function bboxWithPadding(bbox, pad = 0.75) {
  if (!bbox) return null;
  return {
    minLon: bbox.minLon - pad,
    maxLon: bbox.maxLon + pad,
    minLat: bbox.minLat - pad,
    maxLat: bbox.maxLat + pad,
  };
}

/**
 * Filter floats for a sub-region: strict polygon first, then bbox fallback
 * so fallback/demo floats still appear when polygon geometry is tight.
 */
export function filterArgoFloatsForSubRegion(floats, ring) {
  if (!ring?.length || !floats?.length) return [];

  const inPolygon = filterArgoFloatsInPolygon(floats, ring);
  if (inPolygon.length > 0) return inPolygon;

  const bbox = polygonToBbox(ring);
  if (!bbox) return [];

  return floats.filter(
    (f) =>
      f.lon >= bbox.minLon &&
      f.lon <= bbox.maxLon &&
      f.lat >= bbox.minLat &&
      f.lat <= bbox.maxLat,
  );
}
