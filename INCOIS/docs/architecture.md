# System Architecture

## Overview

The 3D Ocean Data Visualization platform follows a clean three-tier architecture:

```
Browser (CesiumJS + React)
        │  REST/JSON
        ▼
FastAPI Backend (Python)
        │  xarray / httpx
        ▼
Data Sources:
  ├── Local NetCDF files  (data/)
  ├── CMEMS Toolbox       (Copernicus Marine)
  ├── OPeNDAP endpoints   (HYCOM / INCOIS ROMS)
  └── Argovis API         (real-time Argo floats)
```

---

## Backend

### Entry Point
`backend/app/main.py` — FastAPI app assembled via `include_router()`.

### API Routers (`backend/app/api/`)

| Router | Prefix | Purpose |
|--------|--------|---------|
| `routes_model.py` | `/api/ocean-grid` | Grid data, depth-slice, timesteps, isosurface |
| `routes_instruments.py` | `/api` | Argo floats, gliders, CTDs, profiles |
| `routes_meta.py` | `/api/meta` | Variables, depths, bbox, parser list |
| `routes_ogc.py` | `/api/ogc` | OGC WMS/WCS + CF-convention endpoints |

### Ingestion Layer (`backend/app/ingestion/`)

Plugin-style parser registry pattern (Blueprint rows 10, 18):

```
BaseParser (abstract)
 ├── NetCDFParser   — xarray/copernicusmarine (.nc files, CMEMS, OPeNDAP)
 ├── ArgoParser     — Argovis REST API (real Argo float profiles)
 ├── GliderParser   — stub (Phase 4)
 └── CTDParser      — stub (Phase 4)
```

`registry.py` maps `source_type → class`. Adding a new sensor = one new file + one dict entry.

### Services (`backend/app/services/`)

| Service | Purpose |
|---------|---------|
| `colorbar.py` | 5 palettes, linear/log normalization, auto-range |
| `isosurface.py` | Marching Cubes via scikit-image (`/api/ocean-grid/isosurface`) |
| `ogc_adapter.py` | CF-1.8 attribute tagging, WMS/WCS response shaping |

### Models (`backend/app/models/schemas.py`)

Pydantic v2 models: `GridPoint`, `GridResponse`, `ProfileResponse`, `MetaResponse`, `WMSCapabilities`, `ColorbarConfig`.

---

## Frontend

### Components (`frontend/src/components/`)

| Component | Role | Blueprint Row |
|-----------|------|---------------|
| `CesiumMap.jsx` | 3D globe, volumetric/slice rendering, float markers | 1, 2, 5, 8, 13, 14 |
| `FloatProfilePanel.jsx` | Depth-vs-variable profile chart on float click | 3 |
| `ColorbarEditor.jsx` | Palette, min/max, log/linear controls | 11 |
| `TimeSlider.jsx` | Play/pause time-step animation | 4, 7 |
| `DepthSlider.jsx` | Depth-slice navigation | 4, 5 |
| `LayerOpacityControl.jsx` | Per-layer opacity sliders | 4, 13 |
| `VerticalExaggerationControl.jsx` | Z-axis scale slider | 4, 14 |
| `OutreachMode.jsx` | Preset views + 5-step guided tour | 22 |
| `Sidebar.jsx` | Control panel container | — |
| `Navbar.jsx` | Navigation bar + outreach toggle | — |
| `ColorLegend.jsx` | Inline colorbar legend overlay | 11 |

### Utilities (`frontend/src/`)

| File | Purpose |
|------|---------|
| `services/api.js` | All `fetch()` calls centralised — swap API_BASE in one place |
| `utils/colormaps.js` | 5 palettes, normalize(), paletteColor(), valueToCesiumColor(), buildGradient() |

---

## Data Flow

### Ocean Grid (full 3D)
```
App.jsx fetchOceanGrid()
  → GET /api/ocean-grid
  → CopernicusClient.sample_grid(lats, lons, depths)
  → xarray.Dataset.sel(nearest)
  → [{lat, lon, depth, temp, salinity, currents}, ...]
  → CesiumMap renders volumetric point cloud + depth planes
```

### Depth Slice
```
DepthSlider onChange
  → depthSlice state → CesiumMap filtered grid
  → filteredGrid (one depth level) → rectangle entities
```

### Argo Float Profile
```
Float marker click → onFloatClick(id)
  → FloatProfilePanel fetches /api/float-profile/{id}
  → Argovis API → [{depth, temp, salinity, timestamp}, ...]
  → Recharts LineChart (depth reversed on Y axis)
```

### Isosurface (Phase 3)
```
GET /api/ocean-grid/isosurface?variable=temperature&iso_level=20
  → Build 3D numpy array from cached dataset
  → skimage.measure.marching_cubes()
  → {vertices, triangles, vertex_count, triangle_count}
  → Client renders with THREE.js BufferGeometry or CesiumJS custom primitive
```

---

## Deployment

```bash
# Development
python backend/app/main.py          # backend on :8000
cd frontend && npm run dev          # frontend on :5173

# Production (Docker)
docker-compose up --build           # backend :8000, frontend :80
```

Environment variables: see `.env` (ARGOVIS_API_KEY, COPERNICUS_USERNAME, COPERNICUS_PASSWORD, OCEAN_NETCDF_DIR).
