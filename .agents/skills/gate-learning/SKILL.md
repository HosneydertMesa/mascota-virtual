---
name: gate-learning
description: "Slash command that updates the '## Current state' section in AGENTS.md based on docs/specs/, docs/plans/, CHANGELOG.md, and recent git commits. Pure PowerShell, no npm. Use when the user types /gate-learning."
---

# gate-learning

Refreshes the `## Current state` section in `AGENTS.md` so AI agents have a current snapshot of what the project is working on. Mirrors `gate-skill-guardrail` / `gate-visual` in structure: slash command is the orchestrator, `gate.ps1 learning` is the CLI implementation.

## When to invoke

User types `/gate-learning` (uses cwd) or with a project path. The command scans the project for recent state and updates the `## Current state` section.

If the user types flags like `/gate-learning -DaysBack 7`, pass them through to the CLI.

## Flow

### Step 1: Confirm scope

Ask the user ONE question if the project path is missing or ambiguous:

> "This will scan the project for recent specs, plans, CHANGELOG entries, and git commits, then update the '## Current state' section in AGENTS.md. Days back: 30 (configurable). Confirm?"

Wait for confirmation before proceeding.

### Step 2: Invoke the CLI

Run the PowerShell CLI in the project root:
```powershell
gate.ps1 learning [-ProjectPath .] [-DaysBack 30] [-DryRun]
```

The CLI does the actual scan and update. Read the CLI's stdout for the summary and stderr for errors.

If the CLI exits non-zero, surface the error and stop. Do not retry without user approval.

### Step 3: Summarize

After the CLI exits 0, print:

```
Learning complete:
  - Specs reflected: N
  - Plans reflected: M
  - Commits reflected: K
  - AGENTS.md section updated
```

Suggest a commit message:

```
chore(agents): refresh Current state section
```

## Exit codes (from CLI)

| Code | Meaning |
|------|---------|
| 0 | Success: AGENTS.md updated (or no changes needed) |
| 2 | Config error: project path not found or not a git repo |

## The section that gets updated

```markdown
## Current state
_Last updated: 2026-08-25 by gate-learning_

### Recent specs
- `2026-08-25-gate-skill-guardrail-design.md` (2 days ago)

### Recent plans
- `2026-08-25-gate-skill-guardrail.md` (2 days ago)

### What we are working on
- **Spec**: `2026-08-25-gate-skill-guardrail-design.md`
- **Plan**: `2026-08-25-gate-skill-guardrail.md`

### What we shipped
- (last CHANGELOG entry or "no CHANGELOG.md")

### Recent commits
- `commit-hash` commit subject -- relative time
```

## Error handling

- **Mavis not available:** print "Mavis no responde. Corré `gate.ps1 learning` directamente en PowerShell." and stop.
- **Project not a git repo:** CLI exits 2. The slash command surfaces the path and stops.
- **AGENTS.md doesn't exist:** CLI creates it with a minimal template.

## Out of scope

- Full AGENTS.md regeneration. v1 only manages the `## Current state` section.
- Auto-commit the AGENTS.md update. v1 leaves the commit to the user.
- Multiple section markers (e.g. `## Recent decisions`, `## Known issues`).
- Watching git for changes (auto-update on every commit).
- Cross-project state aggregation.
- AI-generated summaries of spec/plan content.