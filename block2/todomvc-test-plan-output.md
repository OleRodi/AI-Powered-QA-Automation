# Test Plan — TodoMVC (React)

**Application Under Test:** https://demo.playwright.dev/todomvc/#/
**Framework Reference:** React • TodoMVC (Playwright demo)
**Author:** Senior QA Engineer
**Scope:** Functional behavior of the TodoMVC list (create, add, complete, remove) plus edge and negative coverage.

---

## 1. Feature Overview

TodoMVC is a single-page todo list application. Users can:

- Type into the **"What needs to be done?"** input and press **Enter** to add a new todo.
- View todos in a list under the input.
- Mark a todo complete via its **toggle checkbox** (item shows a strikethrough).
- Delete a todo via the **destroy** button (the **×** icon that appears on row hover).
- See remaining count in the footer (**"N items left"**).
- Filter via **All / Active / Completed** links.
- Click **Clear completed** in the footer to remove all completed items.
- Toggle all items at once via the **"Mark all as complete"** chevron next to the input.
- Persist todos in `localStorage` across reloads.

---

## 2. AC → Test Case Coverage Matrix

| Acceptance Criterion | Covered by |
| --- | --- |
| AC1 — Create a todo list | TC-001, TC-002 |
| AC2 — Add 4 items | TC-003 |
| AC3 — Finish an item, expect it to be marked finished | TC-004, TC-005 |
| AC4 — Remove an item, expect it to be removed | TC-006, TC-007 |

---

## 3. Positive Flows

### TC-001 — Empty list is shown on a fresh visit

- **Preconditions:** `localStorage` is cleared for `demo.playwright.dev`.
- **Steps:**
  1. Navigate to `https://demo.playwright.dev/todomvc/#/`.
  2. Observe the page.
- **Expected result:**
  - Header **"todos"** is visible.
  - Input **"What needs to be done?"** is visible, focused, and empty.
  - No todo rows are rendered.
  - Footer with item counter and filters is **not** visible.
- **Priority:** High

### TC-002 — A new todo is created when Enter is pressed

- **Preconditions:** Empty list.
- **Steps:**
  1. Click the **"What needs to be done?"** input.
  2. Type `Buy milk`.
  3. Press **Enter**.
- **Expected result:**
  - One todo row is rendered with the label **"Buy milk"**.
  - Input is cleared and remains focused.
  - Footer appears with **"1 item left"** and filters **All / Active / Completed**.
- **Priority:** High

### TC-003 — Four todos can be added sequentially (AC2)

- **Preconditions:** Empty list.
- **Steps:**
  1. Add `Buy milk` and press Enter.
  2. Add `Walk the dog` and press Enter.
  3. Add `Write tests` and press Enter.
  4. Add `Submit PR` and press Enter.
- **Expected result:**
  - Four rows are rendered in insertion order: `Buy milk`, `Walk the dog`, `Write tests`, `Submit PR`.
  - Footer shows **"4 items left"**.
  - Input is empty after each Enter.
- **Priority:** High

### TC-004 — A single todo can be marked finished (AC3)

- **Preconditions:** List contains the four todos from TC-003.
- **Steps:**
  1. Click the round toggle checkbox to the left of `Walk the dog`.
- **Expected result:**
  - `Walk the dog` row gets the **completed** style (strikethrough, dimmed text).
  - The toggle checkbox is checked.
  - Footer shows **"3 items left"**.
  - Footer **"Clear completed"** button becomes visible.
- **Priority:** High

### TC-005 — A finished todo can be unmarked

- **Preconditions:** `Walk the dog` is marked completed (after TC-004).
- **Steps:**
  1. Click the toggle checkbox on `Walk the dog` again.
- **Expected result:**
  - Strikethrough/dim styling is removed.
  - Checkbox is unchecked.
  - Footer shows **"4 items left"**.
  - **"Clear completed"** button is hidden (no completed items remain).
- **Priority:** Medium

### TC-006 — A todo can be deleted via the destroy button (AC4)

