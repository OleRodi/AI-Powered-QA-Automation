## Test Plan: Edit Existing Program Details

### Scope
Covers editing an existing program from the Programs list, including pre-population of current data, successful updates, preservation of unchanged fields, and robustness for invalid/edge inputs. Incorporates gap-analysis coverage for field completeness, timing, multi-field edits, cancel behavior, and conflict handling.

### Test Data Baseline
Use an existing record on `Programs` page:

- Name: `Web Development 2026`
- Description: `Full-stack web development program for 2026 cohort`
- Program Code: `WD-2026`
- Delivery Mode: `Online`
- Max Students: `30`

Secondary program (for duplicate tests): `Data Science 2026`

---

## Positive Flows

### TC-001
- **Title:** Edit form opens with existing program data pre-populated  
- **Preconditions:**  
  - User is logged in with edit permission  
  - Program `Web Development 2026` exists with baseline data  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate row for `Web Development 2026`.  
  3. Click the edit icon for that row.  
- **Expected Result:**  
  - Edit modal/form opens.  
  - Fields are pre-populated exactly with current values (`Name`, `Description`, `Program Code`, `Delivery Mode`, `Max Students`).  
- **Priority:** High

### TC-002
- **Title:** Edit form pre-populates every visible field, not just a known subset  
- **Preconditions:**  
  - User is logged in with edit permission  
  - Program `Web Development 2026` exists with baseline data  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Click the edit icon for `Web Development 2026`.  
  3. Count all visible form fields in the modal.  
  4. Compare each field value to the corresponding value shown in the program list/detail view.  
- **Expected Result:**  
  - Every visible field in the edit form has a value that matches the program's current data.  
  - No field is blank or shows a default/placeholder when the program already has a stored value.  
- **Priority:** High

### TC-003
- **Title:** Edit icon is visible and clickable for each program row  
- **Preconditions:**  
  - User is logged in with edit permission  
  - At least two programs exist in the list  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. For each program row, verify an edit icon is visible.  
  3. Click the edit icon on the second program row.  
- **Expected Result:**  
  - Each row displays an edit icon.  
  - Clicking the icon opens the edit modal for the correct program (not a different one).  
- **Priority:** Medium

### TC-004
- **Title:** Saving a valid updated Name closes modal and refreshes list immediately  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026`  
- **Steps:**  
  1. In `Name`, replace `Web Development 2026` with `Web Development 2026 - Updated`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Modal closes after successful save.  
  - Programs list updates and displays `Web Development 2026 - Updated` without manual page refresh.  
  - No duplicate row is created.  
- **Priority:** High

### TC-005
- **Title:** List update after save occurs within 2 seconds  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Timed`.  
  2. Click `Save` and note the time.  
  3. Observe how long until the updated name appears in the program list.  
- **Expected Result:**  
  - Modal closes and the list reflects the new name within 2 seconds of clicking Save.  
  - No full-page reload is required.  
- **Priority:** Medium

### TC-006
- **Title:** Updating only Description preserves all other field values  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026` with baseline data  
- **Steps:**  
  1. Change `Description` to `Updated description for evening and weekend learners`.  
  2. Leave all other fields unchanged.  
  3. Click `Save`.  
  4. Re-open edit modal for same program.  
- **Expected Result:**  
  - Save succeeds and modal closes.  
  - `Description` shows updated value.  
  - `Name`, `Program Code`, `Delivery Mode`, and `Max Students` remain exactly unchanged.  
- **Priority:** High

### TC-007
- **Title:** Editing multiple fields simultaneously saves all changes correctly  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026` with baseline data  
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Multi`.  
  2. Change `Description` to `Multi-field update test`.  
  3. Change `Delivery Mode` to `Hybrid` (if editable).  
  4. Click `Save`.  
  5. Re-open the edit modal for the same program.  
- **Expected Result:**  
  - All three changed fields reflect their new values.  
  - Fields not changed (`Program Code`, `Max Students`) retain original values.  
  - No partial save (all-or-nothing).  
- **Priority:** High

### TC-008
- **Title:** Description change persists through browser reload  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026` with baseline data  
- **Steps:**  
  1. Change `Description` to `Verified persistence of description field`.  
  2. Click `Save`.  
  3. Refresh the browser.  
  4. Re-open edit modal for the same program.  
- **Expected Result:**  
  - `Description` shows `Verified persistence of description field` after reload.  
  - The value is not reverted or empty.  
- **Priority:** High

### TC-009
- **Title:** All persisted updates remain correct after page reload  
- **Preconditions:**  
  - Program has been successfully renamed to `Web Development 2026 - Updated`  
- **Steps:**  
  1. Refresh browser on `Programs` page.  
  2. Find updated program row.  
  3. Open edit modal for it.  
- **Expected Result:**  
  - List still shows `Web Development 2026 - Updated`.  
  - Edit form pre-populates with latest saved values.  
- **Priority:** Medium

---

## Negative Flows

### TC-010
- **Title:** Save is blocked when Name is empty  
- **Preconditions:**  
  - Editing modal is open for an existing program  
- **Steps:**  
  1. Clear `Name` so field is blank.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save does not complete.  
  - Validation message appears for `Name` (e.g., "Name is required").  
  - Modal remains open and no list update occurs.  
- **Priority:** High

