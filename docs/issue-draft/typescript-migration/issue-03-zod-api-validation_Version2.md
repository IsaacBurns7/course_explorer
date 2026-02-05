# Zod Schema Implementation - Runtime Type Safety and API Validation

## Problem Description / Summary

While TypeScript provides compile-time type safety, it offers **no runtime validation** for data entering the application from external sources. This creates a critical gap in type safety because TypeScript types are erased at runtime. The application currently lacks:

### Runtime Type Validation Gaps
- **API Boundaries**: No validation that incoming requests match expected types
- **Database Results**: PostgreSQL queries return data assumed to match TypeScript types, but this is not verified
- **External API Responses**: No validation of responses from external services
- **Configuration**: Environment variables and config files are not validated
- **User Input**: Form data and query parameters are not validated against schemas
- **Type Coercion**: No safe way to transform and validate data between representations

### Current Problems Without Runtime Validation

**Problem 1: Trust Boundary Violations**
When data enters the application from:
- HTTP request bodies - Could be malformed, missing fields, wrong types
- URL parameters - Could be injection attacks, wrong format
- Query strings - Could contain unexpected values
- Database responses - Could have nulls where not expected if schema changes
- Environment variables - Could be missing or malformed

TypeScript types provide **zero protection** against these at runtime.

**Problem 2: Silent Failures**
Without validation, invalid data leads to:
- `undefined` errors deep in application logic
- Type assertions that are actually incorrect
- Database constraint violations
- 500 errors with cryptic messages
- Security vulnerabilities (injection, XSS, etc.)

**Problem 3: Poor Error Messages**
When validation fails (e.g., database constraint), errors are:
- Generic database error messages
- Stack traces with no context
- No indication of which field failed
- No clear path to resolution for API consumers

**Problem 4: Testing Overhead**
Without schemas, testing requires:
- Manual construction of test data
- Guessing at valid/invalid data shapes
- Extensive edge case testing
- Mocking without type safety

**Problem 5: Documentation Drift**
API documentation (OpenAPI/Swagger) can drift from implementation because:
- Documentation is separate from validation logic
- No single source of truth for data shapes
- Manual documentation updates are forgotten

### Specific Pain Points in Course Explorer

**Frontend → Backend API Calls**:
- `POST /api/planner2/getClassInfo` - Request body `{ class: string }` not validated
- `POST /api/planner2/getBestClassesText` - PDF/text content not validated
- `GET /api/search2/professors` - Query params `department`, `courseNumber` not validated
- Authentication tokens - JWT payload not validated against schema

**Backend → Database Queries**:
- Query results assumed to match TypeScript types, but:
  - Database schema could change
  - Nullability could differ from expectations
  - JSON aggregations might return unexpected shapes
  - Complex SQL results (getClassInfo.sql, getBestClasses.sql) are unvalidated

**Third-Party Integrations**:
- Google OAuth profile - Shape assumed but not validated
- Environment variables - Assumed to exist and be correct format
- Configuration files - No schema validation

**Data Transformations**:
- Course data parsing from degree plans - Format assumptions not validated
- PDF parsing results - Structure not validated
- GPA calculations - Input data validity not checked

## Expected Behavior

With Zod schema validation implemented:

### Request Validation
- **All POST/PUT endpoints** validate request bodies against Zod schemas
- **All GET endpoints** validate query parameters against schemas
- **All routes** validate URL parameters against schemas
- **Invalid requests** return 400 with detailed error messages indicating exact validation failures
- **Valid requests** pass typed, parsed data to controllers

### Response Validation
- **All API responses** validated against output schemas (in development)
- **Response shapes** guaranteed to match documentation
- **Unexpected data** caught before sending to client
- **Type safety** end-to-end from database through API

### Database Validation
- **Query results** validated against expected schemas
- **Schema mismatches** caught immediately with clear errors
- **Null handling** explicitly defined in schemas
- **Type coercion** handled safely (e.g., string to number)

### Configuration Validation
- **Environment variables** validated at startup
- **Missing or invalid config** prevents app startup with clear error
- **Type-safe access** to all configuration values

### Error Handling
- **Validation errors** return structured error responses
- **Field-level errors** indicate exactly what's wrong
- **Client-friendly messages** guide developers to fix issues
- **Consistent error format** across all endpoints