- **Preconditions:** List contains the four todos from TC-003.
- **Steps:**
  1. Hover over the `Submit PR` row.
  2. Click the **×** destroy button that appears on the right.
- **Expected result:**
  - `Submit PR` row is removed from the list.
  - Remaining rows: `Buy milk`, `Walk the dog`, `Write tests`.
  - Footer shows **"3 items left"**.
- **Priority:** High

### TC-007 — Clear completed removes all completed items

- **Preconditions:** List contains four todos; `Buy milk` and `Write tests` are marked completed.
- **Steps:**
  1. Click **"Clear completed"** in the footer.
- **Expected result:**
  - Completed rows (`Buy milk`, `Write tests`) are removed.
  - Remaining rows: `Walk the dog`, `Submit PR`.
  - Footer shows **"2 items left"**.
  - **"Clear completed"** button is hidden.
- **Priority:** Medium

### TC-008 — Filter Active hides completed items

- **Preconditions:** List has at least one active and one completed item.
- **Steps:**
  1. Click footer link **"Active"**.
- **Expected result:**
  - Only active todos are visible.
  - URL hash is `#/active`.
  - **"Active"** link is highlighted as the selected filter.
- **Priority:** Medium

### TC-009 — Filter Completed shows only completed items

- **Preconditions:** Same as TC-008.
- **Steps:**
  1. Click footer link **"Completed"**.
- **Expected result:**
  - Only completed todos are visible.
  - URL hash is `#/completed`.
  - **"Completed"** link is highlighted.
- **Priority:** Medium

### TC-010 — Toggle-all marks every todo completed

- **Preconditions:** List contains the four todos from TC-003 (all active).
- **Steps:**
  1. Click the **chevron** ("Mark all as complete") to the left of the input.
- **Expected result:**
  - All four rows show completed styling.
  - Footer shows **"0 items left"**.
  - **"Clear completed"** is visible.
- **Priority:** Medium

### TC-011 — A todo can be edited via double-click

- **Preconditions:** List contains `Buy milk`.
- **Steps:**
  1. Double-click the `Buy milk` label.
  2. Replace text with `Buy oat milk`.
  3. Press **Enter**.
- **Expected result:**
  - Row exits edit mode and now reads `Buy oat milk`.
  - Footer counter unchanged.
- **Priority:** Medium

### TC-012 — Todos persist across reload

- **Preconditions:** List contains `Buy milk` (active) and `Walk the dog` (completed).
- **Steps:**
  1. Reload the page.
- **Expected result:**
  - Both todos are still present with the same completion state.
  - Footer shows **"1 item left"**.
- **Priority:** Medium

---

## 4. Negative Flows

### TC-101 — Empty input does not create a todo

- **Preconditions:** Empty list.
- **Steps:**
  1. Click the input.
  2. Press **Enter** without typing.
- **Expected result:**
  - No row is created.
  - Footer remains hidden.
- **Priority:** High

### TC-102 — Whitespace-only input does not create a todo

- **Preconditions:** Empty list.
- **Steps:**
  1. Type `"   "` (three spaces) in the input.
  2. Press **Enter**.
- **Expected result:**
  - No row is created (input is treated as empty after trim).
  - Footer remains hidden.
- **Priority:** High
- **Note (observed in implementation):** the React TodoMVC at the AUT URL keeps the whitespace value in the input instead of clearing it. Whether the input should be cleared is a product decision — see §6.

### TC-103 — Escape during edit cancels changes

- **Preconditions:** List contains `Buy milk`.
- **Steps:**
  1. Double-click `Buy milk`.
  2. Type `XYZ`.
  3. Press **Escape**.
- **Expected result:**
  - Edit is canceled.
  - Row label remains `Buy milk` (unchanged).
- **Priority:** Medium

### TC-104 — Editing a todo to an empty value deletes it

- **Preconditions:** List contains `Buy milk` and `Walk the dog`.
- **Steps:**
  1. Double-click `Buy milk`.
  2. Clear the field.
  3. Press **Enter**.
