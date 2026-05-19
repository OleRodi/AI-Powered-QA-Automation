# Prompt Template - Test Plan

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Program name validation and duplicate prevention" feature.

## Acceptance Criteria
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)

Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully

Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists

## Requirements for the test plan

- Cover every AC with at least one test case
- Add edge cases the ACs don't mention
  (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as:
  - ID (TC-001, TC-002, etc.)
  - Title (expected behavior, not action)
  - Preconditions
  - Steps (numbered)
  - Expected result
  - Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases

## Additional coverage requirements (gap analysis)

The following gaps were identified from a prior review and must be addressed with dedicated test cases:

1. **Post-creation list verification:** After a successful creation, verify the new program actually appears in the Programs list with the correct name. Do not stop at "form submitted successfully" — confirm the list reflects the new record.
2. **Trimmed value storage verification:** The AC says the name is "trimmed, treated as empty." Include a test that creates a program with leading/trailing spaces and verifies the stored/displayed value is the trimmed version (not the raw input).
3. **Form reset after successful creation:** After successfully creating a program, verify the form fields are cleared (or the modal closes) so a subsequent creation does not carry over stale data.
4. **Create button state during submission:** Include a test verifying the Create button is disabled or shows a loading indicator during API submission to prevent double-submit.
5. **XSS/injection string handling:** Include a test entering a malicious string (e.g., `<script>alert(1)</script>`) as the program name and verifying it is either rejected or safely escaped in the list display with no script execution.
6. **Error message location and format:** For both whitespace rejection and duplicate rejection, verify the error message appears in a consistent, user-visible location (inline validation, toast, or modal) — not silently swallowed.
7. **Duplicate detection after same-session creation:** After creating a program in the current session (without page refresh), immediately attempt to create another with the same name and verify the duplicate check uses the latest persisted data.
8. **Case-sensitivity behavior for duplicates:** Include a test that attempts to create a program with a case-variant of an existing name (e.g., "web development 2026" vs "Web Development 2026") and documents whether the system treats them as duplicates or not.

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs
- Include a traceability table mapping each gap from the "Additional coverage requirements" section to the test case(s) that address it
