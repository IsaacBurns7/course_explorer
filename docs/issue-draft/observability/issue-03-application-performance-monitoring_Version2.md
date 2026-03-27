# Application Performance Monitoring (APM) - Performance Visibility and Optimization

## Problem Description / Summary

The application currently has zero visibility into performance characteristics, making it impossible to understand bottlenecks, optimize slow operations, or proactively identify performance degradation before users complain. The team faces:

### Performance Visibility Gaps

**No Performance Metrics**:
- **Request Duration Unknown**: Don't know how long API requests take
- **Database Query Performance**: No visibility into slow queries or N+1 problems
- **Frontend Rendering**: Don't know which components are slow to render
- **Resource Utilization**: CPU, memory, connection pool usage unknown
- **Throughput Metrics**: Don't track requests per second or concurrent users

**Cannot Identify Bottlenecks**:
- **Slow Endpoints Unknown**: Don't know which endpoints are slowest
- **Algorithm Performance**: Schedule generation algorithm performance unmonitored
- **Database Bottlenecks**: Cannot identify slow queries or missing indexes
- **External API Delays**: Don't know when third-party APIs are slow
- **Frontend Bottlenecks**: Don't know which user interactions are sluggish

**No Performance Baselines**:
- **No SLA Targets**: No defined performance targets (e.g., p95 < 500ms)
- **No Trend Analysis**: Cannot see if performance is degrading over time
- **No Capacity Planning**: Don't know current capacity or when to scale
- **No Regression Detection**: New releases may introduce performance issues silently

**User Experience Impact**:
- **Slow Experience Unknown**: Users experience slowness but team doesn't know where
- **Inconsistent Performance**: Some users experience slowness, others don't - cannot diagnose
- **Peak Load Issues**: Performance problems during high traffic go unnoticed
- **Mobile Performance**: Mobile users may have worse experience but no data

### Specific Performance Pain Points in Course Explorer

Based on code analysis, critical performance monitoring gaps include:

**Backend Performance** (`backend/`):

1. **Schedule Generation Algorithm** (`backend/controllers/planner2.js`):
   - **Most Critical Performance Concern**
   - Lines 374-477: Complex beam search algorithm
   - Can process thousands of schedule permutations
   - No timing instrumentation
   - No visibility into:
     - How long generation takes
     - How many states explored
     - How many schedules pruned
     - Memory usage during search
     - When to optimize beam width
   - Users may wait 5-30 seconds with no feedback
   - No timeout enforcement
   - Cannot identify when algorithm is inefficient

2. **Database Query Performance**:
   - `backend/controllers/sql/getClassInfo.sql` (97 lines):
     - Complex multi-join query
     - JSON aggregation
     - No query timing
     - Cannot detect slow queries
   - `backend/controllers/sql/getBestClasses.sql` (102 lines):
     - Even more complex query
     - Multiple CTEs and aggregations
     - No performance monitoring
   - Connection pool metrics unknown:
     - Active connections
     - Queued requests
     - Pool exhaustion detection

3. **Search Performance** (`backend/controllers/search2.js`):
   - Professor data aggregation (lines 17-82)
   - Multiple database queries per request
   - No query result caching visibility
   - Response time unknown

4. **Data Import Performance** (`backend/services/insertData.js`):
   - Batch inserts of thousands of records
   - No progress monitoring
   - No throughput metrics (records/second)
   - Cannot estimate completion time

5. **External API Performance** (`backend/services/ratings/getProfsAPI.js`):
   - RateMyProfessors API calls
   - Pagination through thousands of professors
   - Retry logic with backoff (lines 48-58)
   - No monitoring of:
     - API response times
     - Retry frequency
     - Total time for full sync

**Frontend Performance** (`frontend/src/`):

1. **Initial Load Time**:
   - No measurement of:
     - Time to First Byte (TTFB)
     - First Contentful Paint (FCP)
     - Largest Contentful Paint (LCP)
     - Time to Interactive (TTI)
   - Bundle size unknown (likely large)
   - No code splitting visibility

2. **Component Rendering Performance**:
   - `frontend/src/components/TeacherTable.js`:
     - Renders large tables of professors
     - May have 10-50+ professors
     - No virtualization
     - Render time unknown
   - `frontend/src/components/GPATrendsChart.js`:
     - Chart rendering performance unknown
     - May render complex line charts
   - `frontend/src/pages/Planner.js`:
     - Complex state management
     - Frequent re-renders
     - No performance profiling

