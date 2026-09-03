import * as Cesium from 'cesium';
import { ANCHOR_TYPE_COLORS, ANCHOR_TYPE_LABELS } from '../data/tacticalAnchors';

/** Sync tactical anchor pin entities on the Cesium globe. */
export function syncTacticalAnchors(viewer, anchors, selectedAnchorId, onAnchorClick) {
  const toRemove = [];
  viewer.entities.values.forEach((entity) => {
    if (entity._isTacticalAnchor) toRemove.push(entity);
  });
  toRemove.forEach((e) => viewer.entities.remove(e));

  anchors.forEach((anchor) => {
    const isSelected = selectedAnchorId === anchor.id;
    const color = ANCHOR_TYPE_COLORS[anchor.type] ?? '#22d3ee';

    const entity = viewer.entities.add({
      id: `anchor-${anchor.id}`,
      name: anchor.label,
      position: Cesium.Cartesian3.fromDegrees(anchor.lon, anchor.lat, 200),
      point: {
        pixelSize: isSelected ? 18 : 13,
        color: Cesium.Color.fromCssColorString(isSelected ? '#ffffff' : color),
        outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
        outlineWidth: isSelected ? 5 : 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: anchor.label,
        font: `bold ${isSelected ? 13 : 11}px Inter, sans-serif`,
        fillColor: Cesium.Color.fromCssColorString(isSelected ? '#ffffff' : color),
        outlineColor: Cesium.Color.fromCssColorString('#0a0e1a'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0f1629').withAlpha(0.88),
        backgroundPadding: new Cesium.Cartesian2(8, 5),
        scale: isSelected ? 1.05 : 0.92,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2_500_000),
      },
      description: `
        <div style="font-family:Inter,sans-serif;padding:8px;max-width:280px">
          <strong>${anchor.label}</strong><br/>
          <span style="color:#94a3b8">${ANCHOR_TYPE_LABELS[anchor.type] ?? anchor.type}</span><br/>
          <span style="color:#64748b;font-size:12px">${anchor.description}</span>
        </div>
      `,
    });

    entity._isTacticalAnchor = true;
    entity._anchorId = anchor.id;
    entity._onAnchorClick = onAnchorClick;
  });
}

export function pickTacticalAnchor(picked) {
  if (!picked?.id?._isTacticalAnchor) return null;
  return picked.id._anchorId ?? null;
}
