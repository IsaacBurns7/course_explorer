# Integration Tests - API and Database Integration

## Problem Description / Summary
While unit tests verify individual components in isolation, integration tests are necessary to ensure that different parts of the system work correctly together. The application currently lacks integration tests for:
- API endpoints communicating with the database
- Frontend components interacting with backend APIs
- Authentication flow end-to-end
- Data flow from database queries through controllers to API responses

Without integration tests, we cannot be confident that:
- Database queries return correct data structures
- API endpoints handle real database interactions properly
- Error handling works across layers
- Data transformations happen correctly between layers

## Expected Behavior
Integration tests should verify:
- API endpoints return correct responses with real database connections
- Database schemas match application expectations
- Authentication flow works end-to-end
- Error handling propagates correctly through layers
- API contracts are maintained (request/response formats)
- Database transactions and connections are managed properly

## Context
- **OS**: Ubuntu 22.04, macOS, Windows
- **Runtime**: Node 20.11
- **Database**: PostgreSQL (test database required)
- **Testing Framework**: Mocha, Supertest, or Jest
- **API**: Express.js REST API
- **Commit**: current HEAD
- **Deployment**: Local test environment with test database

## Acceptance Criteria
- [ ] All API endpoints have integration tests
- [ ] Database queries are tested against a test database
- [ ] Authentication routes are tested end-to-end
- [ ] API response formats are validated
- [ ] Error responses are tested for all failure scenarios
- [ ] Test database is seeded with consistent test data
- [ ] Tests clean up after themselves (no test data pollution)
- [ ] Integration tests run in CI/CD pipeline
- [ ] Tests use actual database (not mocked) but isolated from production

## Proposed Solution / Ideas

### Test Database Setup

1. **Create Test Database Configuration**

Create `backend/test/setup.js`:
```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: false
});

// Seed test data
async function seedTestData() {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing test data
    await client.query('TRUNCATE TABLE course_explorer.courses_sections CASCADE');
    await client.query('TRUNCATE TABLE course_explorer.professors CASCADE');
    await client.query('TRUNCATE TABLE course_explorer.courses CASCADE');
    
    // Insert test courses
    await client.query(`
      INSERT INTO course_explorer.courses (id, department, number, title, description)
      VALUES 
        ('CSCE_121', 'CSCE', '121', 'Intro to Programming', 'Introduction to programming concepts'),
        ('CSCE_221', 'CSCE', '221', 'Data Structures', 'Study of data structures'),
        ('MATH_151', 'MATH', '151', 'Calculus I', 'Differential calculus')
    `);
    
    // Insert test professors
    await client.query(`
      INSERT INTO course_explorer.professors (id, name, averageGPA, averageRating, totalSections, totalStudents)
      VALUES 
        (12345, 'Dr. Test Smith', 3.5, 4.2, 10, 300),
        (67890, 'Prof. Test Johnson', 3.2, 3.8, 8, 250)
    `);
    
    // Insert test sections
    await client.query(`
      INSERT INTO course_explorer.courses_sections (course_id, professor_id, semester_id, section, gpa, site, hours)
      VALUES 
        ('CSCE_121', 12345, 'Fall 2023', 500, 3.5, 'College Station', '4'),
        ('CSCE_221', 12345, 'Spring 2024', 501, 3.6, 'College Station', '4'),
        ('CSCE_221', 67890, 'Spring 2024', 502, 3.2, 'College Station', '4')
    `);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Clean up test data
async function cleanupTestData() {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE course_explorer.courses_sections CASCADE');
    await client.query('TRUNCATE TABLE course_explorer.professors CASCADE');
    await client.query('TRUNCATE TABLE course_explorer.courses CASCADE');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  testPool,
  seedTestData,
  cleanupTestData
};
```

2. **Create Test Environment Variables**

Create `.env.test`:
```
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/course_explorer_test
PORT=4001
JWT_SECRET=test_secret_key
```

### Integration Test Files

#### 1. **API Endpoint Integration Tests - Courses**

