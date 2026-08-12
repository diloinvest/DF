"""Tests against the specimen zones published in ICAO Doc 9303.

The specimens use the fictional issuing state ``UTO`` (Utopia) reserved by the
standard for examples, so no real person's document data appears here.
"""

import datetime
import io
import unittest
from contextlib import redirect_stdout

from tools.mrz import MrzParseError, check_digit, normalize, parse
from tools.mrz.cli import main

# Doc 9303 Part 5, Appendix B — TD1 specimen.
TD1_SPECIMEN = """
I<UTOD231458907<<<<<<<<<<<<<<<
7408122F1204159UTO<<<<<<<<<<<6
ERIKSSON<<ANNA<MARIA<<<<<<<<<<
"""

# Doc 9303 Part 6, Appendix B — TD2 specimen.
TD2_SPECIMEN = """
I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<
D231458907UTO7408122F1204159<<<<<<<6
"""

# Doc 9303 Part 4, Appendix B — TD3 specimen.
TD3_SPECIMEN = """
P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
L898902C36UTO7408122F1204159ZE184226B<<<<<10
"""


class CheckDigitTests(unittest.TestCase):
    def test_examples_from_the_standard(self):
        # Doc 9303 Part 3, Section 4.9.
        self.assertEqual(check_digit("520727"), "3")
        self.assertEqual(check_digit("AB2134<<<"), "5")
        self.assertEqual(check_digit("HA672242<"), "6")

    def test_filler_counts_as_zero(self):
        self.assertEqual(check_digit("<<<<<<"), "0")


class SpecimenTests(unittest.TestCase):
    def test_td1_specimen(self):
        document = parse(TD1_SPECIMEN)
        self.assertEqual(document.mrz_format, "TD1")
        self.assertTrue(document.valid, document.failed_check_digits)
        self.assertEqual(document.document_code, "I")
        self.assertEqual(document.issuing_state, "UTO")
        self.assertEqual(document.document_number, "D23145890")
        self.assertEqual(document.nationality, "UTO")
        self.assertEqual(document.surname, "ERIKSSON")
        self.assertEqual(document.given_names, "ANNA MARIA")
        self.assertEqual(document.sex, "female")
        self.assertEqual(document.date_of_birth, datetime.date(1974, 8, 12))
        self.assertEqual(document.date_of_expiry, datetime.date(2012, 4, 15))

    def test_td2_specimen(self):
        document = parse(TD2_SPECIMEN)
        self.assertEqual(document.mrz_format, "TD2")
        self.assertTrue(document.valid, document.failed_check_digits)
        self.assertEqual(document.document_number, "D23145890")
        self.assertEqual(document.surname, "ERIKSSON")
        self.assertEqual(document.given_names, "ANNA MARIA")
        self.assertEqual(document.date_of_birth, datetime.date(1974, 8, 12))

    def test_td3_specimen(self):
        document = parse(TD3_SPECIMEN)
        self.assertEqual(document.mrz_format, "TD3")
        self.assertTrue(document.valid, document.failed_check_digits)
        self.assertEqual(document.document_code, "P")
        self.assertEqual(document.document_number, "L898902C3")
        self.assertEqual(document.optional_data, "ZE184226B")
        self.assertEqual(document.sex, "female")
        self.assertEqual(document.date_of_expiry, datetime.date(2012, 4, 15))
        self.assertTrue(document.is_expired(on=datetime.date(2020, 1, 1)))
        self.assertFalse(document.is_expired(on=datetime.date(2010, 1, 1)))


class CorruptionTests(unittest.TestCase):
    def test_single_digit_error_is_caught(self):
        lines = normalize(TD3_SPECIMEN)
        # Change the year of birth without fixing the check digit.
        broken = lines[1].replace("7408122F", "7408123F", 1)
        document = parse([lines[0], broken])
        self.assertFalse(document.valid)
        failed = {result.name for result in document.failed_check_digits}
        self.assertEqual(failed, {"date_of_birth", "composite"})

    def test_optional_data_is_covered_only_by_the_composite(self):
        lines = list(normalize(TD1_SPECIMEN))
        # Corrupt optional data 2, which no individual check digit covers.
        lines[1] = lines[1][:18] + "1" + lines[1][19:]
        document = parse(lines)
        self.assertFalse(document.valid)
        self.assertEqual(
            {result.name for result in document.failed_check_digits}, {"composite"}
        )

    def test_value_differences_of_ten_are_undetectable(self):
        # Documented weakness of the Doc 9303 algorithm: character values are
        # summed modulo 10, so substituting a letter for a character whose
        # value differs by a multiple of 10 (here 'A' = 10 for '<' = 0) leaves
        # every check digit unchanged. Check digits catch transcription slips,
        # not tampering.
        lines = list(normalize(TD1_SPECIMEN))
        lines[1] = lines[1][:18] + "A" + lines[1][19:]
        document = parse(lines)
        self.assertTrue(document.valid)
        self.assertEqual(document.optional_data_2, "A")


