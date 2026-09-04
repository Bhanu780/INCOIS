"""
Isosurface extraction service — Marching Cubes algorithm.

Blueprint row 6: Isosurface extraction from 3D scalar fields.

This module provides:
  - Backend precomputation of isosurface meshes from gridded scalar data.
  - The frontend MarchingCubes.js addon is the alternative client-side path.

Current state: Phase 3 (advanced rendering) — fully implemented.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger("ocean_api.isosurface")


# ── Marching Cubes lookup tables ──────────────────────────────────────────

# Edge table: for each of the 256 cube configurations, which edges are crossed
# (abbreviated — full 256-entry table for production use)
_EDGE_TABLE = [
    0x000, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
    0x190, 0x099, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
    # ... (256 entries — abbreviated for clarity, full table in production)
]

# Triangle table: maps cube config → list of edge triples forming triangles
# (abbreviated placeholder)
_TRI_TABLE: List[List[int]] = [[] for _ in range(256)]


def _interpolate_vertex(
    p1: np.ndarray,
    p2: np.ndarray,
    val1: float,
    val2: float,
    iso_level: float,
) -> np.ndarray:
    """Linearly interpolate vertex on edge between p1 and p2."""
    if abs(iso_level - val1) < 1e-6:
        return p1
    if abs(iso_level - val2) < 1e-6:
        return p2
    if abs(val1 - val2) < 1e-6:
        return p1
    t = (iso_level - val1) / (val2 - val1)
    return p1 + t * (p2 - p1)


def extract_isosurface(
    scalar_field: np.ndarray,
    iso_level: float,
    lat_coords: np.ndarray,
    lon_coords: np.ndarray,
    depth_coords: np.ndarray,
    variable: str = "temperature",
) -> Dict[str, Any]:
    """
    Run marching cubes on a regularly-gridded 3D scalar field.

    Parameters
    ----------
    scalar_field : ndarray of shape (n_depth, n_lat, n_lon)
    iso_level    : threshold value to extract (e.g. 20.0 for 20°C isotherm)
    lat_coords   : 1-D array of latitude values
    lon_coords   : 1-D array of longitude values
    depth_coords : 1-D array of depth values (positive = down)
    variable     : name of the field being extracted

    Returns
    -------
    dict with keys:
        vertices : list of [lat, lon, depth] triples
        triangles: list of [i, j, k] index triples
        iso_level: the threshold used
        variable : variable name
        vertex_count: int
        triangle_count: int
    """
    try:
        from skimage.measure import marching_cubes  # type: ignore
        vertices_raw, faces, normals, _ = marching_cubes(
            scalar_field,
            level=iso_level,
            spacing=(
                float(np.mean(np.diff(depth_coords))),
                float(np.mean(np.diff(lat_coords))),
                float(np.mean(np.diff(lon_coords))),
            ),
        )
        # Map voxel indices → geo coordinates
        depth_min = float(depth_coords[0])
        lat_min   = float(lat_coords[0])
        lon_min   = float(lon_coords[0])
        d_step = float(np.mean(np.diff(depth_coords))) if len(depth_coords) > 1 else 1.0
        la_step = float(np.mean(np.diff(lat_coords)))  if len(lat_coords) > 1  else 1.0
        lo_step = float(np.mean(np.diff(lon_coords)))  if len(lon_coords) > 1  else 1.0

        vertices = []
        for vd, vla, vlo in vertices_raw:
            vertices.append([
                round(lat_min + vla * la_step, 4),
                round(lon_min + vlo * lo_step, 4),
                round(depth_min + vd * d_step, 1),
            ])

        return {
            "vertices": vertices,
            "triangles": faces.tolist(),
            "iso_level": iso_level,
            "variable": variable,
            "vertex_count": len(vertices),
            "triangle_count": len(faces),
        }

    except ImportError:
        logger.warning(
            "scikit-image not installed — isosurface extraction unavailable. "
            "Install with: pip install scikit-image"
        )
        return _empty_mesh(iso_level, variable, reason="scikit-image not installed")
    except Exception as exc:
        logger.exception("Marching cubes failed: %s", exc)
        return _empty_mesh(iso_level, variable, reason=str(exc))


def _empty_mesh(iso_level: float, variable: str, reason: str = "") -> Dict[str, Any]:
    return {
        "vertices": [],
        "triangles": [],
        "iso_level": iso_level,
        "variable": variable,
        "vertex_count": 0,
        "triangle_count": 0,
        "error": reason or "No mesh generated",
    }


def default_iso_level(variable: str) -> float:
    """Return a scientifically meaningful default isosurface threshold."""
    defaults = {
        "temperature": 20.0,   # 20°C thermocline (tropical ocean)
        "salinity":    35.0,   # 35 PSU halocline
        "currents":    0.5,    # 0.5 m/s current boundary
    }
    return defaults.get(variable.lower(), 0.0)
