## Test Plan: Program List Filtering and Display

### Scope
Validates the Programs page list rendering and discoverability for admin users, covering display of program details, empty-state behavior, and list robustness. Incorporates gap-analysis coverage for action icons, sort order, loading states, performance, count indicators, data freshness, row navigation, CTA functionality, empty-state transitions, and error-state distinction.

### Test Data Baseline
- Program A: `Web Development 2026` / `Full-stack web technologies and project-based learning`
- Program B: `Data Science Foundations` / `Statistics, Python, and machine learning basics`
- Special-character program: `Informatique & IA - Niveau 2` / `Parcours avancé: IA, NLP, et MLOps`

---

## Positive Flows

### TC-001
- **Title:** Programs page displays all existing programs with name and description  
- **Preconditions:**  
  - Admin user is authenticated  
  - Programs A and B exist  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Observe the program list.  
- **Expected Result:**  
  - List is visible and populated.  
  - Each program entry shows `Program Name` and `Program Description`.  
  - Both sample programs appear.  
- **Priority:** High

### TC-002
- **Title:** Each program row displays management action icons  
- **Preconditions:**  
  - Admin user is authenticated  
  - At least two programs exist  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Inspect each program row for action icons.  
- **Expected Result:**  
  - Each row displays edit and delete icons (or equivalent action controls).  
  - Icons are clickable and functional.  
- **Priority:** High

### TC-003
- **Title:** Empty-state message appears when no programs exist  
- **Preconditions:**  
  - Admin user is authenticated  
  - System has zero program records  
- **Steps:**  
  1. Navigate to `Programs` page.  
- **Expected Result:**  
  - No list rows/cards are shown.  
  - Empty-state message indicates no programs have been created.  
  - A prompt/CTA to create the first program is visible.  
- **Priority:** High

### TC-004
- **Title:** Empty-state CTA navigates to program creation form  
- **Preconditions:**  
  - No programs exist  
  - Empty state is visible on `Programs` page  
- **Steps:**  
  1. Click the empty-state CTA (e.g., `Create Program` button).  
- **Expected Result:**  
  - User is navigated to the Program creation form/page.  
  - No error occurs during navigation.  
  - CTA is a clickable element (not static text).  
- **Priority:** High

### TC-005
- **Title:** Programs are displayed in a consistent default sort order  
- **Preconditions:**  
  - Admin user is authenticated  
  - At least three programs exist with different names and creation dates  
- **Steps:**  
  1. Navigate to `Programs` page and note the order.  
  2. Refresh the page and note the order again.  
- **Expected Result:**  
  - Programs appear in the same order both times.  
  - Order follows a defined rule (alphabetical, creation date, or other).  
- **Priority:** Medium

### TC-006
- **Title:** Clicking a program row navigates to detail or edit view  
- **Preconditions:**  
  - Admin user is authenticated  
  - Program `Web Development 2026` exists  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Click the program name `Web Development 2026` (or the row).  
- **Expected Result:**  
  - User is taken to a detail or edit view for the selected program.  
  - Click is not a dead/no-op action.  
- **Priority:** Medium

---

## Negative Flows

### TC-007
- **Title:** Non-admin user cannot access the program management list  
- **Preconditions:**  
  - User without admin permission is authenticated  
- **Steps:**  
  1. Attempt to open `Programs` page URL directly.  
- **Expected Result:**  
  - Access is denied or user is redirected.  
  - Protected admin list data is not exposed.  
- **Priority:** High

### TC-008
- **Title:** API failure shows error state, not empty-state message  
- **Preconditions:**  
  - Admin user is authenticated  
  - Backend list API returns error (e.g., 500/timeout)  
- **Steps:**  
  1. Navigate to `Programs` page while API fails.  
- **Expected Result:**  
  - User sees a clear error state/message (e.g., "Unable to load programs").  
  - UI does not display the empty-state "no programs" message.  
  - Error state is visually distinct from the empty state.  
- **Priority:** High

### TC-009
- **Title:** Program with missing name/description data renders gracefully  
- **Preconditions:**  
  - Program record exists with missing/blank `Program Name` or `Program Description` due to data anomaly  
- **Steps:**  
  1. Navigate to `Programs` page.  
- **Expected Result:**  
  - UI handles bad data gracefully (fallback text or row exclusion with logging).  
  - Page does not crash and layout is not broken.  
- **Priority:** Medium

### TC-010
- **Title:** Loading state does not flash a false empty-state message  
- **Preconditions:**  
  - Admin user is authenticated  
  - Programs exist in the system  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Observe the UI during the data fetch period.  
- **Expected Result:**  
  - A loading indicator (spinner, skeleton rows) is shown while data is being fetched.  
  - The empty-state "no programs" message does not flash before data arrives.  
- **Priority:** High

---

## Edge Cases

### TC-011
- **Title:** Special characters in name and description display correctly  
- **Preconditions:**  
  - Program `Informatique & IA - Niveau 2` exists with description `Parcours avancé: IA, NLP, et MLOps`  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate the entry.  
- **Expected Result:**  
  - Name and description render correctly (including accented/special characters).  
  - No encoding corruption or escaping artifacts.  
- **Priority:** Medium

