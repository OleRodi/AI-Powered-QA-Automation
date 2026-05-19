## Test Plan: Edit Existing Program Details

### Scope
Covers editing an existing program from the Programs list, validating successful updates, preservation of unchanged fields, and robustness for invalid/edge inputs.

### Test Data Baseline
Use an existing record on `Programs` page:

- Name: `Web Development 2026`
- Description: `Full-stack web development program for 2026 cohort`
- Program Code: `WD-2026`
- Delivery Mode: `Online`
- Max Students: `30`

---

## Positive Flows

### TC-001
- **Title:** Edit form opens with existing program data pre-populated  
- **Preconditions:**  
  - User is logged in with edit permission  
  - Program `Web Development 2026` exists in list with baseline data  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate row for `Web Development 2026`.  
  3. Click the edit icon for that row.  
- **Expected Result:**  
  - Edit modal/form opens.  
  - Fields are pre-populated exactly with current values (`Name`, `Description`, `Program Code`, `Delivery Mode`, `Max Students`).  
- **Priority:** High

### TC-001b
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

### TC-001c
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

### TC-002
- **Title:** Saving a valid updated Name closes modal and refreshes list immediately  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026`  
- **Steps:**  
  1. In `Name`, replace `Web Development 2026` with `Web Development 2026 - Updated`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Modal closes after successful save.  
  - Programs list updates immediately and displays `Web Development 2026 - Updated` without manual page refresh.  
  - No duplicate row is created.  
- **Priority:** High

### TC-002b
- **Title:** List update after save occurs within an acceptable time threshold  
- **Preconditions:**  
  - Editing modal is open for `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Timed`.  
  2. Click `Save` and start a timer.  
  3. Observe how long until the updated name appears in the program list.  
- **Expected Result:**  
  - Modal closes and the list reflects the new name within 2 seconds of clicking Save.  
  - No full-page reload is required.  
- **Priority:** Medium

### TC-003
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

### TC-003b
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

### TC-003c
- **Title:** Editing only Description verifies the new Description value is actually persisted  
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

### TC-004
- **Title:** Persisted updates remain correct after page reload  
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

### TC-005
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

### TC-006
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

### TC-007
- **Title:** Duplicate program Name is rejected and existing entry is not overwritten  
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

### TC-008
- **Title:** Failed save does not close modal or partially update list  
- **Preconditions:**  
  - Editing modal open for existing program  
  - Force backend failure condition (e.g., API returns 500)  
- **Steps:**  
  1. Modify `Description`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Error notification displayed.  
  - Modal remains open with user-entered changes preserved for retry.  
  - Programs list does not show partial/optimistic incorrect data.  
- **Priority:** High

### TC-009
- **Title:** Cancel action does not persist unsaved edits  
- **Preconditions:**  
  - Editing modal open for `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Draft`.  
  2. Click `Cancel` or close (`X`) without saving.  
  3. Re-open edit modal for same program.  
- **Expected Result:**  
  - Unsaved changes are discarded.  
  - Name remains `Web Development 2026` (or last saved value).  
- **Priority:** Medium

---

## Edge Cases

### TC-010
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

### TC-011
- **Title:** Name at maximum allowed length is accepted  
- **Preconditions:**  
  - Editing modal open; known max length for `Name` (example: 100 chars)  
- **Steps:**  
  1. Enter a `Name` exactly at max length (e.g., 100 characters).  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds with exact entered value retained.  
  - No truncation beyond specified rule.  
- **Priority:** Medium

### TC-012
- **Title:** Name exceeding maximum length is prevented or rejected clearly  
- **Preconditions:**  
  - Editing modal open; known max length for `Name`  
- **Steps:**  
  1. Paste a `Name` longer than max (e.g., 101+ chars).  
  2. Click `Save`.  
- **Expected Result:**  
  - System blocks extra input or shows validation error on save.  
  - Record is not updated with invalid over-length value.  
- **Priority:** Medium

### TC-013
- **Title:** Description supports empty value only if optional (rule enforced consistently)  
- **Preconditions:**  
  - Editing modal open for existing program  
- **Steps:**  
  1. Clear `Description`.  
  2. Click `Save`.  
- **Expected Result:**  
  - If optional: save succeeds and description becomes empty.  
  - If required: save blocked with clear validation.  
  - No silent failure.  
- **Priority:** Medium

### TC-014
- **Title:** Unchanged Save does not unintentionally alter audit-relevant fields  
- **Preconditions:**  
  - Editing modal open for existing program  
- **Steps:**  
  1. Make no field changes.  
  2. Click `Save`.  
  3. Reopen program details.  
- **Expected Result:**  
  - No user-visible data drift (`Name`, `Description`, other fields unchanged).  
  - No duplicate entries or unintended resets.  
- **Priority:** Low

### TC-015
- **Title:** Concurrent edit conflict is handled safely  
- **Preconditions:**  
  - Session A and Session B both open same program in edit mode  
- **Steps:**  
  1. In Session A, change `Name` and save.  
  2. In Session B (stale modal), change `Description` and save.  
- **Expected Result:**  
  - System handles conflict per design (reject stale update or merge safely).  
  - No silent overwrite of Session A change without warning.  
- **Priority:** Medium

---

## Ambiguities / Gaps in ACs

- Max length and allowed character set for `Name` and `Description` are not specified.
- Uniqueness rule for `Name` is not explicitly stated (case-sensitive vs case-insensitive unknown).
- Required vs optional status for `Description` and "other fields" is not defined.
- Error handling expectations are missing (validation style, toast vs inline, API failure behavior).
- Concurrency behavior (last-write-wins vs conflict message) is not defined.
- Save behavior when no fields are changed is not defined (allowed, disabled, or no-op).

### Gaps addressed by added test cases

| Gap | Addressed By |
|---|---|
| Pre-population only checked a hardcoded field subset | TC-001b — verifies every visible field dynamically |
| Edit icon presence/correctness not tested | TC-001c — checks icon per row and correct program association |
| "Immediately" had no timing assertion | TC-002b — asserts list update within 2 seconds |
| Multi-field edits never tested | TC-003b — changes 3 fields at once, verifies all-or-nothing save |
| Description save not explicitly verified after persist | TC-003c — changes Description, reloads page, re-checks value |
