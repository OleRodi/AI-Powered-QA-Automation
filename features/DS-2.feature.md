Feature: DS-2 — Edit existing program details
  As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

  # Happy paths

  Scenario: Open program for editing
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with the program's current data

  Scenario: Edit form pre-populates every visible field with current data
    Given I am on the Programs page
    And a program "Web Development 2026" with description "Full-stack web development program" exists
    When I click the edit icon on "Web Development 2026"
    Then Program Name shows "Web Development 2026"
    And Description shows "Full-stack web development program"
    And every other visible field shows its current stored value

  Scenario: Edit icon is visible and opens the correct program
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    And a program "Data Science 2026" exists
    When I click the edit icon on "Data Science 2026"
    Then I see the edit form for "Edit Program"
    And Program Name shows "Data Science 2026"

  Scenario: Successfully edit a program name
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"

  Scenario: Program list updates within 2 seconds after save
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes within 2 seconds
    And the program list shows "Web Development 2026 - Updated" within 2 seconds without a full-page reload

  Scenario: Edit preserves unchanged fields
    Given I am editing a program
    When I only change the Description to "Updated description for evening and weekend learners"
    And I click Save
    Then the Name and other fields remain unchanged

  Scenario: Updated name persists after browser reload
    Given I am editing "Web Development 2026"
    And I change the Name to "Web Development 2026 - Updated"
    And I click Save
    When I reload the browser on the Programs page
    Then the program list shows "Web Development 2026 - Updated"

  Scenario: Updated Description persists after browser reload
    Given I am editing "Web Development 2026"
    When I only change the Description to "Verified persistence of description field"
    And I click Save
    And I reload the browser on the Programs page
    And I click the edit icon on "Web Development 2026"
    Then Description shows "Verified persistence of description field"

  Scenario: Multiple fields can be edited in a single save
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Multi"
    And I change the Description to "Multi-field update test"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026 - Multi"
    And reopening the edit form shows Name "Web Development 2026 - Multi"
    And reopening the edit form shows Description "Multi-field update test"

  # Negative

  Scenario: Save is blocked when Name is cleared
    Given I am editing "Web Development 2026"
    When I clear the Name field
    Then the Save button is disabled

  Scenario: Save is blocked when Name contains only whitespace
    Given I am editing "Web Development 2026"
    When I change the Name to "   "
    Then the Save button is disabled

  Scenario: Duplicate program name is rejected on edit
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    And a program "Data Science 2026" exists
    When I click the edit icon on "Web Development 2026"
    And I change the Name to "Data Science 2026"
    And I click Save
    Then the modal remains open
    And I see a duplicate-name validation error
    And the program list still shows "Web Development 2026"
    And the program list does not show a second "Data Science 2026" row

  Scenario: Cancel discards unsaved changes
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Draft"
    And I change the Description to "Should not persist"
    And I click Cancel
    Then the modal closes
    And the program list shows "Web Development 2026"
    And reopening the edit form shows the original Name and Description

  Scenario: Backend failure keeps modal open and preserves entered values
    Given I am editing "Web Development 2026"
    And the update-program API returns an error
    When I change the Description to "Should not persist due to API error"
    And I click Save
    Then the modal remains open
    And Description still contains "Should not persist due to API error"
    And the program list still shows "Web Development 2026"

  Scenario: Stale list data is not shown after a successful name edit
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list does not still show "Web Development 2026"

  # Edge cases

  Scenario: Name accepts valid special characters on edit
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026: Front-End & API (Evening)"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026: Front-End & API (Evening)"

  Scenario: Leading and trailing spaces in Name are trimmed on save
    Given I am editing "Web Development 2026"
    When I change the Name to "   Web Development 2026 - Updated   "
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026 - Updated"

  Scenario: Name at maximum allowed length is accepted
    Given I am editing "Web Development 2026"
    When I change the Name to a value exactly at the maximum allowed length
    And I click Save
    Then the modal closes
    And the program list shows the full entered Name without truncation

  Scenario: Name exceeding maximum allowed length is rejected
    Given I am editing "Web Development 2026"
    When I change the Name to a value one character longer than the maximum allowed length
    And I click Save
    Then the modal remains open
    And I see a validation error for Name
    And the program list still shows "Web Development 2026"

  Scenario: Empty Description is saved when Description is optional
    Given I am editing "Web Development 2026"
    When I clear the Description field
    And I click Save
    Then the modal closes
    And reopening the edit form shows an empty Description

  Scenario: Empty Description is blocked when Description is required
    Given I am editing "Web Development 2026"
    And Description is a required field
    When I clear the Description field
    Then the Save button is disabled

  Scenario: Save with no field changes does not alter program data
    Given I am editing "Web Development 2026"
    When I click Save without changing any field
    Then the program list still shows "Web Development 2026"
    And reopening the edit form shows the original Name and Description
    And no duplicate program row is created

  Scenario: Rapid double-click on Save does not send duplicate updates
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I double-click Save rapidly
    Then the modal closes
    And exactly one row in the program list shows "Web Development 2026 - Updated"

  Scenario: Concurrent edit conflict is handled safely
    Given Session A and Session B are both editing "Web Development 2026"
    When Session A changes the Name to "Concurrent A" and clicks Save
    And Session B changes the Description to "Concurrent B" and clicks Save
    Then the system rejects the stale update or merges safely
    And Session A's Name change is not silently overwritten without warning

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - The AC references "Name" but the form field label may be "Program Name"; mapping is assumed but not explicit.
# - Which fields beyond Name and Description exist in the edit form is not specified.
# - Maximum length and allowed character set for Name and Description are not defined.
# - Duplicate-name rule is not stated (case-sensitive vs case-insensitive, trimmed comparison unknown).
# - Expected duplicate-name error message text and placement (inline vs toast) are not defined.
# - "Immediately" is not quantified in the AC (2 seconds used as a reasonable test threshold).
# - Cancel / dismiss behavior (Cancel button vs X close) is not in the AC.
# - Backend/API failure handling is not defined.
# - Whether Description is required or optional is not specified.
# - Save behavior when no fields are changed is not defined (allowed, disabled, or no-op).
# - Double-click / idempotency on Save is not in the AC.
# - Whether leading/trailing whitespace in Name should be trimmed is not specified.
# - Persistence after browser reload is not explicitly required in the AC.
# - Concurrent edit behavior (last-write-wins vs conflict message) is not defined.
# - User role beyond admin and permission boundaries for non-admin users are not specified.