**Test File**: `backend/test/integration/api/courses.test.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../server');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');

describe('Course API Integration Tests', () => {
  before(async () => {
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await testPool.end();
  });

  describe('GET /api/courses/getAll', () => {
    it('should return all course IDs from database', async () => {
      const response = await request(app)
        .get('/api/courses/getAll')
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body).to.include('CSCE_121');
      expect(response.body).to.include('CSCE_221');
      expect(response.body).to.include('MATH_151');
      expect(response.body.length).to.be.at.least(3);
    });

    it('should return proper content-type', async () => {
      const response = await request(app)
        .get('/api/courses/getAll')
        .expect(200);

      expect(response.headers['content-type']).to.match(/json/);
    });

    it('should handle database errors gracefully', async () => {
      // Temporarily break the connection
      await testPool.end();

      const response = await request(app)
        .get('/api/courses/getAll')
        .expect(500);

      expect(response.body).to.have.property('error');

      // Reconnect
      await seedTestData();
    });
  });
});
```

#### 2. **API Endpoint Integration Tests - Professors**

**Test File**: `backend/test/integration/api/professors.test.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../server');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');

describe('Professor API Integration Tests', () => {
  before(async () => {
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await testPool.end();
  });

  describe('GET /api/professors/getAll', () => {
    it('should return all professor names from database', async () => {
      const response = await request(app)
        .get('/api/professors/getAll')
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body).to.include('Dr. Test Smith');
      expect(response.body).to.include('Prof. Test Johnson');
    });

    it('should return distinct professor names', async () => {
      const response = await request(app)
        .get('/api/professors/getAll')
        .expect(200);

      const uniqueNames = [...new Set(response.body)];
      expect(response.body.length).to.equal(uniqueNames.length);
    });
  });
});
```

#### 3. **API Endpoint Integration Tests - Search**

**Test File**: `backend/test/integration/api/search.test.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../server');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');

describe('Search API Integration Tests', () => {
  before(async () => {
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await testPool.end();
  });

  describe('GET /api/search2/professors', () => {
    it('should return professor data for a valid course', async () => {
      const response = await request(app)
        .get('/api/search2/professors')
        .query({ department: 'CSCE', courseNumber: '221' })
        .expect(200);

      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('12345');
      expect(response.body).to.have.property('67890');
    });

    it('should return correct professor info structure', async () => {
      const response = await request(app)
        .get('/api/search2/professors')
        .query({ department: 'CSCE', courseNumber: '221' })
        .expect(200);

      const professorData = response.body['12345'];
      expect(professorData).to.have.property('info');
      expect(professorData.info).to.have.property('name');
      expect(professorData.info).to.have.property('averageGPA');
      expect(professorData.info).to.have.property('averageRating');
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/search2/professors')
        .query({ department: 'FAKE', courseNumber: '999' })
        .expect(404);

      expect(response.body).to.have.property('error');
    });

    it('should handle missing query parameters', async () => {
      const response = await request(app)
        .get('/api/search2/professors')
        .query({})
        .expect(500);

      expect(response.body).to.have.property('error');
    });
  });

  describe('GET /api/search2/course', () => {
    it('should return course data with professor list', async () => {
      const response = await request(app)
        .get('/api/search2/course')
        .query({ department: 'CSCE', courseNumber: '221' })
        .expect(200);

      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('professors');
      expect(response.body.professors).to.be.an('array');
    });

    it('should include course metadata', async () => {
      const response = await request(app)
        .get('/api/search2/course')
        .query({ department: 'CSCE', courseNumber: '221' })
        .expect(200);

      expect(response.body).to.have.property('averageGPA');
      expect(response.body).to.have.property('averageRating');
      expect(response.body).to.have.property('numStudents');
      expect(response.body).to.have.property('numSections');
    });
  });
});
```

#### 4. **API Endpoint Integration Tests - Planner**