### Developer Experience
- **Schemas as documentation** - Single source of truth
- **IntelliSense for schemas** - TypeScript types generated from Zod
- **Easy testing** - Generate valid/invalid test data from schemas
- **Refactoring safety** - Schema changes propagate to types

## Context

### Technical Environment
- **Validation Library**: Zod 3.x
- **Node Version**: 20.11 LTS
- **TypeScript**: 5.x
- **Express**: 4.x for request validation
- **React**: 18.x for form validation (frontend)
- **Backend**: Express.js REST API
- **Frontend**: React with form submissions

### Why Zod?

Zod chosen over alternatives (Joi, Yup, io-ts, AJV) because:
- **TypeScript-first**: Designed specifically for TypeScript
- **Type inference**: TypeScript types automatically inferred from schemas
- **Excellent ergonomics**: Clean, intuitive API
- **Comprehensive**: Handles all validation needs (primitives, objects, arrays, unions, etc.)
- **Zero dependencies**: Lightweight
- **Great error messages**: Detailed validation errors out of the box
- **Transform support**: Parse and transform data safely
- **Composable**: Schemas can be built from smaller schemas

## Acceptance Criteria

### Phase 1: Setup and Core Schemas (Week 1)
- [ ] Zod installed in both frontend and backend
- [ ] Schema directory structure created
- [ ] Core domain schemas defined:
  - `schemas/course.schema.ts` - Course, Section, Professor
  - `schemas/user.schema.ts` - User, JWT payload
  - `schemas/planner.schema.ts` - Planner data, semester
  - `schemas/api.schema.ts` - Request/response wrappers
- [ ] Schema documentation written
- [ ] Type inference patterns established

### Phase 2: Request Validation Middleware (Week 1-2)
- [ ] Express middleware created for request validation
- [ ] Middleware validates body, query, params based on schemas
- [ ] Validation errors return structured 400 responses
- [ ] Middleware integrates with existing routes seamlessly
- [ ] TypeScript types inferred from schemas in route handlers

### Phase 3: API Endpoint Validation (Week 2-3)
- [ ] All POST/PUT endpoints validate request bodies:
  - `/api/planner2/getClassInfo`
  - `/api/planner2/getBestClassesText`
  - `/api/planner2/getBestClassesPDF`
  - `/auth/logout`
- [ ] All GET endpoints validate query parameters:
  - `/api/search2/professors?department=X&courseNumber=Y`
  - `/api/search2/course?department=X&courseNumber=Y`
- [ ] All dynamic routes validate URL parameters:
  - `/course/:courseId`
- [ ] All endpoints return typed, validated data

### Phase 4: Response Validation (Week 3-4)
- [ ] Response schemas defined for all endpoints
- [ ] Response validation middleware created (dev mode only)
- [ ] Response type mismatches logged as errors
- [ ] Production mode skips response validation for performance

### Phase 5: Database Query Validation (Week 4)
- [ ] Database result schemas defined for common queries
- [ ] Query wrapper functions validate results
- [ ] SQL file result types validated
- [ ] Null handling explicitly managed

### Phase 6: Configuration and Environment (Week 4)
- [ ] Environment variable schema defined
- [ ] Config validated at startup
- [ ] Missing/invalid config prevents startup
- [ ] Typed environment object exported

### Phase 7: Frontend Form Validation (Week 5)
- [ ] Form schemas defined using shared Zod schemas
- [ ] Form validation integrated with React Hook Form or similar
- [ ] Client-side validation matches server-side
- [ ] Error messages displayed to users

### Phase 8: Testing and Documentation (Week 5-6)
- [ ] Schema test utilities created
- [ ] Generate valid test data from schemas
- [ ] Generate invalid test data for error cases
- [ ] API documentation generated from schemas (consider zod-to-openapi)
- [ ] Schema documentation complete

### Quality Metrics
- [ ] 100% of POST/PUT endpoints validate request bodies
- [ ] 100% of GET endpoints validate query parameters
- [ ] All environment variables validated at startup
- [ ] Zero validation errors slip through to controllers
- [ ] All validation errors return helpful messages

## Proposed Solution / Ideas

### Overall Strategy

