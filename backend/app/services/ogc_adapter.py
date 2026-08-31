"""
OGC WMS/WCS adapter — CF-convention tagging and WMS/WCS response shaping.

Blueprint row 20: Follow OGC WMS/WCS + CF Conventions.

Provides:
  - CF-convention metadata tagging for NetCDF outputs
  - WMS GetCapabilities response builder
  - WCS DescribeCoverage stub
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.app.config import REGION_BOUNDS


# ── CF Convention metadata maps ───────────────────────────────────────────

CF_STANDARD_NAMES: Dict[str, Dict[str, str]] = {
    "temperature": {
        "standard_name": "sea_water_temperature",
        "long_name": "Sea Water Temperature",
        "units": "degrees_C",
        "cell_methods": "time: mean depth: mean",
    },
    "salinity": {
        "standard_name": "sea_water_salinity",
        "long_name": "Sea Water Practical Salinity",
        "units": "1",
        "cell_methods": "time: mean depth: mean",
    },
    "u_current": {
        "standard_name": "eastward_sea_water_velocity",
        "long_name": "Eastward Sea Water Velocity",
        "units": "m s-1",
        "cell_methods": "time: mean",
    },
    "v_current": {
        "standard_name": "northward_sea_water_velocity",
        "long_name": "Northward Sea Water Velocity",
        "units": "m s-1",
        "cell_methods": "time: mean",
    },
    "currents": {
        "standard_name": "sea_water_speed",
        "long_name": "Sea Water Current Speed",
        "units": "m s-1",
        "cell_methods": "time: mean",
    },
}

CF_GLOBAL_ATTRS: Dict[str, str] = {
    "Conventions": "CF-1.8",
    "institution": "INCOIS / SIH-2026 Demo",
    "source": "CMEMS Global Ocean Physics Analysis & Forecast",
    "references": "https://marine.copernicus.eu",
    "comment": "Subset: Arabian Sea and Bay of Bengal",
    "geospatial_lat_min": str(REGION_BOUNDS["min_lat"]),
    "geospatial_lat_max": str(REGION_BOUNDS["max_lat"]),
    "geospatial_lon_min": str(REGION_BOUNDS["min_lon"]),
    "geospatial_lon_max": str(REGION_BOUNDS["max_lon"]),
    "geospatial_vertical_positive": "down",
    "geospatial_vertical_units": "m",
}


def tag_variable(variable: str) -> Dict[str, str]:
    """Return CF-convention attributes for the given variable name."""
    return CF_STANDARD_NAMES.get(variable.lower(), {
        "standard_name": variable,
        "long_name": variable.replace("_", " ").title(),
        "units": "1",
    })


def global_attributes(extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """Return global CF attributes, optionally merged with extra entries."""
    attrs = dict(CF_GLOBAL_ATTRS)
    if extra:
        attrs.update(extra)
    return attrs


# ── WMS GetCapabilities builder ───────────────────────────────────────────

def build_wms_capabilities(
    variables: List[str],
    times: List[str],
    depths: List[float],
) -> Dict[str, Any]:
    """
    Build a simplified OGC WMS 1.3.0 GetCapabilities-style response.
    Returns JSON — real WMS would return XML, but JSON is used here for
    the REST API.  A proper XML adapter can wrap this dict.
    """
    layers = []
    for var in variables:
        cf = tag_variable(var)
        layers.append({
            "name": var,
            "title": cf.get("long_name", var),
            "abstract": f"CF standard_name: {cf.get('standard_name', var)}",
            "bbox": {
                "minx": REGION_BOUNDS["min_lon"],
                "miny": REGION_BOUNDS["min_lat"],
                "maxx": REGION_BOUNDS["max_lon"],
                "maxy": REGION_BOUNDS["max_lat"],
                "crs": "EPSG:4326",
            },
            "styles": ["default", "thermal", "viridis", "plasma", "jet"],
            "dimensions": {
                "time": {
                    "units": "ISO8601",
                    "values": times[:5],       # first 5 for brevity
                    "total": len(times),
                },
                "elevation": {
                    "units": "meters",
                    "positive": "down",
                    "values": depths,
                },
            },
            "cf_metadata": cf,
        })

    return {
        "service": "WMS",
        "version": "1.3.0",
        "cf_conventions": "CF-1.8",
        "contact": "INCOIS / SIH-2026",
        "layers": layers,
    }


# ── WCS DescribeCoverage stub ─────────────────────────────────────────────

def build_wcs_coverage(variable: str, times: List[str], depths: List[float]) -> Dict[str, Any]:
    """Minimal WCS 2.0 DescribeCoverage response for one variable."""
    cf = tag_variable(variable)
    return {
        "service": "WCS",
        "version": "2.0",
        "coverage_id": f"ocean_3d_{variable}",
        "coverage_description": cf.get("long_name", variable),
        "cf_standard_name": cf.get("standard_name", variable),
        "units": cf.get("units", "1"),
        "domain": {
            "type": "ReferenceableGridCoverage",
            "crs": "EPSG:4326+EPSG:5715",   # horizontal + vertical CRS
            "envelope": {
                "lat": [REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"]],
                "lon": [REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"]],
                "depth_m": [min(depths, default=0), max(depths, default=0)],
            },
            "time": {
                "start": times[0] if times else None,
                "end": times[-1] if times else None,
                "count": len(times),
            },
        },
    }