3. **API Call Performance (Frontend Perspective)**:
   - Fetch request timing unknown
   - Network latency not measured
   - Cannot identify slow API endpoints from user perspective
   - No retry or timeout metrics

4. **User Interaction Performance**:
   - Autocomplete search (`frontend/src/components/Search.js`):
     - User types, sees suggestions
     - Latency between keystroke and results unknown
   - Schedule generation trigger:
     - User clicks "Generate Schedule"
     - Wait time unknown to monitoring
     - No progress indicators monitored

**Performance Anti-Patterns Found**:

1. **No Caching** (throughout):
   - Course and professor data fetched repeatedly
   - No cache hit rate metrics
   - Cannot determine if caching would help

2. **Potential N+1 Queries** (controllers):
   - May be querying database in loops
   - Cannot detect without query monitoring

3. **Large Payload Responses** (API responses):
   - Some responses may be very large (professor data, sections)
   - No response size monitoring
   - Compression status unknown

4. **Synchronous Operations** (schedule algorithm):
   - Blocking operations with no parallelization
   - Cannot identify opportunities for async optimization

## Expected Behavior

After APM implementation:

### Performance Metrics Collection
- **Request Metrics**: Duration, throughput, status codes for all endpoints
- **Database Metrics**: Query duration, connection pool stats, slow query detection
- **Frontend Metrics**: Page load times, component render times, Core Web Vitals
- **Resource Metrics**: CPU, memory, disk usage, connection counts
- **Custom Metrics**: Business-specific metrics (schedules generated, searches performed)

### Performance Visibility
- **Real-time Dashboards**: Live view of application performance
- **Historical Trends**: Performance over time (hourly, daily, weekly)
- **Percentile Metrics**: p50, p95, p99 response times
- **Error Rate Correlation**: Correlate errors with performance degradation
- **User Experience Metrics**: Real User Monitoring (RUM) data

### Performance Analysis
- **Slow Endpoint Identification**: Automatically identify slowest endpoints
- **Transaction Tracing**: Trace single request through entire stack
- **Flame Graphs**: Visualize where time is spent in code
- **Database Query Analysis**: Identify slow queries, N+1 problems, missing indexes
- **Bottleneck Detection**: Pinpoint exact line of code causing slowness

### Performance Alerting
- **SLA Violations**: Alert when response times exceed targets
- **Performance Degradation**: Alert on significant slowdown trends
- **Resource Exhaustion**: Alert when CPU/memory/connections high
- **Capacity Thresholds**: Alert when approaching capacity limits

### Performance Optimization
- **Data-Driven Decisions**: Optimize based on actual performance data, not guesses
- **Regression Detection**: Identify performance regressions in new releases
- **A/B Testing**: Compare performance of different implementations
- **Capacity Planning**: Understand when to scale based on metrics

## Context

### Technical Environment
- **Node Version**: 20.11 LTS
- **Backend Framework**: Express.js 4.x
- **Frontend Framework**: React 18.x
- **Database**: PostgreSQL via Neon (serverless)
- **Current Monitoring**: None
- **Target APM**: Sentry Performance, New Relic, DataDog, or alternatives
- **Deployment**: Docker containers (likely)

### APM Platform Comparison

**Sentry Performance** (Recommended if using Sentry for errors):
- **Pros**:
  - Integrated with error tracking
  - Transaction tracing
  - Database query monitoring
  - Frontend performance monitoring (LCP, FID, CLS)
  - Affordable (included in paid tier)
  - Single platform for errors + performance
- **Cons**:
  - Less feature-rich than dedicated APM tools
  - Fewer advanced profiling features

**New Relic** (Best-in-class APM):
- **Pros**:
  - Comprehensive APM features
  - Excellent transaction tracing
  - Distributed tracing
  - Custom dashboards
  - Infrastructure monitoring
- **Cons**:
  - Expensive ($99+/month)
  - Overkill for small applications

**DataDog** (Comprehensive observability):
- **Pros**:
  - Full observability platform (logs, metrics, traces, APM)
  - Excellent for microservices
  - Infrastructure monitoring
  - Custom metrics
- **Cons**:
  - Very expensive at scale
  - Complex setup

**Elastic APM** (Open source):
- **Pros**:
  - Free and open source
  - Part of Elastic Stack
  - Good Node.js and React support
- **Cons**:
  - Requires self-hosting
  - Maintenance burden

**Application Insights** (Azure):
- **Pros**:
  - Good if using Azure
  - Integrated with Azure services
- **Cons**:
  - Requires Azure account

