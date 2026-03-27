# Frontend Unit Tests - Components and Utilities

## Problem Description / Summary
The frontend currently has no unit tests for React components, utility functions, hooks, or context providers. This creates significant risk when refactoring, makes it difficult to catch UI bugs early, and slows down development velocity. Without tests, developers cannot confidently modify components without manually testing every interaction.

Frontend unit tests are essential for:
- Validating component rendering and props
- Testing user interactions and event handlers
- Verifying state management logic
- Catching regressions in UI behavior
- Enabling safe refactoring of components
- Documenting component APIs through tests

## Expected Behavior
All React components, custom hooks, and utility functions should have comprehensive unit test coverage with:
- Tests for component rendering with various props
- Tests for user interactions (clicks, input changes, form submissions)
- Tests for conditional rendering logic
- Tests for custom hooks and state management
- Mocked API calls and external dependencies
- At least 80% code coverage for components

## Context
- **OS**: Ubuntu 22.04, macOS, Windows (cross-platform)
- **Runtime**: Node 20.11
- **Testing Framework**: Jest, React Testing Library, Vitest
- **React Version**: 18.x
- **Build Tool**: Webpack
- **Commit**: current HEAD
- **Deployment**: Local, CI/CD pipeline

## Acceptance Criteria
- [ ] All major components have unit tests (`frontend/src/components/*.js`)
- [ ] All page components have unit tests (`frontend/src/pages/*.js`)
- [ ] Custom hooks have unit tests
- [ ] Context providers are tested
- [ ] User interactions are tested (clicks, inputs, navigation)
- [ ] Test suite runs successfully with `npm test`
- [ ] Code coverage report shows >80% coverage
- [ ] Tests are isolated and do not depend on backend API
- [ ] CI/CD pipeline runs frontend tests on every commit

## Proposed Solution / Ideas

### Testing Framework Setup
1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
   ```

2. **Configure Jest**
   Create `jest.config.js`:
   ```javascript
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
     moduleNameMapper: {
       '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
       '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
     },
     transform: {
       '^.+\\.(js|jsx)$': 'babel-jest'
     },
     collectCoverageFrom: [
       'src/**/*.{js,jsx}',
       '!src/index.js',
       '!src/reportWebVitals.js'
     ]
   };
   ```

3. **Create Setup File**
   Create `frontend/src/setupTests.js`:
   ```javascript
   import '@testing-library/jest-dom';
   ```

### Files That Need Unit Tests

#### 1. `frontend/src/components/Navbar.js`

**Test File**: `frontend/src/components/Navbar.test.js`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as useAllCourses from '../hooks/useAllCourses';

// Mock dependencies
jest.mock('../hooks/useAllCourses');

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    // Mock fetch for auth API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ user: null })
      })
    );

    useAllCourses.getAllCourses = jest.fn(() =>
      Promise.resolve(new Set(['CSCE 121', 'CSCE 221']))
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render navbar with logo', () => {
    renderNavbar();
    
    const logo = screen.getByRole('img', { hidden: true });
    expect(logo).toBeInTheDocument();
  });

  it('should display login button when user is not authenticated', async () => {
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });
  });

  it('should display user name when authenticated', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          user: { name: 'John Doe', email: 'john@example.com' }
        })
      })
    );

    renderNavbar();

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  it('should toggle mobile menu when menu button is clicked', () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Check if mobile menu is visible
    expect(screen.getByText(/Home/i)).toBeVisible();
  });

  it('should navigate to home when logo is clicked', () => {
    renderNavbar();

    const logoLink = screen.getAllByRole('link')[0];
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should call logout API when logout button is clicked', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          user: { name: 'John Doe', email: 'john@example.com' }
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ ok: true })
      });

    renderNavbar();

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
```

#### 2. `frontend/src/components/LoginButton.js`

**Test File**: `frontend/src/components/LoginButton.test.js`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from './LoginButton';