### TC-011
- **Title:** Save is blocked when Name contains only whitespace  
- **Preconditions:**  
  - Editing modal is open for an existing program  
- **Steps:**  
  1. Enter `   ` (spaces only) in `Name`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Input is treated as invalid/empty.  
  - Validation message shown.  
  - Existing program values remain unchanged in list.  
- **Priority:** High

### TC-012
- **Title:** Duplicate program name is rejected  
- **Preconditions:**  
  - Program `Data Science 2026` already exists  
  - Editing modal open for `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Data Science 2026`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save is rejected with duplicate-name error.  
  - Modal stays open (or reopens with error state).  
  - Original `Web Development 2026` record remains unchanged.  
- **Priority:** High

### TC-013
- **Title:** Backend failure does not close modal or corrupt list  
- **Preconditions:**  
  - Editing modal open for existing program  
  - Backend returns error (e.g., API 500)  
- **Steps:**  
  1. Modify `Description`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Error notification displayed.  
  - Modal remains open with user-entered changes preserved for retry.  
  - Programs list does not show partial/optimistic incorrect data.  
- **Priority:** High

### TC-014
- **Title:** Cancel action discards all unsaved changes  
- **Preconditions:**  
  - Editing modal open for `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Draft`.  
  2. Change `Description` to `Should not persist`.  
  3. Click `Cancel` (or close via `X`).  
  4. Re-open edit modal for same program.  
- **Expected Result:**  
  - Unsaved changes are discarded.  
  - `Name` remains `Web Development 2026`.  
  - `Description` remains at its original value.  
- **Priority:** Medium

---

## Edge Cases

### TC-015
- **Title:** Name accepts valid special characters and saves correctly  
- **Preconditions:**  
  - Editing modal open for existing program  
- **Steps:**  
  1. Set `Name` to `Web Development 2026: Front-End & API (Evening)`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds.  
  - List shows exact special-character string (no corruption/escaping artifacts).  
- **Priority:** Medium

### TC-016
- **Title:** Name at maximum allowed length is accepted  
- **Preconditions:**  
  - Editing modal open; known max length for `Name` (e.g., 100 chars)  
- **Steps:**  
  1. Enter a `Name` exactly at max length.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds with exact entered value retained.  
  - No truncation.  
- **Priority:** Medium

### TC-017
- **Title:** Name exceeding maximum length is prevented or rejected  
- **Preconditions:**  
  - Editing modal open; known max length for `Name`  
- **Steps:**  
  1. Paste a `Name` longer than max (e.g., 101+ chars).  
  2. Click `Save`.  
- **Expected Result:**  
  - System blocks extra input or shows validation error on save.  
  - Record is not updated with invalid over-length value.  
- **Priority:** Medium

### TC-018
- **Title:** Empty Description saved if optional, blocked if required  
- **Preconditions:**  
  - Editing modal open for existing program  
- **Steps:**  
  1. Clear `Description`.  
  2. Click `Save`.  
- **Expected Result:**  
  - If optional: save succeeds and description becomes empty.  
  - If required: save blocked with clear validation.  
- **Priority:** Medium

### TC-019
- **Title:** Unchanged Save does not alter any data  
- **Preconditions:**  
  - Editing modal open for existing program  
- **Steps:**  
  1. Make no field changes.  
  2. Click `Save`.  
  3. Reopen program details.  
- **Expected Result:**  
  - No data drift (`Name`, `Description`, other fields unchanged).  
  - No duplicate entries or unintended resets.  
- **Priority:** Low

### TC-020
- **Title:** Concurrent edit conflict is handled safely  
- **Preconditions:**  
  - Session A and Session B both open same program in edit mode  
- **Steps:**  
  1. In Session A, change `Name` to `Concurrent A` and save.  
  2. In Session B (stale modal), change `Description` to `Concurrent B` and save.  
- **Expected Result:**  
  - System handles conflict per design (reject stale update or merge safely).  
  - No silent overwrite of Session A change without warning.  
- **Priority:** Medium

---

## Coverage Matrix (AC → Test Cases)

- **Open program for editing (pre-populated)** → `TC-001`, `TC-002`, `TC-003`
- **Successfully edit a program name (modal closes, list updates)** → `TC-004`, `TC-005`, `TC-009`
- **Edit preserves unchanged fields** → `TC-006`, `TC-007`, `TC-008`

---

## Ambiguities / Gaps in ACs

- Max length and allowed character set for `Name` and `Description` are not specified.
- Uniqueness rule for `Name` is not explicitly stated (case-sensitive vs case-insensitive unknown).
- Required vs optional status for `Description` and other fields is not defined.
- Error handling expectations are missing (validation style, toast vs inline, API failure behavior).
- Concurrency behavior (last-write-wins vs conflict message) is not defined.
- Save behavior when no fields are changed is not defined (allowed, disabled, or no-op).

---

## Gap Traceability

| Gap Requirement | Addressed By |
|---|---|
| 1. Full field pre-population | TC-002 |
| 2. Edit icon availability | TC-003 |
| 3. Timing assertion for "immediately" | TC-005 |
| 4. Multi-field simultaneous edit | TC-007 |
| 5. Explicit Description persistence verification | TC-008 |
| 6. Cancel / dismiss behavior | TC-014 |
| 7. Duplicate name handling | TC-012 |
| 8. Backend failure handling | TC-013 |
| 9. Concurrent edit conflict | TC-020 |
