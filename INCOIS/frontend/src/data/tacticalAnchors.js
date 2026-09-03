/** Camera fly-to for a lat/lon point (anchor zoom). */
export function coordsToCesiumView(lat, lon, height = 120_000) {
  return { longitude: lon, latitude: lat, height };
}

/** Small bbox around an anchor for API filtering. */
export function anchorToBbox(anchor, padding = 0.35) {
  return {
    minLat: anchor.lat - padding,
    maxLat: anchor.lat + padding,
    minLon: anchor.lon - padding,
    maxLon: anchor.lon + padding,
  };
}

function a(id, subRegionId, basinId, label, lat, lon, type, description = '') {
  return { id, subRegionId, basinId, label, lat, lon, type, description };
}

/**
 * Master tactical anchor catalogue — ports, harbors, naval bases, research stations.
 * Coordinates: [lat, lon]
 */
export const TACTICAL_ANCHORS = [
  // ── Arabian Sea — Lakshadweep Sea ─────────────────────────────────
  a('cochin-port', 'lakshadweep-sea', 'arabian-sea-basin', 'Cochin Port (Kochi)', 9.963, 76.261, 'port', 'Major deep-water commercial port and shipbuilding hub.'),
  a('ins-garuda', 'lakshadweep-sea', 'arabian-sea-basin', 'Southern Naval Command (INS Garuda)', 9.946, 76.273, 'naval', 'Premier naval command center and air station.'),
  a('kavaratti-hub', 'lakshadweep-sea', 'arabian-sea-basin', 'Kavaratti Harbour / INS Dweeprakshak / CG DHQ-12', 10.569, 72.637, 'naval', 'Administrative hub, forward naval base, and Coast Guard district HQ.'),
  a('agatti-jetty', 'lakshadweep-sea', 'arabian-sea-basin', 'Agatti Jetty', 10.854, 72.181, 'harbor', 'Core inter-island transit node.'),

  // ── Gulf of Khambhat ──────────────────────────────────────────────
  a('port-dahej', 'gulf-of-khambhat', 'arabian-sea-basin', 'Port of Dahej', 21.678, 72.529, 'port', 'Strategic deep-water liquid chemical and LNG terminal.'),
  a('port-hazira', 'gulf-of-khambhat', 'arabian-sea-basin', 'Port of Hazira (Surat)', 21.102, 72.632, 'port', 'Industrial deep-water cargo and manufacturing port.'),
  a('Alang-sosiya', 'gulf-of-khambhat', 'arabian-sea-basin', 'Alang-Sosiya Ship-Breaking Yard', 21.414, 72.203, 'harbor', "World's largest marine salvage and ship-breaking harbor."),
  a('bhavnagar-port', 'gulf-of-khambhat', 'arabian-sea-basin', 'Bhavnagar Port', 21.758, 72.152, 'port', 'Historical tidal port for regional coastal trade.'),

  // ── Gulf of Kachchh ─────────────────────────────────────────────────
  a('port-kandla', 'gulf-of-kachchh', 'arabian-sea-basin', 'Deendayal Port (Kandla)', 23.003, 70.219, 'port', 'Major bulk, crude oil, and chemical cargo hub.'),
  a('mundra-port', 'gulf-of-kachchh', 'arabian-sea-basin', 'Mundra Port', 22.742, 69.712, 'port', "India's largest private commercial container port."),
  a('vadinar-port', 'gulf-of-kachchh', 'arabian-sea-basin', 'Vadinar Port (SBM Terminal)', 22.441, 69.718, 'port', 'Offshore Single Buoy Mooring crude oil terminal.'),
  a('ins-dwarka', 'gulf-of-kachchh', 'arabian-sea-basin', 'INS Dwarka (Okha)', 22.472, 69.074, 'naval', 'Forward naval base guarding the maritime border.'),

  // ── Konkan-Malabar Shelf ────────────────────────────────────────────
  a('jnpt', 'konkan-malabar-shelf', 'arabian-sea-basin', 'Jawaharlal Nehru Port (JNPT)', 18.951, 72.951, 'port', "India's top container gateway."),
  a('mumbai-port', 'konkan-malabar-shelf', 'arabian-sea-basin', 'Mumbai Port & Western Naval Command', 18.932, 72.854, 'naval', 'Mega commercial harbor and principal strike fleet HQ.'),
  a('mormugao-port', 'konkan-malabar-shelf', 'arabian-sea-basin', 'Mormugao Port (Goa)', 15.412, 73.803, 'port', 'Major natural harbor for iron ore and cruise liners.'),
  a('ins-kadamba', 'konkan-malabar-shelf', 'arabian-sea-basin', 'INS Kadamba (Karwar — Project Seabird)', 14.779, 74.129, 'naval', 'Third-generation exclusive naval base.'),
  a('mangalore-port', 'konkan-malabar-shelf', 'arabian-sea-basin', 'New Mangalore Port', 12.934, 74.821, 'port', 'Deep-water industrial and LPG port.'),

  // ── Saurashtra Shelf ────────────────────────────────────────────────
  a('pipavav-port', 'saurashtra-shelf', 'arabian-sea-basin', 'Port Pipavav', 20.912, 71.503, 'port', 'Public-private model container and bulk port.'),
  a('porbandar-port', 'saurashtra-shelf', 'arabian-sea-basin', 'Porbandar Port & Coast Guard Air Station', 21.631, 69.598, 'coast-guard', 'All-weather commercial port and CG air station.'),
  a('veraval-harbour', 'saurashtra-shelf', 'arabian-sea-basin', 'Veraval Harbour / CIFT Station', 20.903, 70.369, 'research', 'Major fishing hub and CIFT research station.'),

  // ── Gulf of Oman ────────────────────────────────────────────────────
  a('chabahar-port', 'gulf-of-oman', 'arabian-sea-basin', 'Port of Chabahar (Iran)', 25.289, 60.611, 'port', 'Indian-backed strategic transit port.'),
  a('sohar-port', 'gulf-of-oman', 'arabian-sea-basin', 'Sohar Port (Oman)', 24.492, 56.631, 'port', 'Industrial container hub outside the Strait of Hormuz.'),
  a('fujairah-port', 'gulf-of-oman', 'arabian-sea-basin', 'Port of Fujairah (UAE)', 25.178, 56.358, 'port', 'Global marine bunkering and refueling harbor.'),

  // ── Gulf of Aden ────────────────────────────────────────────────────
  a('aden-port', 'gulf-of-aden', 'arabian-sea-basin', 'Port of Aden (Yemen)', 12.791, 44.974, 'port', 'Historic natural harbor and transshipment checkpoint.'),
  a('djibouti-port', 'gulf-of-aden', 'arabian-sea-basin', 'Port of Djibouti', 11.595, 43.148, 'port', 'Maritime choke-point and anti-piracy naval hub.'),
  a('berbera-port', 'gulf-of-aden', 'arabian-sea-basin', 'Port of Berbera (Somaliland)', 10.433, 45.012, 'port', 'Expanding deep-sea commercial hub.'),

  // ── Bay of Bengal — Coromandel Shelf ───────────────────────────────
  a('chennai-port', 'coromandel-shelf', 'bay-of-bengal-basin', 'Chennai Port', 13.084, 80.292, 'port', 'Major automobile and container export gateway.'),
  a('ennore-port', 'coromandel-shelf', 'bay-of-bengal-basin', 'Kamarajar Port (Ennore)', 13.249, 80.331, 'port', 'Satellite port for coal and liquid bulk.'),
  a('vizag-port', 'coromandel-shelf', 'bay-of-bengal-basin', 'Visakhapatnam Port & Eastern Naval Command', 17.688, 83.287, 'naval', 'Prime industrial port and eastern fleet HQ.'),
  a('ins-varsha', 'coromandel-shelf', 'bay-of-bengal-basin', 'INS Varsha (Rambilli Submarine Base)', 17.509, 83.118, 'naval', 'Strategic underground nuclear submarine base.'),

  // ── Northern Bengal Shelf ───────────────────────────────────────────
  a('paradip-port', 'northern-bengal-shelf', 'bay-of-bengal-basin', 'Paradip Port', 20.262, 86.671, 'port', 'Mega deep-sea port for iron ore and coal.'),
  a('kolkata-port', 'northern-bengal-shelf', 'bay-of-bengal-basin', 'Syama Prasad Mookerjee Port (Kolkata)', 22.573, 88.364, 'port', 'Primary riverine port system.'),
  a('haldia-port', 'northern-bengal-shelf', 'bay-of-bengal-basin', 'Syama Prasad Mookerjee Port (Haldia)', 22.022, 88.061, 'port', 'Satellite riverine port at Haldia.'),
  a('ins-netaji-subhash', 'northern-bengal-shelf', 'bay-of-bengal-basin', 'INS Netaji Subhash (Kolkata HQ)', 22.545, 88.318, 'naval', 'Naval base coordinating border coastal security.'),
  a('dhamra-port', 'northern-bengal-shelf', 'bay-of-bengal-basin', 'Dhamra Port', 20.819, 86.968, 'port', 'Deep-draft private port for Capesize vessels.'),

  // ── Swatch of No Ground ─────────────────────────────────────────────
  a('mongla-port', 'swatch-of-no-ground', 'bay-of-bengal-basin', 'Mongla Port (Bangladesh)', 22.481, 89.597, 'port', 'Second-largest Bangladeshi seaport near Sundarbans.'),
  a('payra-port', 'swatch-of-no-ground', 'bay-of-bengal-basin', 'Payra Port (Bangladesh)', 21.993, 90.268, 'port', 'Deep-sea container port.'),
  a('bns-sher-e-bangla', 'swatch-of-no-ground', 'bay-of-bengal-basin', 'BNS Sher-e-Bangla (Bangladesh Navy)', 22.008, 90.231, 'naval', 'Forward Bangladesh Navy base near canyon axis.'),
  a('rv-anushandhani', 'swatch-of-no-ground', 'bay-of-bengal-basin', 'R/V Anushandhani Dynamics Station', 21.250, 89.350, 'research', 'Marine research tracking deep-sea fan dynamics.'),

  // ── Gulf of Mannar ──────────────────────────────────────────────────
  a('tuticorin-port', 'gulf-of-mannar', 'bay-of-bengal-basin', 'V.O. Chidambaranar Port (Tuticorin)', 8.751, 78.163, 'port', 'Industrial container terminal for southern India.'),
  a('ins-kattabomman', 'gulf-of-mannar', 'bay-of-bengal-basin', 'Tuticorin Naval Detachment / INS Kattabomman (VLF)', 8.679, 77.742, 'naval', 'VLF submarine transmission facility.'),
  a('mandapam-station', 'gulf-of-mannar', 'bay-of-bengal-basin', 'Mandapam Coast Guard & CMFRI Station', 9.278, 79.123, 'research', 'Coast Guard base and coral/marine biology institute.'),

  // ── Palk Bay ────────────────────────────────────────────────────────
  a('kankesanthurai', 'palk-bay', 'bay-of-bengal-basin', 'Kankesanthurai Harbour (Sri Lanka)', 9.811, 80.043, 'port', 'Northern Sri Lankan port linking trade with India.'),
  a('slns-uttara', 'palk-bay', 'bay-of-bengal-basin', 'SLNS Uttara (Jaffna Command)', 9.664, 80.012, 'naval', "Sri Lanka Navy northern command securing Palk Strait."),
  a('rameswaram-jetty', 'palk-bay', 'bay-of-bengal-basin', 'Rameswaram Security Jetty', 9.284, 79.314, 'harbor', 'Coastal security and joint maritime patrol checkpoint.'),

  // ── Gulf of Martaban ─────────────────────────────────────────────────
  a('yangon-port', 'gulf-of-martaban', 'bay-of-bengal-basin', 'Yangon Port (Myanmar)', 16.782, 96.161, 'port', 'Primary riverine commercial gateway for Myanmar.'),
  a('thilawa-port', 'gulf-of-martaban', 'bay-of-bengal-basin', 'Thilawa Port (Myanmar)', 16.658, 96.242, 'port', 'Modern deep-sea container terminal.'),
  a('mawlamyine-harbour', 'gulf-of-martaban', 'bay-of-bengal-basin', 'Mawlamyine Harbour', 16.483, 97.621, 'harbor', 'Regional trading harbor at Thanlwin River mouth.'),

  // ── Andaman Sea ─────────────────────────────────────────────────────
  a('port-blair', 'andaman-sea', 'andaman-nicobar-basin', 'Port Blair / ANC Unified HQ / INS Jarawa', 11.668, 92.749, 'naval', "India's unified tri-service command HQ."),
  a('ins-utkrosh', 'andaman-sea', 'andaman-nicobar-basin', 'INS Utkrosh (Reconnaissance Air Base)', 11.642, 92.723, 'naval', 'Naval air station for long-range maritime reconnaissance.'),
  a('niot-port-blair', 'andaman-sea', 'andaman-nicobar-basin', 'NIOT Port Blair Research Center', 11.651, 92.738, 'research', 'Ocean technology center for island marine biology.'),

  // ── Andaman Shelf ───────────────────────────────────────────────────
  a('mayabunder', 'andaman-shelf', 'andaman-nicobar-basin', 'Mayabunder Harbour Jetty', 12.923, 92.931, 'harbor', 'North Andaman jetty for timber and coastal transit.'),
  a('diglipur-port', 'andaman-shelf', 'andaman-nicobar-basin', 'Diglipur Port (Port Cornwallis)', 13.268, 93.004, 'port', 'Natural northern harbor for regional logistics.'),
  a('ins-kohassa', 'andaman-shelf', 'andaman-nicobar-basin', 'INS Kohassa Air Base (Northern Shelf)', 13.242, 93.018, 'naval', 'Naval air station tracking northern shelf.'),

  // ── Ten Degree Channel ──────────────────────────────────────────────
  a('car-nicobar-afs', 'ten-degree-channel', 'andaman-nicobar-basin', 'Car Nicobar Air Force Frontline Station', 9.157, 92.774, 'naval', 'Frontline air defense at the northern edge of the channel.'),
  a('mus-harbour', 'ten-degree-channel', 'andaman-nicobar-basin', 'Mus Harbour Landing Jetty', 9.231, 92.798, 'harbor', 'Primary maritime landing jetty for northern Nicobar.'),
  a('ins-baaz', 'ten-degree-channel', 'andaman-nicobar-basin', 'INS Baaz (Campbell Bay — Malacca Entry)', 7.004, 93.932, 'naval', 'Southern surveillance air station monitoring Malacca Strait.'),

  // ── Sombrero Channel ────────────────────────────────────────────────
  a('nancowry-harbour', 'sombrero-channel', 'andaman-nicobar-basin', 'Nancowry Deep Natural Harbour', 8.049, 93.534, 'harbor', 'Strategic deep natural harbor shelter.'),
  a('ins-kardip', 'sombrero-channel', 'andaman-nicobar-basin', 'INS Kardip (Kamorta Fleet Replenishment)', 8.092, 93.518, 'naval', 'Forward naval establishment for warship replenishment.'),

  // ── Duncan Passage ──────────────────────────────────────────────────
  a('hut-bay', 'duncan-passage', 'andaman-nicobar-basin', 'Hut Bay Harbour (Little Andaman)', 10.591, 92.541, 'harbor', 'Critical logistics lifeline for Little Andaman.'),
  a('duncan-radar', 'duncan-passage', 'andaman-nicobar-basin', 'Duncan Passage Coastal Radar Node', 11.150, 92.680, 'coast-guard', 'Surveillance node tracking shipping through the bottleneck.'),
];

