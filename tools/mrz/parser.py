"""Parser and validator for machine-readable zones (ICAO Doc 9303).

Supports the three machine-readable travel document formats:

===== ============ ================================================
Format Layout       Typical carrier
===== ============ ================================================
TD1    3 x 30       ID cards (including EU/EEA national identity cards)
TD2    2 x 36       older passport cards and travel documents
TD3    2 x 44       passports
===== ============ ================================================

The module reads and verifies; it never emits an MRZ. Parsing is offline and
purely structural — a machine-readable zone whose check digits all pass is
internally consistent, which says nothing about whether the document is
genuine. Authenticity is established by the document's chip (passive/active
authentication) and by the issuing authority, not by this code.
"""

from __future__ import annotations

import datetime
import re
from dataclasses import dataclass, field as dataclass_field
from typing import Iterable, Sequence

from .checkdigit import FILLER, check_digit, is_valid

TD1 = "TD1"
TD2 = "TD2"
TD3 = "TD3"

LINE_LENGTHS = {TD1: 30, TD2: 36, TD3: 44}
LINE_COUNTS = {TD1: 3, TD2: 2, TD3: 2}

SEX_CODES = {"M": "male", "F": "female", "X": "unspecified", FILLER: "unspecified"}

_ALLOWED = re.compile(r"^[A-Z0-9<]+$")


class MrzParseError(ValueError):
    """Raised when input does not form a well-shaped machine-readable zone."""


@dataclass(frozen=True)
class CheckDigitResult:
    """Outcome of verifying one check digit."""

    name: str
    field: str
    expected: str
    found: str
    valid: bool

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "expected": self.expected,
            "found": self.found,
            "valid": self.valid,
        }


@dataclass(frozen=True)
class MrzDocument:
    """Data extracted from a machine-readable zone."""

    mrz_format: str
    lines: tuple[str, ...]
    document_code: str
    issuing_state: str
    document_number: str
    nationality: str
    surname: str
    given_names: str
    sex: str
    date_of_birth: datetime.date | None
    date_of_expiry: datetime.date | None
    raw_date_of_birth: str
    raw_date_of_expiry: str
    optional_data: str
    optional_data_2: str = ""
    name_possibly_truncated: bool = False
    check_digits: tuple[CheckDigitResult, ...] = dataclass_field(default_factory=tuple)

    @property
    def valid(self) -> bool:
        """True when every check digit in the zone verifies."""
        return all(result.valid for result in self.check_digits)

    @property
    def failed_check_digits(self) -> tuple[CheckDigitResult, ...]:
        return tuple(result for result in self.check_digits if not result.valid)

    def is_expired(self, on: datetime.date | None = None) -> bool | None:
        """Whether the document had expired on ``on`` (default: today).

        Returns ``None`` when the expiry date could not be parsed.
        """
        if self.date_of_expiry is None:
            return None
        return self.date_of_expiry < (on or datetime.date.today())

    def to_dict(self) -> dict:
        return {
            "format": self.mrz_format,
            "valid": self.valid,
            "document_code": self.document_code,
            "issuing_state": self.issuing_state,
            "document_number": self.document_number,
            "nationality": self.nationality,
            "surname": self.surname,
            "given_names": self.given_names,
            "sex": self.sex,
            "date_of_birth": _iso(self.date_of_birth),
            "date_of_expiry": _iso(self.date_of_expiry),
            "expired": self.is_expired(),
            "optional_data": self.optional_data,
            "optional_data_2": self.optional_data_2,
            "name_possibly_truncated": self.name_possibly_truncated,
            "check_digits": [result.to_dict() for result in self.check_digits],
        }


def _iso(value: datetime.date | None) -> str | None:
    return value.isoformat() if value else None


