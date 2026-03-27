# Backend Unit Tests - Controllers, Services, and Utilities

## Problem Description / Summary
The backend currently lacks comprehensive unit tests for controllers, services, database queries, and utility functions. This makes it difficult to catch bugs early, refactor safely, and ensure that individual components work correctly in isolation. Without unit tests, developers cannot confidently modify code without fear of breaking existing functionality.

Unit tests are critical for:
- Validating business logic in isolation
- Catching regressions early in development
- Enabling safe refactoring
- Documenting expected behavior through test cases
- Reducing debugging time during development

## Expected Behavior
All backend controllers, services, and utility functions should have comprehensive unit test coverage with:
- Tests for success paths (happy paths)
- Tests for error conditions and edge cases
- Mocked database calls to isolate logic
- Clear test descriptions and assertions
- At least 80% code coverage for critical paths

## Context
- **OS**: Ubuntu 22.04, macOS, Windows (cross-platform)
- **Runtime**: Node 20.11
- **Testing Framework**: Mocha, Jest, or Vitest
- **Mocking Library**: Sinon.js or Jest mocks
- **Database**: PostgreSQL (needs to be mocked for unit tests)
- **Commit**: current HEAD
- **Deployment**: Local, CI/CD pipeline

## Acceptance Criteria
- [ ] All controller functions have unit tests (`backend/controllers/*.js`)
- [ ] All service functions have unit tests (if services exist)
- [ ] Database query logic is tested with mocked database connections
- [ ] Authentication middleware is tested
- [ ] Error handling paths are covered in tests
- [ ] Test suite runs successfully with `npm test`
- [ ] Code coverage report shows >80% coverage for controllers
- [ ] Tests are isolated and do not depend on external services
- [ ] CI/CD pipeline runs tests on every commit

## Proposed Solution / Ideas

### Testing Framework Setup
1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev mocha chai sinon supertest nyc
   ```
   Or for Jest:
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Configure Test Runner**
   Add to `package.json`:
   ```json
   "scripts": {
     "test": "mocha backend/**/*.test.js --exit",
     "test:coverage": "nyc npm test",
     "test:watch": "mocha backend/**/*.test.js --watch"
   }
   ```

### Files That Need Unit Tests

#### 1. `backend/controllers/course.js`
**Function**: `getAllCourses`

**Test File**: `backend/controllers/course.test.js`

```javascript
const { expect } = require('chai');
const sinon = require('sinon');
const { getAllCourses } = require('./course');
const pool = require('../db');

