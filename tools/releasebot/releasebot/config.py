"""Configuration for ReleaseBot targets."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Target:
    """Target repository configuration for release inventory generation."""

    repo_path: Optional[str] = None  # local path to repo
    github_repo: Optional[str] = None  # owner/name
    tag: str = ""
    prev_tag: str = ""
    github_token: Optional[str] = None

    def validate(self) -> None:
        """Validate that required fields are present."""
        if not self.tag or not self.prev_tag:
            raise ValueError("--tag and --prev-tag are required")
        if not self.repo_path and not self.github_repo:
            raise ValueError("Provide --repo-path or --github-repo")
