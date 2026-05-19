# Prompt Template - Test Plan

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Delete program with confirmation" feature.

## Acceptance Criteria
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list

Scenario: Cancel program deletion
  Given I click the delete icon for a program
  When I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list

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

1. **Delete icon visibility per row:** Verify the delete icon is visible and functional for every program row in the list, and that clicking it opens the confirmation dialog for the correct program (not a neighboring row).
2. **Deleting the last remaining program triggers empty state:** When only one program exists and it is deleted, verify the Programs page transitions to the empty-state message with a prompt to create the first program.
3. **Multiple sequential deletions:** Delete two or more programs one after another without page refresh and verify each deletion is reflected immediately in the list with no stale rows or phantom entries.
4. **Confirmation dialog shows correct program identity:** Verify the dialog text explicitly references the correct program name (and not a generic message) so the user can confirm they are deleting the intended record.
5. **List count and pagination adjustment after deletion:** If the page displays a total count or uses pagination, verify the count decrements and pagination adjusts after a deletion (e.g., last item on page 2 deleted should not leave an empty page 2).
6. **Undo or recovery availability:** Verify whether a deleted program can be recovered (e.g., undo toast, soft delete). If no undo exists, document this as a known limitation.
7. **Deletion persistence after page reload:** After confirming deletion, refresh the browser and verify the deleted program does not reappear.
8. **Double-click protection on Confirm button:** Rapidly clicking Confirm multiple times should not send duplicate delete requests or produce duplicate error/success messages.
9. **Deletion of program with dependent records:** If the program is linked to courses, enrollments, or other child records, verify the system either blocks deletion with a clear message or cascades correctly per business rules.

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs
- Include a traceability table mapping each gap from the "Additional coverage requirements" section to the test case(s) that address it
