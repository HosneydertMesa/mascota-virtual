---
name: gate-visual
description: "Slash command that audits HTML files in a project for accessibility (a11y) issues using 10 pure-PowerShell rules covering WCAG 2.1 A-level criteria. Zero external dependencies. Use when the user types /gate-visual followed by an optional project path."
---

# gate-visual

Audits HTML files in a project for accessibility (a11y) issues. Pure PowerShell implementation, no npm/Chrome/jsdom required. Mirrors `gate-qa` / `gate-security` / `gate-deploy` in structure: slash command is the orchestrator, `gate.ps1 visual` is the CLI implementation.

## When to invoke

User types `/gate-visual [<project-path>]` or just `/gate-visual` (uses cwd).

If the user types flags like `/gate-visual -SeverityFilter info`, pass them through to the CLI.

## Flow

### Step 1: Confirm scope

If the project path is missing or ambiguous, ask the user ONE question:

> "This will scan every *.html file in the project for a11y issues (lang, title, alt, label, heading hierarchy, etc.). Default severity filter: error. Confirm or change the path?"

Wait for confirmation before proceeding.

### Step 2: Invoke the CLI

Run the PowerShell CLI in the project root:
```powershell
gate.ps1 visual [-ProjectPath .] [-SeverityFilter error|warning|info] [-DryRun]
```

The CLI does the actual scan. Read the CLI's stdout for findings and stderr for errors.

If the CLI exits non-zero, surface the error and stop. Do not retry without user approval.

### Step 3: Summarize

After the CLI exits, print:

```
Visual audit complete:
  - HTML files scanned: N
  - Findings: M (K error, L warning, J info)
  - At severity >= <filter>: F
  - Exit: <0/1/2>
```

## Exit codes (from CLI)

| Code | Meaning |
|------|---------|
| 0 | Clean: no findings at filter level (or no HTML files in project) |
| 1 | Findings: at least one finding at severity >= filter |
| 2 | Config error: project path does not exist or invalid filter |

## Error handling

- **Mavis not available:** print "Mavis no responde. Corré `gate.ps1 visual` directamente en PowerShell." and stop.
- **No HTML files:** CLI exits 0 with info message. The slash command surfaces this as a positive result.
- **Project path not found:** CLI exits 2. The slash command surfaces the path and stops.

## Out of scope

- axe-core integration (full WCAG 2.1 A/AA/AAA coverage). Reserved for future spec.
- Visual regression testing (screenshots + pixelmatch). Requires Playwright/Chrome.
- Visual diff for PRs (before/after images). Different concern (PR review process, not CI gate).
- Color contrast checking. Requires CSS parsing + rendering engine.
- JS-rendered pages (React/Vue SPAs). Requires a browser. v1 only parses the static HTML.