### TC-012
- **Title:** Very long names and descriptions do not break layout  
- **Preconditions:**  
  - Program exists with long values near max length:  
    - Name: `Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A`  
    - Description: `Comprehensive curriculum covering distributed storage, stream processing, data modeling, observability, and production-grade pipelines for enterprise workloads`  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Inspect row/card rendering.  
- **Expected Result:**  
  - Text wraps or truncates per design without overlapping or clipping UI controls.  
  - Tooltip/expand behavior (if defined) works correctly.  
- **Priority:** Medium

### TC-013
- **Title:** Large dataset loads and renders within acceptable time  
- **Preconditions:**  
  - At least 100 programs exist  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Measure time from navigation to full list render.  
  3. Scroll/use pagination (if available).  
- **Expected Result:**  
  - Page loads and renders within 3 seconds.  
  - No missing or duplicated rows during scroll or page transitions.  
- **Priority:** Medium

### TC-014
- **Title:** Program count indicator is accurate and updates  
- **Preconditions:**  
  - Programs page displays a total count (e.g., "12 Programs")  
  - At least two programs exist  
- **Steps:**  
  1. Navigate to `Programs` page and note the count.  
  2. Create a new program.  
  3. Return to `Programs` page and note the count.  
- **Expected Result:**  
  - Count increments by 1 after creation.  
  - Count matches the actual number of visible rows.  
  - If no count indicator exists, document as a known gap.  
- **Priority:** Medium

### TC-015
- **Title:** List data is fresh after navigation back to Programs page  
- **Preconditions:**  
  - Admin user is authenticated  
  - Programs exist  
- **Steps:**  
  1. Navigate to `Programs` page and note visible entries.  
  2. In a separate session/tab, create a new program `Freshness Test Program`.  
  3. Navigate away from and back to `Programs` page (or refresh).  
- **Expected Result:**  
  - `Freshness Test Program` appears in the list after returning/refreshing.  
  - No stale cache prevents the new entry from appearing.  
- **Priority:** Medium

### TC-016
- **Title:** Deleting the last program transitions to empty state  
- **Preconditions:**  
  - Only one program exists: `Test Program`  
- **Steps:**  
  1. Navigate to `Programs` page and confirm `Test Program` is listed.  
  2. Delete `Test Program` and confirm.  
- **Expected Result:**  
  - List disappears and the empty-state message appears.  
  - The prompt to create the first program is visible.  
  - No broken or blank state.  
- **Priority:** High

### TC-017
- **Title:** Empty state and list state switch correctly after first program is created  
- **Preconditions:**  
  - Start with zero programs  
- **Steps:**  
  1. Open `Programs` page and verify empty state.  
  2. Create program `Cloud Engineering 2026` with valid description.  
  3. Return to `Programs` page.  
- **Expected Result:**  
  - Empty state disappears.  
  - List appears with `Cloud Engineering 2026` and description.  
- **Priority:** High

### TC-018
- **Title:** Duplicate program names are distinguishable in display  
- **Preconditions:**  
  - Two records exist with `Program Name = Test Program` but different descriptions (if system allows duplicates)  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate both `Test Program` entries.  
- **Expected Result:**  
  - Both entries are visible as separate items.  
  - Description helps differentiate records.  
- **Priority:** Medium

### TC-019
- **Title:** Page refresh shows data consistent with server  
- **Preconditions:**  
  - Programs exist  
- **Steps:**  
  1. Open `Programs` page and note visible rows.  
  2. Refresh browser.  
- **Expected Result:**  
  - List content remains consistent with server records.  
  - No phantom rows or transient empty-state flash beyond acceptable loading skeleton behavior.  
- **Priority:** Medium

---

## Coverage Matrix (AC → Test Cases)

- **Display program list with key details** → `TC-001`, `TC-002`, `TC-005`, `TC-011`, `TC-012`
- **Empty state when no programs exist** → `TC-003`, `TC-004`, `TC-016`, `TC-017`

---

## Ambiguities / Gaps in ACs

- AC text mentions admins want to "find and manage" programs, but no explicit filtering/search behavior is defined.
- "Clear list" is subjective; no UI expectations for sorting, pagination, density, or default order.
- No explicit authorization rule besides "admin user" (what non-admin should see/do is unspecified).
- Required behavior for loading/error states is not defined (spinner, retry, fallback messaging).
- No max-length limits for `Program Name`/`Program Description` specified.
- No guidance on handling duplicate names in display and management actions.
- No accessibility requirements (keyboard navigation, screen reader labels, contrast).
- No performance criteria (acceptable load time with large datasets).

---

## Gap Traceability

| Gap Requirement | Addressed By |
|---|---|
| 1. Management action icons visible per row | TC-002 |
| 2. Default sort order | TC-005 |
| 3. Loading/skeleton state during fetch | TC-010 |
| 4. Page load performance threshold | TC-013 |
| 5. Program count indicator | TC-014 |
| 6. Real-time or navigation-refresh data freshness | TC-015 |
| 7. Clicking a program row navigates to detail/edit | TC-006 |
| 8. Empty-state CTA functionality | TC-004 |
| 9. List behavior after last program is deleted | TC-016 |
| 10. Error state distinct from empty state | TC-008 |
