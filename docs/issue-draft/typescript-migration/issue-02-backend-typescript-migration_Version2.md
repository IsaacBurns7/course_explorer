# Backend TypeScript Migration - Complete Conversion Strategy

## Problem Description / Summary

The backend Node.js/Express application is currently implemented entirely in JavaScript, creating significant challenges for API reliability, data integrity, and developer productivity. Without static typing at the backend layer, the application suffers from:

### API Contract Issues
- **Response Shape Inconsistency**: API endpoints can return different shapes for the same resource
- **Parameter Validation Gaps**: Route handlers accept requests with invalid or missing parameters
- **Database Query Results**: PostgreSQL query results are untyped, leading to property access errors
- **Middleware Type Safety**: Request/Response objects lack type information for custom properties
- **Error Handling**: Error objects have unclear shapes, making robust error handling difficult

### Database Integration Problems
- **Query Result Typing**: `pool.query()` returns `any`, losing all type information
- **SQL Injection Risk**: Dynamic query construction without type checking
- **Schema Mismatch**: Database schema changes don't propagate to application code
- **Migration Confusion**: No type-safe way to define or apply database migrations
- **Complex Queries**: SQL file results (getClassInfo.sql, getBestClasses.sql) are untyped

### Service Layer Issues
- **Business Logic Ambiguity**: Function parameters and return types are implicit
- **Data Transformation Errors**: Mapping database rows to API responses is error-prone
- **Controller Coupling**: Controllers directly manipulate data without typed service layer
- **Validation Logic**: Input validation is scattered and inconsistent
- **Testing Difficulty**: Mocking database calls requires guessing types

### Authentication and Authorization
- **User Object Shape**: User structure varies across authentication routes
- **JWT Payload Typing**: Token payload is untyped, risking security issues
- **Session Management**: Cookie/session data lacks type safety
- **OAuth Integration**: Google profile shape is not validated
- **Middleware Contracts**: Auth middleware doesn't enforce user presence on requests

### Specific Pain Points in Current Codebase

Based on analysis of `backend/`, critical issues include:

1. **Controllers** (`backend/controllers/`):
   - `course.js` - Database result mapping is implicit
   - `professor.js` - Query results are typed as `any`
   - `search2.js` - Complex aggregation logic with no type safety
   - `planner2.js` - File reading and SQL execution lack types
   - SQL files return complex nested JSON - no type validation

2. **Routes** (`backend/routes/`):
   - `auth.js` - Passport strategies lack TypeScript integration
   - `professor.js`, `course.js` - Request/response types implicit
   - `planner2.js` - Request body validation is runtime-only
   - `health.js` - Even simple endpoints lack types

3. **Database Layer** (`backend/db.js`, `backend/users.js`):
   - PostgreSQL connection pool is untyped
   - Query methods return `any`
   - User CRUD operations have no type contracts
   - Connection error handling is weakly typed

4. **Models** (`backend/models/`):
   - `professor.js` - Mongoose schema in mixed codebase (MongoDB not used?)
   - Model structure doesn't match database queries
   - No TypeScript-compatible data access layer

## Expected Behavior

After migration, the backend should:

### Type Safety Throughout Stack
- **All route handlers** have explicitly typed request bodies, query params, and URL params
- **All database queries** have typed result shapes
- **All service functions** have explicit parameter and return types
- **All middleware** properly types `req`, `res`, and `next`
- **No `any` types** except at intentional boundaries (e.g., JSON parsing)

### API Contract Enforcement
- **Request validation** happens at compile-time where possible
- **Response shapes** are guaranteed to match documented contracts
- **Error responses** follow consistent typed structure
- **Middleware** adds typed properties to Request object
- **Authentication** state is reflected in request type

### Database Integration
- **Query results** are typed based on SQL structure
- **Parameter binding** is type-checked
- **Schema changes** trigger type errors if not updated in code
- **Migrations** are type-safe
- **Connection pooling** properly typed