The implementation follows a **pragmatic, layered approach**:

1. **Schemas First** - Define all schemas before adding validation
2. **Request Validation First** - Most important validation point
3. **Response Validation (Dev Only)** - Catch bugs without performance hit
4. **Incremental Rollout** - Validate one endpoint at a time
5. **Share Schemas** - Frontend and backend use same schemas where possible
6. **Type Safety** - Leverage Zod's type inference everywhere

### Phase 1: Schema Definition Strategy

#### Schema Organization
Create schemas in dedicated directory:

```
backend/src/schemas/
├── index.ts              # Re-export all schemas
├── common.schema.ts      # Shared primitives and utilities
├── course.schema.ts      # Course domain models
├── professor.schema.ts   # Professor domain models
├── user.schema.ts        # User and auth schemas
├── planner.schema.ts     # Planner-specific schemas
├── api.schema.ts         # API request/response wrappers
└── env.schema.ts         # Environment variable schema
```

For frontend (if sharing schemas):
```
frontend/src/schemas/
├── index.ts              # Re-export schemas
└── (import from backend or duplicate)
```

#### Schema Design Patterns

**Basic Entity Schema Pattern**:
Define base schema, then extend with refinements and transforms.

**Course Schema Example** (conceptual):
- Define core fields (id, department, number, title)
- Add optional fields (description, credits)
- Add refinements (department must be uppercase)
- Create variants (CourseInput, CourseOutput, CourseDB)

**Request/Response Wrapper Pattern**:
Wrap endpoint-specific schemas in request/response containers.

**Reusable Schema Pattern**:
Create small, composable schemas for common patterns (pagination, filters, etc.).

#### Type Inference
Extract TypeScript types from Zod schemas:
```typescript
// Schema
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string()
});

// Inferred TypeScript type
type User = z.infer<typeof UserSchema>;
// equivalent to: { id: number; email: string; name: string; }
```

This ensures **single source of truth**: schema defines both validation and types.

### Phase 2: Request Validation Middleware

#### Validation Middleware Design

Create Express middleware that:
1. Accepts Zod schemas for body, query, params
2. Validates request data against schemas
3. Parses and transforms data (e.g., string "123" → number 123)
4. Attaches validated data to request object
5. Returns 400 with detailed errors on validation failure
6. Passes control to handler on success

#### Middleware Usage Pattern

**Define Endpoint Schemas**:
For each endpoint, define:
- Body schema (for POST/PUT)
- Query schema (for GET)
- Params schema (for URL parameters)

**Apply Middleware to Routes**:
Insert validation middleware before route handler.

**Access Validated Data in Handler**:
Request object has typed, validated, parsed data.

#### Error Response Format

Validation errors return structured 400 response:
```json
{
  "success": false,
  "error": "Validation failed",
  "issues": [
    {
      "path": ["body", "class"],
      "message": "Required"
    },
    {
      "path": ["query", "department"],
      "message": "Must be uppercase"
    }
  ]
}
```

This format:
- Clearly indicates validation failure
- Lists all validation errors (not just first one)
- Shows exact field path that failed
- Provides human-readable error messages

### Phase 3: API Endpoint Validation Implementation

#### Endpoint-by-Endpoint Rollout

**Planner Endpoints** (`/api/planner2/*`):
- `POST /api/planner2/getClassInfo`
  - Body: `{ class: string }` where string matches "DEPT NNN" pattern
  - Validate department is 2-4 uppercase letters
  - Validate number is 3 digits
- `POST /api/planner2/getBestClassesText`
  - Body: `{ content: string }` non-empty
  - Validate content contains valid degree plan format
- `POST /api/planner2/getBestClassesPDF`
  - Body: File upload validation
  - Validate file type is PDF
  - Validate file size limits

**Search Endpoints** (`/api/search2/*`):
- `GET /api/search2/professors?department=X&courseNumber=Y`
  - Query: `department` (uppercase string, 2-4 chars), `courseNumber` (string, 3 digits)
- `GET /api/search2/course?department=X&courseNumber=Y`
  - Same validation as professors endpoint

**Course Endpoints** (`/api/courses/*`):
- `GET /api/courses/getAll`
  - No parameters, but validate response shape

