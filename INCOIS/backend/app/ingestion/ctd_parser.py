"""
CTD (Conductivity-Temperature-Depth) cast parser — stub implementing BaseParser.

Blueprint row 18: Extensible plugin for CTD, moorings, HF-radar, ADCP.

CTD casts produce high-vertical-resolution profiles at a fixed station.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.app.ingestion.base_parser import BaseParser


class CTDParser(BaseParser):
    """
    Stub parser for CTD cast data.

    Supported formats (TODO):
      - SeaBird .cnv files
      - ODF (Ocean Data Format) files
      - CF-compliant NetCDF profiles (Argo-style)
    """

    source_type = "ctd"

    def load(self, **kwargs: Any) -> None:
        # TODO: Implement SeaBird CNV / ODF / NetCDF CTD reader
        self._loaded = True

    def to_grid(
        self,
        lats: List[float],
        lons: List[float],
        depths: List[float],
    ) -> List[Dict[str, Any]]:
        """CTD casts are point observations — not a regular grid."""
        return []

    def to_points(self) -> List[Dict[str, Any]]:
        """Return CTD station positions (TODO: read from real data)."""
        return []

    def profile(self, instrument_id: str) -> Optional[List[Dict[str, Any]]]:
        """Return CTD depth profile (TODO: implement)."""
        return None
