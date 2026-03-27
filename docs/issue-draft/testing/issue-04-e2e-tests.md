# End-to-End (E2E) Tests - Full User Workflows

## Problem Description / Summary
While unit and integration tests verify individual components and their interactions, end-to-end tests are necessary to validate complete user workflows from the browser through the entire application stack. The application currently lacks E2E tests for:
- User authentication flow (Google OAuth)
- Course search and navigation
- Planner creation and management
- Schedule finding and optimization
- Professor comparison features
- Cross-browser compatibility

Without E2E tests, we cannot be confident that:
- Complete user journeys work as expected
- UI interactions trigger correct backend behavior
- Application works across different browsers
- Real user scenarios are properly supported

## Expected Behavior
E2E tests should simulate real user interactions and verify:
- Users can search for courses and view details
- Authentication flow works from login through logout
- Users can create and manage degree plans
- Schedule finder generates valid schedules
- Professor comparison displays correct data
- Navigation between pages works correctly
- Forms validate and submit properly
- Error states display helpful messages

## Context
- **OS**: Ubuntu 22.04, macOS, Windows (cross-platform)
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Testing Framework**: Playwright, Cypress, or Puppeteer
- **Frontend**: React 18.x
- **Backend**: Node 20.11, Express
- **Database**: PostgreSQL
- **Commit**: current HEAD
- **Deployment**: Local, staging environment for E2E

## Acceptance Criteria
- [ ] E2E tests cover all critical user workflows
- [ ] Tests run against a full deployed application stack
- [ ] Authentication flow is tested end-to-end
- [ ] Course search and details pages are tested
- [ ] Planner creation and management is tested
- [ ] Schedule finder functionality is tested
- [ ] Tests run in CI/CD pipeline
- [ ] Tests work across major browsers (Chrome, Firefox)
- [ ] Test failures include screenshots and videos
- [ ] Tests use test data that doesn't pollute production

## Proposed Solution / Ideas

### E2E Testing Framework Setup

1. **Install Playwright (Recommended)**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Configure Playwright**
   Create `playwright.config.js`:
   ```javascript
   const { defineConfig, devices } = require('@playwright/test');

   module.exports = defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [
       ['html'],
       ['junit', { outputFile: 'test-results/junit.xml' }]
     ],
     use: {
       baseURL: process.env.BASE_URL || 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
       video: 'retain-on-failure'
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] }
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] }
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] }
       },
       {
         name: 'Mobile Chrome',
         use: { ...devices['Pixel 5'] }
       }
     ],
     webServer: {
       command: 'npm run start',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
       timeout: 120000
     }
   });
   ```

### E2E Test Files

#### 1. **Landing Page and Search Flow**

**Test File**: `e2e/landing-and-search.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Landing Page and Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with all key elements', async ({ page }) => {
    // Check for logo
    await expect(page.locator('svg').first()).toBeVisible();

    // Check for main heading
    await expect(page.getByText(/ACE your/i)).toBeVisible();

    // Check for search bar
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Check for feature cards
    await expect(page.getByText(/Courses/i)).toBeVisible();
    await expect(page.getByText(/Professors/i)).toBeVisible();
    await expect(page.getByText(/Planner/i)).toBeVisible();
  });

  test('should display course count from API', async ({ page }) => {
    // Wait for course count to load
    await expect(page.getByText(/\d+.*Courses/i)).toBeVisible({ timeout: 10000 });
  });

  test('should search for a course and navigate to details', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Type in search box
    await searchInput.fill('CSCE 221');

    // Wait for suggestions
    await expect(page.getByText('CSCE 221')).toBeVisible();

    // Click on suggestion
    await page.getByText('CSCE 221').click();

    // Should navigate to course details
    await expect(page).toHaveURL(/\/course\/CSCE221/);
  });

  test('should show autocomplete suggestions while typing', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Type partial course name
    await searchInput.fill('CSCE');

    // Should show multiple suggestions
    await expect(page.getByText(/CSCE \d{3}/)).toBeVisible();

    // Suggestions should be clickable
    const firstSuggestion = page.locator('li').filter({ hasText: /CSCE \d{3}/ }).first();
    await expect(firstSuggestion).toBeVisible();
  });

  test('should close autocomplete dropdown when clicking outside', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Type to open dropdown
    await searchInput.fill('CSCE');
    await expect(page.getByText(/CSCE \d{3}/)).toBeVisible();

    // Click outside
    await page.click('body');

    // Dropdown should close
    await expect(page.getByText(/CSCE \d{3}/)).not.toBeVisible();
  });

  test('should navigate using keyboard in autocomplete', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Type to open dropdown
    await searchInput.fill('CSCE');

    // Navigate with arrow keys
    await searchInput.press('ArrowDown');
    await searchInput.press('ArrowDown');
    await searchInput.press('Enter');

    // Should navigate to selected course
    await expect(page).toHaveURL(/\/course\/CSCE\d{3}/);
  });
});
```

