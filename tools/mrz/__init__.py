"""Offline reader and validator for ICAO Doc 9303 machine-readable zones."""

from .checkdigit import MrzValueError, check_digit, is_valid
from .parser import (
    TD1,
    TD2,
    TD3,
    CheckDigitResult,
    MrzDocument,
    MrzParseError,
    detect_format,
    normalize,
    parse,
)

__all__ = [
    "TD1",
    "TD2",
    "TD3",
    "CheckDigitResult",
    "MrzDocument",
    "MrzParseError",
    "MrzValueError",
    "check_digit",
    "detect_format",
    "is_valid",
    "normalize",
    "parse",
]