class ParsingTests(unittest.TestCase):
    def test_rejects_wrong_geometry(self):
        with self.assertRaises(MrzParseError):
            parse("P<UTOERIKSSON<<ANNA")

    def test_rejects_non_mrz_characters(self):
        lines = normalize(TD3_SPECIMEN)
        with self.assertRaises(MrzParseError):
            parse([lines[0].replace("E", "É", 1), lines[1]])

    def test_normalize_folds_ocr_variants_and_whitespace(self):
        lines = normalize("  P<UTO ERIKSSON«ANNA<MARIA  \n\n")
        self.assertEqual(lines, ("P<UTOERIKSSON<<ANNA<MARIA",))

    def test_names_without_given_names(self):
        document = parse(
            [
                "P<UTOERIKSSON<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<",
                "L898902C36UTO7408122F1204159ZE184226B<<<<<10",
            ]
        )
        self.assertEqual(document.surname, "ERIKSSON")
        self.assertEqual(document.given_names, "")

    def test_full_width_name_flagged_as_truncatable(self):
        document = parse(
            [
                "P<UTOSCHMIDTBAUER<<ANNA<MARIA<CHRISTINA<JOHA",
                "L898902C36UTO7408122F1204159ZE184226B<<<<<10",
            ]
        )
        self.assertTrue(document.name_possibly_truncated)
        self.assertFalse(parse(TD3_SPECIMEN).name_possibly_truncated)

    def test_td1_document_number_overflow(self):
        # Document number longer than 9 characters continues in optional data:
        # filler in the check-digit slot, remainder + check digit + filler after.
        number = "D2314589071234"
        digit = check_digit(number)
        line1 = f"I<UTO{number[:9]}<{number[9:]}{digit}<"
        line1 = line1.ljust(30, "<")
        line2_body = "7408122F1204159UTO<<<<<<<<<<<"
        composite = line1[5:30] + line2_body[0:7] + line2_body[8:15] + line2_body[18:29]
        line2 = line2_body + check_digit(composite)
        document = parse([line1, line2, "ERIKSSON<<ANNA<MARIA<<<<<<<<<<"])
        self.assertEqual(document.document_number, number)
        self.assertTrue(document.valid, document.failed_check_digits)


class DateTests(unittest.TestCase):
    def test_birth_century_is_never_in_the_future(self):
        document = parse(TD3_SPECIMEN)
        self.assertLess(document.date_of_birth, datetime.date.today())

    def test_impossible_date_is_reported_rather_than_raised(self):
        lines = normalize(TD3_SPECIMEN)
        broken = lines[1].replace("7408122F", "7413322F", 1)
        document = parse([lines[0], broken])
        self.assertIsNone(document.date_of_birth)
        self.assertEqual(document.raw_date_of_birth, "741332")


class CliTests(unittest.TestCase):
    def _run(self, argv, stdin_text=None):
        import sys

        original = sys.stdin
        if stdin_text is not None:
            sys.stdin = io.StringIO(stdin_text)
        buffer = io.StringIO()
        try:
            with redirect_stdout(buffer):
                code = main(argv)
        finally:
            sys.stdin = original
        return code, buffer.getvalue()

    def test_valid_zone_exits_zero(self):
        code, output = self._run([], stdin_text=TD3_SPECIMEN)
        self.assertEqual(code, 0)
        self.assertIn("ERIKSSON", output)
        self.assertIn("all check digits verify", output)

    def test_invalid_zone_exits_one(self):
        lines = normalize(TD3_SPECIMEN)
        broken = "\n".join([lines[0], lines[1].replace("7408122F", "7408123F", 1)])
        code, output = self._run([], stdin_text=broken)
        self.assertEqual(code, 1)
        self.assertIn("INVALID", output)

    def test_unparseable_input_exits_two(self):
        code, _ = self._run([], stdin_text="not an mrz")
        self.assertEqual(code, 2)

    def test_json_output(self):
        import json

        code, output = self._run(["--json"], stdin_text=TD1_SPECIMEN)
        payload = json.loads(output)
        self.assertEqual(code, 0)
        self.assertEqual(payload["format"], "TD1")
        self.assertEqual(payload["surname"], "ERIKSSON")
        self.assertTrue(payload["valid"])


if __name__ == "__main__":
    unittest.main()