**Test File**: `backend/test/integration/api/planner.test.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../server');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');

describe('Planner API Integration Tests', () => {
  before(async () => {
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await testPool.end();
  });

  describe('POST /api/planner2/getClassInfo', () => {
    it('should return class info for valid course', async () => {
      const response = await request(app)
        .post('/api/planner2/getClassInfo')
        .send({ class: 'CSCE 221' })
        .expect(200);

      expect(response.body).to.have.property('department', 'CSCE');
      expect(response.body).to.have.property('number', 221);
      expect(response.body).to.have.property('title');
      expect(response.body).to.have.property('professors');
    });

    it('should return professor data for each professor teaching the class', async () => {
      const response = await request(app)
        .post('/api/planner2/getClassInfo')
        .send({ class: 'CSCE 221' })
        .expect(200);

      expect(response.body.professors).to.be.an('array');
      expect(response.body.professors.length).to.be.at.least(1);
      
      const professor = response.body.professors[0];
      expect(professor).to.have.property('info');
      expect(professor.info).to.have.property('name');
      expect(professor.info).to.have.property('averageGPA');
      expect(professor.info).to.have.property('averageRating');
    });

    it('should return 400 for invalid class format', async () => {
      const response = await request(app)
        .post('/api/planner2/getClassInfo')
        .send({ class: 'INVALID' })
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.match(/Invalid class format/i);
    });

    it('should return 404 for non-existent class', async () => {
      const response = await request(app)
        .post('/api/planner2/getClassInfo')
        .send({ class: 'FAKE 999' })
        .expect(404);

      expect(response.body).to.have.property('error', 'Class not found');
    });

    it('should include warning when professor doesn\'t typically teach semester', async () => {
      const response = await request(app)
        .post('/api/planner2/getClassInfo')
        .send({ class: 'CSCE 221' })
        .expect(200);

      // Check if any professor has a warning
      const professorsWithWarnings = response.body.professors.filter(
        prof => prof.info.warning
      );
      
      // At least verify the warning property exists
      response.body.professors.forEach(prof => {
        expect(prof.info).to.have.property('warning');
      });
    });
  });

  describe('POST /api/planner2/getBestClassesText', () => {
    it('should return best classes for degree plan', async () => {
      const degreePlan = {
        content: `
          Fall 2024
          CSCE 121 - Intro to Programming - 4 hours
          MATH 151 - Calculus I - 4 hours
          
          Spring 2025
          CSCE 221 - Data Structures - 4 hours
        `
      };

      const response = await request(app)
        .post('/api/planner2/getBestClassesText')
        .send(degreePlan)
        .expect(200);

      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('Fall 2024');
      expect(response.body).to.have.property('Spring 2025');
    });

    it('should return professors sorted by criteria for each course', async () => {
      const degreePlan = {
        content: `
          Spring 2025
          CSCE 221 - Data Structures - 4 hours
        `
      };

      const response = await request(app)
        .post('/api/planner2/getBestClassesText')
        .send(degreePlan)
        .expect(200);

      const course = response.body['Spring 2025'][0];
      expect(course).to.have.property('professors');
      expect(course.professors).to.be.an('array');
      expect(course.professors.length).to.be.at.least(1);
    });

    it('should handle invalid degree plan format', async () => {
      const response = await request(app)
        .post('/api/planner2/getBestClassesText')
        .send({ content: 'invalid format' })
        .expect(500);

      expect(response.body).to.have.property('error');
    });
  });
});
```

#### 5. **Authentication Flow Integration Tests**

