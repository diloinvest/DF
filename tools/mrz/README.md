# MRZ reader

Offline parser and validator for the machine-readable zone (MRZ) of travel
documents, following [ICAO Doc 9303][doc9303]. Pure standard library, no
dependencies.

It reads and verifies. It does not generate machine-readable zones, and it
cannot tell you whether a document is genuine — see [What this does not do](#what-this-does-not-do).

[doc9303]: https://www.icao.int/publications/pages/publication.aspx?docnum=9303

## Supported formats

| Format | Layout | Typical carrier |
| ------ | ------ | --------------- |
| TD1 | 3 lines x 30 | ID cards, including EU/EEA national identity cards |
| TD2 | 2 lines x 36 | older travel documents and passport cards |
| TD3 | 2 lines x 44 | passports |

The format is inferred from the line geometry. Machine-readable visas (MRV-A
and MRV-B) are not supported; they share TD3/TD2 line widths but lay out their
fields differently, so they are rejected rather than mis-parsed.

## Command line

```console
$ python -m tools.mrz specimen.txt
Format           TD3
Document code    P
Issuing state    UTO
Document number  L898902C3
Surname          ERIKSSON
Given names      ANNA MARIA
Nationality      UTO
Sex              female
Date of birth    1974-08-12
Date of expiry   2012-04-15
Expired          yes
Optional data    ZE184226B

Check digits:
  [ok  ] document_number
  [ok  ] date_of_birth
  [ok  ] date_of_expiry
  [ok  ] personal_number
  [ok  ] composite

Result: all check digits verify
```

Reads standard input when no path is given. `--json` emits the same data as a
JSON object. Exit status is `0` when every check digit verifies, `1` when any
fails, and `2` when the input is not a machine-readable zone.

## Library

```python
from tools.mrz import parse

document = parse(open("specimen.txt").read())

document.valid              # True when every check digit verifies
document.document_number    # 'L898902C3'
document.date_of_birth      # datetime.date(1974, 8, 12)
document.is_expired()       # True (None if the expiry date is unparseable)
document.to_dict()          # JSON-ready dict

for result in document.failed_check_digits:
    print(result.name, result.expected, result.found)
```

`parse()` raises `MrzParseError` for input that is not shaped like an MRZ
(wrong geometry, characters outside `A-Z0-9<`). A zone that parses but whose
check digits fail is *returned*, not raised — a failing check digit is a
finding about the document, not an error in the input.

## Details worth knowing

**Check digits.** Every check digit uses one algorithm: character values
(`0-9` = 0-9, `A-Z` = 10-35, `<` = 0) times a repeating 7-3-1 weight, summed
modulo 10. Each format also carries a composite digit over the concatenated
key fields, which is the only digit covering the optional data.

**Centuries.** The MRZ stores `YYMMDD` with no century. Dates of birth resolve
to the most recent century that is not in the future; expiry dates resolve to
whichever century puts them closest to today. Impossible dates (`741332`) parse
as `None` with the raw digits kept in `raw_date_of_birth` / `raw_date_of_expiry`.

**Long document numbers.** TD1 numbers longer than 9 characters overflow into
the optional data field, with a filler in the check-digit slot. This is handled
transparently; `document_number` holds the whole number.

**Truncated names.** The name field is fixed width and long names are cut to
fit. When the field ends without a filler, `name_possibly_truncated` is set —
the name read out may be shorter than the name on the document.

**OCR variants.** `normalize()` strips whitespace, uppercases, and folds the
guillemets `«` / `≪` / `‹` that OCR often produces for filler characters.

## What this does not do

Check digits detect transcription errors, not tampering. They are unkeyed and
trivially recomputable, so a modified zone with recomputed digits verifies
perfectly. The algorithm also has a structural blind spot: because values are
summed modulo 10, substituting characters whose values differ by a multiple of
10 (`A` for `<`, `K` for `0`) leaves every check digit unchanged — this is
covered by a test.

Establishing that a document is genuine requires the chip: passive
authentication against the issuing country's certificate, and active
authentication or chip authentication to show the chip is not a clone. That is
out of scope here and cannot be done offline.

## Tests

```console
$ python -m unittest discover -s tools -t .
```

Test data is the specimen zones published in Doc 9303, which use the reserved
fictional issuing state `UTO` (Utopia). No real document data is included in
this repository, and none should be added — machine-readable zones are personal
data.