### Developer Experience
- **IntelliSense** works for database results, request bodies, etc.
- **Refactoring** safely updates all references
- **API changes** caught at compile-time
- **Debugging** easier with type information
- **Onboarding** faster with self-documenting types

## Context

### Technical Environment
- **OS**: Ubuntu 22.04, macOS, Windows (cross-platform)
- **Node Version**: 20.11 LTS
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: None (raw SQL via `pg` library)
- **API Framework**: Express.js 4.x
- **Authentication**: Passport.js with Google OAuth 2.0
- **Current Language**: JavaScript (CommonJS modules)
- **Target Language**: TypeScript 5.x with ES modules
- **Package Manager**: npm
- **Commit**: eefbcfc2767a4cf5e321455e82c346592a782437

### Current Backend Architecture
- **Controllers**: 6 controller files handling business logic
- **Routes**: 6 route files defining Express endpoints
- **Database**: PostgreSQL connection pool, raw SQL queries
- **Models**: 2 Mongoose models (appears unused - MongoDB not in use)
- **Services**: Parsing service (`services/parseData.js`)
- **SQL Files**: 3 complex SQL files in `controllers/sql/`
- **Authentication**: OAuth 2.0 flow with JWT sessions

### Dependencies Requiring Type Definitions
- `express` - Need `@types/express`
- `pg` - Need `@types/pg` (PostgreSQL client)
- `passport` - Need `@types/passport`
- `passport-google-oauth20` - Need `@types/passport-google-oauth20`
- `jsonwebtoken` - Need `@types/jsonwebtoken`
- `cookie-parser` - Need `@types/cookie-parser`
- `cors` - Need `@types/cors`
- `dotenv` - Need `@types/dotenv`
- `node-fetch` - Need `@types/node-fetch`

## Acceptance Criteria

### Phase 1: Infrastructure Setup (Week 1)
- [ ] TypeScript installed and configured
- [ ] `tsconfig.json` created for Node.js/Express backend
- [ ] All type definition packages installed
- [ ] ESLint configured for TypeScript
- [ ] Build process configured (TypeScript compilation)
- [ ] `ts-node-dev` or `tsx` for development hot-reload
- [ ] One sample controller successfully converted as proof-of-concept
- [ ] Dev server works with mixed JS/TS files
- [ ] Production build compiles to JavaScript in `/dist`

### Phase 2: Type Definitions (Week 1-2)
- [ ] Core type files created in `backend/types/`:
  - `backend/types/database.ts` - Database row types, query results
  - `backend/types/api.ts` - Request bodies, response shapes
  - `backend/types/auth.ts` - User, JWT payload, OAuth profile
  - `backend/types/models.ts` - Domain models (Course, Professor, Section)
  - `backend/types/express.d.ts` - Express augmentations
  - `backend/types/common.ts` - Utility types
- [ ] All shared types documented with JSDoc
- [ ] Database schema types match actual PostgreSQL schema
- [ ] Express Request/Response properly augmented

### Phase 3: Database Layer (Week 2-3)
- [ ] Database connection module typed: `backend/db.ts`
- [ ] Query result types defined for each query
- [ ] User operations typed: `backend/users.ts`
- [ ] Query helper functions created with type safety
- [ ] SQL file result types defined
- [ ] Error handling typed properly

### Phase 4: Controllers and Services (Week 3-4)
- [ ] All controllers converted to TypeScript:
  - `backend/controllers/course.ts` - Course endpoints
  - `backend/controllers/professor.ts` - Professor endpoints
  - `backend/controllers/search2.ts` - Search functionality
  - `backend/controllers/planner2.ts` - Planner logic
- [ ] All services converted:
  - `backend/services/parseData.ts` - Degree plan parsing
- [ ] Controller methods have explicit types
- [ ] Request/response types defined
- [ ] Error handling standardized

