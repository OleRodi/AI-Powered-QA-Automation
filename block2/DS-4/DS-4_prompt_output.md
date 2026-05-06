## Test Plan: Delete Program with Confirmation

### Scope
This plan verifies the `Delete` action on the Program list, including:
- Confirmation dialog behavior
- Successful deletion
- Cancellation path
- Negative and edge conditions (special names, duplicates, constraints, boundary-like UI/API scenarios)

---

## Positive Flows

### TC-001
- **Title:** Confirmation dialog appears before program deletion  
- **Preconditions:**  
  - Program list contains `Test Program`  
  - User has permission to delete programs
- **Steps:**  
  1. Open the Program list page.  
  2. Locate row with `Program Name = Test Program`.  
  3. Click the `Delete` icon in that row.
- **Expected result:**  
  - A confirmation dialog is displayed.  
  - Dialog clearly references `Test Program`.  
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
- **Expected result:**  
  - Deletion request is sent successfully.  
  - `Test Program` no longer appears in Program list.  
  - Success feedback is shown (toast/banner or refreshed list without item).
- **Priority:** High

### TC-003
- **Title:** Program remains in list when deletion is canceled  
- **Preconditions:**  
  - Program list contains at least one program (e.g., `Test Program`)
- **Steps:**  
  1. Click `Delete` icon for `Test Program`.  
  2. In confirmation dialog, click `Cancel`.
- **Expected result:**  
  - Confirmation dialog closes.  
  - No delete request is executed.  
  - `Test Program` remains visible and unchanged in list.
- **Priority:** High

### TC-004
- **Title:** Confirmation dialog closes without side effects when dismissed via close control  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Dialog supports close action (X or outside click)
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Close dialog using `X` (or click outside, if supported).
- **Expected result:**  
  - Dialog closes.  
  - `Test Program` is not deleted.  
  - No error/success deletion message appears.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Program is not removed before user confirms deletion  
- **Preconditions:**  
  - Program `Test Program` exists
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Observe list while dialog is open, without clicking `Confirm`.
- **Expected result:**  
  - Program remains in list until explicit confirmation.  
  - No optimistic removal happens prior to confirmation.
- **Priority:** High

### TC-006
- **Title:** Deletion failure from backend does not remove program from list  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Backend delete endpoint can return failure (e.g., 500)
- **Steps:**  
  1. Trigger delete confirmation for `Test Program`.  
  2. Click `Confirm` while backend returns error.
- **Expected result:**  
  - User sees clear error message (e.g., “Unable to delete program”).  
  - `Test Program` remains in list.  
  - UI does not show false success state.
- **Priority:** High

### TC-007
- **Title:** Unauthorized user cannot delete program  
- **Preconditions:**  
  - Logged in user lacks delete permission  
  - Program `Test Program` exists
- **Steps:**  
  1. Navigate to Program list.  
  2. Attempt to use delete action on `Test Program`.
- **Expected result:**  
  - Delete icon is hidden/disabled, or deletion call is blocked with authorization error.  
  - Program remains in list.
- **Priority:** High

### TC-008
- **Title:** Repeated confirm clicks do not trigger duplicate delete requests  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Confirmation dialog is open
- **Steps:**  
  1. Click `Confirm` multiple times quickly.  
- **Expected result:**  
  - Only one delete request is processed.  
  - No duplicate errors or inconsistent UI state occur.  
  - Program is deleted once.
- **Priority:** Medium

---

## Edge Cases

### TC-009
- **Title:** Deletion works for program names with special characters  
- **Preconditions:**  
  - Program `Informatique & IA - Niveau 2` exists
- **Steps:**  
  1. Click `Delete` for `Informatique & IA - Niveau 2`.  
  2. Confirm deletion.
- **Expected result:**  
  - Correct program row is deleted.  
  - Special characters render safely in dialog and list updates.
- **Priority:** Medium

### TC-010
- **Title:** Dialog identifies the correct record when similar names exist  
- **Preconditions:**  
  - Programs exist: `Test Program`, `Test Program 2`
- **Steps:**  
  1. Click `Delete` on row `Test Program 2`.  
  2. Confirm deletion.
- **Expected result:**  
  - Only `Test Program 2` is removed.  
  - `Test Program` remains in list.  
  - No row-mismatch deletion occurs.
- **Priority:** High

### TC-011
- **Title:** Deletion behavior is deterministic when duplicate names exist  
- **Preconditions:**  
  - Two records with `Program Name = Test Program` exist (if system allows duplicates)
- **Steps:**  
  1. Click `Delete` on first `Test Program` row.  
  2. Confirm deletion.
- **Expected result:**  
  - The selected row/record is deleted by unique identifier, not by name text alone.  
  - Only one targeted record is removed.
- **Priority:** Medium

### TC-012
- **Title:** Deletion handles long program names without truncation-related mistakes  
- **Preconditions:**  
  - Program exists with very long name (near max allowed length), e.g., `Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A`
- **Steps:**  
  1. Trigger delete for that long-name row.  
  2. Confirm deletion.
- **Expected result:**  
  - Correct record is deleted even if UI truncates display text.  
  - No accidental deletion of neighboring row.
- **Priority:** Medium

### TC-013
- **Title:** Program list reflects deletion correctly after refresh  
- **Preconditions:**  
  - Program `Test Program` exists
- **Steps:**  
  1. Delete `Test Program` and confirm success.  
  2. Refresh browser/page.
- **Expected result:**  
  - `Test Program` remains absent after reload.  
  - State is persisted server-side, not only client-side.
- **Priority:** Medium

### TC-014
- **Title:** Deletion blocked when program is referenced by dependent records  
- **Preconditions:**  
  - Program `Test Program` is linked to active enrollments/courses (if referential rules exist)
- **Steps:**  
  1. Click `Delete` for `Test Program`.  
  2. Confirm deletion.
- **Expected result:**  
  - System blocks delete with meaningful message (e.g., “Program cannot be deleted while linked records exist”).  
  - Program remains in list.
- **Priority:** High

### TC-015
- **Title:** Keyboard interaction supports safe confirmation flow  
- **Preconditions:**  
  - Program `Test Program` exists  
  - Dialog supports keyboard controls
- **Steps:**  
  1. Open delete confirmation for `Test Program`.  
  2. Press `Esc` (or tab to `Cancel` and press `Enter`).  
  3. Reopen dialog and use keyboard to activate `Confirm`.
- **Expected result:**  
  - Cancel path keeps program in list.  
  - Confirm path deletes program.  
  - Focus handling is predictable and does not trigger accidental deletion.
- **Priority:** Low

---

## Coverage Matrix (AC -> Test Cases)

- **Delete program with confirmation** -> `TC-001`, `TC-002`, `TC-005`
- **Cancel program deletion** -> `TC-003`, `TC-004`, `TC-015`

---

## Ambiguities / Gaps in the ACs

- Confirmation dialog content is not specified (exact title/body/button labels).
- AC does not define behavior for dialog dismiss methods other than `Cancel` (e.g., `X`, outside click, `Esc`).
- No stated rule for authorization/roles: who can delete programs.
- No explicit expected behavior for backend failures (network/server/timeout).
- No guidance on dependency constraints (whether linked programs can be deleted).
- No rule for duplicate program names and deletion targeting if duplicates exist.
- No non-functional expectations (response time, loading state, double-click protection).
- No accessibility requirements for the confirmation dialog (keyboard support, focus trap, screen reader text).
