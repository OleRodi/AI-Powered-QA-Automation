Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: getByLabel('Email')
  - Password field: getByLabel('Password')
  - Sign In button: getByRole('button', { name: 'Sign In' })
- Programs page: /programs
  - "New Program" button: getByRole('button', { name: 'New Program' })
  - Modal form:
    - Program Name: getByLabel('Program Name')
    - Description: getByLabel('Description')
    - Create button: getByRole('button', { name: 'Create' })

## Credentials

Use dotenv. Read email and password from process.env:

- process.env.DIDAXIS_EMAIL
- process.env.DIDAXIS_PASSWORD
Do NOT hardcode credentials in the test file.

## Test plan

### TC-001
- **Title:** Edit form opens with existing program data pre-populated  
- **Preconditions:**  
  - User is logged in with edit permission  
  - Program `Web Development 2026` exists in list with baseline data  
- **Steps:**  
  1. Navigate to `Programs` page.  
  2. Locate row for `Web Development 2026`.  
  3. Click the edit icon for that row.  
- **Expected Result:**  
  - Edit modal/form opens.  
  - Fields are pre-populated exactly with current values (`Name`, `Description`, `Program Code`, `Delivery Mode`, `Max Students`).  

## Requirements

- TypeScript
- Use Playwright locators (getByRole, getByLabel, getByText)
- Login as the first step in each test (or use beforeEach)
- Each test is independent
- Use unique test data with Date.now() suffix
- Save as tests/ds1-create-program.spec.ts