## Test Plan: Program Name Validation and Duplicate Prevention

### Scope
Validates `Program Name` behavior on the program creation form, covering whitespace rejection, special-character acceptance, duplicate name prevention, and robustness for boundary/edge inputs. Incorporates gap-analysis coverage for post-creation verification, trimmed storage, form reset, submission state, XSS handling, error formatting, same-session duplicates, and case sensitivity.

### Test Data Baseline
- Required fields: `Program Name`, `Program Code`, `Start Date`
- Existing program: `Web Development 2026` / `WD-2026` / `2026-09-01`
- Secondary existing program: `Data Science Bootcamp` / `DSB-2026` / `2026-09-15`

---

## Positive Flows

### TC-001
- **Title:** Program is created when name contains valid special characters  
- **Preconditions:**  
  - User is on the Create Program form  
  - No existing program named `Informatique & IA - Niveau 2`  
- **Steps:**  
  1. Enter `Informatique & IA - Niveau 2` in `Program Name`.  
  2. Enter `INFO-IA-02` in `Program Code`.  
  3. Select `2026-09-01` as `Start Date`.  
  4. Click `Create`.  
- **Expected Result:**  
  - Form is submitted successfully.  
  - Success notification appears (e.g., "Program created successfully").  
- **Priority:** High

### TC-002
- **Title:** Newly created program appears in the Programs list  
- **Preconditions:**  
  - Program `Informatique & IA - Niveau 2` was just created in TC-001  
- **Steps:**  
  1. Navigate to the `Programs` page.  
  2. Locate row for `Informatique & IA - Niveau 2`.  
- **Expected Result:**  
  - The program appears in the list with the correct name.  
  - Name displays without corruption or escaping artifacts.  
- **Priority:** High

### TC-003
- **Title:** Leading and trailing spaces are trimmed and stored value is the trimmed version  
- **Preconditions:**  
  - No existing program named `Cyber Security 2026`  
- **Steps:**  
  1. Enter `   Cyber Security 2026   ` in `Program Name`.  
  2. Fill `Program Code = CYB-2026`, `Start Date = 2026-09-15`.  
  3. Click `Create`.  
  4. Navigate to `Programs` page and locate the new program.  
  5. Click edit icon to open the program.  
- **Expected Result:**  
  - Creation succeeds.  
  - Stored/displayed value is `Cyber Security 2026` (trimmed).  
  - Edit form shows trimmed value, not the raw input with spaces.  
- **Priority:** High

### TC-004
- **Title:** Accented characters are accepted and preserved  
- **Preconditions:**  
  - No existing program named `Ingénierie Logicielle`  
- **Steps:**  
  1. Enter `Ingénierie Logicielle` in `Program Name`.  
  2. Fill other required fields with valid data.  
  3. Click `Create`.  
- **Expected Result:**  
  - Program is created successfully.  
  - Name is preserved correctly with accents in list and edit form.  
- **Priority:** Medium

### TC-005
- **Title:** Form fields are cleared after successful creation  
- **Preconditions:**  
  - User is on Create Program form  
  - No existing program named `Cloud Engineering 2026`  
- **Steps:**  
  1. Enter `Cloud Engineering 2026` in `Program Name`.  
  2. Fill `Program Code = CE-2026`, `Start Date = 2026-10-01`.  
  3. Click `Create`.  
  4. Open the Create Program form again.  
- **Expected Result:**  
  - After creation, form fields are cleared (or modal closes).  
  - Re-opening the form shows empty/default values, not stale data from the previous submission.  
- **Priority:** Medium

---

## Negative Flows

### TC-006
- **Title:** Form is blocked when Program Name contains only spaces  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Enter `   ` (spaces only) in `Program Name`.  
  2. Fill all other required fields with valid values.  
  3. Click `Create`.  
- **Expected Result:**  
  - Form is not submitted.  
  - Inline validation appears for `Program Name` (e.g., "Program Name is required").  
  - No program is created.  