### Phase 5: Routes and Middleware (Week 4-5)
- [ ] All routes converted to TypeScript:
  - `backend/routes/auth.ts` - Authentication routes
  - `backend/routes/course.ts` - Course routes
  - `backend/routes/professor.ts` - Professor routes
  - `backend/routes/search2.ts` - Search routes
  - `backend/routes/planner2.ts` - Planner routes
  - `backend/routes/health.ts` - Health check
- [ ] Custom middleware typed
- [ ] Authentication middleware typed with augmented Request
- [ ] Router configuration typed

### Phase 6: Entry Point and Server (Week 5)
- [ ] Server entry point converted: `backend/server.ts`
- [ ] Express app configuration typed
- [ ] Environment variables typed
- [ ] All middleware integration typed
- [ ] Error handling middleware typed

### Phase 7: Testing and Cleanup (Week 6)
- [ ] All `.js` files removed (only `.ts` remains)
- [ ] No `any` types except documented exceptions
- [ ] No `@ts-ignore` comments except documented exceptions
- [ ] All type errors resolved
- [ ] ESLint TypeScript rules pass
- [ ] Build succeeds with zero warnings
- [ ] Application runs without runtime errors
- [ ] Tests updated for TypeScript (if tests exist)
- [ ] Production build tested

### Quality Metrics
- [ ] Zero type errors in `tsc --noEmit`
- [ ] Zero ESLint TypeScript errors
- [ ] <10 uses of `any` type in entire backend
- [ ] <5 uses of `@ts-ignore` in entire backend
- [ ] >90% of functions have explicit return types
- [ ] All Express handlers have typed request/response

## Proposed Solution / Ideas

### Overall Migration Strategy

The migration follows a **database-up, incremental approach**:

1. **Infrastructure First** - Set up TypeScript tooling and build
2. **Types Before Code** - Define database and API types first
3. **Data Layer First** - Type database queries before controllers
4. **Inside Out** - Convert services before routes
5. **Test Each Layer** - Verify compilation and runtime at each phase
6. **Module by Module** - One complete module at a time
7. **Gradual Strictness** - Start permissive, increase strictness

### Phase 1: Infrastructure Setup

#### TypeScript Installation
Install TypeScript and Node.js type definitions:
```bash
npm install --save-dev typescript @types/node
npm install --save-dev @types/express @types/pg
npm install --save-dev @types/passport @types/passport-google-oauth20
npm install --save-dev @types/jsonwebtoken @types/cookie-parser
npm install --save-dev @types/cors @types/dotenv @types/node-fetch
npm install --save-dev ts-node-dev  # For development
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### TypeScript Configuration
Create `backend/tsconfig.json` for Node.js environment:
- Set `target: "ES2022"` for modern Node.js
- Set `module: "commonjs"` (or `"node16"` for ESM)
- Enable `strict: true` eventually
- Set `esModuleInterop: true` for better import compat
- Set `outDir: "./dist"` for compiled output
- Set `rootDir: "./"` to include all backend files
- Enable `sourceMap: true` for debugging
- Set `resolveJsonModule: true` for JSON imports
- Include `types: ["node"]`
- Set `moduleResolution: "node"`

#### Build Configuration
Set up compilation and development:
- Configure `tsc` to compile to `dist/` folder
- Set up `ts-node-dev` for development with auto-restart
- Configure source maps for production debugging
- Ensure environment variables work in TypeScript
- Test that compiled JavaScript runs correctly

#### Package.json Scripts
Add TypeScript build scripts:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only backend/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint backend/**/*.ts"
  }
}
```

### Phase 2: Core Type Definitions

#### Type File Organization

**`types/database.ts`** - Database schema types:
- `CourseRow` - Row from `courses` table
- `ProfessorRow` - Row from `professors` table
- `SectionRow` - Row from `courses_sections` table
- `UserRow` - Row from `users` table
- `QueryResult<T>` - Wrapper for pg query results
- `DatabaseError` - Typed database errors

**`types/api.ts`** - API contracts:
- Request body types for each endpoint
- Response types for each endpoint
- Query parameter types
- URL parameter types
- Common response wrappers (`SuccessResponse<T>`, `ErrorResponse`)

