---
name: gate-security
description: "Slash command that scans for secrets and audits dependencies. Use when the user types /gate-security to verify security after implementing a feature, before code review."
---

# gate-security

Runs a security review: (1) secrets scan using regex patterns (same as pre-commit gate 1) + (2) dependency audit using the project's package manager. Does NOT modify code or fix vulnerabilities — only reports them.

## When to invoke

User types `/gate-security [<feature>]` to do a security review after implementing. Example: `/gate-security "add OAuth"`.

If the user types just `/gate-security` without a feature description, that’s fine — the feature arg is optional and only used as log context.

## Flow

### Step 1: Detect project stack and find files to scan

Use `Get-DetectedStack` (gate.ps1 helper) or equivalent logic to determine the project type:
- `package.json` → Node
- `pyproject.toml` or `requirements.txt` → Python
- `*.sln` → .NET
- `go.mod` → Go
- etc.

Determine which files to scan for secrets:
- All files in working tree (excluding `node_modules/`, `.git/`, `dist/`, `build/`, `*.min.js`)
- Use `git ls-files` if it’s a git repo (staged + tracked), otherwise fall back to `Get-ChildItem -Recurse`

### Step 2: Run secrets scan

For each file, check against these regex patterns (same as pre-commit gate 1):

- `sk-[A-Za-z0-9]{20,}` (OpenAI, MiniMax)
- `sk-cp-[A-Za-z0-9_-]{20,}` (MiniMax Token Plan)
- `xai-[A-Za-z0-9]{20,}` (xAI)
- `ghp_[A-Za-z0-9]{20,}` (GitHub PAT)
- `AKIA[0-9A-Z]{16}` (AWS)
- `AIza[0-9A-Za-z_-]{35}` (Google)
- `password\s*=\s*["'].*["']` (naive password)
- `api[_-]?key\s*=\s*["'].*["']` (naive api key)

Report each finding: file path, line number, pattern matched, snippet (truncated to 80 chars).

### Step 3: Run dependency audit

Auto-detect based on stack:
- Node (`package.json`) → `npm audit --json` → parse JSON, count vulns by severity (critical/high/moderate/low)
- Python (`pyproject.toml`/`requirements.txt`) → `pip-audit` → parse output
- .NET (`*.sln`) → `dotnet list package --vulnerable` → best-effort parse
- Unknown / PowerShell / no project files → skip deps, secrets-only mode

If the audit tool is not in PATH, print a warning and skip (don’t fail).

### Step 4: Combine and report

```
=== gate-security: review ===

Project: <path>
Stack: <detected>
Feature: <optional>

--- Secrets scan ---
[OK] No secrets found
or
[X] 2 secrets found:
  - src/api.js:42 (sk-...)  "sk-abc123...xyz789"
  - config.yml:8 (api_key=...)  "api_key = <redactado>"

--- Dependency audit ---
[OK] No vulnerabilities
or
[X] 3 vulnerabilities:
  - critical: lodash@4.17.20 (CVE-2021-23337) — prototype pollution
  - high:     axios@0.21.1 (CVE-2021-3749) — ReDoS
  - moderate: minimist@1.2.5 (CVE-2021-44906) — prototype pollution

--- Summary ---
Secrets: 2 found
Deps:    3 vulns (1 critical, 1 high, 1 moderate)

SECURITY FAILED — review findings above
Recomendación: rotar secrets + upgrade deps
```

Exit 1 if any critical/high findings. Exit 0 if all clean. Exit 2 on config error.

### Step 5: Severity filter (CLI only)

If user passes `-SeverityFilter critical`, only report findings at that severity or above. The skill/CLI uses the same filter for both secrets and deps.

## Error handling

- **No project files at all** → exit 2 with instructions
- **Stack unknown** → secrets-only mode (skip deps), no error
- **Audit tool not in PATH** → print warning, skip deps, continue with secrets
- **Permission denied reading files** → skip those files, note in report
- **Malformed JSON from `npm audit`** → print raw output, flag as "audit inconclusive"

## Out of scope

- **Fixing vulnerabilities or rotating secrets** — only reports them. Use the package manager manually.
- **Dangerous code patterns (eval, exec)** — separate spec.
- **CI integration** — separate spec.
- **SBOM / CVE database / License compliance** — separate specs.
- **Replacing pre-commit gate 1** — defense in depth. Both run.
