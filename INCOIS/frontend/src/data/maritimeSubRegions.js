/**
 * Maritime sub-region polygons for geofencing Argo floats.
 * borderCoordinates are [longitude, latitude] pairs (closed rings).
 */

export const MARITIME_SUB_REGIONS = {
  arabianSeaBasin: {
    name: 'Arabian Sea Basin',
    subRegions: [
      {
        id: 'lakshadweep_sea',
        name: 'Lakshadweep Sea',
        borderCoordinates: [
          [71.50, 14.00], [74.50, 14.00], [76.50, 10.00], [77.00, 8.00],
          [75.00, 8.00], [71.50, 10.50], [71.50, 14.00],
        ],
      },
      {
        id: 'gulf_of_khambhat',
        name: 'Gulf of Khambhat',
        borderCoordinates: [
          [72.10, 22.30], [72.95, 21.70], [72.75, 21.00], [72.50, 20.50],
          [72.00, 20.50], [72.15, 21.10], [72.10, 22.30],
        ],
      },
      {
        id: 'gulf_of_kachchh',
        name: 'Gulf of Kachchh',
        borderCoordinates: [
          [69.00, 22.50], [70.20, 23.00], [70.50, 22.80], [70.10, 22.30],
          [69.00, 22.20], [68.90, 22.35], [69.00, 22.50],
        ],
      },
      {
        id: 'konkan_malabar_shelf',
        name: 'Konkan-Malabar Shelf',
        borderCoordinates: [
          [72.50, 20.00], [73.00, 19.00], [73.80, 15.50], [74.80, 13.00],
          [76.30, 10.00], [74.00, 10.00], [71.80, 15.00], [72.00, 19.00],
          [72.50, 20.00],
        ],
      },
      {
        id: 'saurashtra_shelf',
        name: 'Saurashtra Shelf',
        borderCoordinates: [
          [68.50, 22.20], [70.00, 22.50], [72.20, 21.00], [72.00, 20.50],
          [71.00, 20.00], [69.00, 20.50], [68.50, 21.50], [68.50, 22.20],
        ],
      },
      {
        id: 'gulf_of_oman',
        name: 'Gulf of Oman',
        borderCoordinates: [
          [56.00, 26.00], [59.00, 25.50], [61.50, 25.00], [60.50, 23.50],
          [58.00, 23.50], [56.50, 24.50], [56.00, 26.00],
        ],
      },
      {
        id: 'gulf_of_aden',
        name: 'Gulf of Aden',
        borderCoordinates: [
          [43.00, 12.50], [45.00, 13.00], [49.00, 14.00], [51.00, 12.00],
          [47.00, 11.00], [43.50, 11.50], [43.00, 12.50],
        ],
      },
    ],
  },
  bayOfBengalBasin: {
    name: 'Bay of Bengal Basin',
    subRegions: [
      {
        id: 'coromandel_shelf',
        name: 'Coromandel Shelf',
        borderCoordinates: [
          [80.00, 13.00], [80.40, 14.50], [83.30, 17.70], [84.00, 18.00],
          [82.00, 15.00], [79.80, 12.00], [80.00, 13.00],
        ],
      },
      {
        id: 'northern_bengal_shelf',
        name: 'Northern Bengal Shelf',
        borderCoordinates: [
          [85.00, 19.50], [86.70, 20.30], [88.10, 22.00], [89.00, 21.50],
          [88.00, 20.00], [85.50, 19.00], [85.00, 19.50],
        ],
      },
      {
        id: 'swatch_of_no_ground',
        name: 'Swatch of No Ground',
        borderCoordinates: [
          [89.00, 21.80], [90.20, 21.80], [90.50, 21.00], [89.50, 21.00],
          [89.00, 21.30], [89.00, 21.80],
        ],
      },
      {
        id: 'gulf_of_mannar',
        name: 'Gulf of Mannar',
        borderCoordinates: [
          [78.00, 8.80], [79.20, 9.20], [79.50, 8.50], [78.50, 7.50],
          [78.00, 8.00], [78.00, 8.80],
        ],
      },
      {
        id: 'palk_bay',
        name: 'Palk Bay',
        borderCoordinates: [
          [79.00, 9.30], [80.00, 10.30], [80.30, 9.80], [79.50, 9.10],
          [79.00, 9.30],
        ],
      },
      {
        id: 'gulf_of_martaban',
        name: 'Gulf of Martaban',
        borderCoordinates: [
          [96.00, 16.80], [97.50, 16.50], [98.00, 15.00], [96.00, 15.00],
          [96.00, 16.80],
        ],
      },
    ],
  },
  andamanNicobarBasin: {
    name: 'Andaman-Nicobar Basin',
    subRegions: [
      {
        id: 'andaman_sea',
        name: 'Andaman Sea',
        borderCoordinates: [
          [92.00, 14.00], [94.50, 14.00], [94.00, 10.00], [92.00, 10.00],
          [92.00, 14.00],
        ],
      },
      {
        id: 'andaman_shelf',
        name: 'Andaman Shelf',
        borderCoordinates: [
          [92.50, 14.20], [93.50, 14.00], [93.20, 12.50], [92.50, 12.50],
          [92.50, 14.20],
        ],
      },
      {
        id: 'ten_degree_channel',
        name: 'Ten Degree Channel',
        borderCoordinates: [
          [92.00, 10.00], [94.00, 10.00], [94.00, 9.00], [92.00, 9.00],
          [92.00, 10.00],
        ],
      },
      {
        id: 'sombrero_channel',
        name: 'Sombrero Channel',
        borderCoordinates: [
          [93.00, 8.50], [94.00, 8.50], [94.00, 7.50], [93.00, 7.50],
          [93.00, 8.50],
        ],
      },
      {
        id: 'duncan_passage',
        name: 'Duncan Passage',
        borderCoordinates: [
          [92.30, 11.50], [93.00, 11.50], [93.00, 11.00], [92.30, 11.00],
          [92.30, 11.50],
        ],
      },
    ],
  },
};

