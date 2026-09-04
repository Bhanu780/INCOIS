"""
Parser registry — maps source_type → parser class.

Blueprint row 10 & 18: Plugin-style module for adding new sensors.

Adding a new data source requires only:
  1. Create a new parser in backend/app/ingestion/
  2. Add one entry to PARSER_REGISTRY below
  No other core code needs to change.
"""

from __future__ import annotations

from typing import Dict, Type

from backend.app.ingestion.base_parser import BaseParser
from backend.app.ingestion.netcdf_parser import NetCDFParser
from backend.app.ingestion.argo_parser import ArgoParser
from backend.app.ingestion.glider_parser import GliderParser
from backend.app.ingestion.ctd_parser import CTDParser


# ── Registry mapping ──────────────────────────────────────────────────────
#
#  key         : source_type string used in API queries and config
#  value       : parser class (not instance) — instantiated on demand
#
PARSER_REGISTRY: Dict[str, Type[BaseParser]] = {
    "netcdf":  NetCDFParser,
    "argo":    ArgoParser,
    "glider":  GliderParser,
    "ctd":     CTDParser,
    # Future sensors — add here:
    # "mooring": MooringParser,
    # "hf_radar": HFRadarParser,
    # "adcp": ADCPParser,
    # "ml_product": MLProductParser,
}


def get_parser(source_type: str, **kwargs) -> BaseParser:
    """
    Instantiate and return a parser for the given source_type.

    Raises
    ------
    KeyError if source_type is not registered.
    """
    cls = PARSER_REGISTRY[source_type]
    return cls(**kwargs)


def list_sources() -> list[str]:
    """Return all registered source type names."""
    return list(PARSER_REGISTRY.keys())
