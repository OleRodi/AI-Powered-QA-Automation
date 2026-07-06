---
name: self-heal
description: >-
  Repairs drifted Playwright locators after a UI change breaks the suite. Use
  when "the build is red because a locator broke", "fix the drifted selector",
  "the test broke after a UI change", or "heal the suite". Use ONLY after triage
  classifies the red run as a test issue (selector drift) — NEVER for a real app
  bug. If triage says app bug, stop and route to bug-reporter.
---

# Self-Heal (Locator Drift Repair)

Heals selectors that drifted after a UI change. One repair per run. Every heal becomes a PR.

## Guardrails
- Requires an explicit **drift** classification from triage. No classification, or an **app bug** classification → **stop** and route to `jira-bug-reporter`.
- Patch the **POM only**, never the spec's assertions.
- Green achieved by weakening an assertion is a masked app bug → **escalate**, do not commit.
- One locator repair per run.

## Steps
1. **Require drift classification.** Confirm triage classified this red run as a test issue (selector drift). Otherwise stop and route to bug-reporter — do not proceed.
2. **Locate the break.** From the Playwright trace, identify the failing locator and the POM that owns it.
3. **Re-discover the element.** Use the Playwright MCP accessibility (a11y) tree to find the element by its **role + current accessible name**.
4. **Patch the POM.** Apply a minimal, role-based diff to the locator in the POM. Do not touch the spec or its assertions.
5. **Re-run and prove green.** Re-run the affected test and confirm it passes **with assertions unchanged**. If it only goes green via a weakened assertion, that is a bug — escalate instead.
6. **Report.** Output the old → new locator diff and the green run evidence, then open a PR for the heal.

## Report format
```
Drift classification: <triage source/id>
POM: <path>
Locator: <old> -> <new>   (role-based)
Assertions: unchanged
Run: <green run id / evidence>
PR: <link>
```
