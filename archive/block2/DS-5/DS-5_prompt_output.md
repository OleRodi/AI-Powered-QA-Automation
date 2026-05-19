## Test Plan: Program List Filtering and Display

### Scope
This test plan validates the Programs page list rendering and discoverability for admins, including:
- Display of `Program Name` and `Program Description`
- Empty-state behavior when no programs exist
- Baseline filtering/display robustness (special characters, long text, duplicates, ordering/pagination assumptions)

---

## Positive Flows

### TC-001
- **Title:** Programs page displays all existing programs with key details  
- **Preconditions:**  
  - Admin user is authenticated  
  - Programs exist:  
    - `Web Development 2026` / `Full-stack web technologies and project-based learning`  
    - `Data Science Foundations` / `Statistics, Python, and machine learning basics`
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Observe the program list rows/cards.
- **Expected result:**  
  - List is visible and populated.  
  - Each program entry shows `Program Name` and `Program Description`.  
  - Both sample programs appear.
- **Priority:** High

### TC-002
- **Title:** Empty-state message appears when no programs exist  
- **Preconditions:**  
  - Admin user is authenticated  
  - System has zero program records
- **Steps:**  
  1. Navigate to `Programs` page.
- **Expected result:**  
  - No list rows/cards are shown.  
  - Empty-state message indicates no programs have been created.  
  - Prompt/CTA is visible to create the first program (e.g., `Create Program`).
- **Priority:** High

### TC-003
- **Title:** Create-first-program prompt navigates to creation flow from empty state  
- **Preconditions:**  
  - No programs exist  
  - Empty state is visible on `Programs` page
- **Steps:**  
  1. Click empty-state CTA (e.g., `Create Program`).
- **Expected result:**  
  - User is navigated to Program creation form/page.  
  - No error occurs during navigation.
- **Priority:** Medium

### TC-004
- **Title:** Programs with special characters display correctly in list  
- **Preconditions:**  
  - Program exists: `Informatique & IA - Niveau 2` / `Parcours avancé: IA, NLP, et MLOps`
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate `Informatique & IA - Niveau 2`.
- **Expected result:**  
  - Name and description render correctly (including accented/special characters).  
  - No mojibake/encoding corruption.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Non-admin user cannot access full program management list  
- **Preconditions:**  
  - User without admin permission is authenticated
- **Steps:**  
  1. Attempt to open `Programs` page URL directly.
- **Expected result:**  
  - Access is denied or redirected according to authorization rules.  
  - Protected admin list data is not exposed.
- **Priority:** High

### TC-006
- **Title:** Program list does not show stale data after backend retrieval failure  
- **Preconditions:**  
  - Admin user is authenticated  
  - Backend list API returns error (e.g., 500/timeout)
- **Steps:**  
  1. Navigate to `Programs` page while API fails.
- **Expected result:**  
  - User sees clear error state/message (not empty-state success message).  
  - UI does not incorrectly claim “no programs” due to server error.  
  - Previously cached stale list is handled per product rule (clearly marked or refreshed).
- **Priority:** High

### TC-007
- **Title:** List view does not render blank name/description rows silently  
- **Preconditions:**  
  - Program record exists with missing/invalid `Program Name` or `Program Description` due to data anomaly
- **Steps:**  
  1. Navigate to `Programs` page.
- **Expected result:**  
  - UI handles bad data gracefully (fallback text or row exclusion with logging).  
  - Page does not crash and does not show broken layout.
- **Priority:** Medium

### TC-008
- **Title:** Duplicate program names are distinguishable in display  
- **Preconditions:**  
  - Two records exist with same `Program Name = Test Program` but different descriptions
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate both `Test Program` entries.
- **Expected result:**  
  - Both entries are visible as separate items.  
  - Description helps differentiate records; no unintended deduplication in UI.
- **Priority:** Medium

---

## Edge Cases