- **Priority:** High

### TC-007
- **Title:** Form is blocked when Program Name is empty  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Leave `Program Name` blank.  
  2. Fill other required fields validly.  
  3. Click `Create`.  
- **Expected Result:**  
  - Form is not submitted.  
  - Required-field validation shown for `Program Name`.  
- **Priority:** High

### TC-008
- **Title:** Form is blocked when Program Name contains only tabs and newlines  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Paste `\t\t\n` into `Program Name` (tabs/newline only).  
  2. Fill other fields validly.  
  3. Click `Create`.  
- **Expected Result:**  
  - Input is normalized as empty after trim.  
  - Submission blocked with required-field error.  
- **Priority:** Medium

### TC-009
- **Title:** Exact duplicate Program Name is rejected  
- **Preconditions:**  
  - Program `Web Development 2026` already exists  
- **Steps:**  
  1. Open Create Program form.  
  2. Enter `Web Development 2026` in `Program Name`.  
  3. Fill all other required fields with valid unique values.  
  4. Click `Create`.  
- **Expected Result:**  
  - Submission is blocked.  
  - Error message indicates duplicate name (e.g., "Program name already exists").  
  - No second program with same name is created.  
- **Priority:** High

### TC-010
- **Title:** Duplicate with only leading/trailing spaces is rejected  
- **Preconditions:**  
  - Program `Web Development 2026` already exists  
- **Steps:**  
  1. Enter `  Web Development 2026  ` in `Program Name`.  
  2. Fill other required fields with valid data.  
  3. Click `Create`.  
- **Expected Result:**  
  - Submission is blocked as duplicate after trim normalization.  
  - Duplicate error is shown.  
- **Priority:** High

### TC-011
- **Title:** Duplicate detected after same-session creation without page refresh  
- **Preconditions:**  
  - No existing program named `Cloud Engineering 2026`  
- **Steps:**  
  1. Create program with `Program Name = Cloud Engineering 2026`.  
  2. Without page refresh, open Create Program form again.  
  3. Enter `Cloud Engineering 2026` again.  
  4. Click `Create`.  
- **Expected Result:**  
  - Second creation is blocked as duplicate.  
  - Duplicate validation uses latest persisted data.  
- **Priority:** High

### TC-012
- **Title:** Case-variant duplicate behavior is consistent  
- **Preconditions:**  
  - Program `Web Development 2026` already exists  
- **Steps:**  
  1. Enter `web development 2026` in `Program Name`.  
  2. Fill remaining required fields.  
  3. Click `Create`.  
- **Expected Result:**  
  - Either rejected as duplicate (case-insensitive) or accepted (case-sensitive).  
  - Behavior must be consistent across UI and API.  
- **Priority:** High

### TC-013
- **Title:** XSS/injection string is safely handled  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Enter `<script>alert('xss')</script>` in `Program Name`.  
  2. Fill other required fields validly.  
  3. Click `Create`.  
  4. If accepted, navigate to `Programs` page and inspect the entry.  
- **Expected Result:**  
  - Either rejected with validation error, or accepted and safely escaped in the list display.  
  - No script execution occurs on the Programs page.  
- **Priority:** High

### TC-014
- **Title:** Create button is disabled during submission  
- **Preconditions:**  
  - User is on Create Program form with all fields filled validly  
- **Steps:**  
  1. Click `Create`.  
  2. Immediately attempt to click `Create` again before response returns.  
- **Expected Result:**  
  - Create button is disabled or shows loading indicator during API submission.  
  - Only one program record is created (no double-submit).  
- **Priority:** Medium

---

## Edge Cases

### TC-015
- **Title:** Error messages appear in a consistent, visible location  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Enter `   ` in `Program Name`, fill other fields, click `Create`. Note error location.  
  2. Correct name to `Web Development 2026` (duplicate). Click `Create`. Note error location.  
