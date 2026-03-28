"""Tests for Vedic chart computation.

Planetary positions must be mathematically correct — these are not approximations.
"""
import pytest
from datetime import date, time
from app.services.chart import compute_chart, compute_vimshottari_dasha


# Known birth data with verified chart (used as regression fixture)
TEST_DOB = date(1990, 1, 15)
TEST_TOB = time(10, 30)
TEST_LAT = 28.6139   # New Delhi
TEST_LON = 77.2090
TEST_TZ = 5.5        # IST


def test_chart_contains_all_planets():
    chart = compute_chart(TEST_DOB, TEST_TOB, TEST_LAT, TEST_LON, TEST_TZ)
    expected_planets = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"}
    assert set(chart["positions"].keys()) == expected_planets


def test_chart_unknown_tob_defaults_to_noon():
    chart = compute_chart(TEST_DOB, None, TEST_LAT, TEST_LON, TEST_TZ)
    assert chart["tob_unknown"] is True
    assert chart["lagna"] is not None  # still produces a chart


def test_chart_lagna_is_valid_sign():
    chart = compute_chart(TEST_DOB, TEST_TOB, TEST_LAT, TEST_LON, TEST_TZ)
    valid_signs = [
        "Mesha", "Vrishabha", "Mithuna", "Karka",
        "Simha", "Kanya", "Tula", "Vrishchika",
        "Dhanu", "Makara", "Kumbha", "Meena",
    ]
    assert chart["lagna"] in valid_signs


def test_ketu_is_180_from_rahu():
    chart = compute_chart(TEST_DOB, TEST_TOB, TEST_LAT, TEST_LON, TEST_TZ)
    rahu = chart["positions"]["Rahu"]["longitude"]
    ketu = chart["positions"]["Ketu"]["longitude"]
    assert abs((rahu - ketu + 360) % 360 - 180) < 0.01


def test_vimshottari_dasha_covers_120_years():
    chart = compute_chart(TEST_DOB, TEST_TOB, TEST_LAT, TEST_LON, TEST_TZ)
    timeline = compute_vimshottari_dasha(chart, TEST_DOB)
    total_years = sum(p["years"] for p in timeline)
    assert total_years >= 119  # at least 119 years covered


def test_vimshottari_dasha_no_gaps():
    chart = compute_chart(TEST_DOB, TEST_TOB, TEST_LAT, TEST_LON, TEST_TZ)
    timeline = compute_vimshottari_dasha(chart, TEST_DOB)
    for i in range(1, len(timeline)):
        prev_end = timeline[i - 1]["end"]
        curr_start = timeline[i]["start"]
        assert prev_end == curr_start, f"Gap between period {i-1} and {i}"
