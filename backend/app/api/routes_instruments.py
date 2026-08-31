"""
Instrument routes: Argo floats, gliders, CTDs — list + profile-by-id.

Blueprint rows 2, 3, 18: Unified Argo/Glider/CTD display + profile chart.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger("ocean_api.routes_instruments")
router = APIRouter(prefix="/api", tags=["Instruments"])

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from services import argovis_client as _argovis  # type: ignore
from backend.app.ingestion.registry import get_parser


# ── Argo Floats ───────────────────────────────────────────────────────────

@router.get("/argo-floats", summary="Active Argo floats in region")
async def get_argo_floats(
    days_back: int = Query(30, description="How many days back to search for active floats"),
    refresh: bool = Query(False, description="Force a fresh download from Argovis"),
):
    """
    Returns real, currently-reporting Argo float positions and metadata
    from the Argovis API.  Cached to avoid hammering the upstream server.
    """
    try:
        return await _argovis.fetch_active_floats(days_back=days_back, force_refresh=refresh)
    except Exception as exc:
        logger.exception("Argovis float list fetch failed")
        raise HTTPException(status_code=502, detail=f"Could not reach Argovis: {exc}")


@router.get("/float-profile/{float_id}", summary="Depth-profile for a single Argo float")
async def get_float_profile(float_id: str):
    """
    Returns the most-recent depth-vs-temperature/salinity profile for the
    given float ID.  Data sourced from Argovis in real-time (Req 3).
    """
    logger.info(f"Fetching profile for float: {float_id}")
    floats = await _argovis.fetch_active_floats()
    match = next((f for f in floats if f["id"] == float_id), None)
    if not match:
        logger.warning(f"Float '{float_id}' not found in active floats")
        raise HTTPException(status_code=404, detail=f"Float '{float_id}' not found")

    logger.debug(f"Found float {float_id}, fetching profile {match['last_profile_id']}")
    profile = await _argovis.fetch_profile(match["last_profile_id"])
    if profile is None:
        logger.error(f"Profile data unavailable for float {float_id}")
        raise HTTPException(
            status_code=502,
            detail="Profile data unavailable or unparsable from Argovis for this float.",
        )
    logger.info(f"Successfully returned profile with {len(profile)} measurements for {float_id}")
    return {"float_id": float_id, "profile": profile}


# ── Generic Instrument endpoints (Glider / CTD stubs) ────────────────────

@router.get("/instruments", summary="All instruments by type")
async def get_instruments(
    source_type: str = Query("argo", description="argo | glider | ctd"),
):
    """
    List surface positions for the given instrument type.
    Glider and CTD parsers are stubs — returns empty list until data is provided.
    """
    try:
        parser = get_parser(source_type)
        return parser.to_points()
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source_type '{source_type}'. Valid: argo, glider, ctd",
        )
    except Exception as exc:
        logger.exception("Instrument list failed for %s", source_type)
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/instrument-profile/{source_type}/{instrument_id}", summary="Profile by source + ID")
async def get_instrument_profile(source_type: str, instrument_id: str):
    """
    Return a depth profile for any instrument type using the parser registry.
    Currently fully implemented for 'argo'; stubs return 404 for others.
    """
    try:
        parser = get_parser(source_type)
        levels = parser.profile(instrument_id)
        if levels is None:
            raise HTTPException(
                status_code=404,
                detail=f"{source_type} instrument '{instrument_id}' profile not available.",
            )
        return {
            "instrument_id": instrument_id,
            "instrument_type": source_type,
            "levels": levels,
        }
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source_type '{source_type}'.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Profile fetch failed for %s/%s", source_type, instrument_id)
        raise HTTPException(status_code=502, detail=str(exc))
