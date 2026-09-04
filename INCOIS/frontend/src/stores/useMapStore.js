import { create } from 'zustand';
import {
  INDIA_PRESET,
  BASINS,
  getBasin,
  getSubRegion,
  resolveActiveBbox,
  bboxToCesiumView,
} from '../data/indiaBasins';
import {
  getAnchor,
  getAnchorsForSubRegion,
  searchAnchors,
  coordsToCesiumView,
} from '../data/tacticalAnchors';

const useMapStore = create((set, get) => ({
  selectedBasin: null,
  selectedSubRegion: null,
  selectedAnchor: null,
  popupExpanded: false,
  anchorSearchQuery: '',
  mapView: 'india', // 'india' | 'basin' | 'subregion' | 'anchor'

  resetToIndia: () =>
    set({
      selectedBasin: null,
      selectedSubRegion: null,
      selectedAnchor: null,
      mapView: 'india',
      popupExpanded: false,
      anchorSearchQuery: '',
    }),

  selectBasin: (basinId) => {
    const basin = getBasin(basinId);
    if (!basin) return;
    set({
      selectedBasin: basinId,
      selectedSubRegion: null,
      selectedAnchor: null,
      mapView: 'basin',
      popupExpanded: false,
      anchorSearchQuery: '',
    });
  },

  selectSubRegion: (subRegionId) => {
    const { selectedBasin } = get();
    const sub = getSubRegion(selectedBasin, subRegionId);
    if (!sub) return;
    set({
      selectedSubRegion: subRegionId,
      selectedAnchor: null,
      mapView: 'subregion',
      popupExpanded: false,
      anchorSearchQuery: '',
    });
  },

  selectAnchor: (anchorId) => {
    const { selectedBasin, selectedSubRegion } = get();
    const anchor = getAnchor(anchorId);
    if (!anchor) return;
    if (anchor.basinId !== selectedBasin || anchor.subRegionId !== selectedSubRegion) return;
    set({
      selectedAnchor: anchorId,
      mapView: 'anchor',
      popupExpanded: false,
    });
  },

  setAnchorSearchQuery: (query) => set({ anchorSearchQuery: query }),

  togglePopup: () => set((s) => ({ popupExpanded: !s.popupExpanded })),
  collapsePopup: () => set({ popupExpanded: false }),
  expandPopup: () => set({ popupExpanded: true }),

  getActiveBasin: () => {
    const { selectedBasin } = get();
    return selectedBasin ? getBasin(selectedBasin) : null;
  },

  getActiveSubRegion: () => {
    const { selectedBasin, selectedSubRegion } = get();
    if (!selectedBasin || !selectedSubRegion) return null;
    return getSubRegion(selectedBasin, selectedSubRegion);
  },

  getActiveAnchor: () => {
    const { selectedAnchor } = get();
    return selectedAnchor ? getAnchor(selectedAnchor) : null;
  },

  getActiveBbox: () => {
    const { selectedBasin, selectedSubRegion, selectedAnchor } = get();
    return resolveActiveBbox(selectedBasin, selectedSubRegion, selectedAnchor);
  },

  getActiveCesiumView: () => {
    const { selectedBasin, selectedSubRegion, selectedAnchor } = get();
    if (selectedAnchor) {
      const anchor = getAnchor(selectedAnchor);
      if (anchor) return coordsToCesiumView(anchor.lat, anchor.lon, 85_000);
    }
    const view = bboxToCesiumView(
      resolveActiveBbox(selectedBasin, selectedSubRegion, null),
    );
    const zoomFactor = selectedSubRegion ? 0.6 : selectedBasin ? 0.72 : 1;
    return { ...view, height: view.height * zoomFactor };
  },

  getVisibleAnchors: () => {
    const { selectedBasin, selectedSubRegion, mapView } = get();
    if (!selectedBasin || !selectedSubRegion) return [];
    if (mapView === 'india' || mapView === 'basin') return [];
    return getAnchorsForSubRegion(selectedBasin, selectedSubRegion);
  },

  getFilteredAnchors: () => {
    const { selectedBasin, selectedSubRegion, anchorSearchQuery } = get();
    if (!selectedBasin || !selectedSubRegion) return [];
    return searchAnchors(anchorSearchQuery, selectedBasin, selectedSubRegion);
  },
}));

export default useMapStore;
export { BASINS, INDIA_PRESET };
