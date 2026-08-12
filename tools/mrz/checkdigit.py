"""Check-digit arithmetic from ICAO Doc 9303 Part 3, Section 4.9.

A single algorithm covers every check digit in a machine-readable zone: each
character is mapped to a numeric value, multiplied by a repeating 7-3-1 weight,
and the sum is reduced modulo 10.
"""

FILLER = "<"
WEIGHTS = (7, 3, 1)


class MrzValueError(ValueError):
    """Raised when a field contains characters outside the MRZ alphabet."""


def char_value(char: str) -> int:
    """Return the numeric value of a single MRZ character.

    Digits map to themselves, ``A``-``Z`` map to 10-35, and the filler ``<``
    maps to 0.
    """
    if char.isdigit():
        return int(char)
    if "A" <= char <= "Z":
        return ord(char) - ord("A") + 10
    if char == FILLER:
        return 0
    raise MrzValueError(f"character {char!r} is not valid in an MRZ field")


def check_digit(field: str) -> str:
    """Compute the check digit for ``field`` as a single character."""
    total = sum(
        char_value(char) * WEIGHTS[index % len(WEIGHTS)]
        for index, char in enumerate(field)
    )
    return str(total % 10)


def is_valid(field: str, digit: str, optional: bool = False) -> bool:
    """Report whether ``digit`` is the correct check digit for ``field``.

    ``optional`` relaxes the comparison for fields that may be entirely
    filler (personal number, optional data): issuers write either ``0`` or
    ``<`` as the check digit there, and Doc 9303 accepts both.
    """
    if optional and set(field) <= {FILLER}:
        return digit in {FILLER, "0"}
    try:
        return check_digit(field) == digit
    except MrzValueError:
        return False