**Professor Endpoints** (`/api/professors/*`):
- `GET /api/professors/getAll`
  - No parameters, but validate response shape

**Auth Endpoints** (`/auth/*`):
- `POST /auth/logout`
  - No body, but validate cookies/session
- `GET /auth/me`
  - Validate JWT token payload format

### Phase 4: Response Validation Strategy

#### Development vs Production

**Development Mode**:
- Validate all responses against schemas
- Log validation errors to console
- Optionally throw errors to catch bugs immediately
- Helps ensure controllers return correct data

**Production Mode**:
- Skip response validation for performance
- Log unexpected shapes to monitoring service
- Don't block responses

#### Response Schema Definition

For each endpoint, define response schema matching success case:
- Shape of JSON response
- Required vs optional fields
- Nested object structures
- Array types

#### Implementation Pattern

Create response validation middleware:
- Wraps response.json() method
- Validates data before sending
- Only enabled in non-production environments
- Provides clear error when response doesn't match schema

### Phase 5: Database Query Validation

#### Query Result Validation

Wrap database queries with Zod validation:
1. Execute query
2. Validate result rows against schema
3. Throw typed error if validation fails
4. Return validated, typed result

#### SQL File Result Typing

For complex SQL queries:
- Define schema matching JSON_BUILD_OBJECT output
- Validate entire result structure
- Handle null values explicitly
- Transform database types to application types

#### Benefits

- Catch database schema changes immediately
- Handle unexpected nulls gracefully
- Ensure type safety from database to API
- Clear error messages for schema mismatches

### Phase 6: Configuration Validation

#### Environment Variable Schema

Define schema for all environment variables:
- Required variables (throw error if missing)
- Optional variables with defaults
- Type coercion (string to number, etc.)
- Format validation (URLs, email addresses, etc.)
- Custom validation (port ranges, etc.)

#### Startup Validation

Validate environment at app startup:
1. Load environment variables (dotenv)
2. Validate against schema
3. If invalid, log errors and exit process
4. If valid, export typed config object

This ensures:
- App never runs with invalid configuration
- Missing variables caught before deployment issues
- Config is type-safe throughout application

### Phase 7: Frontend Form Validation

#### Form Schema Sharing

Share Zod schemas between frontend and backend:
- Define schemas in shared package (if monorepo)
- Or duplicate essential schemas in frontend
- Ensure client and server validation match

#### Form Integration

Integrate with form libraries:
- **React Hook Form**: Has native Zod resolver
- **Formik**: Can integrate with Zod validation
- **Plain forms**: Validate manually with Zod

#### User Experience

- Validate on blur for immediate feedback
- Validate on submit before sending to server
- Show field-level error messages
- Prevent submission of invalid forms
- Match server error messages to client messages

### Phase 8: Testing with Schemas

#### Test Data Generation

Use schemas to generate test data:
- Create "valid" test data from schemas
- Create "invalid" test data by violating constraints
- Randomize data while maintaining validity

#### Testing Benefits

- Reduce test boilerplate (data generation)
- Ensure tests cover valid data shapes
- Test validation error cases systematically
- Maintain test data when schemas change

## Relevant Code / Links

### Files Needing Validation

**Backend API Endpoints** (all files in `backend/routes/`):
- `backend/routes/auth.ts` - Validate OAuth responses, JWT payloads
- `backend/routes/course.ts` - Validate query parameters
- `backend/routes/professor.ts` - Validate query parameters
- `backend/routes/search2.ts` - Validate complex queries
- `backend/routes/planner2.ts` - Validate request bodies
- `backend/routes/health.ts` - Validate (minimal)

**Backend Controllers** (validate inputs/outputs):
- `backend/controllers/course.ts`
- `backend/controllers/professor.ts`
- `backend/controllers/search2.ts`
- `backend/controllers/planner2.ts`

**Backend Database Layer**:
- `backend/db.ts` - Validate query results
- `backend/users.ts` - Validate user operations

**Frontend Forms**:
- `frontend/src/components/modals/add.js` - Course search/add form
- `frontend/src/components/Search.js` - Autocomplete search
- `frontend/src/pages/Planner.js` - Planner forms
- Any other user input forms

### New Files to Create

