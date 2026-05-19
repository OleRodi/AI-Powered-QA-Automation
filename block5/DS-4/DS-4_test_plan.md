## Test Plan: Delete Program with Confirmation

### Scope
Verifies the delete action on the Programs list, including confirmation dialog behavior, successful deletion, cancellation paths, and robustness for edge conditions. Incorporates gap-analysis coverage for icon visibility, empty-state transitions, sequential deletions, dialog identity, pagination, undo/recovery, persistence, double-click protection, and dependent records.

### Test Data Baseline
- Primary program: `Test Program` / `A program used for deletion testing`
- Secondary programs: `Data Science 2026`, `Cloud Engineering 2026`
- Special-character program: `Informatique & IA - Niveau 2`

---

## Positive Flows

### TC-001
- **Title:** Confirmation dialog appears before program deletion  
- **Preconditions:**  
  - Program list contains `Test Program`  
  - User has permission to delete programs  
- **Steps:**  
  1. Open the `Programs` page.  
  2. Locate row with `Program Name = Test Program`.  
  3. Click the `Delete` icon in that row.  
- **Expected Result:**  
  - A confirmation dialog is displayed.  
  - Dialog clearly references `Test Program` by name.  
  - Dialog contains `Confirm` and `Cancel` actions.  
  - Program is not deleted yet.  
- **Priority:** High

### TC-002
- **Title:** Program is removed from list after deletion is confirmed  
- **Preconditions:**  
  - Program list contains `Test Program`  
  - Confirmation dialog can be opened for that record  
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. In confirmation dialog, click `Confirm`.  
- **Expected Result:**  
  - `Test Program` no longer appears in Program list.  
  - Success feedback is shown (toast/banner or list refreshes without the item).  
- **Priority:** High

### TC-003
- **Title:** Program remains in list when deletion is canceled  
- **Preconditions:**  
  - Program list contains `Test Program`  
- **Steps:**  
  1. Click `Delete` icon for `Test Program`.  
  2. In confirmation dialog, click `Cancel`.  
- **Expected Result:**  
  - Confirmation dialog closes.  
  - No delete request is executed.  
  - `Test Program` remains visible and unchanged in list.  
- **Priority:** High

### TC-004
- **Title:** Dialog closes without side effects when dismissed via X or outside click  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Dialog supports close control (X or outside click)  
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Close dialog using `X` (or click outside, if supported).  
- **Expected Result:**  
  - Dialog closes.  
  - `Test Program` is not deleted.  
  - No error/success message appears.  
- **Priority:** Medium

### TC-005
- **Title:** Delete icon is visible and functional for each program row  
- **Preconditions:**  
  - At least two programs exist: `Test Program`, `Data Science 2026`  
  - User has delete permission  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Verify a delete icon is visible for each program row.  
  3. Click the delete icon for `Data Science 2026`.  
- **Expected Result:**  
  - Each row displays a delete icon.  
  - Clicking the icon on `Data Science 2026` opens the dialog referencing `Data Science 2026` (not `Test Program`).  
- **Priority:** High

### TC-006
- **Title:** Confirmation dialog shows the correct program name  
- **Preconditions:**  
  - Programs exist: `Test Program`, `Cloud Engineering 2026`  
- **Steps:**  
  1. Click `Delete` for `Cloud Engineering 2026`.  
  2. Read the dialog text.  
- **Expected Result:**  
  - Dialog explicitly references `Cloud Engineering 2026` in its message.  
  - Not a generic "Are you sure?" without identifying the program.  
- **Priority:** High

---

## Negative Flows

### TC-007
- **Title:** Program is not removed before user confirms  
- **Preconditions:**  
  - Program `Test Program` exists  
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Observe list while dialog is open, without clicking `Confirm`.  
- **Expected Result:**  
  - Program remains in list until explicit confirmation.  
  - No optimistic removal occurs prior to confirmation.  
- **Priority:** High

### TC-008
- **Title:** Backend failure does not remove program from list  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Backend delete endpoint returns failure (e.g., 500)  
- **Steps:**  
  1. Trigger delete confirmation for `Test Program`.  
  2. Click `Confirm` while backend returns error.  
- **Expected Result:**  
  - User sees clear error message (e.g., "Unable to delete program").  
  - `Test Program` remains in list.  
  - UI does not show false success state.  
- **Priority:** High

### TC-009
- **Title:** Unauthorized user cannot delete a program  
- **Preconditions:**  
  - Logged in user lacks delete permission  
  - Program `Test Program` exists  
- **Steps:**  
  1. Navigate to Program list.  
  2. Attempt to use delete action on `Test Program`.  
- **Expected Result:**  
  - Delete icon is hidden/disabled, or deletion call is blocked with authorization error.  
  - Program remains in list.  
- **Priority:** High

### TC-010
- **Title:** Rapid double-click on Confirm sends only one delete request  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Confirmation dialog is open  
- **Steps:**  
  1. Click `Confirm` multiple times quickly.  
- **Expected Result:**  
  - Only one delete request is processed.  
  - No duplicate errors or inconsistent UI state.  
  - Program is deleted once.  
- **Priority:** Medium

### TC-011
- **Title:** Deletion is blocked for program with dependent records  
- **Preconditions:**  
  - Program `Test Program` is linked to active courses/enrollments (if referential rules exist)  
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Click `Confirm`.  
- **Expected Result:**  
  - System blocks deletion with meaningful message (e.g., "Program cannot be deleted while linked records exist").  
  - Program remains in list.  
