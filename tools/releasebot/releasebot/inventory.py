"""Inventory data structures and bucket classification."""

from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple


@dataclass
class Inventory:
    """Complete inventory of a deployment."""

    tag: str
    prev_tag: str
    commit_count: int
    commits: List[str]
    changed_files: List[Tuple[str, str]]
    buckets: Dict[str, List[str]]
    verification: Dict[str, str]
    notes: List[str]


def bucketize(changed_files: List[Tuple[str, str]]) -> Dict[str, List[str]]:
    """Classify changed files into logical buckets."""
    buckets = {
        "Odoo changes (addons/)": [],
        "Supabase changes (supabase/)": [],
        "Frontend changes (apps/)": [],
        "Infrastructure changes (infrastructure/)": [],
        "CI/Workflow changes (.github/)": [],
        "Platform changes (platforms/)": [],
        "Docs/Other": [],
    }
    for status, path in changed_files:
        entry = f"{status}\t{path}"
        if path.startswith("addons/"):
            buckets["Odoo changes (addons/)"].append(entry)
        elif path.startswith("supabase/") or path.startswith("infrastructure/database/supabase/"):
            buckets["Supabase changes (supabase/)"].append(entry)
        elif path.startswith("apps/"):
            buckets["Frontend changes (apps/)"].append(entry)
        elif path.startswith("infrastructure/"):
            buckets["Infrastructure changes (infrastructure/)"].append(entry)
        elif path.startswith(".github/"):
            buckets["CI/Workflow changes (.github/)"].append(entry)
        elif path.startswith("platforms/"):
            buckets["Platform changes (platforms/)"].append(entry)
        else:
            buckets["Docs/Other"].append(entry)
    return buckets


def as_json(inv: Inventory) -> dict:
    """Convert inventory to JSON-serializable dict."""
    return asdict(inv)
