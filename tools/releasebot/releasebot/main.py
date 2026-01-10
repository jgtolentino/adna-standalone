"""Main entry point for ReleaseBot inventory generation."""

from typing import List

from .config import Target
from .git_range import (
    ensure_tags_exist,
    list_commits,
    diff_name_status,
    show_commit,
    write_file,
)
from .inventory import Inventory, bucketize
from .render import render_md, render_json, render_manifest_md


def run_local(target: Target) -> Inventory:
    """Generate inventory from local git repository."""
    assert target.repo_path

    # Verify tags exist
    ensure_tags_exist(target.repo_path, target.tag)
    ensure_tags_exist(target.repo_path, target.prev_tag)

    # Get commit list
    shas = list_commits(target.repo_path, target.prev_tag, target.tag)
    commits = [show_commit(target.repo_path, s) for s in shas[:200]]  # cap for sanity

    # Get changed files
    changed = diff_name_status(target.repo_path, target.prev_tag, target.tag)

    # Classify into buckets
    buckets = bucketize(changed)

    # Build verification results
    verification = {
        "Git diff parsed": "PASS" if changed is not None else "FAIL",
        "Odoo changes detected": "YES" if buckets["Odoo changes (addons/)"] else "NO",
        "Supabase changes detected": "YES" if buckets["Supabase changes (supabase/)"] else "NO",
        "Frontend changes detected": "YES" if buckets["Frontend changes (apps/)"] else "NO",
        "Infrastructure changes detected": "YES" if buckets["Infrastructure changes (infrastructure/)"] else "NO",
    }

    notes: List[str] = []
    if len(shas) > 200:
        notes.append(f"TRUNCATED: Only showing first 200 of {len(shas)} commits")

    inv = Inventory(
        tag=target.tag,
        prev_tag=target.prev_tag,
        commit_count=len(shas),
        commits=commits,
        changed_files=changed,
        buckets=buckets,
        verification=verification,
        notes=notes,
    )
    return inv


def write_outputs(repo_path: str, inv: Inventory) -> List[str]:
    """Write all output files and return list of created paths."""
    base = "docs/releases"
    safe_tag = inv.tag.replace("/", "-")

    paths = [
        f"{base}/WHAT_DEPLOYED_{safe_tag}.md",
        f"{base}/WHAT_DEPLOYED_{safe_tag}.json",
        f"{base}/GO_LIVE_MANIFEST_{safe_tag}.md",
        f"{base}/DEPLOYMENT_PROOFS/{safe_tag}/README.md",
    ]

    write_file(repo_path, paths[0], render_md(inv))
    write_file(repo_path, paths[1], render_json(inv))
    write_file(repo_path, paths[2], render_manifest_md(inv))
    write_file(
        repo_path,
        paths[3],
        f"""# Deployment Proofs - {inv.tag}

## Evidence Files

Add evidence links and artifacts here:

- [ ] CI workflow run URL
- [ ] Release URL (GitHub releases)
- [ ] Container image digest (if applicable)
- [ ] Deployment logs

## Verification

- Tag: `{inv.tag}`
- Previous: `{inv.prev_tag}`
- Commits: {inv.commit_count}
- Files: {len(inv.changed_files)}
""",
    )

    return paths