describe('LoginButton Component', () => {
  it('should render login button with correct text', () => {
    render(<LoginButton />);
    
    const button = screen.getByRole('button', { name: /log in/i });
    expect(button).toBeInTheDocument();
  });

  it('should redirect to auth URL when clicked', () => {
    const authUrl = 'http://localhost:4000/auth/google';
    delete window.location;
    window.location = { href: '' };

    render(<LoginButton authUrl={authUrl} />);

    const button = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(button);

    expect(window.location.href).toBe(authUrl);
  });

  it('should use default auth URL if none provided', () => {
    delete window.location;
    window.location = { href: '' };

    render(<LoginButton />);

    const button = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(button);

    expect(window.location.href).toContain('/auth/google');
  });

  it('should have correct accessibility attributes', () => {
    render(<LoginButton />);

    const button = screen.getByRole('button', { name: /log in/i });
    expect(button).toHaveAttribute('aria-label', 'Log in');
    expect(button).toHaveAttribute('title', 'Log in');
  });
});
```

#### 3. `frontend/src/components/TeacherTable.js`

**Test File**: `frontend/src/components/TeacherTable.test.js`

```javascript
import { render, screen, fireEvent, within } from '@testing-library/react';
import TeacherTable from './TeacherTable';

const mockTeachers = [
  {
    id: 1,
    name: 'Dr. Smith',
    avgGpa: 3.5,
    rating: 4.2,
    wouldTakeAgain: 85,
    difficulty: 3.0,
    teachingNext: true,
    grades: { A: 50, B: 30, C: 15, D: 3, F: 2 }
  },
  {
    id: 2,
    name: 'Prof. Johnson',
    avgGpa: 3.2,
    rating: 3.8,
    wouldTakeAgain: 70,
    difficulty: 3.8,
    teachingNext: false,
    grades: { A: 30, B: 40, C: 20, D: 7, F: 3 }
  }
];

describe('TeacherTable Component', () => {
  it('should render all teachers in the table', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Prof. Johnson')).toBeInTheDocument();
  });

  it('should display GPA with correct color coding', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    const smithGpa = screen.getByText('3.50');
    expect(smithGpa).toHaveClass('bg-emerald-dark'); // High GPA
  });

  it('should display rating with correct styling', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('3.8')).toBeInTheDocument();
  });

  it('should show teaching next indicator for relevant professors', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    const smithRow = screen.getByText('Dr. Smith').closest('tr');
    expect(within(smithRow).getByTestId('teaching-next-icon')).toBeInTheDocument();
  });

  it('should filter teachers by minimum GPA', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    const gpaFilter = screen.getByLabelText(/minimum gpa/i);
    fireEvent.change(gpaFilter, { target: { value: '3.4' } });

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Prof. Johnson')).not.toBeInTheDocument();
  });

  it('should filter teachers by minimum rating', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    const ratingFilter = screen.getByLabelText(/minimum rating/i);
    fireEvent.change(ratingFilter, { target: { value: '4.0' } });

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Prof. Johnson')).not.toBeInTheDocument();
  });

  it('should display grade distribution correctly', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    // Check that grade bars are rendered
    const gradeBars = screen.getAllByTestId('grade-distribution');
    expect(gradeBars).toHaveLength(2);
  });

  it('should sort teachers with teachingNext first', () => {
    render(<TeacherTable teachers={mockTeachers} />);

    const rows = screen.getAllByRole('row');
    // First row is header, second should be Dr. Smith (teachingNext: true)
    expect(within(rows[1]).getByText('Dr. Smith')).toBeInTheDocument();
  });
});
```

#### 4. `frontend/src/components/GPATrendsChart.js`

**Test File**: `frontend/src/components/GPATrendsChart.test.js`

```javascript
import { render, screen } from '@testing-library/react';
import GPATrendsChart from './GPATrendsChart';

const mockTeachers = [
  {
    name: 'Dr. Smith',
    gpaHistory: {
      'Fall 2022': [3.5, 3.6],
      'Spring 2023': [3.7]
    }
  },
  {
    name: 'Prof. Johnson',
    gpaHistory: {
      'Fall 2022': [3.2],
      'Spring 2023': [3.3, 3.4]
    }
  }
];

const mockTimePeriods = ['Fall 2022', 'Spring 2023'];