**Recommendation for Course Explorer**: **Sentry Performance**
- Already using Sentry for errors (or will be)
- Affordable pricing
- Good enough for application size
- Easy integration (already have SDK)
- Can upgrade to New Relic later if needed

### Core Web Vitals (Frontend Performance)

Critical metrics for user experience:
- **LCP (Largest Contentful Paint)**: <2.5s good, <4s needs improvement
- **FID (First Input Delay)**: <100ms good, <300ms needs improvement  
- **CLS (Cumulative Layout Shift)**: <0.1 good, <0.25 needs improvement
- **TTFB (Time to First Byte)**: <200ms good, <600ms needs improvement

## Acceptance Criteria

### Phase 1: APM Platform Setup (Week 1)
- [ ] APM platform account created (Sentry Performance or alternative)
- [ ] Backend APM configured
- [ ] Frontend APM configured
- [ ] Sample transactions captured successfully
- [ ] Team access configured
- [ ] Basic dashboards created

### Phase 2: Backend Performance Monitoring (Week 1-2)
- [ ] All API endpoints instrumented for performance
- [ ] Database query performance tracked
- [ ] Transaction tracing enabled
- [ ] Custom spans for critical operations
- [ ] Resource metrics collected (CPU, memory)
- [ ] Connection pool metrics tracked

### Phase 3: Frontend Performance Monitoring (Week 2)
- [ ] Core Web Vitals tracked (LCP, FID, CLS)
- [ ] Page load performance measured
- [ ] Component render performance profiled (critical components)
- [ ] API call timing from frontend perspective
- [ ] User interaction timing

### Phase 4: Custom Metrics and Instrumentation (Week 2-3)
- [ ] Schedule generation performance tracked
- [ ] Beam search algorithm metrics collected
- [ ] Database query performance categorized
- [ ] External API performance tracked
- [ ] Business metrics collected (searches, schedules generated)

### Phase 5: Performance Dashboards (Week 3)
- [ ] Overall application health dashboard
- [ ] Endpoint performance dashboard (slowest endpoints)
- [ ] Database performance dashboard (slow queries)
- [ ] Frontend performance dashboard (Core Web Vitals)
- [ ] Business metrics dashboard

### Phase 6: Performance Alerting (Week 3-4)
- [ ] SLA alerts configured (p95 response time thresholds)
- [ ] Slow query alerts set up
- [ ] Resource exhaustion alerts configured
- [ ] Performance degradation alerts enabled
- [ ] Slack integration for performance alerts

### Phase 7: Performance Optimization (Week 4+)
- [ ] Identify top 5 slowest endpoints
- [ ] Optimize schedule generation algorithm
- [ ] Add database indexes where needed
- [ ] Implement caching where beneficial
- [ ] Measure optimization impact

### Phase 8: Documentation (Week 4)
- [ ] APM usage documentation
- [ ] Performance SLA targets documented
- [ ] Performance optimization runbook
- [ ] Team training on APM platform

### Quality Metrics
- [ ] 100% of API endpoints have performance tracking
- [ ] All database queries instrumented
- [ ] Frontend Core Web Vitals tracked for all pages
- [ ] Performance data available within 1 minute of event
- [ ] Performance alerts trigger appropriately

## Proposed Solution / Ideas

### Overall Strategy

The implementation follows a **metrics-first, optimize-later approach**:

1. **Instrumentation First** - Collect data before optimizing
2. **Identify Bottlenecks** - Find actual slow operations, not assumed ones
3. **Set Baselines** - Establish current performance levels
4. **Define SLAs** - Set realistic performance targets
5. **Optimize Worst First** - Focus on biggest performance issues
6. **Measure Impact** - Verify optimizations actually help
7. **Continuous Monitoring** - Ongoing performance tracking

### Phase 1: APM Platform Setup

#### Sentry Performance Setup
If using Sentry (recommended):

**Enable Performance Monitoring**:
- Upgrade Sentry plan if on free tier (or stay on free tier with sampling)
- Enable performance monitoring in project settings
- Configure sample rate (100% in dev, 10-50% in production)

