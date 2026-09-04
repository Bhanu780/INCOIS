"""
Metadata routes: available variables, depths, time steps, bbox.

Blueprint row 16 (lightweight REST API) and row 20 (CF Conventions compliance).
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from backend.app.config import REGION_BOUNDS
from backend.app.ingestion.registry import list_sources
from backend.app.services.ogc_adapter import CF_STANDARD_NAMES

logger = logging.getLogger("ocean_api.routes_meta")
router = APIRouter(prefix="/api/meta", tags=["Metadata"])

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))
from services import copernicus_client as _cmems  # type: ignore


@router.get("", summary="System-wide metadata")
async def get_metadata():
    """
    Returns all available variables, depths, timesteps, and the bounding box.

    This single endpoint lets the frontend discover what the backend holds
    without hardcoding any values in the UI (Req 16).
    """
    depths = _cmems.available_depths() if _cmems.has_cache() else []
    times  = _cmems.available_times()  if _cmems.has_cache() else []

    info = _cmems.cache_info()
    variables = info.get("variables", ["temperature", "salinity", "currents"])

    return {
        "variables": variables,
        "depths": depths,
        "times": times,
        "bbox": REGION_BOUNDS,
        "source": info.get("source", "CMEMS / NetCDF"),
        "cf_conventions": True,
        "registered_parsers": list_sources(),
        "cf_standard_names": {
            v: CF_STANDARD_NAMES.get(v, {}).get("standard_name", v)
            for v in ["temperature", "salinity", "u_current", "v_current", "currents"]
        },
    }


@router.get("/variables", summary="Available variable names")
async def get_variables():
    """Return list of variable names currently in the cache."""
    info = _cmems.cache_info()
    variables = info.get("variables", [])
    return {
        "variables": variables,
        "cf_descriptions": {
            v: CF_STANDARD_NAMES.get(v, {})
            for v in variables
        },
    }


@router.get("/bbox", summary="Geographic bounding box")
async def get_bbox():
    """Return the configured geographic region."""
    return REGION_BOUNDS


@router.get("/parsers", summary="Registered ingestion parsers")
async def get_parsers():
    """List all registered source parsers (plugin registry)."""
    return {"registered_parsers": list_sources()}