def normalize(text: str | Sequence[str]) -> tuple[str, ...]:
    """Reduce raw input to uppercase MRZ lines.

    Accepts a single string with newlines or an iterable of lines. Whitespace
    is dropped, and ``«`` / ``≪`` (common OCR renderings of the filler) are
    folded to ``<``.
    """
    if isinstance(text, str):
        raw_lines: Iterable[str] = text.splitlines()
    else:
        raw_lines = text

    lines = []
    for raw in raw_lines:
        line = re.sub(r"\s+", "", raw).upper()
        line = line.replace("«", "<<").replace("≪", "<<").replace("‹", "<")
        if line:
            lines.append(line)
    return tuple(lines)


def detect_format(lines: Sequence[str]) -> str:
    """Infer the document format from the line geometry."""
    lengths = {len(line) for line in lines}
    if len(lines) == 3 and lengths == {LINE_LENGTHS[TD1]}:
        return TD1
    if len(lines) == 2 and lengths == {LINE_LENGTHS[TD2]}:
        return TD2
    if len(lines) == 2 and lengths == {LINE_LENGTHS[TD3]}:
        return TD3
    raise MrzParseError(
        "unrecognised MRZ geometry: "
        f"{len(lines)} line(s) of length {sorted(lengths) or [0]}; "
        "expected 3x30 (TD1), 2x36 (TD2) or 2x44 (TD3)"
    )


