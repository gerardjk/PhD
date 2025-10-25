#!/usr/bin/env python3
"""Extract ERC metadata and finalization dates from a local ERCs repository.

This script scans the `ERCS` directory within the provided repository, reads the
YAML-style front matter from each markdown file, and determines when the ERC's
status first became `Final` by walking the git history.
"""

from __future__ import annotations

import argparse
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional


@dataclass
class ERCMetadata:
    eip: str
    title: str
    status: str
    created: Optional[str]
    finalization_date: Optional[str]
    path: Path
    history_note: Optional[str]


def run_git(repo: Path, args: List[str]) -> str:
    """Execute a git command in `repo` and return stdout as text."""
    completed = subprocess.run(
        ["git", "-C", str(repo)] + args,
        check=True,
        text=True,
        capture_output=True,
    )
    return completed.stdout.strip()


def parse_front_matter(text: str) -> Dict[str, str]:
    """Parse the leading front matter block into a dict (very small YAML subset)."""
    if not text.startswith("---\n"):
        return {}

    end_idx = text.find("\n---", 4)
    if end_idx == -1:
        return {}

    block = text[4:end_idx]
    meta: Dict[str, str] = {}
    current_key: Optional[str] = None

    for raw_line in block.splitlines():
        line = raw_line.rstrip()
        if not line:
            continue
        if line.startswith((" ", "\t", "- ")) and current_key:
            # Continuations (e.g., bullet lists) are appended with whitespace trimmed.
            meta[current_key] = meta[current_key] + " " + line.strip()
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        current_key = key.strip()
        meta[current_key] = value.strip()

    return meta


def load_front_matter(path: Path) -> Dict[str, str]:
    return parse_front_matter(path.read_text(encoding="utf-8"))


def first_finalization_date(repo: Path, rel_path: Path) -> tuple[Optional[str], Optional[str]]:
    """Return (date, warning) for the first commit when status became Final."""
    try:
        hashes_text = run_git(repo, [
            "log",
            "--follow",
            "--format=%H",
            "--reverse",
            "--",
            str(rel_path),
        ])
    except subprocess.CalledProcessError:
        return None, "unable to load git history"

    hashes: List[str] = [h for h in hashes_text.splitlines() if h]
    if not hashes:
        return None, "no commits found"

    history_note: Optional[str] = None
    if len(hashes) == 1:
        history_note = "only one commit available"

    previous_status: Optional[str] = None
    for commit in hashes:
        try:
            blob = run_git(repo, ["show", f"{commit}:{rel_path.as_posix()}"])
        except subprocess.CalledProcessError:
            continue
        status = parse_front_matter(blob).get("status")
        previous_status_lower = (previous_status or "").lower()
        if status and status.lower() == "final" and previous_status_lower != "final":
            try:
                date = run_git(
                    repo,
                    ["show", "-s", "--format=%ad", "--date=short", commit],
                )
            except subprocess.CalledProcessError:
                return None, history_note or "unable to read commit date"
            return (date.strip() or None, history_note)
        previous_status = status
    return None, history_note


def collect_ercs(repo: Path, status_filter: Optional[str]) -> Iterable[ERCMetadata]:
    erc_dir = repo / "ERCS"
    for path in sorted(erc_dir.glob("*.md")):
        meta = load_front_matter(path)
        status = meta.get("status", "")
        if status_filter and status.lower() != status_filter.lower():
            continue
        if meta.get("category", "").lower() != "erc":
            continue
        eip = meta.get("eip", path.stem.split("-")[-1])
        title = meta.get("title", "")
        created = meta.get("created")
        finalized, history_note = first_finalization_date(repo, path.relative_to(repo))
        yield ERCMetadata(
            eip=str(eip),
            title=title,
            status=status,
            created=created,
            finalization_date=finalized,
            path=path,
            history_note=history_note,
        )


def format_row(erc: ERCMetadata) -> str:
    return ",".join(
        [
            erc.eip,
            erc.title.replace(",", " ").replace("\n", " "),
            erc.status,
            erc.created or "",
            erc.finalization_date or "",
            erc.path.as_posix(),
            (erc.history_note or "").replace(",", " ")
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("ERCs"),
        help="Path to the local ERCs repository (default: ./ERCs)",
    )
    parser.add_argument(
        "--status",
        default="Final",
        help="Only include ERCs with this status (default: Final)",
    )
    parser.add_argument(
        "--no-header",
        action="store_true",
        help="Do not print the CSV header row",
    )
    args = parser.parse_args()

    repo = args.repo.resolve()
    if not (repo / "ERCS").exists():
        parser.error(f"{repo} does not look like the ERCs repository")

    if not args.no_header:
        print("eip,title,status,created,finalized,path,history_note")
    for erc in collect_ercs(repo, args.status):
        print(format_row(erc))


if __name__ == "__main__":
    main()
