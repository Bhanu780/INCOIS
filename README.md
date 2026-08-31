# 🌊 3D Ocean Data Visualization Platform

> **SIH 2026 — INCOIS Ocean Data Visualization Blueprint**  
> An interactive, real-time 3D oceanographic visualization system built for the Arabian Sea & Bay of Bengal regions. Integrates live Argo float profiles (Argovis API) and Copernicus Marine Service (CMEMS) 3D gridded physical oceanography data.

---

## 📌 Table of Contents
1. [Overview & Key Features](#-overview--key-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Step-by-Step Local Setup Guide](#-step-by-step-local-setup-guide)
   - [1. Clone Repository](#1-clone-the-repository)
   - [2. Configure Environment Variables](#2-configure-environment-variables)
   - [3. Backend Setup (FastAPI)](#3-backend-setup-fastapi)
   - [4. Frontend Setup (React + Vite + CesiumJS)](#4-frontend-setup-react--vite--cesiumjs)
5. [Running with Docker Compose](#-running-with-docker-compose)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Project Structure](#-project-structure)
8. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌐 Overview & Key Features

| Feature | Description |
|---------|-------------|
| 🌍 **3D Interactive Globe** | High-performance rendering via CesiumJS with camera controls, tilt, and lighting. |
| 🌡️ **3D Ocean Grids** | Dynamic volumetric 3D point cloud & column visualizers for Temperature, Salinity, and Currents. |
| 🔪 **Depth Slice Mode** | Inspect 2D horizontal depth slices at custom depths (e.g., 0m, 100m, 500m, 1000m). |
| 🛟 **Live Argo Floats** | Fetches live reporting Argo float coordinates and depth profiles via Argovis API. |
| 📊 **Profile Analysis** | Interactive depth-vs-temperature/salinity graph for individual floats. |
| 🔺 **3D Isosurface** | Marching Cubes 3D isosurface mesh generation (e.g., 20°C thermocline visualization). |
| ⏱️ **Time Animation** | Play, pause, and cycle through time steps with adjustable playback speeds. |
| 🎨 **Colorbar Editor** | Custom color maps (Thermal, Haline, Velocity, Jet, Viridis), logarithmic/linear scaling, and range overrides. |
| 📢 **Outreach Mode** | Guided educational mode for public exhibitions and non-technical stakeholders. |
| 📡 **OGC Standards** | WMS/WCS endpoint compatibility with CF-1.8 metadata compliance. |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, xarray, NetCDF4, Copernicus Marine SDK, HTTPX, Pydantic
- **Frontend**: React 19, Vite, CesiumJS, TailwindCSS, Recharts
- **Containerization**: Docker, Docker Compose

---

## 📋 Prerequisites

Before running the application locally, ensure you have the following installed on your machine:

1. **Python**: Version `3.11` or higher ([Download Python](https://www.python.org/downloads/))
2. **Node.js**: Version `20` or higher & `npm` ([Download Node.js](https://nodejs.org/))
3. **Git**: Installed and added to PATH ([Download Git](https://git-scm.com/))
4. *(Optional)* **Docker & Docker Compose**: For containerized deployment ([Download Docker Desktop](https://www.docker.com/products/docker-desktop/))

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Clone the Repository

Open your terminal or command prompt and clone the workspace repository:

```bash
git clone <repository-url>
cd "3d ocean"
```

---

### 2. Configure Environment Variables

1. Copy the template `.env.example` file to create your local `.env` file:

   **On Windows (PowerShell):**
   ```powershell
   Copy-Item .env.example .env
   ```

   **On Linux / macOS:**
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in any code editor and add your credentials:

   ```env
   # Argovis API Key (Get a free key at https://argovis-api.colorado.edu)
   ARGOVIS_API_KEY=your_argovis_api_key

   # Copernicus Marine Service Credentials (Register at https://marine.copernicus.eu)
   COPERNICUS_USERNAME=your_copernicus_username
   COPERNICUS_PASSWORD=your_copernicus_password

   # Server Settings
   HOST=127.0.0.1
   PORT=8000
   ```

---

### 3. Backend Setup (FastAPI)

Navigate to the project root directory in terminal:

#### 3.1 Create and Activate a Virtual Environment

- **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```

- **Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

#### 3.2 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3.3 Start the Backend Server

You can launch the FastAPI server using either entry point:

```bash
# Option A: Recommended blueprint router entry point
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

# Option B: Direct Python invocation
python backend/app/main.py
```

- **API Root**: `http://127.0.0.1:8000/`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

> 💡 **Note**: On initial startup, the backend automatically warms up its ocean grid cache from Copernicus Marine or local NetCDF files. This initial fetch takes ~1-2 minutes.

---

### 4. Frontend Setup (React + Vite + CesiumJS)

Open a **new terminal tab or window**, navigate to the `frontend` folder, install npm dependencies, and start the development server.

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install Node packages
npm install

# 3. Start local development server
npm run dev
```

The frontend will run at:
👉 **`http://localhost:5173/`**

Open `http://localhost:5173/` in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 🐳 Running with Docker Compose

If you prefer running both Frontend and Backend with a single command inside Docker containers:

1. Ensure Docker Desktop is running.
2. Ensure `.env` exists in the root directory.
3. Run:

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:80`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

To stop the containers:
```bash
docker-compose down
```

---

## 🔌 API Endpoints Reference

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Health** | `GET` | `/` | API status, Argovis connection, CMEMS cache readiness |
| **Ocean Grid** | `GET` | `/api/ocean-grid` | Returns 3D spatial grid (temperature, salinity, currents) |
| **Ocean Grid** | `GET` | `/api/ocean-grid/slice` | Returns 2D horizontal slice `?depth=100&variable=temperature` |
| **Ocean Grid** | `GET` | `/api/ocean-grid/depths` | Returns available depth levels in meters |
| **Ocean Grid** | `GET` | `/api/ocean-grid/times` | Returns available temporal timestamps |
| **Ocean Grid** | `POST`| `/api/ocean-grid/refresh` | Force manual refresh of CMEMS cache |
| **Isosurface** | `GET` | `/api/ocean-grid/isosurface` | Marching Cubes 3D surface mesh `?variable=temperature&iso_level=20` |
| **Argo Floats** | `GET` | `/api/argo-floats` | Returns list of active Argo floats in target bounding box |
| **Argo Floats** | `GET` | `/api/float-profile/{float_id}` | Depth-versus-variable profile measurements for a specific float |
| **Metadata** | `GET` | `/api/meta` | Dataset metadata (bounds, variables, depth range, timeframe) |
| **OGC Standard**| `GET` | `/api/ogc/wms` | WMS GetCapabilities metadata |
| **OGC Standard**| `GET` | `/api/ogc/colorbar` | Color palette presets and scalar min/max defaults |

---

## 📁 Project Structure

```
3d ocean/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry point & routes registration
│   │   ├── config.py                  # Backend configuration settings
│   │   ├── api/                       # API Route definitions
│   │   │   ├── routes_model.py        # /api/ocean-grid endpoints
│   │   │   ├── routes_instruments.py  # /api/argo-floats endpoints
│   │   │   ├── routes_meta.py         # Metadata endpoints
│   │   │   └── routes_ogc.py          # OGC WMS/WCS compliant endpoints
│   │   ├── ingestion/                 # Oceanographic data parsers
│   │   │   ├── base_parser.py         # Abstract parser interface
│   │   │   ├── netcdf_parser.py       # xarray NetCDF / CMEMS / OPeNDAP parser
│   │   │   ├── argo_parser.py         # Argovis API float parser
│   │   │   └── registry.py            # Dynamic data parser registry
│   │   ├── services/                  # Business logic & rendering algorithms
│   │   │   ├── colorbar.py            # Colormaps & scale transformations
│   │   │   ├── isosurface.py          # Marching Cubes isosurface generator
│   │   │   └── ogc_adapter.py         # OGC metadata standardizer
│   │   └── models/                    # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root React component & state management
│   │   ├── services/api.js            # Axios/Fetch API wrapper
│   │   ├── utils/colormaps.js         # Color mapping & normalization utilities
│   │   └── components/
│   │       ├── CesiumMap.jsx          # 3D CesiumJS Globe & render loops
│   │       ├── FloatProfilePanel.jsx  # Depth profile chart (Recharts)
│   │       ├── ColorbarEditor.jsx     # Palette & scale control panel
│   │       ├── TimeSlider.jsx         # Time playback controller
│   │       ├── DepthSlider.jsx        # Depth level controller
│   │       ├── LayerOpacityControl.jsx# Grid opacity slider
│   │       ├── VerticalExaggerationControl.jsx # 3D Depth scaling slider
│   │       ├── OutreachMode.jsx       # Exhibition / Outreach walkthrough mode
│   │       ├── Sidebar.jsx            # Main control sidebar
│   │       ├── Navbar.jsx             # Top header bar
│   │       └── ColorLegend.jsx        # Dynamic scalar color legend
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── services/                          # Root services (Copernicus & Argovis clients)
│   ├── copernicus_client.py
│   └── argovis_client.py
├── data/                              # Local directory for custom .nc (NetCDF) files
├── docs/                              # Project architecture & traceability docs
├── .env.example                       # Environment variables template
├── docker-compose.yml                 # Docker orchestration configuration
├── config.py                          # Root configuration defaults
├── main.py                            # Legacy single-file entry point
└── README.md                          # Project documentation
```

---

## ❓ Troubleshooting & FAQs

### 1. "503 Service Unavailable: Ocean data cache is warming up"
- **Cause**: Upon launch, the backend downloads or reads the latest ocean grid from CMEMS / NetCDF files.
- **Fix**: Wait ~60 seconds for the cache to finish warming up and reload the webpage. You can verify progress by navigating to `http://127.0.0.1:8000/`.

### 2. "Could not reach Argovis" or Float data missing
- **Cause**: Invalid or missing `ARGOVIS_API_KEY` in your `.env` file.
- **Fix**: Register for a free API key at [https://argovis-api.colorado.edu](https://argovis-api.colorado.edu) and update your `.env` file.

### 3. Port `8000` or `5173` is already in use
- **Fix**: Specify custom ports:
  - **Backend**: `uvicorn backend.app.main:app --port 8005` (update `VITE_API_BASE_URL` if configured)
  - **Frontend**: `npm run dev -- --port 3000`

---

> ✨ **Developed for SIH 2026 — INCOIS Ocean Data Visualization Challenge**
