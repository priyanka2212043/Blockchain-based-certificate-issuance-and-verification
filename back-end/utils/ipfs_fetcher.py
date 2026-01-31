# utils/ipfs_fetcher.py
import requests

def fetch_metadata(ipfs_url: str) -> dict:
    """
    Fetch metadata from IPFS gateway and normalize keys so downstream
    uses: studentName, courseName, completionDate, issuer.
    If fetch fails, returns a normalized mock metadata (is_mock=True).
    """
    try:
        if not ipfs_url:
            raise ValueError("Empty ipfs_url")

        # allow full gateway urls or ipfs://<cid> or just CID
        if ipfs_url.startswith("ipfs://"):
            ipfs_hash = ipfs_url.replace("ipfs://", "")
            url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
        elif ipfs_url.startswith("http://") or ipfs_url.startswith("https://"):
            url = ipfs_url
        else:
            # assume it's a bare CID
            url = f"https://gateway.pinata.cloud/ipfs/{ipfs_url}"

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        raw = resp.json()
        # Normalize keys
        normalized = {
            "studentName": raw.get("studentName") or raw.get("name") or "",
            "courseName": raw.get("courseName") or raw.get("course") or "",
            "completionDate": raw.get("completionDate") or raw.get("issued_on") or raw.get("date") or "",
            "issuer": raw.get("issuer") or raw.get("organization") or ""
        }
        normalized["is_mock"] = False
        return normalized

    except Exception as e:
        # fallback mock metadata (normalized)
        print("IPFS fetch failed:", e)
        mock = {
            "studentName": "Test User",
            "courseName": "Blockchain 101",
            "completionDate": "2025-09-12",
            "issuer": "Your Institute",
            "is_mock": True,
            "note": "This is mock metadata (IPFS fetch failed)."
        }
        return mock