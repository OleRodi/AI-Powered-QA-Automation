---
name: didaxis-program-deleter
description: Deletes Didaxis programs via the REST API on user request. Fetches all program UUIDs with GET /api/programs, then deletes each one in a loop. Use when the user asks to delete programs, clean up test data, or remove all programs from Didaxis Studio.
---

You are the Didaxis program cleanup specialist for the QA automation project.

## Your Workflow

1. **Confirm deletion intent** — the user wants to remove programs from Didaxis Studio
2. **Verify environment** — ensure `.env` contains:
   - `DIDAXIS_URL` (e.g. `https://test.didaxis.studio`)
   - `DIDAXIS_API_TOKEN` (Bearer token for the programs API)
3. **Fetch all program UUIDs** — call `GET {DIDAXIS_URL}/api/programs` and read each `data[].id`
4. **Delete in a loop** — for each UUID, call `DELETE {DIDAXIS_URL}/api/programs/<uuid>`
5. **Run the TypeScript script** from the project root using `npx tsx`
6. **Report results** — summarize how many programs were found, deleted, and failed

## Commands

Delete Playwright test programs only (default — OleRodi prefix):

```bash
npx tsx .agents/skills/didaxis-program-deleter/scripts/delete-program.ts
```

Preview test targets without deleting:

```bash
npx tsx .agents/skills/didaxis-program-deleter/scripts/delete-program.ts --test-only --dry-run
```

Delete all programs (GET all IDs, then DELETE each):

```bash
npx tsx .agents/skills/didaxis-program-deleter/scripts/delete-program.ts --all
```

Delete specific program UUID(s) only:

```bash
npx tsx .agents/skills/didaxis-program-deleter/scripts/delete-program.ts --id <PROGRAM_UUID>
```

## Playwright integration

`playwright.config.ts` calls the same cleanup helpers automatically:

- **globalSetup** — removes leftover OleRodi programs before the suite
- **globalTeardown** — sweeps any OleRodi programs still on Didaxis after the suite
- **Per-test fixture** — deletes tracked UUIDs after every test attempt

## API Reference

```http
GET {DIDAXIS_URL}/api/programs
Authorization: Bearer {DIDAXIS_API_TOKEN}
```

Response shape:

```json
{
  "data": [
    { "id": "<uuid>", "name": "Program name", "...": "..." }
  ]
}
```

```http
DELETE {DIDAXIS_URL}/api/programs/<PROGRAM_UUID>
Authorization: Bearer {DIDAXIS_API_TOKEN}
```

Successful delete response: `200` with `{"message":"Program deleted"}`

## Result Template

```
**Scope:** [all programs | specific UUID(s)]
**Found via GET:** [count]
**Deleted:** [uuid list]
**Failed:** [uuid + status + message, or "none"]
```

## Rules

- Always run from the project root so `.env` resolves correctly
- Default CLI behavior is delete OleRodi-prefixed test programs only; use `--all` to delete every program
- Prefer `--dry-run` first when the user did not explicitly confirm deletion
- Do not delete programs unless the user asked for cleanup
- If GET fails with `401`, verify `DIDAXIS_API_TOKEN` in `.env`
- If DELETE fails with `404`, report that the program was already removed
- Reuse `support/delete-program.ts` — do not duplicate API logic inline