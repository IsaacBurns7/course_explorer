# Structured Logging Implementation - Application-Wide Logging Infrastructure

## Problem Description / Summary

The application currently relies entirely on `console.log()` and `console.error()` statements scattered throughout the codebase, creating significant observability challenges. Without structured logging, the team faces:

### Current Logging Problems

**Lack of Structure**:
- **Plain Text Output**: Log messages are unstructured strings that are difficult to parse programmatically
- **No Metadata Context**: Logs lack essential context like timestamps, log levels, user IDs, request IDs, session information
- **Inconsistent Formats**: Every developer logs differently - some include timestamps, others don't
- **No Searchability**: Cannot easily search logs for specific request IDs, user actions, or error patterns
- **Lost in Production**: Production logs mix with debug statements, making it hard to find critical issues

**Debugging Challenges**:
- **No Request Tracing**: Cannot track a single request through the entire application flow
- **Missing Context**: When errors occur, logs don't include enough context to understand what happened
- **Temporal Issues**: Cannot easily correlate events that happen at the same time across different parts of the application
- **User Attribution**: No way to filter logs by specific user or session
- **Performance Issues**: Cannot identify slow operations without explicit performance logging

**Operational Problems**:
- **No Log Levels**: Cannot adjust verbosity in production without code changes
- **No Log Aggregation**: Logs printed to console are lost when containers restart
- **No Alerting**: Cannot alert on specific error patterns or thresholds
- **No Metrics**: Cannot extract metrics from logs (request counts, error rates, etc.)
- **Compliance Issues**: No audit trail for sensitive operations

### Specific Pain Points in Course Explorer

Based on code analysis, critical logging gaps include:

**Backend Controllers** (`backend/controllers/`):
- `backend/controllers/planner2.js` - Complex scheduling algorithm with no visibility into performance or failures
  - Lines 374-477: 200+ lines of critical schedule generation logic with only error logging at the end
  - No logging of: algorithm inputs, intermediate steps, performance metrics, beam search pruning
- `backend/controllers/search2.js` - Professor/course search with no request tracking
  - No logging of search parameters, result counts, query performance
- `backend/controllers/course.js` - Simple but no audit trail
- `backend/controllers/professor.js` - No logging of data access patterns

**Database Layer** (`backend/db.js`):
- Line 18: `console.log("Global setup: Attempting to connect to DB at ", process.env.NEON_DB_URL)` - Exposes connection string in logs
- Lines 23-28: Connection success/failure only logged to console
- No query performance logging
- No connection pool statistics
- No slow query detection
- No database error categorization

**Authentication** (`backend/routes/auth.js`, `backend/users.js`):
- No audit trail for login/logout events
- No failed authentication attempt logging
- No session creation/destruction logging
- Security-critical operations untracked

**Data Import/Migration Scripts** (all files in `backend/services/`):
- `backend/services/insertData.js` - Lines 89-187: Database insertion with progress counter but no error details
- `backend/services/insertProfs.js` - Line 24: `console.error('Unexpected error on idle client', err)` - Generic error with no context
- `backend/services/populateClasses.js` - Lines 366-463: Complex data gathering with minimal logging
- `backend/services/RUNME.js`, `RUNME_AUTO.js` - Interactive scripts with scattered console.logs
- No way to understand what went wrong during failed imports
- No performance metrics for large data operations

**Frontend Console Spam** (`frontend/src/`):
- Development console cluttered with logs
- No distinction between debug, info, warning, error
- No context about which component or hook logged
- Production builds still include console statements
- No way to filter or search frontend logs

**Specific Logging Anti-Patterns Found**:

1. **Exposing Sensitive Data** (`backend/db.js:18`):
   ```javascript
   console.log("Global setup: Attempting to connect to DB at ", process.env.NEON_DB_URL);
   ```
   Database URLs should never be logged in full.

2. **Generic Error Handling** (multiple files):
   ```javascript
   catch (err) {
     console.error("Error inserting:", err);
   }
   ```
   No context about what was being inserted, for which user, at what stage, etc.

3. **Mixed Debug and Production Logs** (throughout):
   No way to disable debug logs in production without removing code.

4. **No Request Context** (all controllers):
   Controllers log errors but don't include request ID, user, endpoint, parameters.

5. **Performance Blindness** (`backend/controllers/planner2.js`):
   Schedule generation can take seconds but no performance metrics logged.

## Expected Behavior

After structured logging implementation:

