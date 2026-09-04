# 3D Ocean Data Visualization System — Complete Solution Blueprint (SIH 2026)

This document maps **every requirement** in the problem statement to a concrete
technical solution, so you can build (and later demo/justify) full coverage.

---

## 1. Requirement-to-Solution Traceability Matrix

| # | Problem Statement Requirement | How It's Solved | Component |
|---|---|---|---|
| 1 | Web-based, platform-independent 3D rendering with depth-resolved volumetric views | Three.js `WebGLRenderer` running in any modern browser, no plugins/installs | `frontend/OceanScene.jsx` |
| 2 | Unified display of Argo + Glider (lat/lon/depth/time/temp/salinity/chlorophyll) alongside model fields | Same Three.js scene renders model plane/volume AND instrument markers together | `frontend/InstrumentMarkers.jsx` + `backend/ingestion/argo_parser.py`, `glider_parser.py` |
| 3 | Click a float/glider → depth-vs-variable profile chart with timestamps | Marker click → fetch profile JSON → Plotly line chart (depth on Y, reversed) | `frontend/ProfileChart.jsx` + `backend/api/routes_instruments.py` |
| 4 | Interactive controls: variable selection, depth-slice navigation, time-step animation, colorbars | Dedicated control components bound to scene state | `VariableSelector.jsx`, `DepthSlider.jsx`, `TimeSlider.jsx`, `ColorbarEditor.jsx` |
| 5 | Depth-slice views | Query API for a single depth level → render as textured plane at that Z | `routes_model.py?depth=` |
| 6 | Isosurface extraction | Marching Cubes on scalar field (backend precompute or `three.js` addon) | `services/isosurface.py` (backend) or `MarchingCubes.js` (frontend) |
| 7 | Time-step animation | Backend serves per-timestep grids; frontend interpolates/plays frames | `TimeSlider.jsx` + `routes_model.py?time=` |
| 8 | WebGL / Three.js or Cesium.js | Three.js for ocean-grid rendering; optional Cesium.js swap-in for a georeferenced globe view | `OceanScene.jsx` |
| 9 | Multi-format ingestion: NetCDF via xarray, delimited text | `xarray`-based parser for NetCDF, `pandas` for CSV/ASCII Argo/Glider files | `ingestion/netcdf_parser.py`, `ingestion/argo_parser.py` |
| 10 | Modular architecture — add new variables/sources with minimal code | Abstract `BaseParser` interface; new source = new parser class + one registry entry | `ingestion/base_parser.py` |
| 11 | Colorbar editor: palette, min/max, log/linear | Client-side control writing to a shared colormap util, applied as a shader uniform | `utils/colormaps.js`, `ColorbarEditor.jsx` |
| 12 | Variable selector | Dropdown driving API query param + re-render | `VariableSelector.jsx` |
| 13 | Layer opacity controls | `material.opacity` uniform per layer, exposed as sliders | `OceanScene.jsx` (layer state) |
| 14 | Vertical exaggeration slider | Scales the Z-axis (depth) transform of the whole scene group | `OceanScene.jsx` (`scale.z`) |
| 15 | Frontend on modern JS framework | React (with Three.js / react-three-fiber) | `frontend/` |
| 16 | Lightweight REST/OPeNDAP API backend | FastAPI REST endpoints; optional OPeNDAP passthrough via `xarray` + `Hyrax`/`pydap` | `backend/app/api/` |
| 17 | Deployable on INCOIS infra, no client-side dependencies | Docker Compose bundling frontend + backend; browser needs nothing installed | `docker-compose.yml` |
| 18 | Extensible plugin-style module for future sensors (CTD, moorings, HF-radar, ADCP) | Parser registry pattern — drop in a new parser + route, no core rewrite | `ingestion/base_parser.py` + `api/routes_instruments.py` |
| 19 | Support ML-derived products | Generic "derived variable" type in the data model — anything gridded/pointwise can be served the same way | `models/schemas.py` |
| 20 | Follow OGC WMS/WCS + CF Conventions | Serve raster tiles via WMS-style endpoints; keep NetCDF outputs CF-compliant (standard_name, units) | `services/ogc_adapter.py` |
| 21 | Support hazard assessment, SAR, fishery advisories, climate monitoring | These are *use cases*, not separate code — satisfied by having live model+observation co-display with time animation | End-to-end system |
| 22 | Public outreach / science communication / e-learning | Same platform, "simple mode" UI: preset views, guided tour, simplified controls | `frontend/OutreachMode.jsx` (optional toggle) |

**Everything in the problem statement maps to something in the table above** — nothing is left unaddressed, though several rows (isosurfaces, OPeNDAP, WMS/WCS) are "stretch" items you can stub first and deepen later (see Section 4, phased plan).

---

## 2. Full Project Structure (covers all rows above)