**`types/auth.ts`** - Authentication types:
- `User` - Application user
- `JWTPayload` - Token payload structure
- `GoogleProfile` - OAuth profile from Google
- `AuthRequest` - Express Request with user attached
- `SessionData` - Session information

**`types/models.ts`** - Domain model types:
- `Course` - Full course with all relationships
- `Professor` - Full professor with ratings
- `Section` - Course section with schedule
- `PlannerData` - Degree planner structure
- `Schedule` - Generated schedule

**`types/express.d.ts`** - Express augmentations:
Augment Express types to add custom properties:
- Extend `Request` interface to include `user?: User`
- Extend `Response` for custom methods (if any)
- This file uses TypeScript declaration merging

**`types/common.ts`** - Shared utilities:
- Generic result types
- Pagination types
- Filter types
- Common enums (Semester, GradeLetter, etc.)

#### Database Type Strategy

For PostgreSQL queries, create types that match exact schemas:
- Use database documentation or schema introspection
- Create types for each table
- Create types for JOIN results
- Create types for complex SQL query results
- Consider using code generation tool (e.g., `pg-typegen`) in future

### Phase 3: Database Layer Migration

#### Database Connection Module
Convert `backend/db.js` → `db.ts`:
- Type the connection pool (`Pool` from `pg`)
- Create typed query wrapper functions
- Type error handling for connection failures
- Type graceful shutdown handlers
- Export properly typed pool

#### User Operations Module
Convert `backend/users.js` → `users.ts`:
- Type `findOrCreateUserFromGoogle` function
- Type Google profile parameter properly
- Type database query results
- Type return values explicitly
- Handle null cases properly

#### Query Helper Functions
Create typed wrappers for common query patterns:
- `query<T>(sql: string, params: any[]): Promise<T[]>`
- `queryOne<T>(sql: string, params: any[]): Promise<T | null>`
- `queryFile<T>(filePath: string, params: any[]): Promise<T>`
- These wrappers enforce return type safety

#### SQL File Integration
For complex SQL files (`getClassInfo.sql`, `getBestClasses.sql`):
- Define explicit result types based on SELECT output
- Create interfaces matching JSON_BUILD_OBJECT structures
- Use `queryFile` helper with result type parameter
- Consider generating types from SQL in future

### Phase 4: Controllers and Services Migration

#### Controller Conversion Strategy

**Course Controller** (`controllers/course.ts`):
- Type request/response for `getAllCourses`
- Type database query results
- Type error handling
- Use typed database wrappers

**Professor Controller** (`controllers/professor.ts`):
- Type request/response for `getAllProfs`
- Type database query results
- Ensure SELECT DISTINCT logic is typed

**Search Controller** (`controllers/search2.ts`):
- Type complex query parameter parsing
- Type `getProfessorDataForCourse` request/response
- Type `getCourseData` request/response
- Type complex JOIN result structures
- Type JSON aggregation results

**Planner Controller** (`controllers/planner2.ts`):
- Type degree plan parsing functions
- Type PDF/text parsing results
- Type `getBestClasses` result structure
- Type `getClassInfo` result structure
- Type file system operations (fs.readFileSync)

#### Service Layer
Convert `services/parseData.js` → `parseData.ts`:
- Type PDF parsing functions
- Type text parsing functions
- Type intermediate data structures
- Type error results
- Validate input parameters

### Phase 5: Routes and Middleware Migration

#### Route Handler Typing Pattern

For Express route handlers, use typed request/response:
```typescript
// Define request types
interface GetCourseParams {
  courseId: string;
}

interface GetCourseQuery {
  semester?: string;
}

// Define response type
interface CourseResponse {
  course: Course;
  professors: Professor[];
}

// Type the handler
app.get<GetCourseParams, CourseResponse, never, GetCourseQuery>(
  '/api/courses/:courseId',
  async (req, res) => {
    // req.params is typed as GetCourseParams
    // req.query is typed as GetCourseQuery
    // res.json() expects CourseResponse
  }
);
```

