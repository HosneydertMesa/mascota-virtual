---
name: gate-deploy
description: "Slash command that bumps version, generates release notes, commits, tags, and pushes. Defense in depth: runs gate strict (artifacts + qa + security) by default. Use when the user types /gate-deploy followed by a version (e.g. /gate-deploy minor or /gate-deploy 1.2.4)."
---

# gate-deploy

Automates the full release flow: pre-checks, gates, version bump, release notes generation, commit, tag, and push. Mirrors `gate-security` and `gate-qa` in structure: slash command is the orchestrator, `gate.ps1 deploy` is the CLI implementation.

## When to invoke

User types `/gate-deploy [<version>]` where `<version>` is one of:
- `major` / `minor` / `patch` (semver bump keyword)
- Explicit `X.Y.Z` (e.g. `1.2.4`)

If the user types just `/gate-deploy` without a version, default to `patch` bump.

If the user types `/gate-deploy` followed by other flags (e.g. `/gate-deploy -SkipGates`), pass them through to the CLI.

## Flow

### Step 1: Confirm scope

Ask the user ONE question if version is missing or ambiguous:

> "This deploy will run gate strict (plan, review, QA sign-off, tag = version, then qa + security), then bump [version-source] (default: patch), update CHANGELOG.md, commit, tag, and push to origin/main. Confirm or change the version?"

Wait for confirmation before proceeding.

### Step 2: Invoke the CLI

Run the PowerShell CLI in the project root:
```powershell
gate.ps1 deploy [<version>] [-ProjectPath .] [-SkipGates] [-Force] [-Annotated] [-SkipPush] [-DryRun]
```

The CLI does the actual work. Read the CLI's stdout for status and stderr for errors.

If the CLI exits non-zero, surface the error and stop. Do not retry without user approval.

### Step 3: Summarize

Verify before reporting: after the CLI exits 0, confirm the tag exists (`git tag --list v<version>`) and, unless `-SkipPush`, that the push reached origin (`git ls-remote --tags origin v<version>`). Do not report success from the exit code alone. If `superpowers:verification-before-completion` is in your skills list, follow it.

Then print:

```
✓ Deployed v<version>:
  - Tag: v<version>
  - Commit: <short-sha>
  - Release notes: CHANGELOG.md
  - Pushed: <yes/no — depends on -SkipPush>
```

## Exit codes (from CLI)

| Code | Meaning |
|------|---------|
| 0 | Success: version bumped, tagged, pushed (or staged for push) |
| 1 | Gate failed OR version conflict (tag exists) |
| 2 | Config error (not a git repo, dirty tree, no version source) |

## Error handling

- **Mavis not available:** print "Mavis no responde. Corré `gate.ps1 deploy` directamente en PowerShell." and stop.
- **Gate failed (exit 1):** surface which gate failed. User can run `/gate-deploy -SkipGates` to override (with warning).
- **Config error (exit 2):** surface the missing requirement. No retry possible without fixing the config.
- **Push rejected (exit 1):** surface the git error. User fixes remote and re-runs.

## Out of scope

- Publishing to npm/PyPI/GitHub Releases (reserved for future spec).
- Multi-branch release trains.
- Rollback / undo (use `git revert` + `git tag -d`).
- .NET, Rust, PHP, Java version files. v1 supports Node (package.json) + Python (pyproject.toml) + plain version.txt.