- **Priority:** High

---

## Edge Cases

### TC-012
- **Title:** Deleting the last remaining program triggers the empty state  
- **Preconditions:**  
  - Only one program exists: `Test Program`  
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Click `Confirm`.  
- **Expected Result:**  
  - `Test Program` is removed.  
  - Programs page transitions to the empty-state message with a prompt to create the first program.  
  - No broken or blank state.  
- **Priority:** High

### TC-013
- **Title:** Multiple sequential deletions are reflected immediately  
- **Preconditions:**  
  - Programs exist: `Test Program`, `Data Science 2026`, `Cloud Engineering 2026`  
- **Steps:**  
  1. Delete `Test Program` and confirm.  
  2. Without page refresh, delete `Data Science 2026` and confirm.  
- **Expected Result:**  
  - After each deletion, the list updates immediately.  
  - No stale rows or phantom entries remain.  
  - `Cloud Engineering 2026` is the only remaining program.  
- **Priority:** Medium

### TC-014
- **Title:** List count and pagination adjust after deletion  
- **Preconditions:**  
  - Enough programs exist to trigger pagination (e.g., 11 programs, 10 per page)  
- **Steps:**  
  1. Navigate to page 2 of the program list.  
  2. Delete the only program on page 2.  
- **Expected Result:**  
  - Total count decrements.  
  - User is redirected to page 1 (no empty page 2 left behind).  
  - All remaining programs are still accessible.  
- **Priority:** Medium

### TC-015
- **Title:** Deletion persists after page reload  
- **Preconditions:**  
  - Program `Test Program` exists  
- **Steps:**  
  1. Delete `Test Program` and confirm success.  
  2. Refresh the browser.  
- **Expected Result:**  
  - `Test Program` does not reappear after reload.  
  - Deletion is persisted server-side.  
- **Priority:** Medium

### TC-016
- **Title:** Undo/recovery availability documented  
- **Preconditions:**  
  - Program `Test Program` has been deleted  
- **Steps:**  
  1. After deletion confirmation, observe the UI for an undo option (e.g., undo toast).  
  2. If undo exists, click it and verify recovery.  
  3. If no undo exists, confirm program is permanently removed.  
- **Expected Result:**  
  - If undo: program is restored to the list.  
  - If no undo: behavior is documented as a known limitation; deletion is permanent.  
- **Priority:** Low

### TC-017
- **Title:** Special-character program names are handled correctly in dialog and deletion  
- **Preconditions:**  
  - Program `Informatique & IA - Niveau 2` exists  
- **Steps:**  
  1. Click `Delete` for `Informatique & IA - Niveau 2`.  
  2. Verify dialog displays the name correctly.  
  3. Confirm deletion.  
- **Expected Result:**  
  - Dialog renders special characters without corruption.  
  - Correct program is deleted.  
  - List updates without encoding artifacts.  
- **Priority:** Medium

### TC-018
- **Title:** Correct record is deleted when similar names exist  
- **Preconditions:**  
  - Programs exist: `Test Program`, `Test Program 2`  
- **Steps:**  
  1. Click `Delete` on `Test Program 2`.  
  2. Confirm deletion.  
- **Expected Result:**  
  - Only `Test Program 2` is removed.  
  - `Test Program` remains in list.  
  - Deletion targets by unique identifier, not name text.  
- **Priority:** High

### TC-019
- **Title:** Keyboard interaction supports safe confirmation flow  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Dialog supports keyboard controls  
- **Steps:**  
  1. Open delete confirmation for `Test Program`.  
  2. Press `Esc`.  
  3. Reopen dialog and use keyboard to activate `Confirm`.  
- **Expected Result:**  
  - `Esc` cancels and keeps program in list.  
  - Keyboard confirm deletes program.  
  - Focus handling does not trigger accidental deletion.  
- **Priority:** Low

---

## Coverage Matrix (AC → Test Cases)

- **Delete program with confirmation** → `TC-001`, `TC-002`, `TC-005`, `TC-006`, `TC-007`
- **Cancel program deletion** → `TC-003`, `TC-004`, `TC-019`

---

## Ambiguities / Gaps in ACs

- Confirmation dialog content is not specified (exact title/body/button labels).
- AC does not define behavior for dialog dismiss methods other than Cancel (e.g., X, outside click, Esc).
- No stated rule for authorization/roles: who can delete programs.
- No explicit expected behavior for backend failures (network/server/timeout).
- No guidance on dependency constraints (whether linked programs can be deleted).
- No rule for duplicate program names and deletion targeting if duplicates exist.
- No non-functional expectations (response time, loading state, double-click protection).
- No accessibility requirements for the confirmation dialog (keyboard support, focus trap, screen reader text).

---

## Gap Traceability

| Gap Requirement | Addressed By |
|---|---|
| 1. Delete icon visibility per row | TC-005 |
| 2. Deleting last program triggers empty state | TC-012 |
| 3. Multiple sequential deletions | TC-013 |
| 4. Confirmation dialog shows correct program identity | TC-006 |
| 5. List count and pagination adjustment | TC-014 |
| 6. Undo or recovery availability | TC-016 |
| 7. Deletion persistence after page reload | TC-015 |
| 8. Double-click protection on Confirm | TC-010 |
| 9. Deletion of program with dependent records | TC-011 |