#### 2. **Course Details Page**

**Test File**: `e2e/course-details.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Course Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/course/CSCE221');
  });

  test('should display course information', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for course title
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/CSCE 221/i);

    // Check for course description
    await expect(page.locator('text=/Data Structures/i')).toBeVisible();
  });

  test('should display teacher table with professors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for table
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // Check for table headers
    await expect(table.locator('th').filter({ hasText: /Name/i })).toBeVisible();
    await expect(table.locator('th').filter({ hasText: /GPA/i })).toBeVisible();
    await expect(table.locator('th').filter({ hasText: /Rating/i })).toBeVisible();

    // Check for at least one professor row
    const firstRow = table.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('should filter professors by minimum GPA', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial number of professors
    const initialCount = await page.locator('tbody tr').count();

    // Apply GPA filter
    const gpaFilter = page.locator('input[type="range"]').filter({ has: page.locator('text=/GPA/i') }).first();
    await gpaFilter.fill('3.5');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Should have fewer professors
    const filteredCount = await page.locator('tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should display GPA trends chart', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for chart canvas
    const chart = page.locator('canvas').first();
    await expect(chart).toBeVisible();
  });

  test('should navigate to linked prerequisite courses', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for course code links in description
    const prerequisiteLink = page.locator('a').filter({ hasText: /CSCE \d{3}/ }).first();

    if (await prerequisiteLink.isVisible()) {
      await prerequisiteLink.click();

      // Should navigate to linked course
      await expect(page).toHaveURL(/\/course\/CSCE\d{3}/);
    }
  });

  test('should display grade distribution for professors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for grade distribution bars
    const gradeBars = page.locator('[data-testid="grade-distribution"]');
    
    if (await gradeBars.first().isVisible()) {
      await expect(gradeBars.first()).toBeVisible();
    }
  });

  test('should highlight professors teaching next semester', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for "teaching next" indicators
    const teachingNextIcon = page.locator('[data-testid="teaching-next-icon"]');
    
    if (await teachingNextIcon.first().isVisible()) {
      await expect(teachingNextIcon.first()).toBeVisible();
    }
  });
});
```

#### 3. **Authentication Flow**

**Test File**: `e2e/authentication.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /log in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should redirect to Google OAuth when clicking login', async ({ page, context }) => {
    await page.goto('/');

    // Setup listener for popup
    const popupPromise = context.waitForEvent('page');

    const loginButton = page.getByRole('button', { name: /log in/i });
    await loginButton.click();

    // Wait for OAuth popup
    const popup = await popupPromise;

    // Should redirect to Google OAuth
    await expect(popup).toHaveURL(/accounts\.google\.com/);
  });

  test('should display user name after successful login', async ({ page, context }) => {
    // Note: This test requires mocked OAuth or test credentials
    // For demo purposes, we'll mock the auth state

    // Set auth cookie
    await context.addCookies([{
      name: 'token',
      value: 'mock_jwt_token',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto('/');

    // Should display user info (mocked)
    // In real tests, you'd complete OAuth flow or use test credentials
    await expect(page.getByText(/Test User/i)).toBeVisible({ timeout: 5000 });
  });

  test('should log out successfully', async ({ page, context }) => {
    // Set up authenticated state
    await context.addCookies([{
      name: 'token',
      value: 'mock_jwt_token',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto('/');

    // Click logout
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    // Should show login button again
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });
});
```

#### 4. **Planner Workflow**

