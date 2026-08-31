"""
Colorbar utilities — min/max calculation, log/linear normalization.

Blueprint row 11: Colorbar editor with palette, min/max, log/linear support.
"""

from __future__ import annotations

import math
from typing import List, Optional, Tuple


# ── Available palettes ────────────────────────────────────────────────────

PALETTES = {
    "thermal": [
        (0.000, (0.04, 0.03, 0.27)),
        (0.250, (0.32, 0.07, 0.57)),
        (0.500, (0.72, 0.22, 0.42)),
        (0.750, (0.97, 0.56, 0.14)),
        (1.000, (0.99, 0.99, 0.60)),
    ],
    "viridis": [
        (0.000, (0.267, 0.005, 0.329)),
        (0.250, (0.283, 0.361, 0.596)),
        (0.500, (0.129, 0.565, 0.553)),
        (0.750, (0.369, 0.788, 0.384)),
        (1.000, (0.993, 0.906, 0.144)),
    ],
    "plasma": [
        (0.000, (0.051, 0.031, 0.529)),
        (0.250, (0.494, 0.012, 0.659)),
        (0.500, (0.800, 0.157, 0.463)),
        (0.750, (0.973, 0.463, 0.216)),
        (1.000, (0.941, 0.973, 0.129)),
    ],
    "jet": [
        (0.000, (0.0,  0.0,  0.5)),
        (0.250, (0.0,  0.5,  1.0)),
        (0.500, (0.0,  1.0,  0.0)),
        (0.750, (1.0,  0.5,  0.0)),
        (1.000, (0.5,  0.0,  0.0)),
    ],
    "rdbu": [
        (0.000, (0.698, 0.094, 0.169)),
        (0.250, (0.957, 0.647, 0.510)),
        (0.500, (0.969, 0.969, 0.969)),
        (0.750, (0.573, 0.773, 0.871)),
        (1.000, (0.192, 0.510, 0.741)),
    ],
}


def list_palettes() -> List[str]:
    """Return all registered palette names."""
    return list(PALETTES.keys())


# ── Normalization ─────────────────────────────────────────────────────────

def normalize(
    value: float,
    vmin: float,
    vmax: float,
    scale: str = "linear",
) -> float:
    """
    Map *value* → [0, 1] using linear or log normalization.

    Parameters
    ----------
    value : raw data value
    vmin, vmax : data range
    scale : "linear" or "log"
    """
    if vmin == vmax:
        return 0.5

    if scale == "log":
        if vmin <= 0:
            vmin = 1e-10
        if value <= 0:
            value = 1e-10
        log_min = math.log10(max(vmin, 1e-10))
        log_max = math.log10(max(vmax, 1e-10))
        log_val = math.log10(max(value, 1e-10))
        t = (log_val - log_min) / (log_max - log_min)
    else:
        t = (value - vmin) / (vmax - vmin)

    return max(0.0, min(1.0, t))


# ── Color interpolation ───────────────────────────────────────────────────

def _lerp_color(
    c1: Tuple[float, float, float],
    c2: Tuple[float, float, float],
    t: float,
) -> Tuple[float, float, float]:
    return (
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t,
    )


def palette_color(
    t: float,
    palette: str = "thermal",
) -> Tuple[float, float, float]:
    """
    Map normalised t ∈ [0, 1] → (r, g, b) each in [0, 1].
    Falls back to "thermal" if palette is unrecognised.
    """
    stops = PALETTES.get(palette, PALETTES["thermal"])
    if t <= stops[0][0]:
        return stops[0][1]
    if t >= stops[-1][0]:
        return stops[-1][1]

    for i in range(len(stops) - 1):
        p0, c0 = stops[i]
        p1, c1 = stops[i + 1]
        if p0 <= t <= p1:
            local_t = (t - p0) / (p1 - p0)
            return _lerp_color(c0, c1, local_t)

    return stops[-1][1]


# ── Convenience: compute sensible defaults for a variable ─────────────────

_DEFAULT_RANGES: dict = {
    "temperature": (2.0, 30.0),
    "salinity":    (33.0, 37.0),
    "currents":    (0.0, 1.8),
}


def default_range(variable: str) -> Tuple[float, float]:
    """Return (vmin, vmax) defaults for well-known ocean variables."""
    return _DEFAULT_RANGES.get(variable.lower(), (0.0, 1.0))


def auto_range(values: List[Optional[float]]) -> Tuple[float, float]:
    """Compute (vmin, vmax) from a list of values, ignoring None/NaN."""
    valid = [v for v in values if v is not None and not math.isnan(v)]
    if not valid:
        return (0.0, 1.0)
    return (min(valid), max(valid))
