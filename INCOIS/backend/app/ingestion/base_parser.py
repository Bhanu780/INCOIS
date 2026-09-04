"""
Abstract base class for all data source parsers.

Blueprint row 10 & 18: Modular, plugin-style parser registry.

Adding a new data source requires only:
  1. Subclass BaseParser
  2. Implement load(), to_grid(), to_points()
  3. Register in registry.py
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseParser(ABC):
    """
    Interface every ingestion parser must implement.

    Methods
    -------
    load(**kwargs)
        Load / open the underlying dataset.  May be lazy (xarray dask).
    to_grid(lats, lons, depths) -> list[dict]
        Extract gridded values at the requested coordinate grid.
        Returns: [{lat, lon, depth, temp, salinity, currents, derived_vars}, …]
    to_points() -> list[dict]
        Return all instrument *locations* (surface positions).
        Returns: [{id, lat, lon, instrument_type, status, last_profile_id, last_seen}, …]
    profile(instrument_id) -> list[dict] | None
        Return depth-profile levels for a specific instrument.
        Returns: [{depth, temp, salinity, timestamp}, …] or None
    """

    #: Human-readable name of this parser (used in registry + logs)
    source_type: str = "base"

    def __init__(self, **kwargs: Any) -> None:
        self._kwargs = kwargs
        self._loaded: bool = False

    @abstractmethod
    def load(self, **kwargs: Any) -> None:
        """Open/load the data source.  Idempotent — safe to call multiple times."""

    @abstractmethod
    def to_grid(
        self,
        lats: List[float],
        lons: List[float],
        depths: List[float],
    ) -> List[Dict[str, Any]]:
        """Return gridded values at requested (lat, lon, depth) points."""

    @abstractmethod
    def to_points(self) -> List[Dict[str, Any]]:
        """Return instrument surface locations."""

    def profile(self, instrument_id: str) -> Optional[List[Dict[str, Any]]]:
        """
        Optional — return depth profile for the given instrument.
        Override in subclasses that support it (Argo, Glider, CTD).
        """
        return None  # noqa: RET504

    # ── Convenience ──────────────────────────────────────────────────────

    def is_loaded(self) -> bool:
        return self._loaded

    def ensure_loaded(self) -> None:
        if not self._loaded:
            self.load(**self._kwargs)
