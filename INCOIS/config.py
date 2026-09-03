import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# API Keys & Auth loaded strictly from environment (.env)
ARGOVIS_API_KEY = os.getenv("ARGOVIS_API_KEY", "")
COPERNICUS_USERNAME = os.getenv("COPERNICUS_USERNAME", "")
COPERNICUS_PASSWORD = os.getenv("COPERNICUS_PASSWORD", "")

# Geographic bounds for Arabian Sea & Bay of Bengal region
REGION_BOUNDS = {
    "min_lat": 8,
    "max_lat": 24,
    "min_lon": 64,
    "max_lon": 88,
}

GRID_STEP_DEG = 2
GRID_DEPTHS_M = [0, 50, 100, 200, 300, 400, 500, 750, 1000]
GRID_REFRESH_INTERVAL_SECONDS = 3600  # Refresh cache every hour

# Directory for local NetCDF files (override with OCEAN_NETCDF_DIR env var)
NETCDF_DATA_DIR = Path(os.getenv(
    "OCEAN_NETCDF_DIR",
    str(Path(__file__).resolve().parent / "data"),
))