### Structured Log Format
- **JSON Output**: All logs in JSON format for easy parsing
- **Consistent Fields**: Every log has: timestamp, level, message, service, environment
- **Contextual Metadata**: Logs include request ID, user ID, session ID, operation context
- **Correlation IDs**: Can trace single request through entire application
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL properly categorized
- **Source Information**: File, function, line number included in logs

### Development Experience
- **Readable in Dev**: Human-readable formatted logs in development
- **Configurable Verbosity**: Can adjust log level via environment variable
- **Component Attribution**: Clear indication of which part of app logged
- **Performance Logging**: Automatic timing for critical operations
- **Error Context**: Errors include full context and stack traces

### Production Capabilities
- **Log Aggregation**: Logs sent to centralized logging service
- **Searchability**: Can search logs by any field (user, request ID, error type, etc.)
- **Alerting**: Can alert on specific log patterns or error rates
- **No Sensitive Data**: Automatic redaction of secrets, tokens, passwords
- **Audit Trail**: Complete audit log for security-critical operations

### Observability
- **Request Tracking**: Follow single request from frontend → backend → database
- **Performance Insights**: Identify slow operations and bottlenecks
- **Error Categorization**: Categorize errors by type, severity, component
- **User Activity**: Track user actions for debugging and analytics
- **System Health**: Log system metrics (memory, connections, etc.)

## Context

### Technical Environment
- **Node Version**: 20.11 LTS
- **Backend Framework**: Express.js 4.x
- **Frontend Framework**: React 18.x
- **Current Logging**: console.log/console.error only
- **Target Logging Library**: Winston (backend), or Pino (alternative)
- **Frontend Logging**: Custom logger wrapping console
- **Log Aggregation**: TBD (CloudWatch, DataDog, Logtail, etc.)
- **Environment**: Development, Staging, Production

### Logging Library Comparison

**Winston** (Recommended for Course Explorer):
- Most popular Node.js logging library
- Supports multiple transports (console, file, HTTP, etc.)
- Built-in log levels
- Excellent TypeScript support
- Large ecosystem of plugins
- Format customization

**Pino** (Alternative - Higher Performance):
- Faster than Winston (10x+ in benchmarks)
- Lower overhead for high-volume logging
- Smaller footprint
- Less feature-rich than Winston
- Better for high-throughput applications

**Recommendation**: Winston for Course Explorer because:
- Not a high-throughput application (typical course website traffic)
- Better developer experience and readability
- More plugins and community support
- Easier to configure and customize

## Acceptance Criteria

### Phase 1: Backend Logging Infrastructure (Week 1)
- [ ] Winston installed and configured
- [ ] Logger utility created with standardized interface
- [ ] Log levels defined and documented (DEBUG, INFO, WARN, ERROR)
- [ ] Base logger exports with default configuration
- [ ] Environment-based configuration (dev vs production)
- [ ] JSON format for production, pretty format for development
- [ ] Logger instantiated in at least one file as proof-of-concept

### Phase 2: Request Context and Middleware (Week 1-2)
- [ ] Express middleware for request logging created
- [ ] Request ID generation middleware (unique ID per request)
- [ ] Context logger that includes request metadata
- [ ] User ID extraction and logging (from auth)
- [ ] Request timing middleware (measure request duration)
- [ ] All requests logged with: method, URL, status, duration, user

### Phase 3: Controller and Route Logging (Week 2-3)
- [ ] All controllers migrated from console.log to logger:
  - `backend/controllers/course.js`
  - `backend/controllers/professor.js`
  - `backend/controllers/search2.js`
  - `backend/controllers/planner2.js`
- [ ] All routes migrated from console.log to logger
- [ ] Error handling logs include full context
- [ ] Performance logging for slow operations (>1s)

### Phase 4: Database and Service Layer Logging (Week 3)
- [ ] Database connection logging (`backend/db.js`)
- [ ] Query logging with performance metrics
- [ ] Database error logging with categorization
- [ ] Service layer logging (`backend/services/`)
- [ ] Data import script logging
- [ ] Authentication logging (`backend/users.js`, `backend/routes/auth.js`)

### Phase 5: Frontend Logging (Week 4)
- [ ] Frontend logger wrapper created
- [ ] Replaces all console.log/error in components
- [ ] Error boundary logging
- [ ] User action logging (optional, for analytics)
- [ ] Production vs development configuration
- [ ] Log batching for sending to backend (optional)