**Backend SDK Configuration**:
Update `backend/utils/sentry.js`:
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new ProfilingIntegration(),
  ],
  profilesSampleRate: 0.1, // Optional profiling
});
```

**Frontend SDK Configuration**:
Update `frontend/src/utils/sentry.js`:
```javascript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/yourapp\.com\/api/],
    }),
  ],
  tracesSampleRate: 1.0, // Can reduce in production
});
```

### Phase 2: Backend Performance Monitoring

#### Express Request Instrumentation
Sentry automatically instruments Express requests:
- Creates transaction for each request
- Tracks request duration
- Records status code
- Includes route pattern

**Custom Transaction Names**:
Set meaningful transaction names:
```javascript
app.use((req, res, next) => {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction();
  if (transaction) {
    transaction.setName(`${req.method} ${req.route?.path || req.path}`);
  }
  next();
});
```

#### Database Query Instrumentation
Create database wrapper with spans:

**Query Wrapper**:
```javascript
async function tracedQuery(queryName, query, params) {
  const span = Sentry.startSpan({
    op: 'db.query',
    description: queryName,
  });
  
  try {
    const startTime = Date.now();
    const result = await pool.query(query, params);
    const duration = Date.now() - startTime;
    
    span.setData('duration_ms', duration);
    span.setData('row_count', result.rowCount);
    
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: queryName,
        duration,
        rowCount: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.finish();
  }
}
```

**Usage in Controllers**:
Replace direct `pool.query()` calls with `tracedQuery()`:
```javascript
// Before:
const result = await pool.query(sql, [courseId]);

