import { bboxToRing, bboxCenter, bboxZoom } from '../utils/geoProjection';
import { getAnchor, anchorToBbox } from './tacticalAnchors';

/**
 * India-centric basin / sub-region catalogue (UI navigation + API bboxes).
 */

export const INDIA_PRESET = {
  id: 'india',
  label: 'India EEZ',
  bbox: { minLon: 68, maxLon: 97, minLat: 4, maxLat: 28 },
  camera: {
    center: bboxCenter({ minLon: 68, maxLon: 97, minLat: 4, maxLat: 28 }),
    zoom: 1,
  },
};

function sub(id, label, bbox, neonColor = '#22d3ee') {
  return {
    id,
    label,
    bbox,
    polygon: bboxToRing(bbox),
    neonColor,
    camera: { center: bboxCenter(bbox), zoom: bboxZoom(bbox) },
  };
}

function basin(id, label, bbox, fillColor, neonColor, subRegions) {
  return {
    id,
    label,
    bbox,
    polygon: bboxToRing(bbox),
    fillColor,
    neonColor,
    camera: { center: bboxCenter(bbox), zoom: bboxZoom(bbox) },
    subRegions,
  };
}

export const BASINS = [
  basin(
    'arabian-sea-basin',
    'Arabian Sea Basin',
    { minLon: 43, maxLon: 78, minLat: 5, maxLat: 30 },
    '#0c4a6e',
    '#22d3ee',
    [
      sub('lakshadweep-sea', 'Lakshadweep Sea', { minLon: 71.5, maxLon: 76.5, minLat: 8.0, maxLat: 14.0 }),
      sub('gulf-of-khambhat', 'Gulf of Khambhat', { minLon: 72.0, maxLon: 73.0, minLat: 20.5, maxLat: 22.3 }),
      sub('gulf-of-kachchh', 'Gulf of Kachchh', { minLon: 69.0, maxLon: 70.5, minLat: 22.2, maxLat: 23.0 }),
      sub('konkan-malabar-shelf', 'Konkan-Malabar Shelf', { minLon: 71.8, maxLon: 74.5, minLat: 10.0, maxLat: 20.0 }),
      sub('saurashtra-shelf', 'Saurashtra Shelf', { minLon: 68.5, maxLon: 72.0, minLat: 20.0, maxLat: 22.5 }),
      sub('gulf-of-oman', 'Gulf of Oman', { minLon: 56.0, maxLon: 61.5, minLat: 23.5, maxLat: 26.0 }, '#60a5fa'),
      sub('gulf-of-aden', 'Gulf of Aden', { minLon: 43.0, maxLon: 51.0, minLat: 11.0, maxLat: 14.0 }, '#60a5fa'),
    ],
  ),
  basin(
    'bay-of-bengal-basin',
    'Bay of Bengal Basin',
    { minLon: 78, maxLon: 98, minLat: 5, maxLat: 23 },
    '#1e3a5f',
    '#2dd4bf',
    [
      sub('coromandel-shelf', 'Coromandel Shelf', { minLon: 79.8, maxLon: 84.0, minLat: 12.0, maxLat: 18.0 }, '#2dd4bf'),
      sub('northern-bengal-shelf', 'Northern Bengal Shelf', { minLon: 85.0, maxLon: 89.0, minLat: 19.0, maxLat: 22.5 }, '#2dd4bf'),
      sub('swatch-of-no-ground', 'Swatch of No Ground (Underwater Canyon)', { minLon: 89.0, maxLon: 90.5, minLat: 21.0, maxLat: 21.8 }, '#f472b6'),
      sub('gulf-of-mannar', 'Gulf of Mannar', { minLon: 78.0, maxLon: 79.5, minLat: 7.5, maxLat: 9.2 }, '#2dd4bf'),
      sub('palk-bay', 'Palk Bay', { minLon: 79.0, maxLon: 80.3, minLat: 9.1, maxLat: 10.3 }, '#2dd4bf'),
      sub('gulf-of-martaban', 'Gulf of Martaban', { minLon: 96.0, maxLon: 98.0, minLat: 15.0, maxLat: 17.0 }, '#60a5fa'),
    ],
  ),
  basin(
    'andaman-nicobar-basin',
    'Andaman-Nicobar Basin',
    { minLon: 92, maxLon: 98, minLat: 4, maxLat: 15 },
    '#312e81',
    '#a78bfa',
    [
      sub('andaman-sea', 'Andaman Sea', { minLon: 92.0, maxLon: 94.5, minLat: 10.0, maxLat: 14.0 }, '#a78bfa'),
      sub('andaman-shelf', 'Andaman Shelf', { minLon: 92.5, maxLon: 93.5, minLat: 12.5, maxLat: 14.2 }, '#a78bfa'),
      sub('ten-degree-channel', 'Ten Degree Channel', { minLon: 92.0, maxLon: 94.0, minLat: 7.0, maxLat: 10.0 }, '#c4b5fd'),
      sub('sombrero-channel', 'Sombrero Channel', { minLon: 93.0, maxLon: 94.0, minLat: 7.5, maxLat: 8.5 }, '#c4b5fd'),
      sub('duncan-passage', 'Duncan Passage', { minLon: 92.3, maxLon: 93.0, minLat: 10.5, maxLat: 11.5 }, '#c4b5fd'),
    ],
  ),
];

export function getBasin(id) {
  return BASINS.find((b) => b.id === id) ?? null;
}

export function getSubRegion(basinId, subId) {
  const b = getBasin(basinId);
  return b?.subRegions.find((s) => s.id === subId) ?? null;
}

/** Cesium camera fly-to from a geographic bbox. */
export function bboxToCesiumView(bbox) {
  const center = bboxCenter(bbox);
  const span = Math.max(bbox.maxLon - bbox.minLon, bbox.maxLat - bbox.minLat);
  const height = Math.max(800_000, span * 200_000);
  return { longitude: center.lon, latitude: center.lat, height };
}

/** Active bbox — anchor > sub-region > basin > India preset. */
export function resolveActiveBbox(basinId, subRegionId, anchorId) {
  if (anchorId) {
    const anchor = getAnchor(anchorId);
    if (anchor) return anchorToBbox(anchor);
  }
  if (basinId && subRegionId) {
    const sub = getSubRegion(basinId, subRegionId);
    if (sub) return sub.bbox;
  }
  if (basinId) {
    const b = getBasin(basinId);
    if (b) return b.bbox;
  }
  return INDIA_PRESET.bbox;
}
