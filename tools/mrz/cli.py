"""Command-line front end: read an MRZ, print its fields, verify check digits.

    python -m tools.mrz path/to/mrz.txt
    cat mrz.txt | python -m tools.mrz --json

Exit status is 0 when every check digit verifies, 1 when any fails, and 2 when
the input is not a machine-readable zone.
"""

from __future__ import annotations

import argparse
import json
import sys

from .parser import MrzDocument, MrzParseError, parse


def format_report(document: MrzDocument) -> str:
    """Render a human-readable summary of a parsed zone."""
    expired = document.is_expired()
    rows = [
        ("Format", document.mrz_format),
        ("Document code", document.document_code),
        ("Issuing state", document.issuing_state),
        ("Document number", document.document_number),
        ("Surname", document.surname),
        ("Given names", document.given_names),
        ("Nationality", document.nationality),
        ("Sex", document.sex),
        ("Date of birth", document.date_of_birth or f"unparseable ({document.raw_date_of_birth})"),
        ("Date of expiry", document.date_of_expiry or f"unparseable ({document.raw_date_of_expiry})"),
        ("Expired", "unknown" if expired is None else ("yes" if expired else "no")),
    ]
    if document.optional_data:
        rows.append(("Optional data", document.optional_data))
    if document.optional_data_2:
        rows.append(("Optional data 2", document.optional_data_2))
    if document.name_possibly_truncated:
        rows.append(("Note", "name field is full width and may be truncated"))

    width = max(len(label) for label, _ in rows)
    lines = [f"{label.ljust(width)}  {value}" for label, value in rows]

    lines.append("")
    lines.append("Check digits:")
    for result in document.check_digits:
        mark = "ok  " if result.valid else "FAIL"
        detail = "" if result.valid else f"  (expected {result.expected}, found {result.found})"
        lines.append(f"  [{mark}] {result.name}{detail}")

    lines.append("")
    lines.append("Result: all check digits verify" if document.valid else "Result: INVALID")
    lines.append(
        "Check digits confirm internal consistency only, not that the document is genuine."
    )
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m tools.mrz",
        description="Parse and verify an ICAO 9303 machine-readable zone (TD1/TD2/TD3).",
    )
    parser.add_argument(
        "path",
        nargs="?",
        help="file holding the MRZ lines; omit to read from standard input",
    )
    parser.add_argument("--json", action="store_true", help="emit JSON instead of a report")
    args = parser.parse_args(argv)

    if args.path:
        try:
            with open(args.path, encoding="utf-8") as handle:
                text = handle.read()
        except OSError as error:
            print(f"error: {error}", file=sys.stderr)
            return 2
    else:
        text = sys.stdin.read()

    try:
        document = parse(text)
    except MrzParseError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(document.to_dict(), indent=2))
    else:
        print(format_report(document))
    return 0 if document.valid else 1


if __name__ == "__main__":
    sys.exit(main())