```
ocean-3d-viz/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── api/
│   │   │   ├── routes_model.py        # variable, depth, time queries -> grid JSON
│   │   │   ├── routes_instruments.py  # argo/glider/ctd list + profile-by-id
│   │   │   ├── routes_meta.py         # available variables, depths, time steps, bbox
│   │   │   └── routes_ogc.py          # WMS/WCS-style tile + coverage endpoints
│   │   │
│   │   ├── ingestion/
│   │   │   ├── base_parser.py         # abstract interface: load(), to_grid(), to_points()
│   │   │   ├── netcdf_parser.py       # xarray-based model field reader (CF-aware)
│   │   │   ├── argo_parser.py         # Argo NetCDF/text profile reader
│   │   │   ├── glider_parser.py       # Glider profile reader
│   │   │   ├── ctd_parser.py          # future: CTD casts
│   │   │   └── registry.py            # maps source_type -> parser class (plug-in point)
│   │   │
│   │   ├── services/
│   │   │   ├── colorbar.py            # min/max calc, log/linear transforms
│   │   │   ├── isosurface.py          # marching-cubes precompute (optional, heavier feature)
│   │   │   └── ogc_adapter.py         # CF-convention tagging, WMS/WCS response shaping
│   │   │
│   │   └── models/
│   │       └── schemas.py             # Pydantic models: GridResponse, ProfileResponse, MetaResponse
│   │
│   ├── data/                          # sample NetCDF + Argo/Glider files for local dev
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── OceanScene.jsx         # Three.js scene: volume/plane + isosurface + vertical exaggeration
│   │   │   ├── InstrumentMarkers.jsx  # Argo/Glider markers, geospatially placed
│   │   │   ├── ProfileChart.jsx       # depth-vs-variable chart on click, with timestamps
│   │   │   ├── ColorbarEditor.jsx     # palette / min-max / log-linear
│   │   │   ├── VariableSelector.jsx
│   │   │   ├── TimeSlider.jsx         # play/pause time-step animation
│   │   │   ├── DepthSlider.jsx        # depth-slice navigation
│   │   │   ├── LayerOpacityControl.jsx
│   │   │   ├── VerticalExaggerationControl.jsx
│   │   │   └── OutreachMode.jsx       # simplified public/education UI
│   │   ├── services/api.js
│   │   └── utils/colormaps.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   └── requirement-traceability.md    # this table, kept versioned
└── README.md
```

---

## 3. Where Each Control Lives in the 3D Scene (mental model)

- **OceanScene.jsx** owns a Three.js group. Vertical exaggeration = scaling that group's Z axis.
- Each **variable layer** (temperature plane, current-vector field, isosurface mesh) is a child mesh with its own opacity uniform.
- **DepthSlider** and **TimeSlider** don't move the camera — they change *which grid* is requested from the backend and re-upload it as a texture/geometry.
- **ColorbarEditor** never touches the backend — it only changes the shader's color-mapping uniform on the client, so recoloring is instant.
- **InstrumentMarkers** are plain `THREE.Sprite`/`Points` positioned by lat/lon/depth, raycast-clickable to open `ProfileChart`.

---

## 4. Phased Build Plan (so you always have something demo-able)

**Phase 1 — Core loop (must-have for MVP demo)**
Rows 1, 2, 3, 5, 9, 12, 15, 16, 17 — single NetCDF file, flat depth-slice plane, Argo markers, profile chart on click, variable selector, Dockerized.

**Phase 2 — Interactivity**
Rows 4, 7, 11, 13, 14 — time animation, colorbar editor, opacity, vertical exaggeration.

**Phase 3 — Advanced rendering**
Rows 6, 8 (Cesium option), 19 — isosurfaces, ML-derived product layer.

**Phase 4 — Standards & extensibility**
Rows 10, 18, 20 — plugin parser registry, WMS/WCS-style endpoints, CF-compliance pass.

**Phase 5 — Outreach**
Row 22 — simplified public mode, guided preset tours for exhibitions/e-learning.

Building in this order means at every SIH checkpoint (idea/prototype/final) you have a working, demoable system rather than a half-built everything.

---

## 5. Suggested Tech Stack Summary

| Layer | Choice | Why |
|---|---|---|
| 3D rendering | Three.js (+ react-three-fiber) | Best browser-native WebGL support, huge ecosystem, works for volumetric + isosurface |
| Optional globe view | Cesium.js | If you want true geospatial globe context alongside the 3D ocean box |
| Charts | Plotly.js or Recharts | Depth-vs-variable profile charts |
| Frontend framework | React | Component reuse for all the control panels |
| Backend | FastAPI (Python) | Async, pairs naturally with xarray/NetCDF, auto-generates OpenAPI docs |
| Data reading | xarray + netCDF4 | Industry standard for CF-compliant NetCDF ocean data |
| Point data | pandas | Argo/Glider delimited text and tabular profiles |
| Packaging | Docker Compose | One-command deploy on INCOIS infra, no client installs |
| Standards | CF Conventions (NetCDF metadata), OGC WMS/WCS (tile/coverage endpoints) | Required by problem statement for interoperability |

---

*Keep this file in `docs/` and update the traceability table as you build — it's also your strongest artifact for judges: it proves systematic, complete coverage of the problem statement rather than a partial demo.*