describe('GPATrendsChart Component', () => {
  it('should render chart with teacher data', () => {
    render(<GPATrendsChart teachers={mockTeachers} timePeriods={mockTimePeriods} />);

    // Chart.js canvas should be rendered
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('should handle empty teacher list', () => {
    render(<GPATrendsChart teachers={[]} timePeriods={mockTimePeriods} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should calculate average GPA for multiple sections', () => {
    const { container } = render(
      <GPATrendsChart teachers={mockTeachers} timePeriods={mockTimePeriods} />
    );

    // Dr. Smith's Fall 2022 average should be (3.5 + 3.6) / 2 = 3.55
    // This would be tested by checking the chart data structure
    expect(container).toBeTruthy();
  });

  it('should skip null GPA values', () => {
    const teachersWithNull = [
      {
        name: 'Dr. Test',
        gpaHistory: {
          'Fall 2022': [null, 3.5],
          'Spring 2023': [3.6]
        }
      }
    ];

    render(<GPATrendsChart teachers={teachersWithNull} timePeriods={mockTimePeriods} />);

    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('should display teacher last names in legend', () => {
    render(<GPATrendsChart teachers={mockTeachers} timePeriods={mockTimePeriods} />);

    // Legend should show last names
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('Johnson')).toBeInTheDocument();
  });
});
```

#### 5. `frontend/src/pages/Landing.js`

**Test File**: `frontend/src/pages/Landing.test.js`

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from './Landing';
import * as useAllCourses from '../hooks/useAllCourses';
import * as useAllProfs from '../hooks/useAllProfs';

jest.mock('../hooks/useAllCourses');
jest.mock('../hooks/useAllProfs');

const renderLanding = () => {
  return render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
};

describe('Landing Page', () => {
  beforeEach(() => {
    useAllCourses.getAllCourses = jest.fn(() =>
      Promise.resolve(new Set(Array(525).fill('CSCE 121')))
    );
    useAllProfs.getAllProfs = jest.fn(() =>
      Promise.resolve(new Set(Array(450).fill('Dr. Smith')))
    );
  });

  it('should render main heading with typing animation', async () => {
    renderLanding();

    await waitFor(() => {
      expect(screen.getByText(/ACE your/i)).toBeInTheDocument();
    });
  });

  it('should display course count from API', async () => {
    renderLanding();

    await waitFor(() => {
      expect(screen.getByText(/525.*Courses/i)).toBeInTheDocument();
    });
  });

  it('should display professor count from API', async () => {
    renderLanding();

    await waitFor(() => {
      expect(screen.getByText(/450.*Professors/i)).toBeInTheDocument();
    });
  });

  it('should render search component', () => {
    renderLanding();

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render logo', () => {
    renderLanding();

    const logo = screen.getByRole('img', { hidden: true });
    expect(logo).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    renderLanding();

    expect(screen.getByText(/Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Professors/i)).toBeInTheDocument();
    expect(screen.getByText(/Planner/i)).toBeInTheDocument();
  });
});
```

#### 6. `frontend/src/pages/CourseDetails.js`

**Test File**: `frontend/src/pages/CourseDetails.test.js`

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CourseDetails from './CourseDetails';

const mockCourseData = {
  info: {
    department: 'CSCE',
    number: 221,
    title: 'Data Structures & Algorithms',
    description: 'Introduction to data structures...'
  },
  professors: [12345, 67890],
  sections: {
    'Fall 2022': [
      {
        section: 500,
        prof: 'Dr. Smith',
        prof_id: 12345,
        gpa: 3.5,
        A: 20, B: 15, C: 5, D: 0, F: 0
      }
    ]
  }
};

const renderCourseDetails = (courseId = 'CSCE221') => {
  return render(
    <BrowserRouter initialEntries={[`/course/${courseId}`]}>
      <Routes>
        <Route path="/course/:courseId" element={<CourseDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('CourseDetails Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCourseData)
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render course title', async () => {
    renderCourseDetails();

    await waitFor(() => {
      expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument();
    });
  });

  it('should render course description', async () => {
    renderCourseDetails();

    await waitFor(() => {
      expect(screen.getByText(/Introduction to data structures/i)).toBeInTheDocument();
    });
  });

  it('should display teacher table with professor data', async () => {
    renderCourseDetails();

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  it('should render GPA trends chart', async () => {
    renderCourseDetails();

    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });
  });

  it('should linkify course codes in description', async () => {
    const dataWithLinks = {
      ...mockCourseData,
      info: {
        ...mockCourseData.info,
        description: 'Prerequisite: CSCE 121 or CSCE 120'
      }
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(dataWithLinks)
      })
    );

    renderCourseDetails();

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /CSCE 121/i });
      expect(link).toHaveAttribute('href', '/course/CSCE121');
    });
  });

  it('should show loading state initially', () => {
    renderCourseDetails();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API error'))
    );

    renderCourseDetails();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### 7. `frontend/src/components/Search.js` (AutoCompleteSearch)

**Test File**: `frontend/src/components/Search.test.js`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AutoCompleteSearch from './Search';
import * as useAllCourses from '../hooks/useAllCourses';

jest.mock('../hooks/useAllCourses');

const renderSearch = () => {
  return render(
    <BrowserRouter>
      <AutoCompleteSearch />
    </BrowserRouter>
  );
};

describe('AutoCompleteSearch Component', () => {
  beforeEach(() => {
    useAllCourses.getAllCourses = jest.fn(() =>
      Promise.resolve(new Set(['CSCE 121', 'CSCE 221', 'CSCE 314', 'MATH 151']))
    );
  });

  it('should render search input', async () => {
    renderSearch();

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  it('should display matching courses as user types', async () => {
    renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE' } });

    await waitFor(() => {
      expect(screen.getByText('CSCE 121')).toBeInTheDocument();
      expect(screen.getByText('CSCE 221')).toBeInTheDocument();
    });
  });

  it('should filter courses based on input', async () => {
    renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE 22' } });

    await waitFor(() => {
      expect(screen.getByText('CSCE 221')).toBeInTheDocument();
      expect(screen.queryByText('CSCE 121')).not.toBeInTheDocument();
    });
  });

  it('should navigate to course details on selection', async () => {
    const { container } = renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE' } });

    await waitFor(() => {
      const suggestion = screen.getByText('CSCE 221');
      fireEvent.click(suggestion);
    });

    // Navigation would be tested with router mock
    expect(container).toBeTruthy();
  });

  it('should close dropdown when clicking outside', async () => {
    renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE' } });

    await waitFor(() => {
      expect(screen.getByText('CSCE 221')).toBeInTheDocument();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('CSCE 221')).not.toBeInTheDocument();
    });
  });

  it('should support keyboard navigation', async () => {
    renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE' } });

    await waitFor(() => {
      expect(screen.getByText('CSCE 121')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should navigate to first result
  });

  it('should limit results to 10 items', async () => {
    const manyCourses = new Set(Array.from({ length: 50 }, (_, i) => `CSCE ${i}`));
    useAllCourses.getAllCourses = jest.fn(() => Promise.resolve(manyCourses));

    renderSearch();

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'CSCE' } });

    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeLessThanOrEqual(10);
    });
  });
});
```

### Custom Hooks Testing

#### 8. `frontend/src/hooks/useSearchData.js` (if it exists)

**Test File**: `frontend/src/hooks/useSearchData.test.js`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchData } from './useSearchData';

describe('useSearchData Hook', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch course data successfully', async () => {
    const mockData = { course: 'CSCE 221', professors: [] };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const { result } = renderHook(() => useSearchData('department=CSCE&courseNumber=221'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSearchData('department=CSCE&courseNumber=221'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### Context Testing

#### 9. `frontend/src/context/search.js`

**Test File**: `frontend/src/context/search.test.js`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchContextProvider, SearchContext } from './search';
import { useContext } from 'react';

const TestComponent = () => {
  const { comparedCards, setComparedCards } = useContext(SearchContext);

  return (
    <div>
      <div data-testid="compared-count">{comparedCards.length}</div>
      <button onClick={() => setComparedCards(['CSCE221_12345'])}>
        Add Card
      </button>
    </div>
  );
};

describe('SearchContext', () => {
  it('should provide default values', () => {
    render(
      <SearchContextProvider>
        <TestComponent />
      </SearchContextProvider>
    );

    expect(screen.getByTestId('compared-count').textContent).toBe('0');
  });

  it('should update compared cards', () => {
    render(
      <SearchContextProvider>
        <TestComponent />
      </SearchContextProvider>
    );

    const button = screen.getByRole('button', { name: /add card/i });
    fireEvent.click(button);

    expect(screen.getByTestId('compared-count').textContent).toBe('1');
  });
});
```

### Coverage Goals
- **Components**: 85% line coverage
- **Pages**: 80% line coverage
- **Hooks**: 90% line coverage
- **Utilities**: 95% line coverage

### Running Tests
```bash
# Run all frontend tests
npm run test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/components/Navbar.test.js
```

## Relevant Code / Links
- `frontend/src/components/` - All React components
- `frontend/src/pages/` - Page components
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/context/` - Context providers
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Labels
`enhancement`, `testing`, `frontend`, `difficulty level: high`, `priority level: high`