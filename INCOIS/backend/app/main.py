"""
3D Ocean Visualization API — Blueprint-compliant backend entry point.

Assembles all routers into one FastAPI application.
Run: uvicorn backend.app.main:app --reload  (from project root)
  or: python backend/app/main.py
"""

from __future__ import annotations

import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Allow imports from project root (services/, config.py)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.app.config import GRID_REFRESH_INTERVAL_SECONDS
from backend.app.api import routes_model, routes_instruments, routes_meta, routes_ogc

import services.copernicus_client as _cmems  # type: ignore
import services.argovis_client as _argovis    # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ocean_api")


# ── Background grid refresh ───────────────────────────────────────────────

async def _grid_refresh_loop() -> None:
    while True:
        await _cmems.refresh_cache()
        await asyncio.sleep(GRID_REFRESH_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_grid_refresh_loop())
    try:
        yield
    finally:
        task.cancel()


# ── App assembly ──────────────────────────────────────────────────────────

app = FastAPI(
    title="Apna Sagar — 3D Ocean Data Visualization API",
    description=(
        "FastAPI backend for the Apna Sagar 3D Ocean Visualization platform. "
        "Serves CMEMS/NetCDF ocean grids, Argo float profiles, "
        "and OGC WMS/WCS-compatible metadata."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all routers ──────────────────────────────────────────────────
app.include_router(routes_model.router)
app.include_router(routes_instruments.router)
app.include_router(routes_meta.router)
app.include_router(routes_ogc.router)


# ── Health check ──────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "API is running",
        "argovis": _argovis.status(),
        "cmems_cache_ready": _cmems.has_cache(),
        "grid_info": _cmems.cache_info(),
    }


# ── Direct run ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(Path(__file__).parents[2])],
    )
