Feature: DS-1 — Create new academic program
  As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

  # Happy paths

  Scenario: Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  Scenario: Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Created program persists after page reload
    Given I am on the Programs page
    And a program named "Web Development 2026" with description "Full-stack web development program" exists
    When I reload the browser
    Then the program list still shows "Web Development 2026"

  Scenario: Program can be created with only Program Name when Description is optional
    Given I am on the program creation form
    When I fill in Program Name with "Data Science 2026"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science 2026"

  Scenario: Modal closes within a reasonable time after successful Create
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes within 2 seconds

  # Negative

  Scenario: Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  Scenario: Create is blocked when Program Name contains only whitespace
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Full-stack web development program"
    Then the Create button is disabled

  Scenario: Duplicate program name is rejected
    Given I am on the Programs page
    And a program named "Web Development 2026" already exists
    When I click "+ New Program"
    And I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then the modal remains open
    And I see a duplicate-name validation error
    And the program list does not contain a second "Web Development 2026" row

  Scenario: Duplicate name error does not clear entered Description
    Given I am on the Programs page
    And a program named "Web Development 2026" already exists
    When I click "+ New Program"
    And I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then the Description field still contains "Duplicate name attempt"

  Scenario: Cancel discards unsaved program data
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Cancel
    Then the modal closes
    And the program list does not show "Web Development 2026"

  Scenario: Backend failure keeps modal open and preserves entered values
    Given I am on the program creation form
    And the create-program API returns an error
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal remains open
    And Program Name still contains "Web Development 2026"
    And Description still contains "Full-stack web development program"
    And the program list does not show "Web Development 2026"

  # Edge cases

  Scenario: Program Name accepts valid special characters
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026: Front-End & API (Evening)"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026: Front-End & API (Evening)"

  Scenario: Leading and trailing spaces in Program Name are trimmed on save
    Given I am on the program creation form
    When I fill in Program Name with "   Web Development 2026   "
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the program list does not show "   Web Development 2026   "

  Scenario: Rapid double-click on Create does not create duplicate programs
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I double-click Create rapidly
    Then the modal closes
    And exactly one row in the program list shows "Web Development 2026"

  Scenario: Program list row matches the created program name exactly
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program list shows a row with name exactly "Web Development 2026"
    And the program list does not show unrelated rows because of partial name matching

  Scenario: Program Name at maximum allowed length is accepted
    Given I am on the program creation form
    And the maximum allowed length for Program Name is known
    When I fill in Program Name with a value exactly at the maximum allowed length
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows the full entered Program Name without truncation

  Scenario: Program Name exceeding maximum allowed length is rejected
    Given I am on the program creation form
    And the maximum allowed length for Program Name is known
    When I fill in Program Name with a value one character longer than the maximum allowed length
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal remains open
    And I see a validation error for Program Name
    And the program list does not show the over-length name

  Scenario: Empty Description is allowed when Description is optional
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Empty Description is blocked when Description is required
    Given I am on the program creation form
    And Description is a required field
    When I fill in Program Name with "Web Development 2026"
    And I leave Description empty
    Then the Create button is disabled

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Whether Description is required or optional is not specified in DS-1.
# - Maximum length and allowed character set for Program Name and Description are not defined.
# - Duplicate-name rule is not stated (case-sensitive vs case-insensitive, trimmed comparison unknown).
# - Expected duplicate-name error message text and placement (inline vs toast) are not defined.
# - Cancel behavior is not in AC (button label may be Cancel or X close control).
# - Backend/API failure handling is not defined.
# - Timing expectation for "modal closes" is not in AC (related defect DS-16 suggests ~2 seconds as a reasonable threshold).
# - Double-click / idempotency on Create is not in AC (related defects DS-17, SS-26).
# - Whether leading/trailing whitespace in Program Name should be trimmed is not specified.
# - Persistence after browser reload is not explicitly required in AC.
# - Whether a program created with only a name should display an empty Description in the list is not defined.
# - User role beyond "admin" and permission boundaries for non-admin users are not specified.
