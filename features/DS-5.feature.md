Feature: DS-5 — Program list filtering and display
  As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

  # Happy paths

  Scenario: Display program list with key details
    Given programs exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description

  Scenario: Multiple programs display with correct name and description per row
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    And a program "Data Science Foundations" with description "Statistics, Python, and machine learning basics" exists
    When I navigate to the Programs page
    Then I see a row for "Web Development 2026" showing "Full-stack web technologies and project-based learning"
    And I see a row for "Data Science Foundations" showing "Statistics, Python, and machine learning basics"

  Scenario: Each program row displays management action icons
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    And a program "Data Science Foundations" with description "Statistics, Python, and machine learning basics" exists
    When I navigate to the Programs page
    Then each program row shows an edit icon
    And each program row shows a delete icon

  Scenario: Empty state when no programs exist
    Given no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Empty-state CTA opens the program creation form
    Given no programs exist
    When I navigate to the Programs page
    And I click the prompt to create the first program
    Then I see the program creation form with fields: Program Name, Description

  Scenario: Programs are displayed in a consistent default sort order
    Given a program "Alpha Program" exists
    And a program "Beta Program" exists
    And a program "Gamma Program" exists
    When I navigate to the Programs page
    And I reload the Programs page
    Then the programs appear in the same order on both loads

  Scenario: Newly created program appears in the list without manual refresh
    Given I am on the Programs page
    When I create a program named "Web Development 2026" with description "Full-stack web technologies and project-based learning"
    Then the program list shows "Web Development 2026"
    And the row shows "Full-stack web technologies and project-based learning"

  Scenario: Program count indicator matches the number of listed programs when shown
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    And a program "Data Science Foundations" with description "Statistics, Python, and machine learning basics" exists
    When I navigate to the Programs page
    Then the displayed program count matches the number of program rows shown

  # Negative

  Scenario: Empty state is not shown while programs are still loading
    Given programs exist in the system
    And the Programs page is still fetching program data
    When I navigate to the Programs page
    Then I do not see the empty-state message indicating no programs have been created
    And I see a loading indicator or populated list when data arrives

  Scenario: API failure shows an error state instead of the empty state
    Given the programs API returns an error
    When I navigate to the Programs page
    Then I see an error message
    And I do not see the empty-state message indicating no programs have been created

  Scenario: Program list does not show unrelated rows for partial name matches
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    When I navigate to the Programs page
    Then each visible row corresponds to an actual program record
    And rows are not matched by overly broad substring text elsewhere on the page

  Scenario: Deleted program is removed from the list immediately
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    When I navigate to the Programs page
    And I delete "Web Development 2026" with confirmation
    Then "Web Development 2026" is not shown in the program list

  # Edge cases

  Scenario: Program with special characters in name and description displays correctly
    Given a program "Informatique & IA - Niveau 2" with description "Parcours avancé: IA, NLP, et MLOps" exists
    When I navigate to the Programs page
    Then I see a row for "Informatique & IA - Niveau 2"
    And the row shows "Parcours avancé: IA, NLP, et MLOps"

  Scenario: Program with empty description still appears in the list
    Given a program "Web Development 2026" with an empty description exists
    When I navigate to the Programs page
    Then I see a row for "Web Development 2026"

  Scenario: Program with a long description displays without breaking the list layout
    Given a program "Web Development 2026" with a description at or near the maximum allowed length exists
    When I navigate to the Programs page
    Then I see a row for "Web Development 2026"
    And the list layout remains readable without overlapping rows

  Scenario: Deleting the last program transitions to the empty state
    Given only one program "Web Development 2026" exists
    When I navigate to the Programs page
    And I delete "Web Development 2026" with confirmation
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Programs page loads within an acceptable time for a typical dataset
    Given at least 10 programs exist in the system
    When I navigate to the Programs page
    Then the program list is visible within 3 seconds

  Scenario: List data remains consistent with server after page reload
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    When I navigate to the Programs page
    And I reload the browser
    Then I see a row for "Web Development 2026" showing "Full-stack web technologies and project-based learning"

  Scenario: Clicking edit on a row opens the edit form for that program
    Given a program "Web Development 2026" with description "Full-stack web technologies and project-based learning" exists
    When I navigate to the Programs page
    And I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with "Web Development 2026"

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Default sort order (alphabetical, creation date, etc.) is not specified in the AC.
# - Whether management action icons (edit, delete) must appear in the list is not stated in the AC despite the story goal to "manage" programs.
# - Exact empty-state message copy and CTA label are not defined.
# - Loading/skeleton behavior while fetching programs is not defined.
# - Error-state behavior when the programs API fails is not distinguished from the empty state in the AC.
# - Program count indicator, pagination, and filtering behavior are not in the AC despite the summary mentioning "filtering".
# - Whether clicking a program name navigates to a detail view is not specified.
# - Performance threshold for page load is not defined.
# - Real-time vs refresh-required data freshness is not specified.
# - Display rules for programs with empty or very long descriptions are not defined.
# - User role beyond admin and permission boundaries for non-admin users are not specified.