### Phase 6: Log Aggregation (Week 4-5)
- [ ] Log transport configured for production
- [ ] Logs sent to centralized service (CloudWatch, DataDog, etc.)
- [ ] Log retention policy configured
- [ ] Log search and filtering tested
- [ ] Alerting rules configured for critical errors

### Phase 7: Sensitive Data Redaction (Week 5)
- [ ] Automatic redaction of passwords
- [ ] Automatic redaction of tokens and API keys
- [ ] Database connection strings sanitized
- [ ] PII (Personally Identifiable Information) redaction
- [ ] Audit of all logs to ensure no leaks

### Phase 8: Documentation and Standards (Week 5-6)
- [ ] Logging standards document created
- [ ] Logger usage examples documented
- [ ] When to use each log level documented
- [ ] Team training on new logging system
- [ ] Migration guide for remaining console.logs

### Quality Metrics
- [ ] Zero console.log statements remaining (except frontend fallbacks)
- [ ] All API requests logged with metadata
- [ ] All errors logged with full context
- [ ] All database queries logged in DEBUG mode
- [ ] All authentication events logged
- [ ] No sensitive data in logs (verified by audit)

## Proposed Solution / Ideas

### Overall Strategy

The implementation follows a **bottom-up, incremental approach**:

1. **Infrastructure First** - Set up logging framework before touching code
2. **Core Services First** - Log database and auth before controllers
3. **One Module at a Time** - Migrate one controller/route at a time
4. **Context Propagation** - Ensure context flows through entire request
5. **Gradual Rollout** - Run new logger alongside console.log initially
6. **Test in Development** - Verify logging in dev before production
7. **Production Deployment** - Roll out with monitoring

### Phase 1: Backend Logging Infrastructure

#### Installation
Install Winston and related packages:
```bash
cd backend
npm install winston
npm install express-winston  # For Express integration
npm install winston-daily-rotate-file  # For log rotation
```

#### Logger Configuration
Create `backend/utils/logger.js` (or `logger.ts` if TypeScript):

**Core Logger Features**:
- Multiple transports (console for dev, file for production)
- JSON format in production, pretty format in development
- Configurable log levels via environment variable
- Default metadata (service name, environment, hostname)
- Timestamp in ISO format
- Support for child loggers with additional context

**Log Level Strategy**:
- **DEBUG**: Detailed information for debugging (query results, intermediate values)
- **INFO**: General informational messages (request started, operation completed)
- **WARN**: Warning messages that aren't errors (deprecated API usage, retry attempts)
- **ERROR**: Error messages that need attention (database errors, API failures)
- **FATAL**: Critical errors that require immediate action (cannot connect to database)

**Configuration by Environment**:
- **Development**: Console transport with pretty formatting, DEBUG level
- **Production**: JSON console transport (Docker/Kubernetes logs), INFO level, file rotation
- **Test**: Minimal logging or silent

#### Example Logger Interface
The logger should provide a simple, intuitive interface:
- `logger.debug(message, metadata)` - Debug information
- `logger.info(message, metadata)` - Informational
- `logger.warn(message, metadata)` - Warnings
- `logger.error(message, error, metadata)` - Errors
- `logger.child(metadata)` - Create child logger with context

#### Metadata Standards
Every log should include:
- `timestamp`: ISO 8601 format
- `level`: Log level string
- `message`: Human-readable message
- `service`: "course-explorer-backend"
- `environment`: "development" | "staging" | "production"
- `requestId`: Unique request identifier (when available)
- `userId`: User ID (when authenticated)
- `component`: File or module name
- `function`: Function name (optional)

### Phase 2: Request Context and Middleware

#### Request ID Generation
Create middleware to generate unique request ID:
- Use `uuid` or `nanoid` for unique IDs
- Attach ID to request object
- Include in all logs for that request
- Return in response headers (X-Request-ID)

#### Request Logging Middleware
Use `express-winston` or custom middleware:
- Log incoming request (method, URL, headers, query, body)
- Log outgoing response (status, duration, size)
- Include request ID, user ID, session ID
- Redact sensitive data (passwords, tokens) from body

#### Context Logger Pattern
Create child logger for each request:
- Base logger + request metadata
- All logs within request include context automatically
- Attach context logger to request object
- Controllers use context logger from request

#### Performance Timing
Middleware to measure request duration:
- Start timer on request start
- Log duration on response finish
- Warn on slow requests (configurable threshold)
- Include timing breakdowns (database time, processing time)

### Phase 3: Controller and Route Migration

#### Migration Pattern
For each controller, replace console.log with logger:

