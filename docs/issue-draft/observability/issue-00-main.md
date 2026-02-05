# Logging Strategy - Level Definitions and Usage

```
ERROR  → Error paths (catch blocks, failed operations)
INFO   → API requests/responses (request boundaries)
DEBUG  → Function-to-function calls (internal application flow)
WARN   → Degraded behavior that isn't an error (recoverable issues)
```
## Complete Level Guide

| Level | Production? | Purpose | Volume |
|-------|------------|---------|---------|
| **ERROR** | ✅ Always On | Exceptions, failures requiring attention | Low |
| **WARN** | ✅ Always On | Degraded behavior, concerning patterns | Low-Medium |
| **INFO** | ✅ Always On | Request lifecycle, business events | Medium |
| **DEBUG** | ❌ Off in Prod | Internal flow, detailed debugging | High |

### WARN Level - Concerning behavior 

**Performance Issues:**
- Slow queries detected (works, but concerning)
- Cache misses forcing database fallback
- Connection pool near capacity

**External Dependencies:**
- RateMyProfessors API rate limiting
- External API timeouts with fallback behavior
- Third-party service degraded but functional

**Business Logic Concerns:**
- Schedule generation found few valid schedules (suboptimal results)
- Beam search pruned too aggressively
- Deprecated API parameters used
- Missing data 

**Configuration Issues:**
- Non-critical config missing (using defaults)
- Resource usage trending toward limits
<!-- - Environment variables at edge of valid range -->

## ERROR Level - Error Paths

**All Catch Blocks:**
- Include error object with stack trace
- Include operation context (userId, courseId, etc.)
- Include request ID for tracing
- Categorize error type

**Database Errors:**
- Connection failures
- Query timeouts
- Constraint violations
- Pool exhaustion

**API Errors:**
- Invalid request parameters
- Resource not found (404)
- Authorization failures
- Unexpected data formats

**Algorithm Errors:**
- Schedule generation failures
- Parsing errors (PDF/text)
- Data validation failures

**Critical System Errors:**
- Unable to start server
- Configuration errors at startup
- Critical dependency unavailable

## INFO Level - API Requests & Business Events

**Request Lifecycle:**
- Request start (method, URL, user, requestId)
- Request completion (status, duration, requestId)
- Authentication events (login, logout)
- Authorization decisions

**Business Events:**
- Schedule generation success (courses, schedules found, duration)
- Degree plan imported (semester, courses, source)
- Professor comparison performed
- Search performed (query, results count)
- User registration/profile updates

**Significant Operations:**
- Database migrations completed
- Cache invalidation
- Batch jobs started/completed
- Configuration reloaded

## DEBUG Level - Function-to-Function Flow

**Function Entry/Exit:**
- Function name and key parameters
- Request ID for correlation
- Timing information

**Data Transformations:**
- Input data shape/size
- Transformation steps
- Output data shape/size
- Validation results

**Algorithm Steps:**
- Beam search iterations (states explored, pruned)
- Parsing progress (lines processed, courses extracted)
- Query construction (tables joined, filters applied)
- Cache operations (hits, misses, invalidations)

**Internal State:**
- Loop iterations with counters
- Intermediate calculation results
- State machine transitions
- Flag evaluations

## Production Configuration

**Default Levels by Environment:**
- **Development**: `DEBUG` (see everything)
- **Staging**: `DEBUG` (test like production but with visibility)
- **Production**: `INFO` (ERROR, WARN, INFO only)

**Dynamic Level Changes:**
Can temporarily enable DEBUG in production for troubleshooting without redeploying.

**Log Volume Considerations:**
- DEBUG generates 10-100x more logs than INFO
- Keep DEBUG off in production unless actively debugging
- Use sampling for high-volume DEBUG scenarios

## Metadata Standards

**Every Log Should Include:**
- `timestamp` - ISO 8601 format
- `level` - ERROR, WARN, INFO, DEBUG
- `message` - Human-readable string
- `requestId` - Correlation ID for request tracing -- this will be setup in the database later
- `userId` - User identifier (when available)
- `component` - File/module name
- `function` - Function name (optional)
- `environment` - development/

# Examples
## WARN
// Slow query (works, but concerning)
if (duration > 1000) {
  logger.warn('Slow query detected', { 
    query: 'get_course_details', 
    duration, 
    threshold: 1000 
  });
}

// Fallback behavior
if (!cachedData) {
  logger.warn('Cache miss, falling back to database', { 
    cacheKey, 
    userId 
  });
  // ... fetch from DB
}

