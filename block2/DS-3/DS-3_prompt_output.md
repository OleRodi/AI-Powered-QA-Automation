## Test Plan: Program Name Validation and Duplicate Prevention

### Scope
This plan validates `Program Name` behavior on the **Program Creation** form, with focus on:
- Whitespace-only rejection
- Special-character acceptance
- Duplicate name prevention
- Related edge and negative cases (boundaries, normalization, max-length assumptions)

---

## Positive Flows

### TC-001
- **Title:** Program is created when `Program Name` contains valid letters, numbers, spaces, and special characters  
- **Preconditions:**  
  - User is on the **Create Program** form  
  - Required fields exist: `Program Name`, `Program Code`, `Start Date`
- **Steps:**  
  1. Enter `Informatique & IA - Niveau 2` in `Program Name`.  
  2. Enter `INFO-IA-02` in `Program Code`.  
  3. Select a valid `Start Date` (e.g., `2026-09-01`).  
  4. Click `Create`.
- **Expected result:**  
  - Form is submitted successfully.  
  - Program record is created with `Program Name = Informatique & IA - Niveau 2`.  
  - Success notification appears (e.g., “Program created successfully”).
- **Priority:** High

### TC-002
- **Title:** Program is created when `Program Name` has leading/trailing spaces around valid text  
- **Preconditions:**  
  - No existing program named `Cyber Security 2026`
- **Steps:**  
  1. Enter `   Cyber Security 2026   ` in `Program Name`.  
  2. Fill `Program Code = CYB-2026`, `Start Date = 2026-09-15`.  
  3. Click `Create`.
- **Expected result:**  
  - Form is submitted successfully.  
  - Stored value is trimmed to `Cyber Security 2026` (no leading/trailing spaces).  
  - No validation error is shown.
- **Priority:** Medium

### TC-003
- **Title:** Program is created when `Program Name` includes accented characters  
- **Preconditions:**  
  - No existing program named `Ingénierie Logicielle`
- **Steps:**  
  1. Enter `Ingénierie Logicielle` in `Program Name`.  
  2. Fill other required fields with valid data.  
  3. Click `Create`.
- **Expected result:**  
  - Program is created successfully.  
  - Name is preserved correctly with accents.
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Form submission is blocked when `Program Name` contains only spaces  
- **Preconditions:**  
  - User is on Create Program form
- **Steps:**  
  1. Enter `   ` in `Program Name`.  
  2. Fill all other required fields with valid values.  
  3. Click `Create`.
- **Expected result:**  
  - Form is not submitted.  
  - Inline validation appears for `Program Name` (e.g., “Program Name is required”).  
  - No program is created.
- **Priority:** High

### TC-005
- **Title:** Duplicate exact `Program Name` is rejected  
- **Preconditions:**  
  - Program `Web Development 2026` already exists
- **Steps:**  
  1. Open Create Program form.  
  2. Enter `Web Development 2026` in `Program Name`.  
  3. Fill all other required fields with valid unique values.  
  4. Click `Create`.
- **Expected result:**  
  - Submission is blocked.  
  - Error message indicates duplicate name (e.g., “Program name already exists”).  
  - No second program with same name is created.
- **Priority:** High

### TC-006
- **Title:** Duplicate is rejected when difference is only leading/trailing spaces  
- **Preconditions:**  
  - Program `Web Development 2026` already exists
- **Steps:**  
  1. Enter `  Web Development 2026  ` in `Program Name`.  
  2. Fill other required fields with valid data.  
  3. Click `Create`.
- **Expected result:**  
  - Submission is blocked as duplicate after trim normalization.  
  - Duplicate error is shown.  
  - No new record created.
- **Priority:** High

### TC-007
- **Title:** Program is not created when server returns duplicate conflict despite passing client validation  
- **Preconditions:**  
  - Existing program `Data Science Bootcamp`  
  - Two users/sessions can submit concurrently
- **Steps:**  
  1. In Session A, enter `Data Science Bootcamp` and submit.  
  2. In Session B, submit same name nearly simultaneously.  
- **Expected result:**  
  - Only one creation succeeds.  
  - Other request gets duplicate error from backend (e.g., HTTP 409 + user-friendly message).  
  - UI does not falsely show success for failed request.
- **Priority:** High

---

## Edge Cases

### TC-008
- **Title:** Form blocks submission when `Program Name` is empty string  
- **Preconditions:** User is on Create Program form
- **Steps:**  
  1. Leave `Program Name` blank.  
  2. Fill other required fields validly.  
  3. Click `Create`.