**Before**:
```javascript
console.log("Executing query for course:", courseId);
// ... query execution
console.error("Database error:", error);
```

**After**:
```javascript
logger.info('Executing course query', { courseId });
// ... query execution
logger.error('Database query failed', error, { courseId, query });
```

#### Error Logging Pattern
Standardize error logging:
- Log error object with stack trace
- Include operation context
- Include relevant IDs (user, resource, etc.)
- Categorize error type (validation, database, external API, etc.)

#### Performance Logging Pattern
For operations that may be slow:
- Log start with DEBUG level
- Log completion with INFO level and duration
- Log performance metrics (items processed, cache hits, etc.)
- Warn if duration exceeds threshold

#### Specific Controller Migrations

**Course Controller** (`backend/controllers/course.js`):
- Log all course queries with parameters
- Log result counts
- Log cache hits/misses (if caching implemented)
- Log errors with course ID context

**Professor Controller** (`backend/controllers/professor.js`):
- Log professor data access
- Log search parameters
- Log aggregation operations

**Search Controller** (`backend/controllers/search2.js`):
- Log search queries with parameters
- Log result counts and performance
- Log filter applications
- Log sorting/ranking operations

**Planner Controller** (`backend/controllers/planner2.js`):
- **Critical for observability** - Complex algorithm needs extensive logging:
  - Log degree plan parsing inputs
  - Log extracted courses and semesters
  - Log schedule generation parameters (courses, constraints, filters)
  - Log beam search iterations (how many states explored, pruned)
  - Log final schedule count and scores
  - Log performance metrics (algorithm duration, states explored)
  - Log any optimization decisions (why certain schedules rejected)

### Phase 4: Database and Service Layer

#### Database Connection Logging
Migrate `backend/db.js`:
- Log connection attempts (WITHOUT full connection string)
- Log connection success with pool stats
- Log connection failures with error categorization
- Log graceful shutdown events
- Log connection pool metrics (active, idle, waiting)

**Critical Fix**:
```javascript
// BEFORE (SECURITY ISSUE):
console.log("Global setup: Attempting to connect to DB at ", process.env.NEON_DB_URL);

// AFTER:
logger.info('Connecting to database', {
  host: new URL(process.env.NEON_DB_URL).hostname,
  ssl: true,
  poolSize: pool.options.max
});
```

#### Query Logging
Create query wrapper with logging:
- Log all queries in DEBUG mode
- Include query text (parameterized, not with values)
- Include query parameters (redacted if sensitive)
- Log query duration
- Warn on slow queries (configurable threshold)
- Log query errors with context

#### Service Layer Logging
Migrate `backend/services/`:

**Data Parsing Service** (`parseData.js`):
- Log parsing attempts with input type
- Log parsing success/failure
- Log extracted data summary (course count, semester count)
- Log parsing errors with input sample

**Data Import Scripts** (`insertData.js`, `insertProfs.js`, etc.):
- Log import start with row counts
- Log progress at intervals (every 100 rows, etc.)
- Log import completion with statistics
- Log import errors with row context
- Log performance metrics (rows per second)

#### Authentication Logging
Migrate `backend/users.js` and `backend/routes/auth.js`:
- **Audit trail for security**:
  - Log login attempts (success and failure)
  - Log user creation
  - Log logout events
  - Log password resets
  - Log token generation/validation
  - Log OAuth callbacks
  - Include user ID, IP address, user agent
  - Do NOT log passwords or tokens

### Phase 5: Frontend Logging

#### Frontend Logger Wrapper
Create `frontend/src/utils/logger.js`:

**Features**:
- Wrap console methods (log, info, warn, error)
- Add component context automatically
- Format messages consistently
- Conditional logging based on environment
- Optional: Batch and send to backend

**Log Levels**:
- **DEBUG**: Component lifecycle, state changes
- **INFO**: User actions, navigation
- **WARN**: Deprecated API usage, minor issues
- **ERROR**: Exceptions, API failures, render errors

**Environment Behavior**:
- **Development**: Full logging to console with pretty formatting
- **Production**: ERROR only, optionally send to backend

#### Error Boundary Integration
Add logging to React Error Boundaries:
- Log component stack when error occurs
- Log error details and props
- Log user session context
- Optionally send to error tracking service

#### Component Migration
Replace console.log throughout components:
- Use logger instead of console
- Add component name to context
- Log user interactions (optional)
- Log API call failures with request details

### Phase 6: Log Aggregation

#### Choose Log Aggregation Service

