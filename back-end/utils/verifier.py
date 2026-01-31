# utils/verifier.py
from difflib import SequenceMatcher
import re

def _normalize_ocr_quirks(text: str) -> str:
    """
    Fix common OCR misreads before cleaning.
    Examples:
        ! → i
        | → i
        1 → i (inside words)
        rn → m
        cl → d
    """
    if not text:
        return ""

    # Fix '!' at end of word or inside letters
    text = re.sub(r'(?<=\w)!', 'i', text)
    text = re.sub(r'!$', 'i', text)

    # '|' inside words → 'i'
    text = re.sub(r'(?<=[A-Za-z])\|(?=[A-Za-z])', 'i', text)

    # '1' inside letters → 'i'
    text = re.sub(r'(?<=[A-Za-z])1(?=[A-Za-z])', 'i', text)

    # Optional: fix common ligature OCR errors
    text = re.sub(r'rn', 'm', text, flags=re.IGNORECASE)
    text = re.sub(r'cl', 'd', text, flags=re.IGNORECASE)

    return text

def _clean_text(text: str) -> str:
    """
    Normalize OCR quirks, remove special chars, collapse whitespace, lowercase.
    """
    if not text:
        return ""

    text = _normalize_ocr_quirks(text)
    # Remove remaining non-alphanumeric characters
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    cleaned = " ".join(cleaned.split())
    return cleaned.lower()

def _similar(a: str, b: str) -> float:
    """
    Return similarity ratio between 0 and 1 using SequenceMatcher.
    """
    return SequenceMatcher(None, _clean_text(a), _clean_text(b)).ratio()

def _find_best_match(expected: str, text: str, min_ratio=0.9):
    """
    Compare expected string against OCR text.
    Handles both single-word and multi-word expected strings.
    """
    exp_clean = _clean_text(expected)
    txt_clean = _clean_text(text)
    result = {"expected": expected, "found": None, "similarity": 0.0, "match": False}

    if not exp_clean:
        return result

    # Exact substring match shortcut
    if exp_clean in txt_clean:
        result.update({"found": expected, "similarity": 1.0, "match": True})
        return result

    tokens = txt_clean.split()
    best_ratio = 0.0
    best_snippet = None

    # Check individual words first (handles "Jes!" → "Jesi")
    for token in tokens:
        ratio = _similar(exp_clean, token)
        if ratio > best_ratio:
            best_ratio = ratio
            best_snippet = token

    # Sliding window for multi-word fields
    L = max(1, len(exp_clean.split()))
    for w in range(max(1, L-2), L+3):
        for i in range(0, max(0, len(tokens)-w+1)):
            snippet = " ".join(tokens[i:i+w])
            ratio = _similar(exp_clean, snippet)
            if ratio > best_ratio:
                best_ratio = ratio
                best_snippet = snippet

    result.update({
        "found": best_snippet,
        "similarity": round(best_ratio, 2),
        "match": best_ratio >= min_ratio
    })
    return result

def _find_date_match(expected_date: str, text: str, min_ratio=0.9):
    """
    Try to match date: exact substring first, then common formats.
    Returns dict with similarity and match.
    """
    expected = (expected_date or "").strip()
    txt = (text or "")
    res = {"expected": expected, "found": None, "similarity": 0.0, "match": False}

    if not expected:
        return res

    # Exact substring
    if expected in txt:
        res.update({"found": expected, "similarity": 1.0, "match": True})
        return res

    # Look for common date patterns
    date_patterns = [
        r"\d{4}[-/|]\d{2}[-/|]\d{2}",          # 2025-09-12 or 2025/09/12
        r"\d{2}[-/|]\d{2}[-/|]\d{4}",          # 12-09-2025
        r"\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}",     # 12 September 2025
        r"[A-Za-z]{3,}\s+\d{1,2},\s*\d{4}"     # Sep 12, 2025
    ]

    candidates = []
    for pat in date_patterns:
        found = re.findall(pat, txt)
        candidates.extend(found)

    if candidates:
        best_ratio = 0.0
        best_cand = None
        for c in candidates:
            ratio = _similar(expected, c)
            if ratio > best_ratio:
                best_ratio = ratio
                best_cand = c
        res.update({
            "found": best_cand,
            "similarity": round(best_ratio, 2),
            "match": best_ratio >= min_ratio
        })
        return res

    return res  # fallback: no match

def compare_metadata(ocr_text: str, metadata: dict) -> dict:
    """
    Compare OCR text with metadata and return detailed results.
    Ensures similarity threshold is high (~0.9) to avoid false negatives.
    """
    ocr = ocr_text or ""
    results = {}

    expected_name = metadata.get("studentName", "")
    expected_course = metadata.get("courseName", "")
    expected_date = metadata.get("completionDate", "")

    name_res = _find_best_match(expected_name, ocr, min_ratio=0.7)
    course_res = _find_best_match(expected_course, ocr, min_ratio=0.9)
    date_res = _find_date_match(expected_date, ocr, min_ratio=0.9)

    results["studentName"] = name_res
    results["courseName"] = course_res
    results["completionDate"] = date_res

    results["overall_match"] = name_res["match"] and course_res["match"] and date_res["match"]

    # Optional: average confidence score
    results["confidence"] = round(
        (name_res["similarity"] + course_res["similarity"] + date_res["similarity"]) / 3, 2
    )

    # Optional: list failed fields
    results["failed_fields"] = [
        k for k, v in results.items() if isinstance(v, dict) and not v["match"]
    ]

    return results