- **Expected result:**  
  - Form is not submitted.  
  - Required-field validation shown for `Program Name`.
- **Priority:** High

### TC-009
- **Title:** Form blocks submission when `Program Name` contains only tab/newline whitespace  
- **Preconditions:** User is on Create Program form
- **Steps:**  
  1. Paste `\t\t\n` into `Program Name` (tabs/newline only).  
  2. Fill other fields validly.  
  3. Click `Create`.
- **Expected result:**  
  - Input is normalized as empty after trim.  
  - Submission blocked with required-field error.
- **Priority:** Medium

### TC-010
- **Title:** Duplicate detection behavior is consistent for case differences  
- **Preconditions:**  
  - Program `Web Development 2026` already exists
- **Steps:**  
  1. Enter `web development 2026` in `Program Name`.  
  2. Fill remaining required fields.  
  3. Click `Create`.
- **Expected result:**  
  - **Expected per business rule:** either rejected as duplicate (case-insensitive uniqueness) or accepted (case-sensitive uniqueness).  
  - Behavior must match defined rule and be consistent across UI/API.
- **Priority:** High

### TC-011
- **Title:** Duplicate detection behavior is consistent for internal multiple spaces  
- **Preconditions:**  
  - Program `Web Development 2026` already exists
- **Steps:**  
  1. Enter `Web  Development  2026` (double spaces) in `Program Name`.  
  2. Fill required fields and submit.
- **Expected result:**  
  - **Expected per normalization rule:** either treated as duplicate (if whitespace collapsing is enforced) or accepted (if not).  
  - No inconsistent UI/API decision.
- **Priority:** Medium

### TC-012
- **Title:** Maximum allowed length for `Program Name` is enforced  
- **Preconditions:**  
  - System has a defined max length (e.g., 255 chars)
- **Steps:**  
  1. Enter a name exactly at max length.  
  2. Submit with valid other fields.  
  3. Enter a name with max+1 length.  
  4. Submit again.
- **Expected result:**  
  - At max length: accepted.  
  - Max+1: blocked with clear validation error.  
  - No truncation without user notice.
- **Priority:** High

### TC-013
- **Title:** Program name with allowed punctuation does not trigger false validation errors  
- **Preconditions:** No existing identical program
- **Steps:**  
  1. Enter `AI/ML: Foundations (2026) - Group A` in `Program Name`.  
  2. Fill required fields and submit.
- **Expected result:**  
  - Program is created if punctuation is allowed by rule.  
  - No unsafe escaping side effects in UI display.
- **Priority:** Medium

### TC-014
- **Title:** Duplicate check works correctly after successful creation in same session  
- **Preconditions:**  
  - No existing program `Cloud Engineering 2026`
- **Steps:**  
  1. Create program with `Program Name = Cloud Engineering 2026`.  
  2. Without page refresh, attempt to create another with same name.  
- **Expected result:**  
  - Second creation is blocked as duplicate.  
  - Duplicate validation uses latest persisted data.
- **Priority:** Medium

### TC-015
- **Title:** Validation errors do not clear other valid field values unexpectedly  
- **Preconditions:** User is on Create Program form
- **Steps:**  
  1. Enter `   ` in `Program Name`.  
  2. Fill valid values in `Program Code` and `Start Date`.  
  3. Click `Create`.  
  4. Correct `Program Name` to `Business Analytics 2026`.
- **Expected result:**  
  - Initial submit blocked with name error.  
  - Other field values remain intact after validation failure.  
  - After correction, creation succeeds.
- **Priority:** Low

---

## Coverage Matrix (AC -> Test Cases)

- **Reject program name with only whitespace** -> `TC-004`, `TC-009`, `TC-008`
- **Accept program name with special characters** -> `TC-001`, `TC-013`, `TC-003`
- **Reject duplicate program name** -> `TC-005`, `TC-006`, `TC-007`, `TC-014`

---

## Ambiguities / Gaps in the ACs

- Duplicate matching rule is not explicit for **case sensitivity** (`Web` vs `web`).
- Duplicate matching rule is not explicit for **internal whitespace normalization** (single vs multiple spaces).
- Allowed/blocked **special character set** is unspecified (e.g., `/`, `:`, `'`, emojis, non-Latin scripts).
- `Program Name` **min/max length** constraints are not specified.
- AC does not define whether validation is **client-side only, server-side only, or both**.
- Exact **error message text/location** (inline vs toast vs modal) is not specified.
- Behavior for **concurrent creation race conditions** is not stated (must be backend-enforced for integrity).
- No explicit rule for **Unicode normalization** (accented variants, composed vs decomposed forms).