**Option 1: AWS CloudWatch Logs** (if using AWS):
- Native integration with AWS services
- Pay-as-you-go pricing
- Log Insights for querying
- Integration with CloudWatch Alarms

**Option 2: DataDog**:
- Comprehensive observability platform
- Excellent search and filtering
- Built-in dashboards and alerts
- Higher cost

**Option 3: Logtail (Better Stack)**:
- Modern, developer-friendly UI
- Affordable pricing
- Good search and filtering
- Easy setup

**Option 4: Self-Hosted (Loki + Grafana)**:
- Full control
- No ongoing costs (except infrastructure)
- Requires maintenance
- Steeper learning curve

**Recommendation for Course Explorer**: Start with **Logtail** or **CloudWatch** (if on AWS)
- Both have generous free tiers
- Easy setup
- Good enough for application scale
- Can migrate later if needs change

#### Transport Configuration
Configure Winston transport for chosen service:
- Install transport package
- Configure with API key/credentials
- Set appropriate log level for production (INFO or higher)
- Ensure no sensitive data in logs
- Test log delivery in staging first

#### Log Retention and Archiving
Configure retention policies:
- **Hot storage**: Last 7-30 days for active searching
- **Cold storage**: 90+ days for compliance/audit
- **Archival**: Longer-term storage in S3/Glacier if needed
- **Deletion**: PII logs deleted per data retention policies

### Phase 7: Sensitive Data Redaction

#### Automatic Redaction
Implement redaction in logger:
- Detect common secret patterns (password, token, key, secret)
- Redact values automatically
- Redact database connection strings
- Redact credit card numbers, SSNs (if applicable)

#### Redaction Patterns
Create redaction rules:
- **Passwords**: Any field named password, passwd, pwd
- **Tokens**: Any field named token, jwt, apiKey, secret
- **Connection Strings**: Full database URLs
- **PII**: Email (optionally hash), phone numbers
- **Credit Cards**: Any 13-16 digit numbers

#### Audit Process
Manual audit of logs:
- Review sample production logs
- Check for any exposed secrets
- Verify redaction rules work
- Test with real user data (in staging)
- Document any exceptions

### Phase 8: Documentation and Standards

#### Logging Standards Document
Create comprehensive guide:
- When to use each log level
- What metadata to include
- How to log errors
- How to use context loggers
- Examples for common scenarios
- Anti-patterns to avoid

#### Usage Examples
Provide code examples:
- Controller logging
- Service logging
- Error logging
- Performance logging
- Audit logging

#### Migration Guide
Step-by-step guide for team:
- How to replace console.log
- How to add context
- How to test logging
- Common pitfalls

#### Team Training
Conduct training session:
- Explain new logging system
- Demonstrate usage
- Show how to search logs
- Answer questions

## Relevant Code / Links

### Files Requiring Migration (100+ console.log statements)

**Backend Core** (20+ statements):
- `backend/db.js` - 7 console statements (connection logging)
- `backend/users.js` - Auth operations (needs audit logging)
- `backend/server.js` - Server startup and errors

**Backend Controllers** (30+ statements):
- `backend/controllers/course.js` - Simple queries
- `backend/controllers/professor.js` - Simple queries
- `backend/controllers/search2.js` - Complex queries, no logging
- `backend/controllers/planner2.js` - Critical algorithm, minimal logging

**Backend Routes** (10+ statements):
- `backend/routes/auth.js` - Security-critical, needs audit trail
- `backend/routes/*.js` - Various console.error statements

**Backend Services** (50+ statements):
- `backend/services/RUNME.js` - Interactive script with console.log everywhere
- `backend/services/RUNME_AUTO.js` - Automated version, same issues
- `backend/services/insertData.js` - Progress logging with console
- `backend/services/insertProfs.js` - Database insertion
- `backend/services/populateClasses.js` - Data gathering
- `backend/services/parseData.js` - PDF/text parsing
- `backend/services/adjustData.js` - Data transformation
- `backend/services/ratings/getProfsAPI.js` - RateMyProfessors API

**Database Migration Tools** (20+ statements):
- `database/migration_tools/*.js` - Various migration scripts

**Frontend** (estimated 30+ statements):
- `frontend/src/components/*.js` - Various console.logs
- `frontend/src/pages/*.js` - Page-level logging
- `frontend/src/hooks/*.js` - Hook debugging

### New Files to Create