def parse(text: str | Sequence[str]) -> MrzDocument:
    """Parse and verify a machine-readable zone.

    Raises :class:`MrzParseError` when the input is not shaped like an MRZ.
    A successfully parsed zone with failing check digits is returned rather
    than raised — inspect :attr:`MrzDocument.valid`.
    """
    lines = normalize(text)
    if not lines:
        raise MrzParseError("no input")

    for line in lines:
        if not _ALLOWED.match(line):
            bad = sorted(set(line) - set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<"))
            raise MrzParseError(f"invalid MRZ character(s): {''.join(bad)!r}")

    mrz_format = detect_format(lines)
    if mrz_format == TD1:
        return _parse_td1(lines)
    if mrz_format == TD2:
        return _parse_td2(lines)
    return _parse_td3(lines)


def _check(name: str, field: str, found: str, optional: bool = False) -> CheckDigitResult:
    return CheckDigitResult(
        name=name,
        field=field,
        expected=check_digit(field),
        found=found,
        valid=is_valid(field, found, optional=optional),
    )


def _parse_names(field: str) -> tuple[str, str, bool]:
    """Split a name field into (surname, given names, possibly truncated)."""
    truncated = not field.endswith(FILLER)
    primary, _, secondary = field.partition("<<")
    surname = " ".join(part for part in primary.split(FILLER) if part)
    given_names = " ".join(part for part in secondary.split(FILLER) if part)
    return surname, given_names, truncated


def _parse_date(raw: str, kind: str, today: datetime.date | None = None) -> datetime.date | None:
    """Convert a ``YYMMDD`` field to a date, resolving the century.

    Dates of birth resolve to the most recent century that is not in the
    future; expiry dates resolve to the century placing them closest to today.
    Both rules follow the guidance in Doc 9303 Part 3, which leaves the
    century implicit.
    """
    if len(raw) != 6 or not raw.isdigit():
        return None
    today = today or datetime.date.today()
    year, month, day = int(raw[0:2]), int(raw[2:4]), int(raw[4:6])

    candidates = []
    for century in (1900, 2000, 2100):
        try:
            candidates.append(datetime.date(century + year, month, day))
        except ValueError:
            continue
    if not candidates:
        return None

    if kind == "birth":
        past = [value for value in candidates if value <= today]
        return max(past) if past else min(candidates)
    return min(candidates, key=lambda value: abs((value - today).days))


def _document_number_td1(line: str) -> tuple[str, str, str, str]:
    """Resolve the TD1 document number, which may overflow into optional data.

    Returns ``(number, check digit, field used for the check digit, remaining
    optional data)``. When the number exceeds 9 characters, Doc 9303 Part 5
    puts the first 9 in positions 6-14, a filler in the check-digit position,
    and the remainder plus the check digit for the whole number at the start
    of the optional data field, terminated by a filler.
    """
    head = line[5:14]
    digit = line[14]
    optional = line[15:30]

    if digit != FILLER:
        return head.rstrip(FILLER), digit, head, optional

    overflow, _, rest = optional.partition(FILLER)
    if len(overflow) < 2:
        # Malformed overflow: report what is there and let the check digit fail.
        return head.rstrip(FILLER), digit, head, optional
    number = head + overflow[:-1]
    return number.rstrip(FILLER), overflow[-1], number, rest


def _parse_td1(lines: Sequence[str]) -> MrzDocument:
    line1, line2, line3 = lines
    number, number_digit, number_field, optional = _document_number_td1(line1)

    birth, birth_digit = line2[0:6], line2[6]
    expiry, expiry_digit = line2[8:14], line2[14]
    optional_2 = line2[18:29].rstrip(FILLER)

    composite = line1[5:30] + line2[0:7] + line2[8:15] + line2[18:29]
    checks = (
        _check("document_number", number_field, number_digit),
        _check("date_of_birth", birth, birth_digit),
        _check("date_of_expiry", expiry, expiry_digit),
        _check("composite", composite, line2[29]),
    )

    surname, given_names, truncated = _parse_names(line3)
    return MrzDocument(
        mrz_format=TD1,
        lines=tuple(lines),
        document_code=line1[0:2].rstrip(FILLER),
        issuing_state=line1[2:5].rstrip(FILLER),
        document_number=number,
        nationality=line2[15:18].rstrip(FILLER),
        surname=surname,
        given_names=given_names,
        sex=SEX_CODES.get(line2[7], "unspecified"),
        date_of_birth=_parse_date(birth, "birth"),
        date_of_expiry=_parse_date(expiry, "expiry"),
        raw_date_of_birth=birth,
        raw_date_of_expiry=expiry,
        optional_data=optional.rstrip(FILLER),
        optional_data_2=optional_2,
        name_possibly_truncated=truncated,
        check_digits=checks,
    )


def _parse_two_line(lines: Sequence[str], mrz_format: str) -> MrzDocument:
    """Shared body for TD2 and TD3, which differ only in field widths."""
    line1, line2 = lines
    optional_start = 28
    optional_end = 35 if mrz_format == TD2 else 42

    number, number_digit = line2[0:9], line2[9]
    birth, birth_digit = line2[13:19], line2[19]
    expiry, expiry_digit = line2[21:27], line2[27]
    optional = line2[optional_start:optional_end]

    checks = [
        _check("document_number", number, number_digit),
        _check("date_of_birth", birth, birth_digit),
        _check("date_of_expiry", expiry, expiry_digit),
    ]
    if mrz_format == TD3:
        # TD3 carries a dedicated check digit over the personal number field.
        checks.append(_check("personal_number", optional, line2[42], optional=True))
        composite = line2[0:10] + line2[13:20] + line2[21:43]
        composite_digit = line2[43]
    else:
        composite = line2[0:10] + line2[13:20] + line2[21:35]
        composite_digit = line2[35]
    checks.append(_check("composite", composite, composite_digit))

    surname, given_names, truncated = _parse_names(line1[5:])
    return MrzDocument(
        mrz_format=mrz_format,
        lines=tuple(lines),
        document_code=line1[0:2].rstrip(FILLER),
        issuing_state=line1[2:5].rstrip(FILLER),
        document_number=number.rstrip(FILLER),
        nationality=line2[10:13].rstrip(FILLER),
        surname=surname,
        given_names=given_names,
        sex=SEX_CODES.get(line2[20], "unspecified"),
        date_of_birth=_parse_date(birth, "birth"),
        date_of_expiry=_parse_date(expiry, "expiry"),
        raw_date_of_birth=birth,
        raw_date_of_expiry=expiry,
        optional_data=optional.rstrip(FILLER),
        name_possibly_truncated=truncated,
        check_digits=tuple(checks),
    )


def _parse_td2(lines: Sequence[str]) -> MrzDocument:
    return _parse_two_line(lines, TD2)


def _parse_td3(lines: Sequence[str]) -> MrzDocument:
    return _parse_two_line(lines, TD3)
