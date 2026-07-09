# Legion AI Automation

Coursework and projects for the **AI-Powered QA Automation** course (Legion).
Playwright test suite for **Didaxis Studio**, with a Cursor agent that turns the
Jira backlog into conforming specs.

## Active project (Block 5 — Didaxis Studio)

| Path | Purpose |
|------|---------|
| `block5/DS-*` | Test plans and gap analyses per story |
| `tests/block5/` | Playwright specs (DS-1 through DS-6) |
| `pages/` | Page Object Models |
| `.cursor/` | Constitution, conventions, skills, and agents |

## Setup

Prerequisites: Node.js 20+.

```bash
npm ci
npx playwright install --with-deps chromium
```

Copy the example env file and fill in real values (`.env` is git-ignored — never
commit secrets):

```bash
cp .env.example .env
# PowerShell: Copy-Item .env.example .env
```

Only the **Run tests** section of `.env` is required to run Playwright. See
[`.env.example`](.env.example) for every variable and a one-line comment each.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DIDAXIS_URL` | yes | Environment under test (`baseURL`) |
| `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` | yes | storageState login (`tests/auth.setup.ts`) |
| `DIDAXIS_API_TOKEN` | yes | REST API for data setup/cleanup |
| `DIDAXIS_ALT_EMAIL` / `DIDAXIS_ALT_PASSWORD` | optional | Second account for permission probes |
| `CURSOR_API_KEY` | agent/CI | Headless Cursor `agent` CLI |
| `ATLASSIAN_API_TOKEN` / `ATLASSIAN_BASE_URL` / `ATLASSIAN_EMAIL` | agent/CI | Jira access for the ticket-driven agent |

## Run tests

```bash
npm test                        # tests/block5 (setup project logs in, saves storageState)
npx playwright test             # whole suite
npx playwright test tests/block5/ds1-create-program.spec.ts   # single spec
npm run test:ui                 # interactive UI mode
```

### Run a tagged slice

Tag individual `test(...)` cases (per the constitution — never tag `describe`),
then filter with `--grep`:

```ts
test('creates a program', { tag: '@smoke' }, async ({ page }) => { /* ... */ });
```

```bash
npx playwright test --grep @smoke     # only @smoke tests
npx playwright test --grep-invert @smoke   # everything except @smoke
```

## Cursor agent & skills setup

The `.cursor/` directory drives AI-assisted test work:

- **Rules** (`.cursor/rules/`): `constitution.mdc` (always-on MUST/SHOULD/WON'T)
  and `playwright-conventions.mdc` (deep guide under `tests/**`).
- **Skills** (`.cursor/skills/`): `pom-conventions`, `api-cleanup`,
  `jira-ticket-analyzer`, `explore-and-generate`, `ci-failure-triage`,
  `self-heal`, `jira-bug-reporter`, `didaxis-program-deleter`.
- **Agents** (`.cursor/agents/`): `test-writer`, `triage`, `bug-reporter`.
- **Hooks** (`.cursor/hooks.json`): `afterFileEdit` guard that blocks
  constitution WON'T violations in `tests/**` and `pages/**`.

For local MCP (Jira/GitHub), set tokens in **Cursor settings**, not in `.env`.
In CI, the headless agent in
[`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml)
reads `CURSOR_API_KEY`, `ATLASSIAN_*`, and the `DIDAXIS_*` values from GitHub
Actions **secrets** — mirror the names from `.env.example`.

## Archive

Early labs (TodoMVC, example spec, Block 2 prompts) are under
[`archive/`](archive/README.md). Not run by default.

```bash
npm run test:archive
```

## Tech stack

- **AI assistants:** Cursor, Codex, GitHub Copilot
- **Version control:** GitHub
- **Runtime:** Node.js, Playwright, TypeScript
