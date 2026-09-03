"""
OGC WMS/WCS-style tile and coverage endpoints.

Blueprint row 20: OGC WMS/WCS + CF Conventions.

This router provides:
  - GET /api/ogc/wms?SERVICE=WMS&REQUEST=GetCapabilities
  - GET /api/ogc/wcs/{variable}  (DescribeCoverage)
  - GET /api/ogc/colorbar  (client-side colorbar configuration helper)

Phase 4 — currently serving JSON equivalents of WMS/WCS responses.
A future upgrade can wrap these in proper XML using the `lxml` library.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query

from backend.app.services.ogc_adapter import (
    build_wms_capabilities,
    build_wcs_coverage,
    tag_variable,
    global_attributes,
)
from backend.app.services.colorbar import list_palettes, default_range

logger = logging.getLogger("ocean_api.routes_ogc")
router = APIRouter(prefix="/api/ogc", tags=["OGC / Standards"])

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))
from services import copernicus_client as _cmems  # type: ignore


@router.get("/wms", summary="WMS GetCapabilities (JSON)")
async def wms_capabilities(
    service: str = Query("WMS"),
    request: str = Query("GetCapabilities"),
    version: str = Query("1.3.0"),
):
    """
    Simplified OGC WMS 1.3.0 GetCapabilities response (JSON format).

    Returns available layers, their bounding boxes, available styles
    (palettes), and temporal/vertical dimensions.
    """
    info = _cmems.cache_info()
    variables = info.get("variables", ["temperature", "salinity", "currents"])
    times = _cmems.available_times() if _cmems.has_cache() else []
    depths = _cmems.available_depths() if _cmems.has_cache() else []
    return build_wms_capabilities(variables, times, depths)


@router.get("/wcs/{variable}", summary="WCS DescribeCoverage (JSON)")
async def wcs_coverage(variable: str):
    """
    Simplified OGC WCS 2.0 DescribeCoverage for a single variable (JSON).
    """
    times = _cmems.available_times() if _cmems.has_cache() else []
    depths = _cmems.available_depths() if _cmems.has_cache() else [0.0]
    return build_wcs_coverage(variable, times, depths)


@router.get("/cf/{variable}", summary="CF-convention metadata for a variable")
async def cf_metadata(variable: str):
    """Return CF-1.8 standard_name, units, and cell_methods for a variable."""
    return {
        "variable": variable,
        "cf": tag_variable(variable),
        "global_attrs": global_attributes(),
    }


@router.get("/colorbar", summary="Available colorbars and default ranges")
async def get_colorbar_info(
    variable: Optional[str] = Query(None, description="Variable to get default range for"),
):
    """
    Returns available palette names and the default min/max range for each variable.
    Used by the frontend ColorbarEditor to populate its palette selector.
    """
    response = {"palettes": list_palettes()}
    if variable:
        vmin, vmax = default_range(variable)
        response["default_range"] = {"vmin": vmin, "vmax": vmax}
    return response
