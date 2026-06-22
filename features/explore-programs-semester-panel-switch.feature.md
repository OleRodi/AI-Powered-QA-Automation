## Coverage snapshot
- Page: `/programs`
- Already covered: create, edit, delete, name validation, list display, empty state, row click opens semester panel (DS-5 TC-006)
- Explored via a11y tree: this session

## Selected gap (one flow)
**Flow:** Semester panel reflects the selected program; switching rows updates panel context
**Why this one:** DS-5 only asserts the first selection opens the panel — it never verifies the right-hand panel tracks a different program when the user switches rows.

## Gherkin test plan

Feature: Programs — semester panel selection (discovered)

  # Positive path
  Scenario: Selecting a program reveals the semester panel
    Given I am logged in as admin
    And I am on the Programs page
    And a program "OleRodi Semester Panel Alpha" exists in the list
    When I click the program row "OleRodi Semester Panel Alpha"
    Then I do not see "Select a program to manage semesters"
    And I see "Semesters & scheduling config"
    And I see the button "+ Semester"
    And I see the heading "OleRodi Semester Panel Alpha" in the semester panel

  # Edge case
  Scenario: Switching selection updates the semester panel
    Given I am logged in as admin
    And programs "OleRodi Semester Panel Alpha" and "OleRodi Semester Panel Beta" exist in the list
    And I have selected program "OleRodi Semester Panel Alpha"
    When I click the program row "OleRodi Semester Panel Beta"
    Then the semester panel shows "OleRodi Semester Panel Beta"
    And the semester panel does not show "OleRodi Semester Panel Alpha" as the panel heading

## Locator hints (from a11y tree)
- Program row: `getByRole('row', { name: /<programName>/ })`
- Empty panel hint: `getByText('Select a program to manage semesters')`
- Semester subtitle: `getByText('Semesters & scheduling config')`
- Add semester: `getByRole('button', { name: '+ Semester' })`
- Panel program heading: `getByRole('heading', { name: <programName>, level: 4 })`

## For test-writer
- Suggested file: `tests/block5/ds6-program-semester-panel.spec.ts`
- POM updates: `ProgramsPage.selectProgram`, `semesterPanelHeading`, `semesterConfigSubtitle`, `addSemesterButton`