**Test File**: `backend/test/integration/auth/auth-flow.test.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');

describe('Authentication Flow Integration Tests', () => {
  let testUser;
  let authToken;

  before(async () => {
    await seedTestData();
    
    // Insert test user
    const client = await testPool.connect();
    try {
      const result = await client.query(`
        INSERT INTO course_explorer.users (google_id, email, name, picture)
        VALUES ('test-google-id', 'test@example.com', 'Test User', 'http://example.com/pic.jpg')
        RETURNING id, email, name
      `);
      testUser = result.rows[0];
    } finally {
      client.release();
    }
  });

  after(async () => {
    // Clean up test user
    const client = await testPool.connect();
    try {
      await client.query(`
        DELETE FROM course_explorer.users WHERE google_id = 'test-google-id'
      `);
    } finally {
      client.release();
    }
    
    await cleanupTestData();
    await testPool.end();
  });

  describe('GET /auth/me', () => {
    it('should return null when no token is provided', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(200);

      expect(response.body).to.deep.equal({ user: null });
    });

    it('should return user data when valid token is provided', async () => {
      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.user).to.include({
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should return null for expired token', async () => {
      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '0s' });

      // Wait a moment to ensure token expires
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).to.deep.equal({ user: null });
    });

    it('should return null for invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', 'token=invalid-token')
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
      
      const cookies = response.headers['set-cookie'];
      expect(cookies).to.exist;
      expect(cookies[0]).to.match(/token=;/);
    });

    it('should work even when no token is present', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).to.deep.equal({ ok: true });
    });
  });

  describe('User Creation Flow', () => {
    it('should create new user when Google profile is provided', async () => {
      const newGoogleProfile = {
        id: 'new-google-id',
        emails: [{ value: 'newuser@example.com' }],
        displayName: 'New Test User',
        photos: [{ value: 'http://example.com/newpic.jpg' }]
      };

      // This would require mocking Google OAuth callback
      // For now, we test the database function directly
      const { findOrCreateUserFromGoogle } = require('../../../users');
      
      const user = await findOrCreateUserFromGoogle(newGoogleProfile);

      expect(user).to.have.property('id');
      expect(user.email).to.equal('newuser@example.com');
      expect(user.name).to.equal('New Test User');

      // Clean up
      const client = await testPool.connect();
      try {
        await client.query(`
          DELETE FROM course_explorer.users WHERE google_id = 'new-google-id'
        `);
      } finally {
        client.release();
      }
    });
  });
});
```

#### 6. **Database Query Integration Tests**

**Test File**: `backend/test/integration/database/queries.test.js`