**Backend**:
- `backend/utils/logger.js` (or `.ts`) - Main logger configuration
- `backend/middleware/requestLogger.js` - Request logging middleware
- `backend/middleware/requestId.js` - Request ID generation
- `backend/utils/redactor.js` - Sensitive data redaction
- `backend/config/logging.js` - Logging configuration

**Frontend**:
- `frontend/src/utils/logger.js` - Frontend logger wrapper
- `frontend/src/utils/errorBoundaryLogger.js` - Error boundary logging

**Documentation**:
- `docs/LOGGING_STANDARDS.md` - Logging standards and guidelines
- `docs/LOGGING_SETUP.md` - Setup and configuration
- `docs/LOGGING_EXAMPLES.md` - Usage examples

### External Resources
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Express Winston](https://github.com/bithavoc/express-winston)
- [Pino (Alternative)](https://getpino.io/)
- [Log Levels Best Practices](https://www.dataset.com/blog/the-10-commandments-of-logging/)
- [Logtail](https://betterstack.com/logs)
- [AWS CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)

## Risk Mitigation

### Potential Risks

**Risk 1**: Logging overhead impacts performance
- **Mitigation**: Winston/Pino are highly optimized; use async transports
- **Mitigation**: Only log at INFO level in production
- **Contingency**: Profile if concerns arise, adjust log levels

**Risk 2**: Logs contain sensitive data despite redaction
- **Mitigation**: Comprehensive redaction rules, manual audit
- **Mitigation**: Test redaction with real data in staging
- **Contingency**: Immediate log purge if leak discovered

**Risk 3**: Log volume overwhelms aggregation service
- **Mitigation**: Start with conservative log levels (INFO+ only)
- **Mitigation**: Monitor log volume and costs
- **Contingency**: Adjust log levels or sampling rate

**Risk 4**: Breaking changes during migration
- **Mitigation**: Run logger alongside console.log initially
- **Mitigation**: Gradual rollout, one module at a time
- **Contingency**: Keep console.log fallbacks temporarily

**Risk 5**: Team resistance to logging discipline
- **Mitigation**: Clear documentation and training
- **Mitigation**: Code review enforcement
- **Contingency**: Automated linting rules for console.log

**Risk 6**: Lost context during async operations
- **Mitigation**: Use AsyncLocalStorage for request context (Node.js 12+)
- **Mitigation**: Explicitly pass context loggers
- **Contingency**: Include manual request ID tracking

## Success Metrics

### Quantitative Metrics
- **Migration Progress**: >95% of console.log statements replaced
- **Log Coverage**: 100% of API requests logged
- **Error Logging**: 100% of errors logged with context
- **Performance Impact**: <5ms overhead per request
- **Log Volume**: Predictable, manageable volume in production
- **Redaction Effectiveness**: Zero sensitive data leaks

### Qualitative Metrics
- **Debugging Speed**: Faster incident resolution with searchable logs
- **Developer Experience**: Team finds logging helpful, not burdensome
- **Observability**: Can understand application behavior from logs alone
- **Security**: Complete audit trail for authentication events
- **Compliance**: Logs meet regulatory requirements

## Timeline Estimate

### 6-Week Implementation Plan

**Week 1: Infrastructure**
- Days 1-2: Install Winston, create logger utility
- Days 3-4: Create request middleware (ID, timing, logging)
- Day 5: Test logging infrastructure, document usage

**Week 2: Core Services**
- Days 1-2: Migrate database layer (`db.js`, query wrappers)
- Days 3-4: Migrate authentication (`users.js`, `auth.js`)
- Day 5: Test core service logging

**Week 3: Controllers and Routes**
- Days 1-2: Migrate simple controllers (course, professor)
- Days 3-4: Migrate complex controllers (search2, planner2)
- Day 5: Migrate all routes

**Week 4: Services and Frontend**
- Days 1-2: Migrate service layer (`services/*.js`)
- Days 3-5: Create frontend logger, migrate components

**Week 5: Production Setup**
- Days 1-2: Configure log aggregation service
- Days 3-4: Set up sensitive data redaction
- Day 5: Production deployment and testing

**Week 6: Documentation and Polish**
- Days 1-3: Write logging standards documentation
- Days 4-5: Team training, address issues, final cleanup

## Labels
`enhancement`, `observability`, `logging`, `backend`, `frontend`, `infrastructure`, `difficulty level: medium`, `priority level: high`

## Dependencies
- Blocks: Complete observability project
- Depends on: Observability Infrastructure Setup (Issue #4)
- Related to: Error Tracking (Issue #2), APM Implementation (Issue #3)