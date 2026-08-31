"""
Copernicus Marine Service (CMEMS) client — real ocean data via xarray.

Supports three data sources in priority order:
  1. Local NetCDF files  (fastest, zero network dependency)
  2. Copernicus Marine Toolbox  (`copernicusmarine.open_dataset`)
  3. OPeNDAP URLs  (legacy fallback for HYCOM / INCOIS ROMS)

All synthetic / trigonometric approximations have been removed.
"""

from __future__ import annotations

import asyncio
import logging
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import xarray as xr

from config import COPERNICUS_USERNAME, COPERNICUS_PASSWORD, REGION_BOUNDS

logger = logging.getLogger("ocean_api.copernicus")

# ── Default CMEMS product / dataset identifiers ─────────────────────────
# Global Ocean Physics Analysis & Forecast (1/12°, daily means)
CMEMS_PRODUCT_ID = "GLOBAL_ANALYSISFORECAST_PHY_001_024"
CMEMS_DATASET_ID = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m"
CMEMS_DATASET_ID_TEM_SAL = "cmems_mod_glo_phy_anfc_0.083deg_P1D-m"

# CF-convention standard variable names coming from CMEMS / HYCOM / ROMS
VAR_MAP = {
    "temperature": ["thetao", "temperature", "temp", "sea_water_temperature", "water_temp"],
    "salinity":    ["so", "salinity", "salt", "sea_water_salinity", "water_salt"],
    "u_current":   ["uo", "u", "water_u", "eastward_sea_water_velocity"],
    "v_current":   ["vo", "v", "water_v", "northward_sea_water_velocity"],
}

# Depth coordinate name candidates used across different models
DEPTH_COORD_NAMES = ["depth", "lev", "z", "Depth", "st_ocean", "s_rho"]
LAT_COORD_NAMES   = ["latitude", "lat", "y", "nav_lat", "eta_rho"]
LON_COORD_NAMES   = ["longitude", "lon", "x", "nav_lon", "xi_rho"]
TIME_COORD_NAMES  = ["time", "time_counter", "ocean_time"]

# ── Local NetCDF search path (configurable via env var) ─────────────────
NETCDF_DATA_DIR = Path(os.getenv("OCEAN_NETCDF_DIR", str(Path(__file__).resolve().parent.parent / "data")))


def _resolve_coord(ds: xr.Dataset, candidates: List[str]) -> Optional[str]:
    """Find the first coordinate/dimension name that exists in the dataset."""
    all_names = set(ds.coords) | set(ds.dims)
    for name in candidates:
        if name in all_names:
            return name
    return None


def _resolve_var(ds: xr.Dataset, candidates: List[str]) -> Optional[str]:
    """Find the first data variable name that exists in the dataset."""
    for name in candidates:
        if name in ds.data_vars:
            return name
    return None