```javascript
const { expect } = require('chai');
const { testPool, seedTestData, cleanupTestData } = require('../../setup');
const fs = require('fs');
const path = require('path');

describe('Database Query Integration Tests', () => {
  before(async () => {
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await testPool.end();
  });

  describe('Course Queries', () => {
    it('should retrieve all courses', async () => {
      const result = await testPool.query(`
        SELECT id FROM course_explorer.courses
      `);

      expect(result.rows).to.have.lengthOf.at.least(3);
      expect(result.rows.map(r => r.id)).to.include.members([
        'CSCE_121',
        'CSCE_221',
        'MATH_151'
      ]);
    });

    it('should retrieve course with all details', async () => {
      const result = await testPool.query(`
        SELECT * FROM course_explorer.courses WHERE id = $1
      `, ['CSCE_221']);

      expect(result.rows).to.have.lengthOf(1);
      const course = result.rows[0];
      expect(course).to.have.property('department', 'CSCE');
      expect(course).to.have.property('number', '221');
      expect(course).to.have.property('title', 'Data Structures');
    });
  });

  describe('Professor Queries', () => {
    it('should retrieve professors teaching a specific course', async () => {
      const result = await testPool.query(`
        SELECT DISTINCT p.id, p.name
        FROM course_explorer.professors p
        JOIN course_explorer.courses_sections cs ON cs.professor_id = p.id
        WHERE cs.course_id = $1
      `, ['CSCE_221']);

      expect(result.rows).to.have.lengthOf.at.least(2);
      expect(result.rows.map(r => r.name)).to.include.members([
        'Dr. Test Smith',
        'Prof. Test Johnson'
      ]);
    });

    it('should calculate average GPA for professor', async () => {
      const result = await testPool.query(`
        SELECT 
          p.name,
          ROUND(AVG(cs.gpa)::numeric, 2) as avg_gpa
        FROM course_explorer.professors p
        JOIN course_explorer.courses_sections cs ON cs.professor_id = p.id
        WHERE p.id = $1
        GROUP BY p.id, p.name
      `, [12345]);

      expect(result.rows).to.have.lengthOf(1);
      expect(result.rows[0].avg_gpa).to.be.a('string');
      expect(parseFloat(result.rows[0].avg_gpa)).to.be.above(0);
    });
  });

  describe('Section Queries', () => {
    it('should retrieve sections for a course in a semester', async () => {
      const result = await testPool.query(`
        SELECT *
        FROM course_explorer.courses_sections
        WHERE course_id = $1 AND semester_id = $2
      `, ['CSCE_221', 'Spring 2024']);

      expect(result.rows).to.have.lengthOf.at.least(2);
      expect(result.rows[0]).to.have.property('professor_id');
      expect(result.rows[0]).to.have.property('gpa');
    });

    it('should retrieve all semesters for a course', async () => {
      const result = await testPool.query(`
        SELECT DISTINCT semester_id
        FROM course_explorer.courses_sections
        WHERE course_id = $1
        ORDER BY semester_id DESC
      `, ['CSCE_221']);

      expect(result.rows.length).to.be.at.least(1);
      expect(result.rows.map(r => r.semester_id)).to.include('Spring 2024');
    });
  });

  describe('Complex SQL File Queries', () => {
    it('should execute getClassInfo.sql successfully', async () => {
      const sqlPath = path.join(__dirname, '../../../controllers/sql/getClassInfo.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');

      const result = await testPool.query(sql, ['CSCE_221']);

      expect(result.rows).to.have.lengthOf(1);
      expect(result.rows[0]).to.have.property('result');
      
      const courseData = result.rows[0].result;
      expect(courseData).to.have.property('department', 'CSCE');
      expect(courseData).to.have.property('number', 221);
      expect(courseData).to.have.property('professors');
      expect(courseData.professors).to.be.an('array');
    });

    it('should execute getBestClasses.sql successfully', async () => {
      const sqlPath = path.join(__dirname, '../../../controllers/sql/getBestClasses.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');

      const courseIds = ['CSCE_121', 'CSCE_221'];
      const semesterIds = ['Fall 2023', 'Spring 2024'];

      const result = await testPool.query(sql, [courseIds, semesterIds]);

      expect(result.rows).to.have.lengthOf(1);
      expect(result.rows[0]).to.have.property('result');
      
      const plannerData = result.rows[0].result;
      expect(plannerData).to.have.property('Fall 2023');
      expect(plannerData).to.have.property('Spring 2024');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between courses and sections', async () => {
      // Try to insert a section with invalid course_id
      try {
        await testPool.query(`
          INSERT INTO course_explorer.courses_sections (course_id, professor_id, semester_id, section)
          VALUES ('INVALID_COURSE', 12345, 'Fall 2024', 999)
        `);
        expect.fail('Should have thrown foreign key violation');
      } catch (error) {
        expect(error.code).to.equal('23503'); // Foreign key violation
      }
    });

    it('should maintain referential integrity between sections and professors', async () => {
      // Try to insert a section with invalid professor_id
      try {
        await testPool.query(`
          INSERT INTO course_explorer.courses_sections (course_id, professor_id, semester_id, section)
          VALUES ('CSCE_121', 99999, 'Fall 2024', 999)
        `);
        expect.fail('Should have thrown foreign key violation');
      } catch (error) {
        expect(error.code).to.equal('23503'); // Foreign key violation
      }
    });
  });
});
```

### Running Integration Tests

Add to `package.json`:
```json
"scripts": {
  "test:integration": "mocha backend/test/integration/**/*.test.js --timeout 10000 --exit",
  "test:integration:watch": "mocha backend/test/integration/**/*.test.js --watch --timeout 10000",
  "test:all": "npm run test:unit && npm run test:integration"
}
```

Run tests:
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test suite
npm test -- backend/test/integration/api/courses.test.js

# Run with verbose output
npm run test:integration -- --reporter spec
```

### CI/CD Integration

Create `.github/workflows/integration-tests.yml`:
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: course_explorer_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run database migrations
        run: npm run migrate
        env:
          TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/course_explorer_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://test_user:test_password@localhost:5432/course_explorer_test
          JWT_SECRET: test_secret_key
```

## Relevant Code / Links
- `backend/controllers/` - API controllers
- `backend/routes/` - API routes
- `backend/db.js` - Database connection
- `backend/controllers/sql/` - Complex SQL queries
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Mocha Documentation](https://mochajs.org/)

## Labels
`enhancement`, `testing`, `integration`, `backend`, `database`, `difficulty level: high`, `priority level: high`