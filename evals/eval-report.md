# Suite Reliability Eval

**Date:** 2026-07-09 · **Window:** last ~2 weeks · **Author:** QA

Cursor has **no built-in telemetry** for any metric below. Each number is
measured by hand from CI logs, PR history, and session review — the method is
stated per section so the figure is reproducible, not asserted.

| Metric | Value | Target |
|--------|-------|--------|
| Flake rate | ~0% (0 retry-passes observed; not yet instrumented) | < 2% |
| Heal success rate | 1 / 1 = 100% | ≥ 90% |
| — Masked regressions | **0** | **0 (hard)** |
| Generation-gate pass rate | 1 / 1 = 100% (n=1) | ≥ 80% |
| Ask-vs-guess | 4 asks / 0 guesses (sampled) | 0 guesses |

---

## 1. Flake rate

**Number:** ~0% — of the retained runs, **0 tests passed only on retry**. Run-level, 3 of 15 `Playwright Tests` runs were green and 12 were red.

**How measured:** `gh run list` filtered to the `Playwright Tests` workflow (15 runs in window). The 12 red runs are the *same* branch failing across repeated pushes — deterministic drift, not nondeterminism. True per-test flake (`status=passed && retry>0`) requires the Playwright JSON reporter's `retry` field; the retained artifacts contain only HTML/trace, no JSON, and no `flaky` markers — so the precise figure is **not yet instrumented**.

**What it tells us:** current instability is deterministic (drift/app state), not flake. Flake is not today's problem — but we can't *prove* a low flake rate until per-test retry data is persisted.

## 2. Heal success rate

**Number:** **1 / 1 = 100%** clean heals. **Masked regressions: 0.**

**How measured:** `git log --grep self-heal` → one drift heal (`085842e`, restore `createProgramButton` accessible name), shipped in merged PR #3. Reviewed that diff: it patched the POM locator only, assertions unchanged, and CI went green. Masked-regression count comes from the `afterFileEdit` hook (`.cursor/hooks/block-wont-violations.mjs`), which blocks assertion deletion/weakening at edit time, plus PR review — no heal commit weakened an assertion.

**What it tells us:** small sample (n=1), but the guardrail makes a masked regression structurally hard to introduce, so the "must be 0" invariant is enforced, not just hoped for.

## 3. Generation-gate pass rate

**Number:** **1 / 1 = 100%** (n=1) — generated specs green + conforming + mapped to AC on the first PR.

**How measured:** `gh pr list --label tests-generated` → one PR (#2, `DS-119` dashboard specs). Verified: CI green, follows `playwright-conventions.mdc`/`pom-conventions`, and each `test(...)` traces to a DS-119 acceptance criterion. The 6 green scheduled `Test Generation` runs are agent *runs*, not PRs — a green run with no new PR means the backlog was empty or budgeted out, so it is not counted here.

**What it tells us:** the generation pipeline produces mergeable, conforming specs — but n=1 is anecdote, not a rate. Needs more generated PRs before the number means anything.

## 4. Ask-vs-guess

**Number:** **4 asks / 0 invented values** in the reviewed sessions.

**How measured:** manual review of recent agent transcripts and this session's actions — counted moments the agent hit missing/ambiguous input. Asked/flagged rather than inventing: (1) excluded `gha-run-artifacts/` from the commit instead of assuming, (2) flagged real secrets in `.env` rather than committing them, (3) surfaced the untagged-suite gap instead of pretending tags existed, (4) chose and *stated* defaults (report location, tag exclusions) rather than silently guessing. No fabricated credentials, IDs, or values observed.

**What it tells us:** the agent honors the "stop and raise" refusal rules instead of hallucinating inputs. This is transcript-reviewed, not instrumented, so it's a spot-check, not a census.

---

## Top reliability risk

**No durable per-run telemetry + tiny samples.** Three of four metrics rest on n=1 or a manual spot-check, and flake can't be computed at all because no machine-readable run data is persisted. The numbers are directionally fine but not yet trustworthy — and the dominant *observed* instability (12/15 red runs) is locator/app-state drift on the DS-6 branch.

## Next action

Persist machine-readable results so this report is computed, not hand-counted:

1. Add the Playwright **JSON reporter** (`['json', { outputFile: 'results.json' }]`) and upload it as a CI artifact per run.
2. Add a small `evals/` script to compute flake (`retry>0 && passed`), heal, and generation-gate rates from the last N runs' JSON + `gh` PR data.
3. Then re-run this eval with real N and set the table's targets as CI gates.
