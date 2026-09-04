"""
Argo float parser — wraps ArgovisClient into the BaseParser interface.

Blueprint row 2, 3, 9: Argo float ingestion, profile retrieval.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from backend.app.ingestion.base_parser import BaseParser


class ArgoParser(BaseParser):
    """
    Parser wrapping the existing ArgovisClient.

    Provides:
      - to_points(): currently-reporting Argo float positions
      - profile(float_id): depth-vs-temperature/salinity profile
    """

    source_type = "argo"

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        from services.argovis_client import ArgovisClient  # type: ignore
        self._client = ArgovisClient()

    def load(self, **kwargs: Any) -> None:
        """Pre-fetch active floats into the client cache."""
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(
                self._client.fetch_active_floats(force_refresh=True)
            )
            self._loaded = True
        except Exception:
            self._loaded = False
        finally:
            loop.close()

    def to_grid(
        self,
        lats: List[float],
        lons: List[float],
        depths: List[float],
    ) -> List[Dict[str, Any]]:
        """Argo floats are point data — not a regular grid."""
        return []

    def to_points(self) -> List[Dict[str, Any]]:
        """Return active Argo float surface locations."""
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            floats = loop.run_until_complete(
                self._client.fetch_active_floats()
            )
            return [
                {
                    "id": f.get("id", ""),
                    "lat": f.get("lat", 0.0),
                    "lon": f.get("lon", 0.0),
                    "instrument_type": "argo",
                    "status": f.get("status", "active"),
                    "last_profile_id": f.get("last_profile_id"),
                    "last_seen": f.get("last_seen"),
                }
                for f in floats
            ]
        except Exception:
            return []
        finally:
            loop.close()

    def profile(self, instrument_id: str) -> Optional[List[Dict[str, Any]]]:
        """Fetch depth-profile for the given float ID."""
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            # First find the float to get its last_profile_id
            floats = loop.run_until_complete(self._client.fetch_active_floats())
            match = next((f for f in floats if f["id"] == instrument_id), None)
            if not match:
                return None
            raw = loop.run_until_complete(
                self._client.fetch_profile(match["last_profile_id"])
            )
            return raw  # [{depth, temp, salinity, timestamp}, ...]
        except Exception:
            return None
        finally:
            loop.close()
