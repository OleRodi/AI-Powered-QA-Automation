Feature: DS-3 — Program name validation and duplicate prevention
  As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

  # Happy paths

  Scenario: Accept program name with special characters
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program is created successfully
    And the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  Scenario: Newly created program appears in the Programs list
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program list shows "Informatique & IA - Niveau 2"
    And exactly one row in the program list shows "Informatique & IA - Niveau 2"

  Scenario: Leading and trailing spaces are trimmed and stored as the trimmed value
    Given I am on the program creation form
    When I enter "   Cyber Security 2026   " as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program is created successfully
    And the program list shows "Cyber Security 2026"
    And the program list does not show "   Cyber Security 2026   "

  Scenario: Form resets after successful creation
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    When I click "+ New Program"
    Then Program Name is empty
    And Description is empty

  # Negative

  Scenario: Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the form is not submitted
    And the name is trimmed and treated as empty
    And the program list does not show a new program

  Scenario: Create is blocked when Program Name is empty
    Given I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Full-stack web development program"
    Then the Create button is disabled

  Scenario: Whitespace-only name shows a visible validation error
    Given I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then I see a visible validation error for Program Name
    And the modal remains open

  Scenario: Reject duplicate program name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And the program list does not contain a second "Web Development 2026" row

  Scenario: Duplicate name error appears in a user-visible location
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then I see an error indicating the name already exists in the modal or as a toast notification

  Scenario: Duplicate rejection preserves entered Description
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then the Description field still contains "Duplicate name attempt"

  Scenario: Duplicate rejection preserves entered Program Name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    And I fill in Description with "Duplicate name attempt"
    And I click Create
    Then Program Name still contains "Web Development 2026"

  Scenario: Duplicate detection works immediately after same-session creation
    Given I am on the program creation form
    When I enter "Web Development 2026" as the program name
    And I fill in Description with "First creation in session"
    And I click Create
    And the modal closes
    And I click "+ New Program"
    And I enter "Web Development 2026" as the program name
    And I fill in Description with "Second creation attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And the program list contains exactly one "Web Development 2026" row

  # Edge cases

  Scenario: Case-variant duplicate name behavior is documented
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the name "web development 2026"
    And I fill in Description with "Case variant duplicate test"
    And I click Create
    Then the system either rejects the duplicate or creates a distinct program
    And the observed behavior matches the product's case-sensitivity rule

  Scenario: Program Name at maximum allowed length is accepted
    Given I am on the program creation form
    When I enter a program name exactly at the maximum allowed length
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program is created successfully
    And the program list shows the full entered name without truncation

  Scenario: Program Name exceeding maximum allowed length is rejected
    Given I am on the program creation form
    When I enter a program name one character longer than the maximum allowed length
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the form is not submitted
    And I see a validation error for Program Name

  Scenario: XSS string in Program Name is safely handled
    Given I am on the program creation form
    When I enter "<script>alert(1)</script>" as the program name
    And I fill in Description with "XSS handling test"
    And I click Create
    Then either the program is not created with an unsafe name
    Or the program list displays the name as escaped text with no script execution

  Scenario: Create button is disabled or shows loading during submission
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the Create button is disabled or shows a loading state until the request completes

  Scenario: Rapid double-click on Create does not create duplicate programs
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Full-stack web development program"
    And I double-click Create rapidly
    Then exactly one row in the program list shows "Informatique & IA - Niveau 2"

  Scenario: Program Name with internal multiple spaces is accepted
    Given I am on the program creation form
    When I enter "Cyber   Security   2026" as the program name
    And I fill in Description with "Internal spacing test"
    And I click Create
    Then the program is created successfully
    And the program list shows "Cyber   Security   2026"

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - "Fill other required fields" is not explicit; Description is assumed required based on DS-1 but not stated in DS-3.
# - Maximum length for Program Name is not defined in the AC (related defect suggests 100 characters may be relevant).
# - Expected error message text for whitespace and duplicate rejection is not specified.
# - Error placement (inline field validation vs toast vs modal banner) is not defined.
# - Case-sensitivity rule for duplicate detection is not specified.
# - Whether internal multiple spaces should be collapsed or preserved is not defined.
# - Whether leading/trailing trim applies only on submit or also disables Create proactively is not specified.
# - XSS/injection handling policy (reject vs escape) is not in the AC.
# - Create button disabled-during-submit and double-click idempotency are not in the AC.
# - Whether duplicate rejection should preserve all entered field values is not specified.
# - Post-creation list verification and form reset behavior are not explicitly required in the AC.
# - User role beyond admin and permission boundaries for non-admin users are not specified.
