Feature: DS-4 — Delete program with confirmation
  As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Delete program with confirmation
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Confirmation dialog shows the correct program name
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then the confirmation dialog references "Test Program"

  Scenario: Deleted program does not reappear after page reload
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    And I reload the browser on the Programs page
    Then "Test Program" is not shown in the program list

  Scenario: Delete icon is visible and targets the correct program row
    Given a program "Test Program" exists
    And a program "Data Science 2026" exists
    When I click the delete icon for "Data Science 2026"
    Then I see a confirmation dialog
    And the confirmation dialog references "Data Science 2026"
    And "Test Program" still exists in the list

  Scenario: Multiple sequential deletions update the list immediately
    Given a program "Test Program A" exists
    And a program "Test Program B" exists
    And a program "Test Program C" exists
    When I delete "Test Program A" with confirmation
    And I delete "Test Program B" with confirmation
    Then "Test Program A" is removed from the program list
    And "Test Program B" is removed from the program list
    And "Test Program C" still exists in the program list

  Scenario: List updates within 2 seconds after confirmed deletion
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list within 2 seconds without a full-page reload

  # Negative

  Scenario: Cancel program deletion
    Given I click the delete icon for a program
    When I see the confirmation dialog
    And I click Cancel
    Then the program still exists in the list

  Scenario: Program is not removed before user confirms
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I have not confirmed deletion
    Then "Test Program" still exists in the program list
    And no delete request is sent to the server

  Scenario: Dismiss confirmation without confirming keeps the program
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I dismiss the confirmation dialog without confirming
    Then "Test Program" still exists in the program list

  Scenario: Backend failure during deletion keeps the program in the list
    Given a program "Test Program" exists
    And the delete-program API returns an error
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then I see an error notification
    And "Test Program" still exists in the program list

  Scenario: Deletion of program with dependent records is handled safely
    Given a program "Test Program" exists
    And "Test Program" is linked to courses, enrollments, or other child records
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then either deletion is blocked with a clear message
    Or dependent records are handled according to business rules without orphaned data

  # Edge cases

  Scenario: Deleting the last remaining program triggers the empty state
    Given only one program "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And I see an empty-state message prompting me to create the first program

  Scenario: Rapid double-click on Confirm sends only one delete request
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I double-click Confirm rapidly
    Then "Test Program" is removed from the program list
    And exactly one delete request is sent

  Scenario: Rapid double-click on delete icon opens only one confirmation dialog
    Given a program "Test Program" exists
    When I double-click the delete icon for "Test Program" rapidly
    Then I see one confirmation dialog
    And "Test Program" still exists in the list until I confirm deletion

  Scenario: Deleted program name can be reused for a new program
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    And I click "+ New Program"
    And I enter "Test Program" as the program name
    And I fill in Description with "Recreated after deletion"
    And I click Create
    Then the program list shows "Test Program"

  Scenario: List count or pagination adjusts after deletion when applicable
    Given the Programs page displays a total program count or uses pagination
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then the displayed program count decrements by one
    And pagination does not leave an empty page

  Scenario: No undo or recovery is available after confirmed deletion
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And no undo action restores "Test Program"

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Confirmation dialog type is not specified (native browser dialog vs custom modal).
# - Exact confirmation dialog copy and whether Cancel is a labeled button or dismiss action are not defined.
# - Expected behavior when deleting the last program (empty state) is not in the AC.
# - Timing expectation for list update after deletion is not quantified.
# - Double-click protection on Confirm and delete icon is not in the AC.
# - Deletion persistence after browser reload is not explicitly required in the AC.
# - Behavior for programs with dependent child records (block vs cascade) is not defined.
# - Backend/API failure handling is not defined.
# - Whether deleted program names can be immediately reused is not specified.
# - List count, pagination, and undo/recovery behavior are not in the AC.
# - User role beyond admin and permission boundaries for non-admin users are not specified.