- **Expected Result:**  
  - Both errors appear in the same consistent location (inline below field, or toast, or banner).  
  - Error is not silently swallowed or shown only in console.  
- **Priority:** Medium

### TC-016
- **Title:** Name at maximum allowed length is accepted  
- **Preconditions:**  
  - System has a defined max length (e.g., 255 chars)  
- **Steps:**  
  1. Enter a name exactly at max length.  
  2. Submit with valid other fields.  
- **Expected Result:**  
  - Program is created successfully.  
  - Name is stored without truncation.  
- **Priority:** Medium

### TC-017
- **Title:** Name exceeding maximum length is rejected  
- **Preconditions:**  
  - System has a defined max length  
- **Steps:**  
  1. Enter a name with max+1 characters.  
  2. Submit.  
- **Expected Result:**  
  - Blocked with clear validation error.  
  - No truncation without user notice.  
- **Priority:** Medium

### TC-018
- **Title:** Valid punctuation does not trigger false validation errors  
- **Preconditions:**  
  - No existing program named `AI/ML: Foundations (2026) - Group A`  
- **Steps:**  
  1. Enter `AI/ML: Foundations (2026) - Group A` in `Program Name`.  
  2. Fill required fields and submit.  
- **Expected Result:**  
  - Program is created successfully.  
  - No escaping side effects in UI display.  
- **Priority:** Medium

### TC-019
- **Title:** Validation error preserves other field values  
- **Preconditions:**  
  - User is on Create Program form  
- **Steps:**  
  1. Enter `   ` in `Program Name`.  
  2. Fill `Program Code = BA-2026` and `Start Date = 2026-11-01`.  
  3. Click `Create`.  
  4. Correct `Program Name` to `Business Analytics 2026`.  
- **Expected Result:**  
  - Initial submit blocked with name error.  
  - `Program Code` and `Start Date` values remain intact after validation failure.  
  - After correction, creation succeeds.  
- **Priority:** Low

### TC-020
- **Title:** Internal multiple spaces behavior is consistent  
- **Preconditions:**  
  - Program `Web Development 2026` already exists  
- **Steps:**  
  1. Enter `Web  Development  2026` (double spaces) in `Program Name`.  
  2. Fill required fields and submit.  
- **Expected Result:**  
  - Either treated as duplicate (if whitespace collapsing is enforced) or accepted (if not).  
  - Behavior is consistent between UI and API.  
- **Priority:** Medium

---

## Coverage Matrix (AC → Test Cases)

- **Reject program name with only whitespace** → `TC-006`, `TC-007`, `TC-008`
- **Accept program name with special characters** → `TC-001`, `TC-004`, `TC-018`
- **Reject duplicate program name** → `TC-009`, `TC-010`, `TC-011`, `TC-012`

---

## Ambiguities / Gaps in ACs

- Duplicate matching rule is not explicit for case sensitivity (`Web` vs `web`).
- Duplicate matching rule is not explicit for internal whitespace normalization (single vs multiple spaces).
- Allowed/blocked special character set is unspecified (e.g., `/`, `:`, `'`, emojis, non-Latin scripts).
- `Program Name` min/max length constraints are not specified.
- AC does not define whether validation is client-side only, server-side only, or both.
- Exact error message text/location (inline vs toast vs modal) is not specified.
- Behavior for concurrent creation race conditions is not stated.
- No explicit rule for Unicode normalization (accented variants, composed vs decomposed forms).

---

## Gap Traceability

| Gap Requirement | Addressed By |
|---|---|
| 1. Post-creation list verification | TC-002 |
| 2. Trimmed value storage verification | TC-003 |
| 3. Form reset after successful creation | TC-005 |
| 4. Create button state during submission | TC-014 |
| 5. XSS/injection string handling | TC-013 |
| 6. Error message location and format | TC-015 |
| 7. Duplicate detection after same-session creation | TC-011 |
| 8. Case-sensitivity behavior for duplicates | TC-012 |