describe('Course Controller - getAllCourses', () => {
  let mockClient;
  let req, res;

  beforeEach(() => {
    mockClient = {
      query: sinon.stub(),
      release: sinon.stub()
    };
    sinon.stub(pool, 'connect').resolves(mockClient);
    
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all course IDs successfully', async () => {
    const mockRows = [
      { id: 'CSCE_121' },
      { id: 'CSCE_221' },
      { id: 'MATH_151' }
    ];
    mockClient.query.resolves({ rows: mockRows });

    await getAllCourses(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(['CSCE_121', 'CSCE_221', 'MATH_151'])).to.be.true;
    expect(mockClient.release.called).to.be.true;
  });

  it('should handle database errors gracefully', async () => {
    const error = new Error('Database connection failed');
    mockClient.query.rejects(error);

    await getAllCourses(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ error })).to.be.true;
    expect(mockClient.release.called).to.be.true;
  });

  it('should return empty array when no courses exist', async () => {
    mockClient.query.resolves({ rows: [] });

    await getAllCourses(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith([])).to.be.true;
  });
});
```

#### 2. `backend/controllers/professor.js`
**Function**: `getAllProfs`

**Test File**: `backend/controllers/professor.test.js`

```javascript
describe('Professor Controller - getAllProfs', () => {
  let mockClient;
  let req, res;

  beforeEach(() => {
    mockClient = {
      query: sinon.stub(),
      release: sinon.stub()
    };
    sinon.stub(pool, 'connect').resolves(mockClient);
    
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all professor names successfully', async () => {
    const mockRows = [
      { name: 'John Doe' },
      { name: 'Jane Smith' },
      { name: 'Bob Johnson' }
    ];
    mockClient.query.resolves({ rows: mockRows });

    await getAllProfs(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(['John Doe', 'Jane Smith', 'Bob Johnson'])).to.be.true;
  });

  it('should handle database query errors', async () => {
    mockClient.query.rejects(new Error('Query failed'));

    await getAllProfs(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(mockClient.release.called).to.be.true;
  });

  it('should return distinct professor names only', async () => {
    const mockRows = [
      { name: 'John Doe' },
      { name: 'John Doe' }
    ];
    mockClient.query.resolves({ rows: mockRows });

    await getAllProfs(req, res);

    // The SQL query uses DISTINCT, so duplicates should be handled by DB
    expect(res.json.firstCall.args[0]).to.deep.equal(['John Doe', 'John Doe']);
  });
});
```

#### 3. `backend/controllers/search2.js`
**Functions**: `getProfessorDataForCourse`, `getCourseData`

**Test File**: `backend/controllers/search2.test.js`

```javascript
const { getProfessorDataForCourse, getCourseData } = require('./search2');

describe('Search Controller - getProfessorDataForCourse', () => {
  let mockClient;
  let req, res;

  beforeEach(() => {
    mockClient = {
      query: sinon.stub(),
      release: sinon.stub()
    };
    sinon.stub(pool, 'connect').resolves(mockClient);
    
    req = {
      query: {
        department: 'CSCE',
        courseNumber: '121'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return professor data for a valid course', async () => {
    const mockRows = [
      {
        professorid: 12345,
        professor_data: {
          info: {
            name: 'Dr. Smith',
            averageGPA: 3.5,
            averageRating: 4.2
          },
          courses: ['CSCE_121', 'CSCE_221'],
          ratings: {}
        }
      }
    ];
    mockClient.query.resolves({ rows: mockRows });

    await getProfessorDataForCourse(req, res);

    expect(res.json.called).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('12345');
    expect(mockClient.release.called).to.be.true;
  });

  it('should return 404 when no professors found for course', async () => {
    mockClient.query.resolves({ rows: [] });

    await getProfessorDataForCourse(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
  });

  it('should handle missing query parameters', async () => {
    req.query = {};

    await getProfessorDataForCourse(req, res);

    expect(res.status.calledWith(500)).to.be.true;
  });

  it('should construct correct course ID from department and course number', async () => {
    mockClient.query.resolves({ rows: [] });

    await getProfessorDataForCourse(req, res);

    expect(mockClient.query.firstCall.args[1]).to.deep.equal(['CSCE_121']);
  });
});
```

#### 4. `backend/controllers/planner2.js`
**Functions**: `getBestClassesPDF`, `getBestClassesText`, `getClassInfo`

**Test File**: `backend/controllers/planner2.test.js`

```javascript
const { getClassInfo } = require('./planner2');
const fs = require('fs');

describe('Planner Controller - getClassInfo', () => {
  let mockClient;
  let req, res;
  let fsReadStub;

  beforeEach(() => {
    mockClient = {
      query: sinon.stub(),
      release: sinon.stub()
    };
    sinon.stub(pool, 'connect').resolves(mockClient);
    
    req = {
      body: {
        class: 'CSCE 221'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    fsReadStub = sinon.stub(fs, 'readFileSync').returns('SELECT * FROM courses');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return class info for valid class format', async () => {
    const mockResult = {
      rows: [{
        result: {
          department: 'CSCE',
          number: 221,
          title: 'Data Structures',
          professors: []
        }
      }]
    };
    mockClient.query.resolves(mockResult);

    await getClassInfo(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(mockResult.rows[0].result)).to.be.true;
  });

  it('should return 400 for invalid class format', async () => {
    req.body.class = 'INVALID';

    await getClassInfo(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
  });

  it('should return 404 when class not found', async () => {
    mockClient.query.resolves({ rows: [] });

    await getClassInfo(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ error: 'Class not found' })).to.be.true;
  });

  it('should parse department and course number correctly', async () => {
    req.body.class = 'MATH 151';
    mockClient.query.resolves({ rows: [{ result: {} }] });

    await getClassInfo(req, res);

    expect(mockClient.query.firstCall.args[1]).to.deep.equal(['MATH_151']);
  });
});
```

#### 5. `backend/routes/auth.js`
**Authentication Routes**

**Test File**: `backend/routes/auth.test.js`

```javascript
const request = require('supertest');
const express = require('express');
const authRoutes = require('./auth');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('GET /auth/me', () => {
    it('should return null user when no token provided', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(200);

      expect(response.body).to.deep.equal({ user: null });
    });

    it('should return user data for valid token', async () => {
      const userData = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(userData, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.user).to.include(userData);
    });

    it('should return null for expired token', async () => {
      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '0s' });

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).to.deep.equal({ user: null });
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear authentication cookie', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).to.deep.equal({ ok: true });
      expect(response.headers['set-cookie']).to.exist;
    });
  });
});
```

#### 6. `backend/users.js`
**User Management Functions**

**Test File**: `backend/users.test.js`

```javascript
const { findOrCreateUserFromGoogle } = require('./users');
const pool = require('./db');

