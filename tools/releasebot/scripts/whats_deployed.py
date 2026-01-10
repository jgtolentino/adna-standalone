#!/usr/bin/env python3
"""
Generate deployment inventory for a release tag.

Usage:
    python whats_deployed.py --repo-path /path/to/repo --tag v1.0.0 --prev-tag v0.9.0

This script analyzes git history between two tags and generates:
- WHAT_DEPLOYED_<tag>.md - Human-readable deployment summary
- WHAT_DEPLOYED_<tag>.json - Machine-readable deployment data
- GO_LIVE_MANIFEST_<tag>.md - Deployment checklist
- DEPLOYMENT_PROOFS/<tag>/README.md - Evidence placeholder
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from releasebot.config import Target
from releasebot.main import run_local, write_outputs


def main() -> int:
    """Main entry point."""
    ap = argparse.ArgumentParser(
        description="Generate deployment inventory for a release tag",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Against a local checkout
    python whats_deployed.py --repo-path ../odoo-ce --tag prod-20260109 --prev-tag prod-20260108

    # Future: Against GitHub (not yet implemented)
    python whats_deployed.py --github-repo owner/repo --tag v1.0.0 --prev-tag v0.9.0 --github-token $TOKEN
        """,
    )
    ap.add_argument(
        "--repo-path",
        help="Local path to target repository",
    )
    ap.add_argument(
        "--github-repo",
        help="GitHub repository (owner/name) - future feature",
    )
    ap.add_argument(
        "--github-token",
        help="GitHub token for API access - future feature",
    )
    ap.add_argument(
        "--tag",
        required=True,
        help="Release tag to analyze",
    )
    ap.add_argument(
        "--prev-tag",
        required=True,
        help="Previous release tag for comparison",
    )
    args = ap.parse_args()

    target = Target(
        repo_path=args.repo_path,
        github_repo=args.github_repo,
        github_token=args.github_token,
        tag=args.tag,
        prev_tag=args.prev_tag,
    )

    try:
        target.validate()
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    if not target.repo_path:
        print(
            "Error: Only --repo-path mode is implemented. "
            "GitHub API mode is planned for future releases.",
            file=sys.stderr,
        )
        return 1

    try:
        print(f"Analyzing {target.tag} vs {target.prev_tag}...")
        inv = run_local(target)

        print(f"Found {inv.commit_count} commits, {len(inv.changed_files)} files changed")

        paths = write_outputs(target.repo_path, inv)
        print(f"\nWrote release docs under {target.repo_path}/docs/releases/")
        for p in paths:
            print(f"  - {p}")

        return 0

    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
