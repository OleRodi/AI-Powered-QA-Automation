# Legion AI Automation

Coursework and projects for the **AI-Powered QA Automation** course (Legion).

## Active project (Block 5 — Didaxis Studio)

| Path | Purpose |
|------|---------|
| `block5/DS-*` | Test plans and gap analyses per story |
| `tests/block5/` | Playwright specs (DS-2 through DS-5) |

### Run tests

Requires `.env` with `DIDAXIS_URL`, `DIDAXIS_EMAIL`, and `DIDAXIS_PASSWORD`.

```bash
npm test
# or
npx playwright test tests/block5
```

```bash
npm run test:ui
```

### Archive

Early labs (TodoMVC, example spec, Block 2 prompts) are under [`archive/`](archive/README.md). Not run by default.

```bash
npm run test:archive
```

## Tech stack

- **AI assistants:** Cursor, Codex, GitHub Copilot
- **Version control:** GitHub
- **Runtime:** Node.js, Playwright, TypeScript
