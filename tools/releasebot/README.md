# ReleaseBot - Deterministic Deployment Inventory Generator

Generate deterministic "What's Deployed" inventories from git history and (optionally) GitHub API evidence.

## Purpose

ReleaseBot creates reproducible deployment reports by analyzing:
- Git commit history between release tags
- File changes classified by area (Odoo, Supabase, Frontend, etc.)
- Verification status for each component

## Installation

```bash
cd tools/releasebot
pip install -r requirements.txt
```

Requirements:
- Python 3.11+
- PyYAML
- requests (for future GitHub API features)

## Usage

### Against a Local Repository Checkout

```bash
python scripts/whats_deployed.py \
  --repo-path /path/to/odoo-ce \
  --tag prod-20260109-2219 \
  --prev-tag prod-20260108-1500
```

Or using the shell wrapper:

```bash
./scripts/whats_deployed.sh \
  --repo-path ../odoo-ce \
  --tag prod-20260109-2219 \
  --prev-tag prod-20260108-1500
```

### Output Files

The script generates these files in the target repository:

```
docs/releases/
├── WHAT_DEPLOYED_<tag>.md      # Human-readable summary
├── WHAT_DEPLOYED_<tag>.json    # Machine-readable data
├── GO_LIVE_MANIFEST_<tag>.md   # Deployment checklist
└── DEPLOYMENT_PROOFS/
    └── <tag>/
        └── README.md           # Evidence placeholder
```

## Output Specification

### WHAT_DEPLOYED_<tag>.json

```json
{
  "generated_at": "2026-01-09T22:19:00+00:00",
  "tag": "prod-20260109-2219",
  "prev_tag": "prod-20260108-1500",
  "commit_count": 15,
  "file_count": 42,
  "commits": ["abc123 feat: add feature", ...],
  "changed_files": [{"status": "M", "path": "addons/module/model.py"}, ...],
  "buckets": {
    "Odoo changes (addons/)": ["M\taddons/module/model.py", ...],
    "Supabase changes (supabase/)": [],
    ...
  },
  "verification": {
    "Git diff parsed": "PASS",
    "Odoo changes detected": "YES",
    "Supabase changes detected": "NO"
  },
  "notes": []
}
```

### Change Buckets

Files are automatically classified into these buckets:

| Bucket | Path Pattern |
|--------|-------------|
| Odoo changes | `addons/**` |
| Supabase changes | `supabase/**`, `infrastructure/database/supabase/**` |
| Frontend changes | `apps/**` |
| Infrastructure changes | `infrastructure/**` |
| CI/Workflow changes | `.github/**` |
| Platform changes | `platforms/**` |
| Docs/Other | Everything else |

## Future Features (Planned)

### GitHub API Mode

```bash
python scripts/whats_deployed.py \
  --github-repo jgtolentino/odoo-ce \
  --tag prod-20260109-2219 \
  --prev-tag prod-20260108-1500 \
  --github-token $GITHUB_TOKEN
```

This will add:
- Release metadata from GitHub Releases API
- Workflow run information from GitHub Actions
- Artifacts list
- Deployment environment status

### Evidence Collection

When GitHub API mode is enabled, additional proof files will be saved:

```
docs/releases/DEPLOYMENT_PROOFS/<tag>/
├── README.md
├── api_release_latest.json
├── api_compare.json
├── api_workflow_runs.json
├── api_workflow_run_{id}.json
├── artifacts_index.json
└── graphql_commits_prs.json
```

## Integration

### CI/CD Pipeline

Add to your GitHub workflow:

```yaml
- name: Generate deployment inventory
  run: |
    python tools/releasebot/scripts/whats_deployed.py \
      --repo-path . \
      --tag ${{ github.ref_name }} \
      --prev-tag $(git describe --tags --abbrev=0 HEAD^)
```

### Copying to Another Repository

This tooling can be copied to any repository:

```bash
cp -r tools/releasebot /path/to/odoo-ce/tools/
```

Then run against that repository's tags.

## Design Principles

1. **Deterministic**: Same inputs produce same outputs (modulo timestamps)
2. **Evidence-based**: Everything must be provable from git/API data
3. **No secrets in output**: Tokens are never logged or saved
4. **Portable**: No heavy dependencies, works with Python 3.11+ stdlib + minimal deps
5. **Diff-friendly**: JSON output has stable ordering for version control

## License

MIT - see repository LICENSE file.
