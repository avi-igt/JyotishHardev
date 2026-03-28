"""Response classifier: rewrites sensitive prediction language before delivery.

All LLM responses MUST pass through classify() before reaching the user.
If this classifier raises, show a fallback message — never raw LLM output.
"""
import re


DEATH_PATTERNS = [
    r"\bdeath\b",
    r"\bdying\b",
    r"\bdie\b",
    r"\bfatal\b",
    r"\bmortal\b",
    r"\bend of life\b",
    r"\blife span\b",
    r"\byear of death\b",
]

DEATH_REWRITE = "health watch period — prioritize preventive care and regular checkups during this time"

FALLBACK_MESSAGE = (
    "I encountered an issue preparing your reading. "
    "Please try again, and I'll be with you shortly."
)


def classify(text: str) -> str:
    """Rewrite sensitive language in LLM output.

    Raises:
        ClassifierError: if input is empty or classification itself fails
    """
    if not text or not text.strip():
        raise ClassifierError("Empty response from LLM")

    result = text
    for pattern in DEATH_PATTERNS:
        result = re.sub(
            pattern,
            DEATH_REWRITE,
            result,
            flags=re.IGNORECASE,
        )

    return result


class ClassifierError(Exception):
    pass