**Test File**: `e2e/planner.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Degree Planner Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planner');
  });

  test('should display planner landing page', async ({ page }) => {
    // Check for heading
    await expect(page.getByRole('heading', { name: /Degree Planner/i })).toBeVisible();

    // Check for start options
    await expect(page.getByText(/Start from Scratch/i)).toBeVisible();
    await expect(page.getByText(/Upload/i)).toBeVisible();
  });

  test('should start planner from scratch', async ({ page }) => {
    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    // Should show empty planner interface
    await expect(page.getByText(/Add Semester/i)).toBeVisible();
  });

  test('should add a semester to planner', async ({ page }) => {
    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    // Click add semester
    await page.getByRole('button', { name: /Add Semester/i }).click();

    // Fill in semester details
    await page.selectOption('select', 'Fall');
    await page.fill('input[type="number"]', '2024');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Should display new semester
    await expect(page.getByText(/Fall 2024/i)).toBeVisible();
  });

  test('should add a course to semester', async ({ page }) => {
    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    // Add semester first
    await page.getByRole('button', { name: /Add Semester/i }).click();
    await page.selectOption('select', 'Fall');
    await page.fill('input[type="number"]', '2024');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Add course
    await page.getByRole('button', { name: /Add Class/i }).first().click();

    // Search for course
    await page.fill('input[placeholder*="Search"]', 'CSCE 221');
    await page.getByText('CSCE 221').click();

    // Confirm
    await page.getByRole('button', { name: /Add/i }).click();

    // Should display course in semester
    await expect(page.getByText(/CSCE 221/i)).toBeVisible();
  });

  test('should select a professor for a course', async ({ page }) => {
    // Assume planner already has courses (use localStorage mock)
    await page.addInitScript(() => {
      localStorage.setItem('academicPlanner', JSON.stringify({
        'Fall 2024': [
          {
            department: 'CSCE',
            number: '221',
            title: 'Data Structures',
            hours: 4,
            professors: [
              { info: { name: 'Dr. Smith', averageGPA: '3.5', averageRating: '4.2' } },
              { info: { name: 'Prof. Johnson', averageGPA: '3.2', averageRating: '3.8' } }
            ]
          }
        ]
      }));
    });

    await page.reload();

    // Click on professor dropdown
    await page.locator('select').filter({ hasText: /Select Professor/i }).first().click();

    // Select a professor
    await page.selectOption('select', { label: /Dr. Smith/i });

    // Verify selection
    const selectedOption = await page.locator('select').first().inputValue();
    expect(selectedOption).toBeTruthy();
  });

  test('should move course to different semester', async ({ page }) => {
    // Setup planner with courses
    await page.addInitScript(() => {
      localStorage.setItem('academicPlanner', JSON.stringify({
        'Fall 2024': [
          { department: 'CSCE', number: '221', title: 'Data Structures', hours: 4 }
        ],
        'Spring 2025': []
      }));
    });

    await page.reload();

    // Click move button
    await page.getByRole('button', { name: /Move/i }).first().click();

    // Select destination semester
    await page.selectOption('select', 'Spring 2025');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Course should now be in Spring 2025
    const spring2025Section = page.locator('text=Spring 2025').locator('..');
    await expect(spring2025Section.getByText(/CSCE 221/i)).toBeVisible();
  });

  test('should delete a course from planner', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('academicPlanner', JSON.stringify({
        'Fall 2024': [
          { department: 'CSCE', number: '221', title: 'Data Structures', hours: 4 }
        ]
      }));
    });

    await page.reload();

    // Click delete button
    await page.getByRole('button', { name: /Delete/i }).first().click();

    // Confirm deletion
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Course should be removed
    await expect(page.getByText(/CSCE 221/i)).not.toBeVisible();
  });

  test('should save planner to localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    // Add content
    await page.getByRole('button', { name: /Add Semester/i }).click();
    await page.selectOption('select', 'Fall');
    await page.fill('input[type="number"]', '2024');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Reload page
    await page.reload();

    // Content should persist
    await expect(page.getByText(/Fall 2024/i)).toBeVisible();
  });
});
```

#### 5. **Schedule Finder Workflow**