// Deprecated API usage
logger.warn('Using deprecated API parameter', { 
  endpoint: '/api/planner2/getBestClasses',
  deprecatedParam: 'oldFormat' 
});

// External API partial failure
if (rmpResponse.status === 429) {
  logger.warn('RateMyProfessors rate limit hit, using cached data', { 
    retryAfter: response.headers['retry-after'] 
  });
}

// Schedule generation found solutions but suboptimal
if (topSchedules.length < 10 && courses.length > 5) {
  logger.warn('Schedule generation found few valid schedules', {
    schedulesFound: topSchedules.length,
    coursesRequested: courses.length,
    constraintsCount: Object.keys(constraints).length
  });
}

## ERROR 
// backend/controllers/planner2.js
async function getOptimalSchedule(req, res) {
  try {
    // ... logic
  } catch (err) {
    logger.error('Schedule generation failed', err, {
      userId: req.user?.id,
      courses: req.body.courses,
      semester: req.body.semester,
      constraintsProvided: !!req.body.constraints,
      errorType: err.name,
      requestId: req.id
    });
    return res.status(500).json({error: "Schedule generation failed"});
  }
}

// backend/db.js
pool.on('error', (err, client) => {
  logger.error('Database pool error', err, {
    poolSize: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

// backend/controllers/search2.js - specific error
const result = await pool.query(sql, [courseId]);
if (result.rows.length === 0) {
  logger.error('Course not found in database', {
    courseId,
    userId: req.user?.id,
    source: 'search_controller'
  });
  return res.status(404).json({error: "Course not found"});
}

## INFO 
// backend/middleware/requestLogger.js
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info('API request started', {
    method: req.method,
    url: req.url,
    requestId: req.id,
    userId: req.user?.id,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('API request completed', {
      method: req.method,
      url: req.url,
      requestId: req.id,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    });
  });
  
  next();
});

// Or in specific endpoints:
// backend/routes/auth.js
app.post('/auth/logout', async (req, res) => {
  logger.info('User logout', {
    userId: req.user?.id,
    sessionId: req.sessionID,
    requestId: req.id
  });
  
  // ... logout logic
  
  logger.info('User logout successful', {
    userId: req.user?.id,
    requestId: req.id
  });
  
  return res.status(200).json({ ok: true });
});

## DEBUG
// backend/controllers/planner2.js
async function getOptimalSchedule(req, res) {
  logger.debug('Entering getOptimalSchedule', {
    userId: req.user?.id,
    coursesCount: req.body.courses?.length,
    requestId: req.id
  });
  
  const courses = req.body.courses;
  logger.debug('Parsed input courses', { 
    courses, 
    requestId: req.id 
  });
  
  const coursesMap = await fetchCourseSections(courses);
  logger.debug('Fetched course sections from database', {
    coursesRequested: courses.length,
    sectionsFound: Object.keys(coursesMap).length,
    totalSections: Object.values(coursesMap).flat().length,
    requestId: req.id
  });
  
  logger.debug('Starting beam search algorithm', {
    initialStateCount: 1,
    beamWidth: 200,
    coursesCount: courses.length,
    requestId: req.id
  });
  
  // Beam search loop
  for (const course of courses) {
    logger.debug('Beam search iteration', {
      course,
      currentStateCount: dp.size,
      requestId: req.id
    });
    
    // ... algorithm logic
    
    logger.debug('Beam search iteration complete', {
      course,
      newStateCount: new_dp.size,
      statesPruned: dp.size - new_dp.size,
      requestId: req.id
    });
  }
  
  logger.debug('Beam search complete', {
    finalScheduleCount: topSchedules.length,
    bestScore: topSchedules[0]?.total_score,
    requestId: req.id
  });
  
  return res.json({ schedules: topSchedules });
}

// backend/services/parseData.js
async function parseDegreePlanPDF(body) {
  logger.debug('Entering parseDegreePlanPDF', { 
    bodySize: body.length 
  });
  
  const pdfData = await extractPDFText(body);
  logger.debug('Extracted PDF text', { 
    textLength: pdfData.length,
    lineCount: pdfData.split('\n').length
  });
  
  const courses = extractCourses(pdfData);
  logger.debug('Extracted courses from PDF', {
    coursesFound: courses.length,
    uniqueDepartments: [...new Set(courses.map(c => c.department))].length
  });
  
  return courses;
}