/** Map indiaBasins kebab ids → MARITIME_SUB_REGIONS keys. */
export const BASIN_KEY_BY_ID = {
  'arabian-sea-basin': 'arabianSeaBasin',
  'bay-of-bengal-basin': 'bayOfBengalBasin',
  'andaman-nicobar-basin': 'andamanNicobarBasin',
};

/** Map indiaBasins sub-region ids → maritime snake_case ids. */
export const SUB_REGION_ID_MAP = {
  'lakshadweep-sea': 'lakshadweep_sea',
  'gulf-of-khambhat': 'gulf_of_khambhat',
  'gulf-of-kachchh': 'gulf_of_kachchh',
  'konkan-malabar-shelf': 'konkan_malabar_shelf',
  'saurashtra-shelf': 'saurashtra_shelf',
  'gulf-of-oman': 'gulf_of_oman',
  'gulf-of-aden': 'gulf_of_aden',
  'coromandel-shelf': 'coromandel_shelf',
  'northern-bengal-shelf': 'northern_bengal_shelf',
  'swatch-of-no-ground': 'swatch_of_no_ground',
  'gulf-of-mannar': 'gulf_of_mannar',
  'palk-bay': 'palk_bay',
  'gulf-of-martaban': 'gulf_of_martaban',
  'andaman-sea': 'andaman_sea',
  'andaman-shelf': 'andaman_shelf',
  'ten-degree-channel': 'ten_degree_channel',
  'sombrero-channel': 'sombrero_channel',
  'duncan-passage': 'duncan_passage',
};

export function getMaritimeSubRegion(basinId, subRegionId) {
  const basinKey = BASIN_KEY_BY_ID[basinId];
  const maritimeSubId = SUB_REGION_ID_MAP[subRegionId];
  if (!basinKey || !maritimeSubId) return null;

  const basin = MARITIME_SUB_REGIONS[basinKey];
  return basin?.subRegions.find((s) => s.id === maritimeSubId) ?? null;
}

export function getSubRegionBorder(basinId, subRegionId) {
  const sub = getMaritimeSubRegion(basinId, subRegionId);
  return sub?.borderCoordinates ?? null;
}