- **Expected result:**
  - `Buy milk` row is removed.
  - `Walk the dog` remains.
  - Footer shows **"1 item left"**.
- **Priority:** Medium

### TC-105 — Deleting a non-existent item does nothing harmful

- **Preconditions:** List contains `Buy milk`. Tester deletes it.
- **Steps:**
  1. Click **×** on `Buy milk` (already removed in a previous step in the same flow).
- **Expected result:**
  - No JavaScript error in the console.
  - Empty-state UI is shown.
- **Priority:** Low

### TC-106 — Clear completed has no effect when nothing is completed

- **Preconditions:** All todos are active.
- **Steps:**
  1. Inspect the footer.
- **Expected result:**
  - **"Clear completed"** button is **not** rendered.
  - No way to trigger the action.
- **Priority:** Low

### TC-107 — Filter URL hash with garbage value falls back to All

- **Preconditions:** Empty list, then add `Buy milk`.
- **Steps:**
  1. Manually navigate to `https://demo.playwright.dev/todomvc/#/foo`.
- **Expected result:**
  - The list shows all todos (default **All** behavior).
  - No console error that breaks rendering.
- **Priority:** Low

---

## 5. Edge Cases

### TC-201 — Leading/trailing whitespace is trimmed

- **Preconditions:** Empty list.
- **Steps:**
  1. Type `"   Buy milk   "`.
  2. Press **Enter**.
- **Expected result:**
  - Row is created with label exactly `Buy milk` (trimmed).
- **Priority:** Medium

### TC-202 — Duplicate titles are allowed

- **Preconditions:** Empty list.
- **Steps:**
  1. Add `Buy milk` twice.
- **Expected result:**
  - Two separate rows both labeled `Buy milk`.
  - Footer shows **"2 items left"**.
- **Priority:** Medium

### TC-203 — Very long title (1000 characters) is accepted

- **Preconditions:** Empty list.
- **Steps:**
  1. Add a todo whose label is the letter `a` repeated 1000 times.
- **Expected result:**
  - Row is created and renders without breaking layout (text wraps within row width).
  - Footer shows **"1 item left"**.
- **Priority:** Low

### TC-204 — Special characters and emoji are preserved

- **Preconditions:** Empty list.
- **Steps:**
  1. Add `<script>alert(1)</script> & "quotes" 🚀 — em‑dash`.
- **Expected result:**
  - Row label renders the text **literally** (no script execution, no HTML interpretation).
  - Emoji and em‑dash render correctly.
- **Priority:** High (security-relevant)

### TC-205 — Unicode (RTL + CJK) renders correctly

- **Preconditions:** Empty list.
- **Steps:**
  1. Add `שלום עולם` (Hebrew).
  2. Add `买牛奶` (Chinese).
- **Expected result:**
  - Both rows render with correct directionality and glyphs.
- **Priority:** Low

### TC-206 — Counter pluralization is correct

- **Preconditions:** Empty list.
- **Steps:**
  1. Add one todo. Read footer.
  2. Add a second todo. Read footer.
  3. Mark both completed. Read footer.
- **Expected result:**
  - After step 1: **"1 item left"** (singular).
  - After step 2: **"2 items left"** (plural).
  - After step 3: **"0 items left"** (plural).
- **Priority:** Low

### TC-207 — Toggle-all when list is mixed marks every item complete in one click

- **Preconditions:** List has 2 active and 2 completed todos.
- **Steps:**
  1. Click the **chevron** above the list.
- **Expected result:**
  - All 4 are completed.
  - Counter shows **"0 items left"**.
- **Priority:** Medium

### TC-208 — Toggle-all again unmarks every item

- **Preconditions:** All 4 todos are completed (after TC-207).
- **Steps:**
  1. Click the **chevron** again.
- **Expected result:**
  - All 4 become active.
  - Counter shows **"4 items left"**.
- **Priority:** Medium

### TC-209 — Adding a todo while an Active filter is selected updates filtered view

