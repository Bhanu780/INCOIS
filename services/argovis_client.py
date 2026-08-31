import datetime
import logging
from typing import Any, Dict, List, Optional
import httpx
from config import ARGOVIS_API_KEY, REGION_BOUNDS

logger = logging.getLogger("ocean_api.argovis")

class ArgovisClient:
    BASE_URL = "https://argovis-api.colorado.edu"

    def __init__(self, api_key: str = ARGOVIS_API_KEY):
        # API key loaded securely from environment / .env
        self._HEADERS = {"x-api-key": api_key} if api_key and api_key != "your_argovis_api_key_here" else {}
        self._floats_cache: List[Dict[str, Any]] = []
        self._profiles_cache: Dict[str, List[Dict[str, float]]] = {}
        self._last_fetch: Optional[datetime.datetime] = None
        self._data_source: str = "unknown"  # "argovis", "cache", or "none"
        self._last_fetch_error: Optional[str] = None

    async def fetch_active_floats(self, days_back: int = 30, force_refresh: bool = False) -> List[Dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc)
        if not force_refresh and self._floats_cache and self._last_fetch and (now - self._last_fetch).total_seconds() < 1800:
            return self._floats_cache

        start_date = (now - datetime.timedelta(days=days_back)).strftime("%Y-%m-%dT00:00:00Z")
        end_date = now.strftime("%Y-%m-%dT23:59:59Z")
        box = f"[[{REGION_BOUNDS['min_lon']},{REGION_BOUNDS['min_lat']}],[{REGION_BOUNDS['max_lon']},{REGION_BOUNDS['max_lat']}]]"
        url = f"{self.BASE_URL}/argo?startDate={start_date}&endDate={end_date}&box={box}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self._HEADERS)
                if resp.status_code == 200:
                    data = resp.json()
                    floats_map: Dict[str, Dict[str, Any]] = {}
                    for item in data:
                        platform = str(item.get("platform", item.get("_id", "unknown")))
                        coords = item.get("geolocation", {}).get("coordinates", [0, 0])
                        # Sanity check: determine [lon, lat] vs [lat, lon]
                        if len(coords) >= 2:
                            if abs(coords[0]) > 90 and abs(coords[1]) <= 90:
                                lon, lat = coords[0], coords[1]  # [lon, lat]
                            elif abs(coords[1]) > 90 and abs(coords[0]) <= 90:
                                lon, lat = coords[1], coords[0]  # [lat, lon] — swap
                            else:
                                # Both within ±90 — assume Argovis convention [lon, lat]
                                lon, lat = coords[0], coords[1]
                        else:
                            lon, lat = 0, 0

                        float_id = f"AF-{platform}"
                        floats_map[float_id] = {
                            "id": float_id,
                            "lat": round(lat, 2),
                            "lon": round(lon, 2),
                            "status": "active",
                            "last_profile_id": str(item.get("_id")),
                        }

                    if floats_map:
                        self._floats_cache = list(floats_map.values())
                        self._last_fetch = now
                        self._data_source = "argovis"
                        self._last_fetch_error = None
                        logger.info(f"Fetched {len(self._floats_cache)} active floats from Argovis API")
                        return self._floats_cache
                    else:
                        self._last_fetch_error = "Argovis returned empty data"
                        logger.warning("Argovis API returned empty result set")
        except Exception as e:
            self._last_fetch_error = str(e)
            logger.warning(f"Argovis API query failed: {e}")

        # Return cached data if available, otherwise empty list (no mock data)
        if self._floats_cache:
            self._data_source = "cache"
            return self._floats_cache
        self._data_source = "none"
        return []

    def status(self) -> Dict[str, Any]:
        """Return data source status for the frontend."""
        return {
            "data_source": self._data_source,
            "float_count": len(self._floats_cache),
            "last_fetch": self._last_fetch.isoformat() if self._last_fetch else None,
            "last_error": self._last_fetch_error,
        }

    async def fetch_profile(self, profile_id: str) -> Optional[List[Dict[str, float]]]:
        if profile_id in self._profiles_cache:
            logger.debug(f"Returning cached profile for {profile_id}")
            return self._profiles_cache[profile_id]

        # Argovis v2 API: try ?_id=<profile_id> first (underscore prefix), then ?id=<profile_id>
        urls_to_try = [
            f"{self.BASE_URL}/argo?_id={profile_id}",
            f"{self.BASE_URL}/argo?id={profile_id}",
        ]

        # If profile_id looks like "PLATFORM_CYCLE" (e.g., "5907085_103"), also try platform query
        if "_" in profile_id:
            platform = profile_id.split("_")[0]
            urls_to_try.append(f"{self.BASE_URL}/argo?platform={platform}&limit=1")

        for url in urls_to_try:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.get(url, headers=self._HEADERS)
                    logger.debug(f"Profile fetch {url} -> {resp.status_code}")
                    if resp.status_code != 200:
                        continue
                    raw_list = resp.json()
                    if not raw_list or not isinstance(raw_list, list):
                        continue

                    pdata = raw_list[0]

                    # data_info can be:
                    #   [["pres", unit, ...], ["temp", unit, ...]]  (list-of-lists, Argovis v2)
                    #   ["pres", "temp", ...]                       (flat list, legacy)
                    data_info = pdata.get("data_info", [])
                    data_matrix = pdata.get("data", [])
                    logger.debug(f"Profile {profile_id}: data_info={data_info}, rows={len(data_matrix)}")

                    # Normalise keys to flat strings
                    keys = [
                        (k[0] if isinstance(k, (list, tuple)) else str(k)).lower()
                        for k in data_info
                    ]

                    pres_idx = next((i for i, k in enumerate(keys) if "pres" in k), None)
                    temp_idx = next((i for i, k in enumerate(keys) if "temp" in k), None)

                    if pres_idx is None or temp_idx is None:
                        logger.warning(f"Profile {profile_id}: pres/temp not in keys {keys}, trying next URL")
                        continue

                    profile = []
                    for row in (data_matrix or []):
                        if not isinstance(row, (list, tuple)):
                            continue
                        if len(row) <= max(pres_idx, temp_idx):
                            continue
                        pres = row[pres_idx]
                        temp = row[temp_idx]
                        if pres is None or temp is None:
                            continue
                        try:
                            # dbar → metres (simplified, accurate to ~1%)
                            depth_m = float(pres) / 10.1
                            temperature_c = float(temp)
                            profile.append({
                                "depth_m": round(depth_m, 1),
                                "temperature_c": round(temperature_c, 2),
                            })
                        except (ValueError, TypeError):
                            continue

                    if profile:
                        profile.sort(key=lambda x: x["depth_m"])
                        self._profiles_cache[profile_id] = profile
                        logger.info(f"Successfully fetched profile {profile_id}: {len(profile)} measurements via {url}")
                        return profile

                    logger.warning(f"Profile {profile_id}: parsed 0 valid measurements from {url}")

            except Exception as e:
                logger.warning(f"Failed to fetch profile {profile_id} from {url}: {e}")
                continue

        logger.error(f"All URL attempts failed for profile {profile_id}")
        return None


argovis_client = ArgovisClient()