// After:
const result = await tracedQuery('get_course_details', sql, [courseId]);
```

#### Custom Spans for Critical Operations
Instrument complex operations:

**Schedule Generation** (`backend/controllers/planner2.js`):
```javascript
async function getOptimalSchedule(req, res) {
  const transaction = Sentry.startTransaction({
    op: 'schedule.generate',
    name: 'Generate Optimal Schedule'
  });
  
  try {
    // Parse input
    const parseSpan = transaction.startChild({
      op: 'schedule.parse_input',
      description: 'Parse course IDs and constraints'
    });
    const courses = req.body.courses;
    parseSpan.setData('course_count', courses.length);
    parseSpan.finish();
    
    // Fetch course/professor data
    const fetchSpan = transaction.startChild({
      op: 'schedule.fetch_data',
      description: 'Fetch course and professor data'
    });
    const coursesMap = await fetchCourseData(courses);
    fetchSpan.setData('sections_fetched', Object.keys(coursesMap).length);
    fetchSpan.finish();
    
    // Run beam search algorithm
    const algoSpan = transaction.startChild({
      op: 'schedule.beam_search',
      description: 'Beam search algorithm'
    });
    let statesExplored = 0;
    let statesPruned = 0;
    // ... beam search logic with counters
    algoSpan.setData('states_explored', statesExplored);
    algoSpan.setData('states_pruned', statesPruned);
    algoSpan.setData('schedules_generated', topSchedules.length);
    algoSpan.finish();
    
    transaction.setStatus('ok');
    return res.json({ schedules: topSchedules });
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
```

**Benefits**:
- See breakdown of time spent in each phase
- Identify if algorithm is slow or data fetching is slow
- Track algorithm efficiency metrics
- Detect regressions in algorithm performance

#### External API Performance
Track external API calls:

**RateMyProfessors API** (`backend/services/ratings/getProfsAPI.js`):
```javascript
async function fetchPage({ after }) {
  const span = Sentry.startSpan({
    op: 'http.client',
    description: 'RateMyProfessors API call'
  });
  
  try {
    const startTime = Date.now();
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    const duration = Date.now() - startTime;
    
    span.setData('duration_ms', duration);
    span.setData('status_code', res.status);
    span.setData('after_cursor', after);
    
    if (!res.ok) {
      span.setStatus('http_error');
    }
    
    return await res.json();
  } finally {
    span.finish();
  }
}
```

### Phase 3: Frontend Performance Monitoring

#### Core Web Vitals Tracking
Sentry automatically tracks Core Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

**No additional code needed** - Sentry's `BrowserTracing` integration handles this.

#### Component Render Performance
Profile slow components:

**React Profiler Integration**:
```javascript
import { Profiler } from 'react';
import * as Sentry from '@sentry/react';

function onRenderCallback(
  id, // Component name
  phase, // "mount" or "update"
  actualDuration, // Time spent rendering
  baseDuration, // Estimated time without memoization
  startTime,
  commitTime,
) {
  if (actualDuration > 100) { // Warn if render takes >100ms
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Slow render: ${id}`,
      level: 'warning',
      data: {
        phase,
        actualDuration,
        baseDuration,
      }
    });
  }
}

// Wrap components
<Profiler id="TeacherTable" onRender={onRenderCallback}>
  <TeacherTable {...props} />
</Profiler>
```

**Critical Components to Profile**:
- `TeacherTable` - Large table rendering
- `GPATrendsChart` - Chart rendering
- `Planner` - Complex state management
- `ScheduleFinder` - Schedule visualization

#### API Call Timing (Frontend)
Track API call performance from frontend:

Sentry automatically instruments `fetch`, but can add custom spans:
```javascript
async function fetchCourseData(courseId) {
  const transaction = Sentry.startTransaction({
    op: 'api.fetch',
    name: 'Fetch Course Data'
  });
  
  try {
    const response = await fetch(`/api/course/${courseId}`);
    transaction.setData('status', response.status);
    return await response.json();
  } finally {
    transaction.finish();
  }
}
```

#### User Interaction Timing
Track user-initiated actions:

**Schedule Generation Click**:
```javascript
const handleGenerateSchedule = async () => {
  const transaction = Sentry.startTransaction({
    op: 'user.interaction',
    name: 'Generate Schedule Button Click'
  });
  
  setLoading(true);
  
  try {
    const response = await generateSchedule(selectedCourses);
    transaction.setData('courses_count', selectedCourses.length);
    transaction.setData('schedules_found', response.schedules.length);
    setSchedules(response.schedules);
    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    setLoading(false);
    transaction.finish();
  }
};
```

### Phase 4: Custom Metrics and Business Metrics

#### Custom Metrics
Track application-specific metrics:

**Sentry Custom Metrics**:
```javascript
// Track searches performed
Sentry.metrics.increment('search.performed', 1, {
  tags: { search_type: 'course' }
});

// Track schedule generation
Sentry.metrics.distribution('schedule.generation_time', duration, {
  unit: 'millisecond',
  tags: { courses_count: String(courses.length) }
});

// Track beam search efficiency
Sentry.metrics.gauge('schedule.beam_width', beamWidth, {
  tags: { courses_count: String(courses.length) }
});
```

#### Business Metrics
Track key business indicators:

**Usage Metrics**:
- Searches performed per day
- Schedules generated per day
- Unique users per day
- Courses viewed per day

**Feature Metrics**:
- Planner usage (planners created, modified)
- Scheduler usage (schedules generated)
- Compare usage (professors compared)

### Phase 5: Performance Dashboards

#### Default Dashboards
Use built-in Sentry dashboards:
- **Performance Overview**: All transactions, avg duration, throughput
- **Web Vitals**: LCP, FID, CLS for all pages
- **Database**: Query performance, slow queries
- **HTTP**: External API call performance

#### Custom Dashboards
Create application-specific dashboards:

**Application Health Dashboard**:
- Request rate (requests/minute)
- Error rate (errors/minute)
- p50, p95, p99 response times
- Database connection pool status
- Memory usage

**Schedule Generation Dashboard**:
- Schedule generation requests
- Average generation time
- p95 generation time
- Beam search efficiency metrics
- Generation success rate

**Database Performance Dashboard**:
- Slow queries (>1s)
- Query count by type
- Connection pool usage
- N+1 query detection

### Phase 6: Performance Alerting

#### SLA Alert Rules
Define and alert on SLA violations:

**Response Time SLAs**:
- API p95 response time < 500ms
- Schedule generation p95 < 5s
- Database queries p95 < 200ms

**Alert Configuration**:
```
Alert: API Response Time SLA Violation
Condition: p95 response time > 500ms for 5 minutes
Action: Notify #engineering-alerts on Slack
Severity: Warning
```

**Resource Alerts**:
```
Alert: High Memory Usage
Condition: Memory > 80% for 10 minutes
Action: Notify #ops on Slack
Severity: Critical
```

### Phase 7: Performance Optimization

#### Optimization Workflow
1. **Identify**: Use APM to find slowest operations
2. **Measure**: Baseline current performance
3. **Optimize**: Implement optimization
4. **Verify**: Measure impact with APM
5. **Iterate**: Continue with next bottleneck

#### Common Optimizations

**Database Optimizations**:
- Add indexes for frequently queried columns
- Optimize complex queries (CTEs, joins)
- Implement query result caching
- Use connection pooling effectively

**Algorithm Optimizations**:
- Optimize beam search parameters
- Parallelize independent operations
- Cache intermediate results
- Implement early termination conditions

**Frontend Optimizations**:
- Code splitting for faster initial load
- Lazy loading components
- Memoization for expensive computations
- Virtualization for large lists

**Caching Strategy**:
- Cache course/professor data (rarely changes)
- Cache search results (10-minute TTL)
- Cache schedule results for same inputs
- Implement HTTP caching headers

## Relevant Code / Links

### Files Requiring Performance Instrumentation

**Backend** (30+ files):
- `backend/controllers/planner2.js` - **CRITICAL** - Schedule generation
- `backend/controllers/search2.js` - Search queries
- `backend/controllers/course.js` - Course data
- `backend/controllers/professor.js` - Professor data
- `backend/db.js` - Database operations
- `backend/services/*.js` - Service operations
- All route handlers

**Frontend** (20+ files):
- `frontend/src/pages/Scheduler.js` - Schedule generation UI
- `frontend/src/pages/Planner.js` - Planner state management
- `frontend/src/components/TeacherTable.js` - Large table rendering
- `frontend/src/components/GPATrendsChart.js` - Chart rendering
- `frontend/src/components/Search.js` - Autocomplete
- All major pages

### New Files to Create

**Backend**:
- `backend/utils/performance.js` - Performance tracking utilities
- `backend/middleware/performanceMonitoring.js` - Request timing middleware
- `backend/utils/tracedQuery.js` - Database query wrapper with tracing

**Frontend**:
- `frontend/src/utils/performance.js` - Performance tracking utilities
- `frontend/src/components/PerformanceProfiler.js` - React Profiler wrapper

**Documentation**:
- `docs/PERFORMANCE_SLA.md` - Performance SLA targets
- `docs/PERFORMANCE_OPTIMIZATION.md` - Optimization guide and runbook
- `docs/APM_USAGE.md` - How to use APM platform

### External Resources
- [Sentry Performance](https://docs.sentry.io/product/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

## Risk Mitigation

### Potential Risks

**Risk 1**: Performance overhead from instrumentation
- **Mitigation**: Sampling reduces overhead (10% in production)
- **Mitigation**: APM SDKs are optimized for low overhead
- **Contingency**: Reduce sample rate if needed

**Risk 2**: Information overload from metrics
- **Mitigation**: Start with high-level dashboards, drill down as needed
- **Mitigation**: Focus on actionable metrics first
- **Contingency**: Simplify dashboards, focus on key metrics

**Risk 3**: Cost overruns on APM platform
- **Mitigation**: Monitor usage, start with free/lower tier
- **Mitigation**: Use sampling to control data volume
- **Contingency**: Adjust sample rates or switch platforms

**Risk 4**: False performance alarms
- **Mitigation**: Tune alert thresholds based on actual patterns
- **Mitigation**: Use moving averages, not absolute values
- **Contingency**: Adjust alert sensitivity

**Risk 5**: Optimization makes things worse
- **Mitigation**: Always measure before and after optimization
- **Mitigation**: A/B test optimizations when possible
- **Contingency**: Rollback and re-measure

## Success Metrics

### Quantitative Metrics
- **Instrumentation Coverage**: 100% of API endpoints monitored
- **p95 Response Time**: <500ms for 95% of API requests
- **Database Query Time**: p95 < 200ms
- **Schedule Generation**: p95 < 5s
- **Frontend LCP**: <2.5s for all pages
- **Alert Accuracy**: <5% false positive rate

### Qualitative Metrics
- **Performance Visibility**: Team can identify slow operations immediately
- **Optimization Impact**: Data-driven optimizations improve performance measurably
- **User Experience**: Fewer complaints about slowness
- **Proactive Detection**: Performance issues detected before user reports
- **Capacity Planning**: Clear understanding of capacity limits

## Timeline Estimate

### 4-Week Implementation Plan

**Week 1: Setup and Backend**
- Days 1-2: APM platform setup, SDK configuration
- Days 3-5: Backend request and database instrumentation

**Week 2: Frontend and Custom Metrics**
- Days 1-2: Frontend Core Web Vitals and component profiling
- Days 3-4: Custom spans for critical operations (schedule generation)
- Day 5: Business metrics collection

**Week 3: Dashboards and Alerting**
- Days 1-2: Create performance dashboards
- Days 3-4: Configure performance alerts
- Day 5: Production deployment and monitoring

**Week 4: Optimization and Documentation**
- Days 1-2: Identify and optimize top bottlenecks
- Days 3-4: Documentation and runbooks
- Day 5: Team training

## Labels
`enhancement`, `observability`, `apm`, `performance`, `monitoring`, `backend`, `frontend`, `difficulty level: medium`, `priority level: high`

## Dependencies
- Depends on: Observability Infrastructure Setup (Issue #4)
- Related to: Structured Logging (Issue #1), Error Tracking (Issue #2)
- Enables: Performance optimization efforts