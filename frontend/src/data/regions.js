/**
 * Named ocean regions with geographic bounding boxes and
 * Cesium camera fly-to parameters.
 *
 * bbox  — { minLon, maxLon, minLat, maxLat } in decimal degrees
 * cesiumView — { longitude, latitude, height } for camera.flyTo()
 */
export const REGIONS = [
  {
    id: 'global',
    label: 'Global Ocean',
    bbox: null,
    cesiumView: { longitude: 0, latitude: 20, height: 25_000_000 },
  },
  {
    id: 'arabian-sea',
    label: 'Arabian Sea',
    bbox: { minLon: 50, maxLon: 78, minLat: 5, maxLat: 30 },
    cesiumView: { longitude: 64, latitude: 17, height: 4_500_000 },
  },
  {
    id: 'bay-of-bengal',
    label: 'Bay of Bengal',
    bbox: { minLon: 78, maxLon: 100, minLat: 5, maxLat: 23 },
    cesiumView: { longitude: 89, latitude: 14, height: 3_500_000 },
  },
  {
    id: 'indian-ocean',
    label: 'Indian Ocean',
    bbox: { minLon: 20, maxLon: 120, minLat: -60, maxLat: 30 },
    cesiumView: { longitude: 70, latitude: -15, height: 14_000_000 },
  },
  {
    id: 'north-pacific',
    label: 'North Pacific',
    // 120°E → 120°W (crosses antimeridian); backend splits into two Argovis queries
    bbox: { minLon: 120, maxLon: -120, minLat: 0, maxLat: 65 },
    cesiumView: { longitude: 180, latitude: 35, height: 12_000_000 },
  },
  {
    id: 'north-atlantic',
    label: 'North Atlantic',
    bbox: { minLon: -80, maxLon: 20, minLat: 0, maxLat: 70 },
    cesiumView: { longitude: -30, latitude: 40, height: 11_000_000 },
  },
  {
    id: 'southern-ocean',
    label: 'Southern Ocean',
    bbox: { minLon: -180, maxLon: 180, minLat: -75, maxLat: -45 },
    cesiumView: { longitude: 0, latitude: -60, height: 18_000_000 },
  },
  {
    id: 'gulf-of-mexico',
    label: 'Gulf of Mexico',
    bbox: { minLon: -98, maxLon: -80, minLat: 18, maxLat: 31 },
    cesiumView: { longitude: -89, latitude: 25, height: 3_000_000 },
  },
  {
    id: 'mediterranean-sea',
    label: 'Mediterranean Sea',
    bbox: { minLon: -6, maxLon: 42, minLat: 30, maxLat: 47 },
    cesiumView: { longitude: 18, latitude: 38, height: 4_200_000 },
  },
];

/** Lookup a region by its id string. Falls back to 'global'. */
export function getRegion(id) {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