describe('User Management - findOrCreateUserFromGoogle', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = sinon.stub(pool, 'query');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return existing user when found', async () => {
    const existingUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/pic.jpg'
    };
    mockQuery.onFirstCall().resolves({
      rows: [existingUser]
    });

    const profile = {
      id: 'google-123',
      emails: [{ value: 'test@example.com' }],
      displayName: 'Test User',
      photos: [{ value: 'http://example.com/pic.jpg' }]
    };

    const result = await findOrCreateUserFromGoogle(profile);

    expect(result).to.deep.equal(existingUser);
    expect(mockQuery.calledOnce).to.be.true;
  });

  it('should create new user when not found', async () => {
    mockQuery.onFirstCall().resolves({ rows: [] });
    mockQuery.onSecondCall().resolves({
      rows: [{
        id: 2,
        email: 'newuser@example.com',
        name: 'New User'
      }]
    });

    const profile = {
      id: 'google-456',
      emails: [{ value: 'newuser@example.com' }],
      displayName: 'New User',
      photos: [{ value: 'http://example.com/new.jpg' }]
    };

    const result = await findOrCreateUserFromGoogle(profile);

    expect(result.id).to.equal(2);
    expect(mockQuery.calledTwice).to.be.true;
  });

  it('should handle missing email gracefully', async () => {
    mockQuery.onFirstCall().resolves({ rows: [] });
    mockQuery.onSecondCall().resolves({
      rows: [{
        id: 3,
        email: null,
        name: 'User Without Email'
      }]
    });

    const profile = {
      id: 'google-789',
      emails: [],
      displayName: 'User Without Email',
      photos: []
    };

    const result = await findOrCreateUserFromGoogle(profile);

    expect(result.email).to.be.null;
  });
});
```

### Coverage Goals
- **Controllers**: 90% line coverage
- **Routes**: 85% line coverage
- **Utilities**: 95% line coverage
- **Error Handlers**: 100% coverage

### Running Tests
```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run specific test file
npm test -- backend/controllers/course.test.js
```

## Relevant Code / Links
- `backend/controllers/course.js` - Course controller
- `backend/controllers/professor.js` - Professor controller
- `backend/controllers/search2.js` - Search functionality
- `backend/controllers/planner2.js` - Planner logic
- `backend/routes/auth.js` - Authentication routes
- `backend/users.js` - User management
- `backend/db.js` - Database connection pool

## Labels
`enhancement`, `testing`, `backend`, `difficulty level: high`, `priority level: high`