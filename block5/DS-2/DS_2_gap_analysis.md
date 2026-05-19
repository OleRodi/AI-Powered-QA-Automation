# Prompt Template - Test Plan

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Edit existing program details" feature.

## Acceptance Criteria
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged

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

1. **Full field pre-population:** Do not only assert a hardcoded subset of fields (e.g., Name, Description). Include a test that verifies every visible form field is pre-populated with the program's current data, so regressions from new fields are caught.
2. **Edit icon availability:** Include a test that confirms the edit icon is visible and functional for each program row, and that clicking it opens the modal for the correct program — not a different one.
3. **Timing assertion for "immediately":** The AC states the list "immediately shows" the updated name. Include a test that asserts the list updates within a concrete time threshold (e.g., 2 seconds) without requiring a full-page reload.
4. **Multi-field simultaneous edit:** All AC scenarios edit a single field. Include a test that changes multiple fields (e.g., Name + Description + Delivery Mode) in one save and verifies all changes persist with no partial save.
5. **Explicit Description persistence verification:** The AC for "preserves unchanged fields" checks other fields but does not explicitly verify the changed Description value itself is persisted through a browser reload. Include a test that saves a Description change, reloads, and confirms the new value.
6. **Cancel / dismiss behavior:** Include a test verifying that closing the modal without saving (Cancel or X) discards all unsaved changes.
7. **Duplicate name handling:** Include a test verifying that renaming a program to an already-existing program name is rejected.
8. **Backend failure handling:** Include a test verifying that an API error does not close the modal or corrupt the list.
9. **Concurrent edit conflict:** Include a test for two sessions editing the same program simultaneously.

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs
- Include a traceability table mapping each gap from the "Additional coverage requirements" section to the test case(s) that address it
