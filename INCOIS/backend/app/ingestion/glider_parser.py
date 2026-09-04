"""
Glider profile parser — stub implementing BaseParser.

Blueprint row 2, 18: Glider ingestion support planned for Phase 4.

To activate:
  1. Provide glider NetCDF / Iridium CSV files in OCEAN_NETCDF_DIR/gliders/
  2. Implement load() to read those files with xarray/pandas
  3. Implement to_points() and profile() with real data
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.app.ingestion.base_parser import BaseParser


class GliderParser(BaseParser):
    """
    Stub parser for glider trajectory data.

    Gliders produce depth-resolving profiles along a horizontal track,
    storing temperature, salinity, chlorophyll, and optionally oxygen.
    """

    source_type = "glider"

    def load(self, **kwargs: Any) -> None:
        # TODO: Implement NetCDF / CSV glider reader
        self._loaded = True

    def to_grid(
        self,
        lats: List[float],
        lons: List[float],
        depths: List[float],
    ) -> List[Dict[str, Any]]:
        """Gliders are track-based — not a regular grid."""
        return []

    def to_points(self) -> List[Dict[str, Any]]:
        """Return glider surface positions (TODO: read from real data)."""
        return []

    def profile(self, instrument_id: str) -> Optional[List[Dict[str, Any]]]:
        """Return glider depth profile (TODO: implement)."""
        return None
