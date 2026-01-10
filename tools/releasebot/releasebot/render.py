"""Render inventory to Markdown and JSON outputs."""

import json
from datetime import datetime, timezone
from typing import List

from .inventory import Inventory


def render_md(inv: Inventory) -> str:
    """Render inventory as Markdown document."""
    lines: List[str] = []
    lines.append(f"# What Deployed - {inv.tag}")
    lines.append("")
    lines.append(f"*Generated: {datetime.now(timezone.utc).isoformat()}*")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- **Current tag**: `{inv.tag}`")
    lines.append(f"- **Previous tag**: `{inv.prev_tag}`")
    lines.append(f"- **Commit count**: **{inv.commit_count}**")
    lines.append(f"- **Files changed**: **{len(inv.changed_files)}**")
    lines.append("")
    lines.append("## Verification Results")
    lines.append("")
    for k, v in inv.verification.items():
        lines.append(f"- {k}: **{v}**")
    lines.append("")
    lines.append("## Changes Shipped (by bucket)")
    lines.append("")
    for bucket, items in inv.buckets.items():
        lines.append(f"### {bucket}")
        lines.append("")
        if not items:
            lines.append("- None")
        else:
            for it in items[:50]:  # Cap display for readability
                lines.append(f"- `{it}`")
            if len(items) > 50:
                lines.append(f"- ... and {len(items) - 50} more")
        lines.append("")
    lines.append("## Commits")
    lines.append("")
    for c in inv.commits[:100]:  # Cap display
        lines.append(f"- `{c[:80]}...`" if len(c) > 80 else f"- `{c}`")
    if len(inv.commits) > 100:
        lines.append(f"- ... and {len(inv.commits) - 100} more commits")
    lines.append("")
    if inv.notes:
        lines.append("## Notes")
        lines.append("")
        for n in inv.notes:
            lines.append(f"- {n}")
        lines.append("")
    return "\n".join(lines)


def render_manifest_md(inv: Inventory) -> str:
    """Render go-live manifest as Markdown checklist."""
    lines: List[str] = []
    lines.append(f"# GO-LIVE MANIFEST - {inv.tag}")
    lines.append("")
    lines.append(f"*Generated: {datetime.now(timezone.utc).isoformat()}*")
    lines.append("")
    lines.append("## Pre-Deploy Checklist")
    lines.append("")
    lines.append("- [ ] All CI checks passing on release tag")
    lines.append("- [ ] Release notes reviewed and approved")
    lines.append("- [ ] Stakeholder sign-off obtained")
    lines.append("")
    lines.append("## Deployment Checklist")
    lines.append("")
    lines.append("- [ ] Deployment artifacts verified (CI logs / release assets)")
    lines.append("- [ ] Supabase migrations applied (if any)")
    lines.append("- [ ] Odoo addons updated and module list verified (if any)")
    lines.append("- [ ] Environment variables updated (if required)")
    lines.append("")
    lines.append("## Post-Deploy Checklist")
    lines.append("")
    lines.append("- [ ] Health checks passing")
    lines.append("- [ ] Smoke tests completed")
    lines.append("- [ ] Monitoring dashboards verified")
    lines.append("- [ ] Rollback plan confirmed")
    lines.append("")
    lines.append("## Quick Facts")
    lines.append("")
    lines.append(f"- **Previous release**: `{inv.prev_tag}`")
    lines.append(f"- **Commits in release**: **{inv.commit_count}**")
    lines.append(f"- **Files changed**: **{len(inv.changed_files)}**")
    lines.append("")
    lines.append("## Impact Summary")
    lines.append("")
    for bucket, items in inv.buckets.items():
        if items:
            lines.append(f"- **{bucket}**: {len(items)} files")
    lines.append("")
    return "\n".join(lines)


def render_json(inv: Inventory) -> str:
    """Render inventory as JSON."""
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tag": inv.tag,
        "prev_tag": inv.prev_tag,
        "commit_count": inv.commit_count,
        "file_count": len(inv.changed_files),
        "commits": inv.commits,
        "changed_files": [{"status": s, "path": p} for s, p in inv.changed_files],
        "buckets": {k: v for k, v in inv.buckets.items()},
        "verification": inv.verification,
        "notes": inv.notes,
    }
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"