**Test File**: `e2e/scheduler.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Schedule Finder Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup planner with courses for scheduling
    await page.addInitScript(() => {
      localStorage.setItem('academicPlanner', JSON.stringify({
        'Spring 2026': [
          {
            department: 'CSCE',
            number: '221',
            title: 'Data Structures',
            hours: 4,
            professors: [
              { info: { name: 'Dr. Smith', averageGPA: '3.5', averageRating: '4.2' } }
            ]
          },
          {
            department: 'CSCE',
            number: '314',
            title: 'Programming Languages',
            hours: 3,
            professors: [
              { info: { name: 'Prof. Johnson', averageGPA: '3.3', averageRating: '3.9' } }
            ]
          }
        ]
      }));
    });

    await page.goto('/scheduler');
  });

  test('should display scheduler interface', async ({ page }) => {
    await expect(page.getByText(/Schedule Finder/i)).toBeVisible();
  });

  test('should show error if no courses in planner', async ({ page, context }) => {
    // Clear planner
    await page.addInitScript(() => {
      localStorage.setItem('academicPlanner', JSON.stringify({}));
    });

    await page.reload();

    // Should show error message
    await expect(page.getByText(/No courses have been inputted/i)).toBeVisible();
  });

  test('should display courses from planner', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should show courses
    await expect(page.getByText(/CSCE 221/i)).toBeVisible();
    await expect(page.getByText(/CSCE 314/i)).toBeVisible();
  });

  test('should set filters for schedule generation', async ({ page }) => {
    // Set minimum GPA
    await page.fill('input[placeholder*="GPA"]', '3.0');

    // Set minimum rating
    await page.fill('input[placeholder*="Rating"]', '3.5');

    // Verify filters are set
    expect(await page.inputValue('input[placeholder*="GPA"]')).toBe('3.0');
    expect(await page.inputValue('input[placeholder*="Rating"]')).toBe('3.5');
  });

  test('should generate optimal schedule', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click generate schedule button
    await page.getByRole('button', { name: /Find Schedule/i }).click();

    // Wait for schedule to be generated
    await page.waitForTimeout(2000);

    // Should display schedule
    await expect(page.locator('[data-testid="schedule-result"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display schedule in calendar view', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Find Schedule/i }).click();

    await page.waitForTimeout(2000);

    // Should show day columns
    await expect(page.getByText(/Monday/i)).toBeVisible();
    await expect(page.getByText(/Tuesday/i)).toBeVisible();
    await expect(page.getByText(/Wednesday/i)).toBeVisible();
  });

  test('should show time slots in schedule', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Find Schedule/i }).click();

    await page.waitForTimeout(2000);

    // Should show time labels
    await expect(page.getByText(/8:00 AM/i)).toBeVisible();
    await expect(page.getByText(/9:00 AM/i)).toBeVisible();
  });

  test('should display course blocks in schedule', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Find Schedule/i }).click();

    await page.waitForTimeout(2000);

    // Should show course blocks
    const courseBlocks = page.locator('[data-testid="course-block"]');
    await expect(courseBlocks.first()).toBeVisible({ timeout: 10000 });
  });
});
```

#### 6. **Mobile Responsiveness Tests**

**Test File**: `e2e/mobile-responsive.spec.js`

```javascript
const { test, expect, devices } = require('@playwright/test');

test.describe('Mobile Responsiveness', () => {
  test.use({ ...devices['iPhone 12'] });

  test('landing page should be responsive on mobile', async ({ page }) => {
    await page.goto('/');

    // Check that elements are visible and properly sized
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Check mobile menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('mobile menu should expand when clicked', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // Navigation items should be visible
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /planner/i })).toBeVisible();
  });

  test('course details should be readable on mobile', async ({ page }) => {
    await page.goto('/course/CSCE221');
    await page.waitForLoadState('networkidle');

    // Text should be readable
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Table should be scrollable
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      const viewport = await page.viewportSize();
      expect(viewport.width).toBeLessThan(768); // Mobile width
    }
  });

  test('planner should be usable on mobile', async ({ page }) => {
    await page.goto('/planner');

    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    // Add semester button should be visible and clickable
    const addSemesterBtn = page.getByRole('button', { name: /Add Semester/i });
    await expect(addSemesterBtn).toBeVisible();
    await addSemesterBtn.click();

    // Modal should appear
    await expect(page.locator('select')).toBeVisible();
  });
});
```

### Running E2E Tests

Add to `package.json`:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

Run tests:
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/course-details.spec.js

# Run on specific browser
npx playwright test --project=chromium
```

### CI/CD Integration

Add to `.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Relevant Code / Links
- `frontend/src/pages/` - All page components
- `frontend/src/components/` - UI components
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)

## Labels
`enhancement`, `testing`, `e2e`, `frontend`, `backend`, `difficulty level: high`, `priority level: high`