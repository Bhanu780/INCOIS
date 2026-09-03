"""
Model-field routes: variable, depth, time queries → grid JSON.

Blueprint rows 1, 5, 6, 7, 16: Ocean grid, depth-slice, time-step, isosurface.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from backend.app.config import GRID_DEPTHS_M, GRID_STEP_DEG, REGION_BOUNDS

logger = logging.getLogger("ocean_api.routes_model")
router = APIRouter(prefix="/api/ocean-grid", tags=["Ocean Grid"])

# ── Shared client singletons (imported from root services) ────────────────
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from services import copernicus_client as _cmems  # type: ignore
from backend.app.services.isosurface import extract_isosurface, default_iso_level
from backend.app.services.colorbar import default_range


# ── Helpers ───────────────────────────────────────────────────────────────

def _require_cache():
    if not _cmems.has_cache():
        raise HTTPException(
            status_code=503,
            detail=(
                "Ocean data cache is still warming up "
                "(first download can take a minute or two) — retry shortly."
            ),
        )


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.get("", summary="Full 3D ocean grid (all depths)")
async def get_ocean_grid(
    min_lon: Optional[float] = Query(None, description="Bounding box min longitude"),
    max_lon: Optional[float] = Query(None, description="Bounding box max longitude"),
    min_lat: Optional[float] = Query(None, description="Bounding box min latitude"),
    max_lat: Optional[float] = Query(None, description="Bounding box max latitude"),
):
    """
    Real gridded temperature/salinity/currents sampled from CMEMS/NetCDF.

    Returns a list of {lat, lon, depth, temp, salinity, currents} objects
    covering the configured region (or the requested bbox) at all depth levels.
    """
    _require_cache()
    lats = list(range(REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"] + 1, GRID_STEP_DEG))
    lons = list(range(REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"] + 1, GRID_STEP_DEG))
    try:
        points = _cmems.sample_grid(lats, lons, GRID_DEPTHS_M)
        # Apply optional bbox filter when a non-global region is selected
        if all(v is not None for v in [min_lon, max_lon, min_lat, max_lat]):
            points = [
                p for p in points
                if min_lat <= p.get("lat", 0) <= max_lat
                and min_lon <= p.get("lon", 0) <= max_lon
            ]
        return points
    except Exception as exc:
        logger.exception("Ocean grid sampling failed")
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/slice", summary="Single depth-slice of a variable")
async def get_depth_slice(
    depth: float = Query(0.0, description="Depth in metres"),
    variable: str = Query("temperature", description="Variable: temperature | salinity | currents"),
):
    """
    Return a flat 2-D grid at a single depth level.

    This is the efficient endpoint for the depth-slice view (Req 5) —
    only fetches one depth plane rather than the full 3-D volume.
    """
    _require_cache()
    lats = list(range(REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"] + 1, GRID_STEP_DEG))
    lons = list(range(REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"] + 1, GRID_STEP_DEG))
    try:
        grid = _cmems.sample_grid(lats, lons, [depth])
        return {"depth": depth, "variable": variable, "points": grid}
    except Exception as exc:
        logger.exception("Depth-slice sampling failed")
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/refresh", summary="Manually trigger grid re-download")
async def force_grid_refresh():
    """Manually trigger a data re-download instead of waiting for the schedule."""
    ok = await _cmems.refresh_cache()
    if not ok:
        raise HTTPException(status_code=502, detail="Cache refresh failed — check server logs.")
    return {"status": "refreshed"}


@router.get("/info", summary="Dataset metadata")
async def get_grid_info():
    """Return metadata about the currently loaded dataset (variables, coords, source)."""
    return _cmems.cache_info()


@router.get("/depths", summary="Available depth levels")
async def get_available_depths():
    """Return the list of actual depth levels available in the cached dataset."""
    return {"depths": _cmems.available_depths()}


@router.get("/times", summary="Available time steps")
async def get_available_times():
    """Return the list of timestamps available in the cached dataset."""
    return {"times": _cmems.available_times()}


@router.get("/isosurface", summary="Extract 3D isosurface mesh")
async def get_isosurface(
    variable: str = Query("temperature", description="Scalar field variable"),
    iso_level: Optional[float] = Query(None, description="Threshold value (default: 20°C for temp)"),
):
    """
    Compute a Marching Cubes isosurface for the given variable and threshold.

    Returns a triangle mesh (vertices + face indices) suitable for three.js
    BufferGeometry or CesiumJS custom primitive rendering (Req 6).

    Requires scikit-image (`pip install scikit-image`).
    """
    _require_cache()

    import numpy as np

    level = iso_level if iso_level is not None else default_iso_level(variable)

    try:
        info = _cmems.cache_info()
        depths = _cmems.available_depths()
        lats = list(range(REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"] + 1, GRID_STEP_DEG))
        lons = list(range(REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"] + 1, GRID_STEP_DEG))

        # Build 3-D numpy array (depth × lat × lon)
        grid = _cmems.sample_grid(lats, lons, depths)

        n_d = len(depths)
        n_la = len(lats)
        n_lo = len(lons)
        field = np.full((n_d, n_la, n_lo), np.nan)

        var_key = {
            "temperature": "temp",
            "salinity": "salinity",
            "currents": "currents",
        }.get(variable.lower(), "temp")

        for pt in grid:
            di = depths.index(pt["depth"]) if pt["depth"] in depths else -1
            lai = lats.index(int(pt["lat"])) if int(pt["lat"]) in lats else -1
            loi = lons.index(int(pt["lon"])) if int(pt["lon"]) in lons else -1
            if di >= 0 and lai >= 0 and loi >= 0 and pt.get(var_key) is not None:
                field[di, lai, loi] = pt[var_key]

        # Fill NaN with mean for marching cubes
        mean_val = float(np.nanmean(field)) if not np.all(np.isnan(field)) else 0.0
        field = np.where(np.isnan(field), mean_val, field)

        return extract_isosurface(
            scalar_field=field,
            iso_level=level,
            lat_coords=np.array(lats, dtype=float),
            lon_coords=np.array(lons, dtype=float),
            depth_coords=np.array(depths, dtype=float),
            variable=variable,
        )
    except Exception as exc:
        logger.exception("Isosurface extraction failed")
        raise HTTPException(status_code=500, detail=str(exc))