export const ANCHOR_TYPE_LABELS = {
  port: 'Commercial Port',
  naval: 'Naval Base',
  harbor: 'Harbor / Jetty',
  research: 'Research Station',
  'coast-guard': 'Coast Guard',
};

export const ANCHOR_TYPE_COLORS = {
  port: '#22d3ee',
  naval: '#f97316',
  harbor: '#2dd4bf',
  research: '#a78bfa',
  'coast-guard': '#facc15',
};

export function getAnchor(id) {
  return TACTICAL_ANCHORS.find((x) => x.id === id) ?? null;
}

export function getAnchorsForSubRegion(basinId, subRegionId) {
  return TACTICAL_ANCHORS.filter(
    (x) => x.basinId === basinId && x.subRegionId === subRegionId,
  );
}

export function searchAnchors(query, basinId, subRegionId) {
  const pool = subRegionId
    ? getAnchorsForSubRegion(basinId, subRegionId)
    : basinId
      ? TACTICAL_ANCHORS.filter((x) => x.basinId === basinId)
      : TACTICAL_ANCHORS;

  if (!query?.trim()) return pool;

  const q = query.trim().toLowerCase();
  return pool.filter(
    (x) =>
      x.label.toLowerCase().includes(q) ||
      x.description.toLowerCase().includes(q) ||
      ANCHOR_TYPE_LABELS[x.type]?.toLowerCase().includes(q),
  );
}
