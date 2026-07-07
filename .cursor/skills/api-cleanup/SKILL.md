---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create programs (or any persistent records) in Didaxis, so test data does not accumulate. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
---

# API Cleanup for Test Data

Tests that create data must remove it. Leftover data slows the app and
makes test runs unreliable. Every test that creates a program must track
its UUID and delete it via the API afterwards.

## Steps

1. Use the shared cleanup fixture in `fixtures/cleanup.fixture.ts`.
   Import `test` from there, not from `@playwright/test`.

2. When a test creates a program, capture the program's UUID and call
   `trackProgram(uuid)` immediately.

3. Do not write manual `afterAll` blocks for cleanup — the fixture
   handles teardown for every test that uses it. Cleanup runs after
   **every** attempt (passed, failed, timedOut, and retries).

4. `playwright.config.ts` runs `globalSetup` / `globalTeardown` to
   delete leftover `OleRodi`-prefixed programs via the same API as the
   didaxis-program-deleter skill (`support/test-program-cleanup.ts`).

5. Cleanup uses the DELETE API, not the UI:
   `DELETE /api/programs/<uuid>` with a Bearer token from
   `process.env.DIDAXIS_API_TOKEN`.

6. Never hardcode the token. Never delete non-test programs (only
   names starting with `OleRodi `).

## Reference

- Endpoint: DELETE https://didaxis.studio/api/programs/<uuid>
- Auth: Authorization: Bearer ${DIDAXIS_API_TOKEN}