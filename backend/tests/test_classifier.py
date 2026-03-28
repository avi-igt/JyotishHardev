import pytest
from app.services.classifier import classify, ClassifierError, FALLBACK_MESSAGE


def test_death_language_rewritten():
    result = classify("Your death year appears to be around 2055.")
    assert "death" not in result.lower()
    assert "health watch period" in result.lower()


def test_dying_language_rewritten():
    result = classify("There is a risk of dying during this period.")
    assert "dying" not in result.lower()


def test_safe_text_unchanged():
    text = "Jupiter Mahadasha indicates a strong career period from 2027 to 2034."
    assert classify(text) == text


def test_empty_input_raises():
    with pytest.raises(ClassifierError):
        classify("")


def test_whitespace_only_raises():
    with pytest.raises(ClassifierError):
        classify("   ")


def test_case_insensitive_rewrite():
    result = classify("DEATH is indicated in this Dasha period.")
    assert "DEATH" not in result
    assert "health watch period" in result.lower()