### TC-009
- **Title:** Program list displays very long names/descriptions without breaking layout  
- **Preconditions:**  
  - Program exists with long values near max length:  
    - `Program Name = Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A`  
    - `Program Description = Comprehensive curriculum covering distributed storage, stream processing, data modeling, observability, and production-grade pipelines for enterprise workloads`
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Inspect row/card rendering.
- **Expected result:**  
  - Text wraps/truncates per design without overlap or clipping critical UI controls.  
  - Tooltip/expand behavior (if defined) works.
- **Priority:** Medium

### TC-010
- **Title:** Empty-state and list-state switch correctly after first program is created  
- **Preconditions:**  
  - Start with zero programs  
- **Steps:**  
  1. Open `Programs` page and verify empty state.  
  2. Create program `Cloud Engineering 2026` with valid description.  
  3. Return to `Programs` page.
- **Expected result:**  
  - Empty state disappears.  
  - List appears with `Cloud Engineering 2026` and description.
- **Priority:** High

### TC-011
- **Title:** Program descriptions with newline and punctuation display safely  
- **Preconditions:**  
  - Program exists with description containing punctuation/newline:  
    - `Program Description = "Core modules:\n- Python\n- SQL\n- ML Ops"`
- **Steps:**  
  1. Open `Programs` page.  
  2. Observe rendering for that program entry.
- **Expected result:**  
  - Content is displayed in readable format per UI rules.  
  - No HTML/script injection or malformed markup appears.
- **Priority:** Medium

### TC-012
- **Title:** List remains usable with large number of programs  
- **Preconditions:**  
  - At least 100 programs exist
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Scroll/use pagination (if available).  
  3. Observe load and render behavior.
- **Expected result:**  
  - Page remains responsive within acceptable performance threshold.  
  - No missing/duplicated rows during scroll or page transitions.
- **Priority:** Medium

### TC-013
- **Title:** Program names differing only by case are displayed consistently  
- **Preconditions:**  
  - Records exist: `Data Science`, `data science` (if allowed by business rules)
- **Steps:**  
  1. Open `Programs` page.  
  2. Check ordering and visibility of both entries.
- **Expected result:**  
  - Both entries render according to data rules.  
  - No accidental merge/hide due to case normalization in UI layer.
- **Priority:** Low

### TC-014
- **Title:** Programs page refresh keeps state consistent with latest backend data  
- **Preconditions:**  
  - Programs exist  
- **Steps:**  
  1. Open `Programs` page and note visible rows.  
  2. Refresh browser.  
- **Expected result:**  
  - List content remains consistent with server records.  
  - No phantom rows or transient empty-state flash beyond acceptable loading skeleton behavior.
- **Priority:** Medium

### TC-015
- **Title:** Filtering controls (if present) update displayed list correctly  
- **Preconditions:**  
  - Programs exist with varied names/descriptions  
  - A filter/search input is available on `Programs` page
- **Steps:**  
  1. In filter/search field, enter `Data`.  
  2. Observe resulting list.  
  3. Clear filter.
- **Expected result:**  
  - Only matching programs are shown while filter is active.  
  - Clearing filter restores full list.  
  - Empty-state for “no filter results” is distinct from “no programs exist”.
- **Priority:** Medium

---

## Coverage Matrix (AC -> Test Cases)

- **Display program list with key details** -> `TC-001`, `TC-004`, `TC-009`
- **Empty state when no programs exist** -> `TC-002`, `TC-003`, `TC-010`
- **Admin can quickly find/manage programs (story intent)** -> `TC-012`, `TC-014`, `TC-015`

---

## Ambiguities / Gaps in the ACs

- AC text mentions **filtering**, but no explicit filtering behavior/controls are defined (fields, match type, case sensitivity).
- “Clear list” is subjective; no UI expectations for sorting, pagination, density, or default order.
- No explicit authorization rule besides “admin user” (what non-admin should see/do is unspecified).
- Required behavior for loading/error states is not defined (spinner, retry, fallback messaging).
- No max-length limits for `Program Name`/`Program Description` specified.
- No guidance on handling duplicate names in display and management actions.
- No accessibility requirements (keyboard navigation, screen reader labels, contrast) for list and empty-state CTA.
- No performance criteria (acceptable load time with large datasets).
