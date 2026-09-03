"""
NetCDF / xarray parser — wraps CopernicusClient into the BaseParser interface.

Blueprint row 9: Multi-format ingestion via xarray + netCDF4.
"""

from __future__ import annotations

import sys
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

# Allow importing from project root services/
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from backend.app.ingestion.base_parser import BaseParser


class NetCDFParser(BaseParser):
    """
    Parser wrapping the existing CopernicusClient xarray pipeline.

    Data source priority (handled internally by CopernicusClient):
      1. Local NetCDF files in OCEAN_NETCDF_DIR
      2. Copernicus Marine Toolbox (copernicusmarine)
      3. OPeNDAP URL fallback (HYCOM / INCOIS ROMS)
    """

    source_type = "netcdf"

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        # Lazy import to avoid circular deps
        from services.copernicus_client import CopernicusClient  # type: ignore
        self._client = CopernicusClient()

    def load(self, **kwargs: Any) -> None:
        """Delegate to CopernicusClient.refresh_cache() (sync wrapper)."""
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            ok = loop.run_until_complete(self._client.refresh_cache())
            self._loaded = ok
        finally:
            loop.close()

    def to_grid(
        self,
        lats: List[float],
        lons: List[float],
        depths: List[float],
    ) -> List[Dict[str, Any]]:
        """Extract gridded values from the cached xarray dataset."""
        if not self._loaded:
            return []
        try:
            return self._client.sample_grid(
                [int(la) for la in lats],
                [int(lo) for lo in lons],
                [int(d) for d in depths],
            )
        except Exception:
            return []

    def to_points(self) -> List[Dict[str, Any]]:
        """NetCDF model fields don't have instrument locations."""
        return []

    def available_depths(self) -> List[float]:
        return self._client.available_depths()

    def available_times(self) -> List[str]:
        return self._client.available_times()

    def cache_info(self) -> Dict[str, Any]:
        return self._client.cache_info()

    def has_cache(self) -> bool:
        return self._client.has_cache()
