---
name: gate-skill-guardrail
description: "Slash command that validates skills against 8 rules: frontmatter, name match, description, no BOM, no placeholders, conventional prefix, byte-identity between source and runtime, and line cap. Pure PowerShell, manual CLI invocation. Use when the user types /gate-skill-guardrail followed by an optional skill name."
---

# gate-skill-guardrail

Validates skills against 8 quality rules. Pure PowerShell implementation, no npm/Chrome required. Mirrors `gate-qa` / `gate-security` / `gate-visual` in structure: slash command is the orchestrator, `gate.ps1 skill-guardrail` is the CLI implementation.

## When to invoke

User types `/gate-skill-guardrail [<skill-name>]` or just `/gate-skill-guardrail` (validates all skills).

If the user types flags like `/gate-skill-guardrail -MaxLines 500`, pass them through to the CLI.

## Flow

### Step 1: Confirm scope

If the project path or skill name is missing or ambiguous, ask the user ONE question:

> "This will validate skill(s) in the project against 8 quality rules. Default: validate all skills. Confirm or specify a single skill name?"

Wait for confirmation before proceeding.

### Step 2: Invoke the CLI

Run the PowerShell CLI in the project root:
```powershell
gate.ps1 skill-guardrail [<skill-name>] [-ProjectPath .] [-MaxLines 200] [-DryRun]
```

The CLI does the actual validation. Read the CLI stdout for findings and stderr for errors.

If the CLI exits non-zero, surface the error and stop. Do not retry without user approval.

### Step 3: Summarize

After the CLI exits, print:

```
Skill guardrail complete:
  - Skills validated: N
  - Findings: M (in K skills)
  - Exit: <0/1/2>
```

## Exit codes (from CLI)

| Code | Meaning |
|------|---------|
| 0 | All skills pass all 8 rules |
| 1 | At least one skill fails at least one rule |
| 2 | Config error: project path not found, skills/ missing, or skill-name arg invalid |

## The 8 rules (v1)

1. **YAML frontmatter present** -- file starts with `---` and ends the frontmatter block with `---`
2. **name field present and matches directory name** -- `name: <dir>` in frontmatter
3. **description field present and non-empty** -- `description: <text>` in frontmatter
4. **No UTF-8 BOM** -- first 3 bytes are not `0xEF 0xBB 0xBF`
5. **No placeholders** -- file content has none of the 4 uppercase placeholder markers the CLI checks (to-do, to-be-determined, fix-me, triple-x); this file avoids spelling them so it passes its own rule
6. **Conventional prefix** -- name starts with `gate-`
7. **SHA256 byte-identity** -- source (in `gate-setup/skills/`) and runtime (`$env:GATE_RUNTIME_SKILLS_DIR`, default `~/.minimax/agents/mavis/skills/`) are byte-identical; skipped if the runtime dir does not exist
8. **Line count cap** -- file has `< MaxLines` lines (default 200)

## Error handling

- **Mavis not available:** print "Mavis no responde. Corré `gate.ps1 skill-guardrail` directamente en PowerShell." and stop.
- **Skill not found:** CLI exits 2. The slash command surfaces the skill name and stops.
- **No skills/ directory:** CLI exits 2. The slash command surfaces the path and stops.

## Out of scope

- Pre-commit hook integration. Reserved for future spec.
- gate-deploy gate integration. Reserved for future spec.
- gate-strict integration. Reserved for future spec.
- Auto-fix (rewrite source to match runtime, etc.). v1 only reports.
- Custom rule plugins. v1 has 8 hard-coded rules.
- Validation of other artifact types (templates, hooks, bin scripts).