- **Preconditions:** Filter set to **Active**, list has 1 completed item.
- **Steps:**
  1. Add `Buy milk`.
- **Expected result:**
  - `Buy milk` appears immediately in the Active view.
  - Total count footer shows **"1 item left"**.
- **Priority:** Medium

### TC-210 — Order is preserved after deleting a middle item

- **Preconditions:** List has `A`, `B`, `C`, `D` in that order.
- **Steps:**
  1. Delete `B`.
- **Expected result:**
  - Remaining order is `A`, `C`, `D`.
- **Priority:** Medium

### TC-211 — Persisted state survives a hard reload but not a different origin

- **Preconditions:** List has `Buy milk`.
- **Steps:**
  1. Hard-reload (Ctrl+Shift+R).
  2. Open the same URL in a private window.
- **Expected result:**
  - Hard reload preserves `Buy milk` (localStorage).
  - Private window shows an empty list (separate storage).
- **Priority:** Low

### TC-212 — Editing preserves completion state

- **Preconditions:** `Buy milk` is completed.
- **Steps:**
  1. Double-click and rename to `Buy oat milk`.
  2. Press **Enter**.
- **Expected result:**
  - Row label is `Buy oat milk`.
  - Row remains in the **completed** state (still strikethrough, checkbox checked).
- **Priority:** Medium

---

## 6. Ambiguities & Gaps in the Acceptance Criteria

The provided ACs are minimal. The following points are not specified and were filled in using TodoMVC reference behavior — they should be confirmed with the product owner:

1. **AC1 ("Create a todo list")** — There is no explicit "create list" action in TodoMVC; a list exists implicitly when the first item is added. AC1 was interpreted as **"a fresh empty list is rendered on first visit"**.
2. **AC2 ("Add items (4)")** — Maximum number of items, allowed length per item, and trimming/whitespace rules are unspecified. Assumed: no hard cap, whitespace-only is rejected, leading/trailing whitespace is trimmed.
3. **AC3 ("Finish item")** — Mechanism (checkbox vs. button) and visual indication of "finished" are unspecified. Assumed: toggle checkbox + strikethrough styling.
4. **AC4 ("Remove item")** — Removal mechanism (per-item × button vs. swipe vs. context menu) is unspecified. Assumed: hover-revealed × destroy button.
5. **Editing** — Not in ACs. Included because it is core TodoMVC behavior; confirm whether it is in scope.
6. **Filters (All / Active / Completed)** — Not in ACs. Same note as editing.
7. **"Clear completed"** — Not in ACs. Same note as editing.
8. **Toggle-all** — Not in ACs. Same note as editing.
9. **Persistence** — Not in ACs. Confirm whether reload-persistence is required.
10. **Duplicates** — ACs do not say whether duplicate titles are allowed. Assumed allowed.
11. **Accessibility** — Keyboard nav, focus order, ARIA labels, and screen-reader behavior are not in ACs. Recommend a separate a11y pass.
12. **Performance** — No SLA for list rendering with large numbers of items. Recommend a load test if relevant.
13. **Whitespace-only submission UX** — The current implementation preserves the typed whitespace in the input after Enter (see TC-102). Confirm with the PO whether the input should also be cleared.

---

## 7. Revalidation Against the ACs

| AC | Verified by |
| --- | --- |
| AC1 — Create a todo list | TC-001 (empty list), TC-002 (first item creates the list/footer) |
| AC2 — Add items (4) | TC-003 (four sequential adds, footer = "4 items left") |
| AC3 — Finish item; expect to be finished | TC-004 (mark complete), TC-005 (unmark), supported by TC-010 (toggle-all) |
| AC4 — Remove item; expect to be removed | TC-006 (×-button delete), TC-007 (Clear completed) |

All four ACs have at least one positive test case. Negative and edge-case coverage extend AC2 (whitespace, length, special chars), AC3 (state preserved on edit, toggle-all), and AC4 (delete via empty edit, double-delete safety).
