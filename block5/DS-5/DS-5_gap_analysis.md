# Prompt Template - Test Plan

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Program list filtering and display" feature.

## Acceptance Criteria
Scenario: Display program list with key details
  Given programs exist in the system
  When I navigate to the Programs page
  Then I see a list showing each program's name and description

Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program

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

1. **Management action icons visible per row:** The story intent is "find and manage" programs. Verify each program row displays action icons (edit, delete) alongside the name and description so the user can manage programs directly from the list.
2. **Default sort order:** Programs are displayed in a list, but no order is specified. Include a test that documents the default sort order (alphabetical, creation date, etc.) and verifies it is consistent across page loads.
3. **Loading/skeleton state during fetch:** Include a test verifying what the user sees while the program list is being fetched (spinner, skeleton rows, blank) — the page should not flash an empty-state "no programs" message before data arrives.
4. **Page load performance threshold:** Include a test asserting the Programs page loads and renders the full list within an acceptable time (e.g., under 3 seconds for a typical dataset).
5. **Program count indicator:** If the page shows a total count (e.g., "12 Programs"), verify it is accurate and updates when programs are added or removed.
6. **Real-time or navigation-refresh data freshness:** If another user creates a program while the admin is viewing the list, verify whether the list updates on its own, on navigation back, or only on manual refresh — and that the behavior is consistent.
7. **Clicking a program row navigates to detail/edit:** The AC says admins want to "find and manage" programs. Include a test verifying that clicking a program name or row navigates to a detail or edit view (not a dead click).
8. **Empty-state CTA functionality:** The AC says a "prompt to create the first program" appears. Verify the CTA is a clickable button/link that navigates to the program creation form and is not just static text.
9. **List behavior after last program is deleted:** After deleting the only program in the list, verify the page transitions to the empty state with the creation prompt — not a broken/blank state.
10. **Error state distinct from empty state:** If the API fails, the user should see an error message, not the empty-state "no programs" message. Include a test distinguishing these two states.

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs
- Include a traceability table mapping each gap from the "Additional coverage requirements" section to the test case(s) that address it
