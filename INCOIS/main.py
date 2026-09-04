import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from config import GRID_DEPTHS_M, GRID_REFRESH_INTERVAL_SECONDS, GRID_STEP_DEG, REGION_BOUNDS
from services import argovis_client, copernicus_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ocean_api")


async def _grid_refresh_loop() -> None:
    # Run once immediately on startup, then on a fixed interval.
    while True:
        await copernicus_client.refresh_cache()
        await asyncio.sleep(GRID_REFRESH_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_grid_refresh_loop())
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(title="Apna Sagar API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {
        "status": "API is running",
        "argovis": argovis_client.status(),
        "cmems_cache_ready": copernicus_client.has_cache(),
        "grid_info": copernicus_client.cache_info(),
    }


@app.get("/api/argo-floats")
async def get_argo_floats(
    days_back: int = 30,
    refresh: bool = False,
    min_lon: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
    min_lat: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
):
    """Real, currently-reporting Argo floats in the region, from Argovis.
    Optional bbox params (min_lon, max_lon, min_lat, max_lat) filter results
    to a specific ocean region.
    """
    try:
        floats = await argovis_client.fetch_active_floats(days_back=days_back, force_refresh=refresh)
        # Apply bounding-box filter when a region is selected
        if all(v is not None for v in [min_lon, max_lon, min_lat, max_lat]):
            floats = [
                f for f in floats
                if min_lat <= f.get("lat", 0) <= max_lat
                and min_lon <= f.get("lon", 0) <= max_lon
            ]
            logger.info(
                f"Bbox filter applied: lon=[{min_lon},{max_lon}] lat=[{min_lat},{max_lat}] "
                f"→ {len(floats)} floats returned"
            )
        return floats
    except Exception as exc:
        logger.exception("Argovis float list fetch failed")
        raise HTTPException(status_code=502, detail=f"Could not reach Argovis: {exc}")


@app.get("/api/float-profile/{float_id}")
async def get_float_profile(float_id: str):
    """Real depth-vs-temperature profile for a float's most recent dive."""
    floats = await argovis_client.fetch_active_floats()
    match = next((f for f in floats if f["id"] == float_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Float '{float_id}' not found")

    profile = await argovis_client.fetch_profile(match["last_profile_id"])
    if profile is None:
        raise HTTPException(
            status_code=502,
            detail="Profile data unavailable or unparsable from Argovis for this float.",
        )

    return {"float_id": float_id, "profile": profile}


@app.get("/api/ocean-grid")
async def get_ocean_grid():
    """Real gridded temperature/salinity/currents, sampled from the cached CMEMS/NetCDF subset."""
    if not copernicus_client.has_cache():
        raise HTTPException(
            status_code=503,
            detail="Ocean data cache is still warming up (first download can take a "
            "minute or two) — retry shortly.",
        )

    lats = list(range(REGION_BOUNDS["min_lat"], REGION_BOUNDS["max_lat"] + 1, GRID_STEP_DEG))
    lons = list(range(REGION_BOUNDS["min_lon"], REGION_BOUNDS["max_lon"] + 1, GRID_STEP_DEG))

    try:
        return copernicus_client.sample_grid(lats, lons, GRID_DEPTHS_M)
    except Exception as exc:
        logger.exception("Ocean grid sampling failed")
        raise HTTPException(status_code=502, detail=str(exc))


@app.post("/api/ocean-grid/refresh")
async def force_grid_refresh():
    """Manually trigger a data re-download instead of waiting for the schedule."""
    ok = await copernicus_client.refresh_cache()
    if not ok:
        raise HTTPException(status_code=502, detail="Cache refresh failed — check server logs.")
    return {"status": "refreshed"}


@app.get("/api/ocean-grid/info")
async def get_grid_info():
    """Return metadata about the currently loaded dataset (variables, coords, source)."""
    return copernicus_client.cache_info()


@app.get("/api/ocean-grid/depths")
async def get_available_depths():
    """Return the list of actual depth levels available in the cached dataset."""
    return {"depths": copernicus_client.available_depths()}


@app.get("/api/ocean-grid/times")
async def get_available_times():
    """Return the list of timestamps available in the cached dataset."""
    return {"times": copernicus_client.available_times()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