**Backend Schemas**:
- `backend/src/schemas/index.ts`
- `backend/src/schemas/common.schema.ts`
- `backend/src/schemas/course.schema.ts`
- `backend/src/schemas/professor.schema.ts`
- `backend/src/schemas/user.schema.ts`
- `backend/src/schemas/planner.schema.ts`
- `backend/src/schemas/api.schema.ts`
- `backend/src/schemas/env.schema.ts`

**Backend Middleware**:
- `backend/src/middleware/validate.ts` - Request validation middleware
- `backend/src/middleware/validateResponse.ts` - Response validation middleware

**Backend Utilities**:
- `backend/src/utils/validateQuery.ts` - Database result validation

**Frontend Schemas** (if separate):
- `frontend/src/schemas/` (mirror backend schemas needed for forms)

### External Resources
- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Express + Zod Examples](https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p)
- [Zod to OpenAPI](https://github.com/asteasolutions/zod-to-openapi)

## Risk Mitigation

### Potential Risks

**Risk 1**: Performance overhead from validation
- **Mitigation**: Validation is extremely fast; measure if concerned
- **Mitigation**: Skip response validation in production
- **Contingency**: Profile and optimize schemas if needed

**Risk 2**: Schema definitions are verbose
- **Mitigation**: Create reusable schema components
- **Mitigation**: Use Zod's composition features
- **Contingency**: Accept verbosity for safety benefits

**Risk 3**: Schema maintenance burden
- **Mitigation**: Schemas are single source of truth, reduce overall code
- **Mitigation**: Generate documentation from schemas
- **Contingency**: Automate schema generation from database in future

**Risk 4**: Breaking changes during rollout
- **Mitigation**: Add validation incrementally, one endpoint at a time
- **Mitigation**: Start with permissive schemas, tighten later
- **Contingency**: Feature flag validation, rollback if issues

**Risk 5**: Complex validation requirements
- **Mitigation**: Zod supports complex validation (refinements, transforms)
- **Mitigation**: Custom validation functions for edge cases
- **Contingency**: Hybrid approach (Zod + manual validation)

## Success Metrics

### Quantitative Metrics
- **Endpoint Coverage**: 100% of POST/PUT endpoints validate bodies
- **Endpoint Coverage**: 100% of GET endpoints validate query params
- **Environment Validation**: All env vars validated at startup
- **Error Rate**: Decrease in 500 errors (caught as 400s earlier)
- **Bug Detection**: Validation catches bugs in development

### Qualitative Metrics
- **Developer Confidence**: Team feels safer making changes
- **Error Messages**: API consumers get clear, actionable errors
- **Documentation**: Schemas serve as living documentation
- **Testing**: Easier to write tests with schema-based data generation
- **Type Safety**: End-to-end type safety from request to response

## Timeline Estimate

### 6-Week Implementation Plan

**Week 1: Foundation**
- Days 1-2: Install Zod, create schema directory structure
- Days 3-5: Define all core domain schemas (course, professor, user, planner)

**Week 2: Middleware and Infrastructure**
- Days 1-2: Create request validation middleware
- Days 3-4: Create response validation middleware
- Day 5: Create database query validation utilities

**Week 3: API Endpoint Validation**
- Days 1-2: Validate planner endpoints
- Days 3-4: Validate search endpoints
- Day 5: Validate course/professor endpoints

**Week 4: Response and Database Validation**
- Days 1-2: Add response schemas for all endpoints
- Days 3-4: Validate database query results
- Day 5: Test entire backend validation

**Week 5: Frontend and Configuration**
- Days 1-2: Implement environment variable validation
- Days 3-5: Add form validation in frontend

**Week 6: Testing and Documentation**
- Days 1-3: Create test utilities, write schema tests
- Days 4-5: Document schemas, generate API docs from schemas

## Labels
`enhancement`, `validation`, `zod`, `backend`, `frontend`, `api`, `type-safety`, `difficulty level: medium`, `priority level: high`

## Dependencies
- Depends on: Backend TypeScript Migration (Issue #2) - Zod works best with TypeScript
- Depends on: Frontend TypeScript Migration (Issue #1) - For frontend form validation
- Related to: Testing Project - Schemas help with test data generation
- Blocks: API documentation generation (schemas can generate OpenAPI specs)