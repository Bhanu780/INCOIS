"""
Pydantic validation models for all API request/response shapes.

Rows covered: 10 (modular data model), 19 (ML-derived products supported
via generic `derived_vars`), 20 (CF-convention metadata fields).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Grid / Model Field ────────────────────────────────────────────────────


class GridPoint(BaseModel):
    """A single (lat, lon, depth) observation or model value."""

    lat: float
    lon: float
    depth: float
    temp: Optional[float] = None
    salinity: Optional[float] = None
    currents: Optional[float] = None
    # Generic derived variables (ML products, chlorophyll, etc.)
    derived_vars: Dict[str, Optional[float]] = Field(default_factory=dict)


class GridResponse(BaseModel):
    """Full ocean-grid API response."""

    source: str = "unknown"
    variables: List[str] = Field(default_factory=list)
    points: List[GridPoint]


# ── Instrument / Profile ──────────────────────────────────────────────────


class InstrumentLocation(BaseModel):
    """Surface position of a float, glider, CTD drop, or mooring."""

    id: str
    lat: float
    lon: float
    depth: Optional[float] = None
    instrument_type: str = "argo"          # argo | glider | ctd | mooring | adcp | hf-radar
    status: str = "active"                 # active | inactive
    last_profile_id: Optional[str] = None
    last_seen: Optional[str] = None        # ISO-8601 timestamp


class ProfileLevel(BaseModel):
    """One depth level of a vertical profile."""

    depth: float
    temp: Optional[float] = None
    salinity: Optional[float] = None
    timestamp: Optional[str] = None


class ProfileResponse(BaseModel):
    """Depth-vs-variable profile returned on instrument click (Req 3)."""

    instrument_id: str
    instrument_type: str = "argo"
    levels: List[ProfileLevel]


# ── Metadata ──────────────────────────────────────────────────────────────


class MetaResponse(BaseModel):
    """Available variables, depths, timesteps, bounding box (Req 16)."""

    variables: List[str]
    depths: List[float]
    times: List[str]
    bbox: Dict[str, float]   # min_lat, max_lat, min_lon, max_lon
    source: str
    cf_conventions: bool = True


# ── OGC / WMS ─────────────────────────────────────────────────────────────


class WMSLayer(BaseModel):
    """Metadata for a single WMS-style layer (Req 20)."""

    name: str
    title: str
    abstract: str = ""
    bbox: Dict[str, float]
    styles: List[str] = Field(default_factory=list)
    time_range: Optional[Dict[str, str]] = None   # {"start": ..., "end": ...}


class WMSCapabilities(BaseModel):
    """Simplified WMS GetCapabilities response."""

    service: str = "OGC WMS (simplified)"
    version: str = "1.3.0"
    layers: List[WMSLayer]


# ── Colorbar ──────────────────────────────────────────────────────────────


class ColorbarConfig(BaseModel):
    """Client-configurable colorbar parameters (Req 11)."""

    variable: str
    palette: str = "thermal"          # thermal | viridis | plasma | jet | rdbu
    vmin: Optional[float] = None
    vmax: Optional[float] = None
    scale: str = "linear"             # linear | log