class CopernicusClient:
    """
    Manages an in-memory xarray.Dataset cache of ocean physics fields.

    The cache is populated via `refresh_cache()` which is called periodically
    by the FastAPI lifespan loop.  `sample_grid()` then extracts values from
    the cached dataset at the requested lat/lon/depth grid — all values are
    **real observations or model output**, never synthetic.
    """

    def __init__(self) -> None:
        self._username: str = COPERNICUS_USERNAME
        self._password: str = COPERNICUS_PASSWORD
        self._ds: Optional[xr.Dataset] = None
        self._cache_ready: bool = False
        self._last_refresh: Optional[datetime] = None

        # Resolved coordinate & variable names (populated on first load)
        self._lat_name: Optional[str] = None
        self._lon_name: Optional[str] = None
        self._depth_name: Optional[str] = None
        self._time_name: Optional[str] = None
        self._temp_var: Optional[str] = None
        self._sal_var: Optional[str] = None
        self._u_var: Optional[str] = None
        self._v_var: Optional[str] = None

    # ── Public status ────────────────────────────────────────────────────

    def has_cache(self) -> bool:
        return self._cache_ready and self._ds is not None

    def cache_info(self) -> Dict[str, Any]:
        """Return metadata about the currently loaded dataset."""
        if not self.has_cache():
            return {"loaded": False}
        ds = self._ds
        return {
            "loaded": True,
            "last_refresh": self._last_refresh.isoformat() if self._last_refresh else None,
            "variables": list(ds.data_vars),
            "coords": {k: list(map(str, ds.coords[k].values[:5])) for k in ds.coords},
            "temp_var": self._temp_var,
            "sal_var": self._sal_var,
            "u_var": self._u_var,
            "v_var": self._v_var,
        }

    # ── Cache refresh (blocking I/O offloaded to thread) ─────────────────

    async def refresh_cache(self) -> bool:
        """Attempt to load ocean data.  Tries local files → CMEMS toolbox → OPeNDAP."""
        try:
            ds = await asyncio.to_thread(self._load_dataset)
            if ds is None:
                logger.error("All data sources failed — no dataset loaded.")
                return False

            self._ds = ds
            self._resolve_names(ds)
            self._cache_ready = True
            self._last_refresh = datetime.now(timezone.utc)
            logger.info(
                "Ocean grid cache loaded — temp=%s  sal=%s  u=%s  v=%s  | shape=%s",
                self._temp_var, self._sal_var, self._u_var, self._v_var,
                {k: ds[k].shape for k in ds.data_vars if k in [self._temp_var, self._sal_var]},
            )
            return True
        except Exception:
            logger.exception("refresh_cache failed")
            return False

    # ── Internal loaders (run in thread) ─────────────────────────────────

    def _load_dataset(self) -> Optional[xr.Dataset]:
        """Try data sources in priority order."""
        # 1. Local NetCDF files
        ds = self._try_local_netcdf()
        if ds is not None:
            return ds

        # 2. Copernicus Marine Toolbox (copernicusmarine pip package)
        ds = self._try_cmems_toolbox()
        if ds is not None:
            return ds

        # 3. OPeNDAP URL (HYCOM / INCOIS ROMS / any public OPeNDAP)
        ds = self._try_opendap()
        if ds is not None:
            return ds

        return None

    def _try_local_netcdf(self) -> Optional[xr.Dataset]:
        """Scan OCEAN_NETCDF_DIR for .nc files and open with xarray."""
        if not NETCDF_DATA_DIR.is_dir():
            logger.info("No local NetCDF directory at %s — skipping.", NETCDF_DATA_DIR)
            return None

        nc_files = sorted(NETCDF_DATA_DIR.glob("*.nc"))
        if not nc_files:
            logger.info("No .nc files found in %s — skipping.", NETCDF_DATA_DIR)
            return None

        logger.info("Opening %d local NetCDF file(s) from %s", len(nc_files), NETCDF_DATA_DIR)
        try:
            if len(nc_files) == 1:
                ds = xr.open_dataset(nc_files[0], engine="netcdf4")
            else:
                # Multi-file dataset (e.g. one file per timestep or variable)
                ds = xr.open_mfdataset(
                    nc_files,
                    engine="netcdf4",
                    combine="by_coords",
                    parallel=False,
                )
            # Subset to the configured region to save memory
            return self._regional_subset(ds)
        except Exception:
            logger.exception("Failed to open local NetCDF files")
            return None

    def _try_cmems_toolbox(self) -> Optional[xr.Dataset]:
        """Use the `copernicusmarine` package for lazy remote access."""
        try:
            import copernicusmarine  # noqa: F811
        except ImportError:
            logger.info("copernicusmarine package not installed — skipping CMEMS toolbox source.")
            return None

        if not self._username or not self._password:
            logger.warning("COPERNICUS_USERNAME / COPERNICUS_PASSWORD not set — skipping CMEMS.")
            return None

        try:
            logger.info("Opening CMEMS dataset %s via copernicusmarine toolbox …", CMEMS_DATASET_ID_TEM_SAL)
            ds = copernicusmarine.open_dataset(
                dataset_id=CMEMS_DATASET_ID_TEM_SAL,
                username=self._username,
                password=self._password,
                minimum_longitude=REGION_BOUNDS["min_lon"],
                maximum_longitude=REGION_BOUNDS["max_lon"],
                minimum_latitude=REGION_BOUNDS["min_lat"],
                maximum_latitude=REGION_BOUNDS["max_lat"],
                minimum_depth=0,
                maximum_depth=1100,
            )
            # ds is lazily loaded — calling .load() would pull into RAM.
            # We keep it lazy and let sample_grid select only the points it needs.
            return ds
        except Exception:
            logger.exception("CMEMS toolbox open_dataset failed")
            return None

    def _try_opendap(self) -> Optional[xr.Dataset]:
        """
        Fallback: try well-known public OPeNDAP endpoints.

        HYCOM GLBa0.08 is free and requires no auth.
        INCOIS ROMS endpoints can be added to OPENDAP_URLS env var.
        """
        opendap_urls_raw = os.getenv("OPENDAP_URLS", "")
        urls: List[str] = [u.strip() for u in opendap_urls_raw.split(",") if u.strip()]

        # Default public HYCOM endpoint as a fallback
        if not urls:
            urls = [
                "https://tds.hycom.org/thredds/dodsC/GLBy0.08/latest",
            ]

        for url in urls:
            try:
                logger.info("Trying OPeNDAP URL: %s", url)
                ds = xr.open_dataset(url, engine="netcdf4")
                ds = self._regional_subset(ds)
                return ds
            except Exception:
                logger.warning("OPeNDAP URL %s failed", url, exc_info=True)

        return None

    # ── Helpers ──────────────────────────────────────────────────────────

    def _regional_subset(self, ds: xr.Dataset) -> xr.Dataset:
        """Slice the dataset to the configured REGION_BOUNDS."""
        lat_name = _resolve_coord(ds, LAT_COORD_NAMES)
        lon_name = _resolve_coord(ds, LON_COORD_NAMES)
        depth_name = _resolve_coord(ds, DEPTH_COORD_NAMES)
        time_name = _resolve_coord(ds, TIME_COORD_NAMES)

        slicers: Dict[str, slice] = {}
        if lat_name:
            # Handle both ascending and descending lat grids
            lat_vals = ds.coords[lat_name].values
            lat_ascending = lat_vals[-1] > lat_vals[0] if len(lat_vals) > 1 else True
            if lat_ascending:
                slicers[lat_name] = slice(REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"])
            else:
                slicers[lat_name] = slice(REGION_BOUNDS["max_lat"], REGION_BOUNDS["min_lat"])
        if lon_name:
            slicers[lon_name] = slice(REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"])
        if depth_name:
            slicers[depth_name] = slice(0, 1100)
        if time_name:
            # Take the most recent timestep with actual data.
            # The latest timestep in CMEMS can sometimes be empty/NaN,
            # so we walk backwards until we find one with valid values.
            try:
                times = ds.coords[time_name].values
                if len(times) > 0:
                    # Try from newest to oldest
                    selected = None
                    for t in reversed(times):
                        candidate = ds.sel({time_name: t})
                        # Check if any data variable has non-NaN values
                        has_data = False
                        for var in candidate.data_vars:
                            if np.any(~np.isnan(candidate[var].values)):
                                has_data = True
                                break
                        if has_data:
                            selected = t
                            break
                    if selected is not None:
                        ds = ds.sel({time_name: selected}, method="nearest")
                    else:
                        # Fallback: just take latest even if empty
                        ds = ds.sel({time_name: times[-1]}, method="nearest")
            except Exception:
                pass  # Non-fatal — keep full time axis

        if slicers:
            ds = ds.sel(**slicers)

        return ds

    def _resolve_names(self, ds: xr.Dataset) -> None:
        """Detect coordinate and variable names from the loaded dataset."""
        self._lat_name = _resolve_coord(ds, LAT_COORD_NAMES)
        self._lon_name = _resolve_coord(ds, LON_COORD_NAMES)
        self._depth_name = _resolve_coord(ds, DEPTH_COORD_NAMES)
        self._time_name = _resolve_coord(ds, TIME_COORD_NAMES)

        self._temp_var = _resolve_var(ds, VAR_MAP["temperature"])
        self._sal_var = _resolve_var(ds, VAR_MAP["salinity"])
        self._u_var = _resolve_var(ds, VAR_MAP["u_current"])
        self._v_var = _resolve_var(ds, VAR_MAP["v_current"])

    # ── Grid sampling (called from the API endpoint) ─────────────────────

    def sample_grid(
        self,
        lats: List[int],
        lons: List[int],
        depths: List[int],
    ) -> List[Dict[str, Any]]:
        """
        Extract real values at the requested (lat, lon, depth) grid points
        using xarray nearest-neighbour selection from the cached dataset.

        Returns the same JSON-serialisable list-of-dicts format the frontend
        already expects:  [{lat, lon, depth, temp, salinity, currents}, …]
        """
        if self._ds is None:
            raise RuntimeError("Dataset cache is empty — call refresh_cache() first.")

        ds = self._ds
        grid: List[Dict[str, Any]] = []

        for lat in lats:
            for lon in lons:
                for depth in depths:
                    point: Dict[str, Any] = {
                        "lat": lat,
                        "lon": lon,
                        "depth": depth,
                        "temp": None,
                        "salinity": None,
                        "currents": None,
                    }

                    # Build the selector dict for xr.Dataset.sel()
                    sel: Dict[str, Any] = {}
                    if self._lat_name:
                        sel[self._lat_name] = lat
                    if self._lon_name:
                        sel[self._lon_name] = lon
                    if self._depth_name:
                        sel[self._depth_name] = depth

                    try:
                        sample = ds.sel(sel, method="nearest")

                        # Temperature
                        if self._temp_var and self._temp_var in sample.data_vars:
                            val = float(sample[self._temp_var].values)
                            if not (np.isnan(val) or np.isinf(val)):
                                point["temp"] = round(val, 2)

                        # Salinity
                        if self._sal_var and self._sal_var in sample.data_vars:
                            val = float(sample[self._sal_var].values)
                            if not (np.isnan(val) or np.isinf(val)):
                                point["salinity"] = round(val, 2)

                        # Currents — compute speed from u, v components
                        u_val, v_val = 0.0, 0.0
                        has_current = False
                        if self._u_var and self._u_var in sample.data_vars:
                            raw = float(sample[self._u_var].values)
                            if not (np.isnan(raw) or np.isinf(raw)):
                                u_val = raw
                                has_current = True
                        if self._v_var and self._v_var in sample.data_vars:
                            raw = float(sample[self._v_var].values)
                            if not (np.isnan(raw) or np.isinf(raw)):
                                v_val = raw
                                has_current = True

                        if has_current:
                            speed = math.sqrt(u_val ** 2 + v_val ** 2)
                            point["currents"] = round(speed, 3)

                    except (KeyError, ValueError, IndexError):
                        logger.debug(
                            "No data at lat=%s lon=%s depth=%s — leaving as None",
                            lat, lon, depth,
                        )

                    grid.append(point)

        return grid

    # ── Utility: list available timesteps (for future time-slider) ──────

    def available_times(self) -> List[str]:
        """Return ISO-formatted timestamps available in the cached dataset."""
        if not self.has_cache() or not self._time_name:
            return []
        try:
            times = self._ds.coords[self._time_name].values
            return [str(t) for t in times]
        except Exception:
            return []

    # ── Utility: list available depth levels ─────────────────────────────

    def available_depths(self) -> List[float]:
        """Return depth levels (in metres) available in the cached dataset."""
        if not self.has_cache() or not self._depth_name:
            return []
        try:
            return sorted(float(d) for d in self._ds.coords[self._depth_name].values)
        except Exception:
            return []


# ── Module-level singleton (imported by services/__init__.py) ────────────
copernicus_client = CopernicusClient()