#### Authentication Routes
Convert `routes/auth.js` → `auth.ts`:
- Type Passport strategy configuration
- Type Google OAuth callback
- Type JWT signing/verification
- Type `/auth/me` response
- Type logout endpoint
- Augment Request to include `user` property

#### API Routes
Convert remaining routes:
- `routes/course.ts` - Simple GET route
- `routes/professor.ts` - Simple GET route
- `routes/search2.ts` - Complex query routes
- `routes/planner2.ts` - POST routes with bodies
- `routes/health.ts` - Simple health check

#### Middleware Typing
Create typed middleware:
- Authentication middleware that adds `user` to Request
- Error handling middleware with typed error objects
- CORS middleware (already typed by `@types/cors`)
- Cookie parser (already typed by `@types/cookie-parser`)

### Phase 6: Server Entry Point

#### Express App Configuration
Convert `backend/server.js` → `server.ts`:
- Type Express app initialization
- Type middleware configuration
- Type route mounting
- Type error handlers
- Type server listen callback

#### Environment Variables
Create typed environment configuration:
- Define interface for all env vars
- Validate env vars at startup
- Provide typed access to env vars
- Consider using `zod` for runtime validation (connects to Issue #3)

### Phase 7: Testing and Production

#### Compilation Validation
Ensure TypeScript compiles correctly:
```bash
# Check types
npm run type-check

# Build to dist/
npm run build

# Test compiled output
node dist/server.js
```

#### Runtime Validation
Test that the application works:
- Start development server with `npm run dev`
- Test all API endpoints manually
- Check database connections
- Verify authentication flow
- Test error handling
- Monitor console for errors

#### Production Build
Verify production readiness:
- Build compiles without errors
- Compiled size is reasonable
- Source maps are generated
- Application starts correctly from compiled code
- Environment variables work in production

### CommonJS to ESM Migration (Optional)

If team wants to modernize to ES modules:
- Change `tsconfig.json` to `"module": "es2022"`
- Update all `require()` to `import`
- Update all `module.exports` to `export`
- Update `package.json` to include `"type": "module"`
- Test that all imports/exports work
- This can be done after TypeScript migration

### Error Handling Standardization

Create typed error handling:
- Define error classes extending `Error`
- Create error response formatter
- Type all error middleware
- Ensure consistent error structure across API
- Log errors with proper typing

### Incremental Strictness Strategy

Start permissive, gradually increase strictness:

**Stage 1** - Allow JavaScript during migration:
```json
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

**Stage 2** - After 50% migrated:
```json
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "noImplicitAny": true,
    "strictNullChecks": false
  }
}
```

**Stage 3** - After 100% migrated:
```json
{
  "compilerOptions": {
    "strict": true,
    "allowJs": false
  }
}
```

## Relevant Code / Links

### Files Requiring Migration (25+ files)

**Core Infrastructure** (2 files):
- `backend/db.js` → `db.ts`
- `backend/users.js` → `users.ts`

**Controllers** (4-5 files):
- `backend/controllers/course.js` → `course.ts`
- `backend/controllers/professor.js` → `professor.ts`
- `backend/controllers/search2.js` → `search2.ts`
- `backend/controllers/planner2.js` → `planner2.ts`
- SQL files in `backend/controllers/sql/` - Define result types (don't convert files)

**Routes** (6 files):
- `backend/routes/auth.js` → `auth.ts`
- `backend/routes/course.js` → `course.ts`
- `backend/routes/professor.js` → `professor.ts`
- `backend/routes/search2.js` → `search2.ts`
- `backend/routes/planner2.js` → `planner2.ts`
- `backend/routes/health.js` → `health.ts`

**Services** (1+ files):
- `backend/services/parseData.js` → `parseData.ts`

**Models** (2 files - may remove):
- `backend/models/course.js` - Mongoose model (probably unused?)
- `backend/models/professor.js` - Mongoose model (probably unused?)
- Verify if MongoDB is actually used; if not, remove these

**Entry Point** (1 file):
- `backend/server.js` → `server.ts`

**Configuration** (new files):
- `backend/tsconfig.json` (create)
- `backend/.eslintrc.js` (update)
- `backend/types/` directory (create)

### External Resources
- [TypeScript for Node.js](https://nodejs.dev/learn/nodejs-with-typescript)
- [Express with TypeScript](https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [pg-types documentation](https://github.com/brianc/node-pg-types)
- [Passport TypeScript Examples](https://github.com/jaredhanson/passport/tree/master/examples)

## Risk Mitigation

### Potential Risks and Mitigation Strategies

**Risk 1**: Database query types are complex and error-prone
- **Mitigation**: Start with simple queries, use query helpers, generate types from schema
- **Contingency**: Use `any` at database boundary, type at controller level

**Risk 2**: Express Request augmentation is tricky
- **Mitigation**: Use well-documented declaration merging pattern
- **Contingency**: Use custom request wrapper instead of augmenting

**Risk 3**: Passport.js types are incomplete
- **Mitigation**: Research community solutions, check DefinitelyTyped issues
- **Contingency**: Create custom type declarations for missing pieces

**Risk 4**: SQL file results are hard to type
- **Mitigation**: Create types matching JSON_BUILD_OBJECT output carefully
- **Contingency**: Type as generic JSON object, validate at runtime

**Risk 5**: CommonJS/ESM module system confusion
- **Mitigation**: Stick with CommonJS initially, migrate to ESM later if desired
- **Contingency**: Use `esModuleInterop` flag to handle interop issues

**Risk 6**: Production deployment issues
- **Mitigation**: Test compiled output thoroughly before deploying
- **Contingency**: Keep JavaScript fallback version, gradual rollout

## Success Metrics

### Quantitative Metrics
- **Type Coverage**: >90% of backend code typed
- **Build Success**: Zero type errors in `tsc --noEmit`
- **Lint Success**: Zero TypeScript ESLint errors
- **Any Usage**: <10 occurrences of `any`
- **Migration Progress**: Track files converted weekly
- **API Stability**: No increase in 500 errors post-migration

### Qualitative Metrics
- **Developer Experience**: Improved autocomplete for database results
- **API Reliability**: Fewer request/response contract violations
- **Code Quality**: Better type safety in code reviews
- **Refactoring Confidence**: Safer database schema changes
- **Debugging**: Easier to trace type-related bugs

## Timeline Estimate

### 6-Week Migration Plan

**Week 1: Infrastructure and Types**
- Days 1-2: Install TypeScript, configure tsconfig.json, test compilation
- Days 3-5: Create all type definitions in `backend/types/`

**Week 2: Database Layer**
- Days 1-2: Convert `db.ts` and `users.ts`
- Days 3-4: Create query helper functions
- Day 5: Define SQL file result types

**Week 3: Services**
- Days 1-3: Convert `services/parseData.ts`
- Days 4-5: Start controller conversions (simple ones first)

**Week 4: Controllers**
- Days 1-2: Convert `course.ts` and `professor.ts`
- Days 3-5: Convert `search2.ts` and `planner2.ts` (more complex)

**Week 5: Routes and Server**
- Days 1-3: Convert all route files
- Days 4-5: Convert `server.ts` and middleware

**Week 6: Testing and Cleanup**
- Days 1-2: Remove JavaScript files, fix remaining type errors
- Days 3-4: Increase strictness, fix new errors
- Day 5: Production build testing, documentation

## Labels
`enhancement`, `typescript`, `migration`, `backend`, `refactoring`, `difficulty level: high`, `priority level: high`, `epic`

## Dependencies
- Blocks: TypeScript Migration Project completion
- Depends on: TypeScript Configuration and Tooling Setup (Issue #4)
- Related to: Frontend TypeScript Migration (Issue #1), Zod Schema Implementation (Issue #3)