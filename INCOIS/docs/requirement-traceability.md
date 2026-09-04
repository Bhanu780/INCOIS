# Requirement Traceability Matrix

*Kept versioned in `docs/` — proves systematic, complete coverage of the problem statement.*

| # | Problem Statement Requirement | How It's Solved | Component | Status |
|---|---|---|---|---|
| 1 | Web-based, platform-independent 3D rendering with depth-resolved volumetric views | CesiumJS `WebGLRenderer` running in any modern browser, no plugins/installs | `frontend/src/components/CesiumMap.jsx` | ✅ Done |
| 2 | Unified display of Argo + Glider (lat/lon/depth/time/temp/salinity/chlorophyll) alongside model fields | Same CesiumJS scene renders model plane/volume AND instrument markers together | `CesiumMap.jsx` + `backend/app/ingestion/argo_parser.py`, `glider_parser.py` | ✅ Done |
| 3 | Click a float/glider → depth-vs-variable profile chart with timestamps | Marker click → fetch profile JSON → Recharts line chart (depth on Y, reversed) | `FloatProfilePanel.jsx` + `backend/app/api/routes_instruments.py` | ✅ Done |
| 4 | Interactive controls: variable selection, depth-slice navigation, time-step animation, colorbars | Dedicated control components bound to scene state | `VariableSelector` (Sidebar), `DepthSlider.jsx`, `TimeSlider.jsx`, `ColorbarEditor.jsx` | ✅ Done |
| 5 | Depth-slice views | Query API for a single depth level → render as textured plane at that Z | `routes_model.py?depth=` + `DepthSlider.jsx` | ✅ Done |
| 6 | Isosurface extraction | Marching Cubes on scalar field via scikit-image (backend precompute) | `backend/app/services/isosurface.py` + `/api/ocean-grid/isosurface` | ✅ Done |
| 7 | Time-step animation | Backend serves per-timestep grids; frontend `TimeSlider` interpolates/plays frames | `TimeSlider.jsx` + `routes_model.py#get_available_times` | ✅ Done |
| 8 | WebGL / Three.js or Cesium.js | CesiumJS for georeferenced globe + volumetric ocean rendering | `CesiumMap.jsx` | ✅ Done |
| 9 | Multi-format ingestion: NetCDF via xarray, delimited text | `xarray`-based parser for NetCDF, `pandas` for CSV/ASCII Argo/Glider files | `backend/app/ingestion/netcdf_parser.py`, `argo_parser.py` | ✅ Done |
| 10 | Modular architecture — add new variables/sources with minimal code | Abstract `BaseParser` interface; new source = new parser class + one registry entry | `backend/app/ingestion/base_parser.py`, `registry.py` | ✅ Done |
| 11 | Colorbar editor: palette, min/max, log/linear | Client-side `ColorbarEditor.jsx` writes to `colormaps.js` utilities | `frontend/src/utils/colormaps.js`, `ColorbarEditor.jsx` | ✅ Done |
| 12 | Variable selector | Dropdown driving API query param + re-render | `Sidebar.jsx` (variable select section) | ✅ Done |
| 13 | Layer opacity controls | `gridOpacity` prop → CesiumMap material alpha, exposed as slider | `LayerOpacityControl.jsx` + `CesiumMap.jsx` | ✅ Done |
| 14 | Vertical exaggeration slider | Scales the Z-axis (depth) transform of the CesiumJS scene group | `VerticalExaggerationControl.jsx` + `CesiumMap.jsx` (`VE * altitude`) | ✅ Done |
| 15 | Frontend on modern JS framework | React + Vite (with CesiumJS via vite-plugin-cesium) | `frontend/` | ✅ Done |
| 16 | Lightweight REST/OPeNDAP API backend | FastAPI REST endpoints; OPeNDAP passthrough via `xarray` + HYCOM fallback | `backend/app/api/` (4 router modules) | ✅ Done |
| 17 | Deployable on INCOIS infra, no client-side dependencies | Docker Compose bundling frontend + backend; browser needs nothing installed | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | ✅ Done |
| 18 | Extensible plugin-style module for future sensors (CTD, moorings, HF-radar, ADCP) | Parser registry pattern — drop in a new parser + route, no core rewrite | `backend/app/ingestion/registry.py` + `routes_instruments.py` | ✅ Done |
| 19 | Support ML-derived products | Generic `derived_vars` dict in `GridPoint` Pydantic model — anything gridded/pointwise served the same way | `backend/app/models/schemas.py` (`GridPoint.derived_vars`) | ✅ Done |
| 20 | Follow OGC WMS/WCS + CF Conventions | JSON WMS/WCS endpoints; CF-convention tagging on all variables | `backend/app/api/routes_ogc.py`, `services/ogc_adapter.py` | ✅ Done |
| 21 | Support hazard assessment, SAR, fishery advisories, climate monitoring | Use cases satisfied by live model+observation co-display with time animation | End-to-end system | ✅ Done |
| 22 | Public outreach / science communication / e-learning | `OutreachMode.jsx`: preset views + 5-step guided tour; toggled from Navbar | `frontend/src/components/OutreachMode.jsx` | ✅ Done |

---

## Phase Coverage

| Phase | Rows | Status |
|-------|------|--------|
| Phase 1 — Core loop (MVP) | 1, 2, 3, 5, 9, 12, 15, 16, 17 | ✅ Complete |
| Phase 2 — Interactivity | 4, 7, 11, 13, 14 | ✅ Complete |
| Phase 3 — Advanced rendering | 6, 8 (Cesium option), 19 | ✅ Complete |
| Phase 4 — Standards & extensibility | 10, 18, 20 | ✅ Complete |
| Phase 5 — Outreach | 22 | ✅ Complete |

*Last updated: 2026-08-28*
