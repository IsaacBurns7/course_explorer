# Frontend TypeScript Migration - Complete Conversion Strategy

## Problem Description / Summary

The frontend application is currently implemented entirely in JavaScript, which creates significant challenges for maintainability, developer experience, and code quality. Without static typing, the application suffers from:

### Type Safety Issues
- **Runtime Errors**: Type mismatches and undefined property accesses only appear at runtime, often in production
- **API Contract Violations**: No compile-time validation that API responses match expected shapes
- **Prop Drilling Errors**: Component props can be passed incorrectly without warnings
- **Refactoring Risk**: Changing data structures or function signatures can silently break dependent code
- **Null/Undefined Confusion**: No distinction between nullable and non-nullable values

### Developer Experience Problems
- **No IntelliSense**: IDEs cannot provide accurate autocomplete or inline documentation
- **Navigation Difficulties**: "Go to definition" and "Find references" work unreliably
- **Unclear Contracts**: Function parameters and return types are implicit, requiring code reading
- **Debugging Overhead**: Type-related bugs require extensive runtime debugging
- **Onboarding Friction**: New developers must infer types by reading implementation code

### Code Quality Concerns
- **Hidden Dependencies**: Implicit type contracts between components are undocumented
- **Inconsistent Data Shapes**: No enforcement of data structure consistency across the codebase
- **Callback Hell**: Event handlers have unclear parameter types
- **State Management Confusion**: useState and useReducer types are inferred, often incorrectly
- **API Integration Issues**: Fetch responses are typed as `any`, losing all type safety

### Specific Pain Points in Current Codebase

Based on analysis of `frontend/src/`, critical issues include:

1. **Component Props** (`frontend/src/components/`):
   - `TeacherTable.js` - 10+ props with complex nested structures, no type checking
   - `GPATrendsChart.js` - Chart data structures are implicit
   - `Navbar.js` - User authentication state shape is unclear
   - `Compare.js` - Graph data has deeply nested objects without type safety
   - `Planner.js` - Semester/course objects have 15+ properties, all untyped

2. **API Interactions** (all files using `fetch` or `axios`):
   - `frontend/src/hooks/useSearchData.js` - API responses are not validated
   - `frontend/src/pages/CourseDetails.js` - Professor/course data shapes are implicit
   - `frontend/src/components/Search.js` - Course autocomplete data lacks types

3. **State Management** (`frontend/src/context/search.js`):
   - Context value shape is unclear (comparedCards, professors, courses, etc.)
   - No type safety for context consumers
   - Easy to misspell property names

4. **Complex Data Structures**:
   - Planner data: Nested semester → courses → professors → sections
   - Professor data: info, ratings, courses arrays with no schema
   - Section data: Times object with complex day/time structure
   - Graph data: Category/frequency tuples with metadata

## Expected Behavior

After migration, the frontend should:

### Type Safety
- **All components** use TypeScript interfaces for props, state, and context
- **All API calls** have explicit return types validated at compile-time
- **All hooks** have properly typed parameters and return values
- **No `any` types** except in explicitly documented edge cases
- **Strict null checking** enforced throughout the codebase

### Developer Experience
- **Full IntelliSense** - IDE autocomplete works everywhere
- **Refactoring Confidence** - Rename operations update all references safely
- **Inline Documentation** - JSDoc comments provide contextual help
- **Error Detection** - Type errors caught before `npm start`
- **Import Clarity** - Clear distinction between types and runtime values

### Code Organization
- **Centralized Types** - Shared interfaces in `frontend/src/types/`
- **API Schemas** - Clear contracts for all backend endpoints
- **Component APIs** - Documented prop interfaces for every component
- **Utility Types** - Reusable type helpers for common patterns

### Build Process
- **TypeScript Compilation** - All `.js` files converted to `.ts`/`.tsx`
- **Build Folder** - Compiled output in `/dist` or `/build`
- **Source Maps** - Debugging maps back to TypeScript source
- **Type Checking in CI** - No PRs merge with type errors

## Context

### Technical Environment
- **OS**: Ubuntu 22.04, macOS, Windows (cross-platform)
- **Node Version**: 20.11 LTS
- **React Version**: 18.x
- **Build Tool**: Webpack (currently)
- **Package Manager**: npm
- **Current Language**: JavaScript (ES6+)
- **Target Language**: TypeScript 5.x
- **Commit**: eefbcfc2767a4cf5e321455e82c346592a782437

### Current Frontend Architecture
- **Pages**: 10 page components in `frontend/src/pages/`
- **Components**: 30+ components in `frontend/src/components/`
- **Hooks**: Custom hooks for data fetching and state
- **Context**: Search context for global state
- **Styling**: TailwindCSS with utility classes
- **Animation**: Framer Motion for transitions
- **Charts**: ApexCharts and Recharts libraries

### Dependencies Requiring Type Definitions
- `react` and `react-dom` - Already have types
- `react-router-dom` - Already have types
- `axios` - Already have types
- `framer-motion` - Already have types
- `react-apexcharts` - Needs `@types/react-apexcharts`
- `recharts` - Already has types
- `lucide-react` - Already has types

## Acceptance Criteria

### Phase 1: Infrastructure Setup (Week 1)
- [ ] TypeScript installed and configured (`typescript` package)
- [ ] `tsconfig.json` created with strict mode enabled
- [ ] Type declaration packages installed (`@types/*`)
- [ ] ESLint configured for TypeScript
- [ ] Webpack/build tools updated for `.ts`/`.tsx` support
- [ ] One sample component successfully converted as proof-of-concept
- [ ] Build process works with mixed JS/TS files
- [ ] Development server hot-reloads `.tsx` files correctly

### Phase 2: Type Definitions (Week 1-2)
- [ ] Core type files created in `frontend/src/types/`:
  - `frontend/src/types/course.ts` - Course, Section, Professor types
  - `frontend/src/types/api.ts` - API request/response types
  - `frontend/src/types/planner.ts` - Planner, Semester, CourseEntry types
  - `frontend/src/types/auth.ts` - User, AuthState types
  - `frontend/src/types/search.ts` - SearchContext types
  - `frontend/src/types/common.ts` - Utility types (TimeSlot, GradeDistribution, etc.)
- [ ] All shared interfaces documented with JSDoc comments
- [ ] Type exports are organized and re-exported from index
- [ ] No circular dependencies between type files

### Phase 3: Core Infrastructure (Week 2-3)
- [ ] Context providers converted to TypeScript:
  - `frontend/src/context/search.tsx` fully typed
- [ ] Custom hooks converted to TypeScript:
  - `frontend/src/hooks/useAllCourses.ts`
  - `frontend/src/hooks/useAllProfs.ts`
  - `frontend/src/hooks/useSearchData.ts`
- [ ] Utility functions converted:
  - `frontend/src/utils/` (if exists)
- [ ] API client wrapper created with typed methods

### Phase 4: Component Migration (Week 3-5)
- [ ] UI components converted (30+ files in `frontend/src/components/`):
  - Navigation: `Navbar.tsx`, `Search.tsx`
  - Display: `TeacherTable.tsx`, `GPATrendsChart.tsx`, `HistoricalDataTable.tsx`
  - Planner: `Planner.tsx`, `PlannerDisplay.tsx`, `ScheduleFinder.tsx`
  - Modals: `frontend/src/components/modals/*.tsx`
  - Cards: `ProfessorCard.tsx`, `ProfessorRatingCard.tsx`
  - UI elements: `frontend/src/components/ui/*.tsx`
- [ ] All component props have explicit interfaces
- [ ] Event handlers have proper type signatures
- [ ] Refs are properly typed
- [ ] Children props use `React.ReactNode`

### Phase 5: Page Migration (Week 5-6)
- [ ] All page components converted (10 files in `frontend/src/pages/`):
  - `Landing.tsx` - Landing page with search
  - `CourseDetails.tsx` - Course detail page
  - `Planner.tsx` - Degree planner page
  - `Scheduler.tsx` - Schedule finder page
  - `SearchResults.tsx` (deprecated but needs migration)
  - `Compare.tsx` - Professor comparison page
  - `Home.tsx`, `DashboardRedirect.tsx` - Simple pages
- [ ] Router configuration updated for TypeScript
- [ ] URL parameters properly typed

### Phase 6: Testing and Cleanup (Week 6)
- [ ] All `.js` files removed (only `.ts`/`.tsx` remain)
- [ ] No `any` types except documented exceptions
- [ ] No `@ts-ignore` comments except documented exceptions
- [ ] All type errors resolved
- [ ] ESLint TypeScript rules pass
- [ ] Build succeeds with zero warnings
- [ ] Application runs without runtime errors
- [ ] Hot reload works correctly
- [ ] Production build size checked (should be similar)

### Quality Metrics
- [ ] Zero type errors in `tsc --noEmit`
- [ ] Zero ESLint TypeScript errors
- [ ] <5 uses of `any` type in entire codebase
- [ ] <3 uses of `@ts-ignore` in entire codebase
- [ ] >95% of functions have explicit return types
- [ ] >98% of variables have inferred or explicit types

## Proposed Solution / Ideas

### Overall Migration Strategy

The migration will follow a **bottom-up, incremental approach**:

1. **Infrastructure First** - Set up tooling before touching code
2. **Types Before Code** - Define interfaces before converting components
3. **Leaves to Trunk** - Convert leaf components before parents
4. **Test Each Layer** - Verify each phase before proceeding
5. **No Big Bang** - Mixed JS/TS codebase during migration
6. **Gradual Strictness** - Start permissive, tighten over time

### Phase 1: Infrastructure Setup

#### TypeScript Installation
Install TypeScript and type definitions:
```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
npm install --save-dev @types/react-router-dom
npm install --save-dev @types/react-apexcharts
```

#### TypeScript Configuration
Create `frontend/tsconfig.json` with appropriate strictness:
- Start with `strict: false` to allow gradual migration
- Enable `allowJs: true` to support mixed JS/TS
- Set `jsx: "react-jsx"` for React 18
- Configure `baseUrl` and `paths` for clean imports
- Set `outDir` to `./build` or `./dist`
- Enable `sourceMap` for debugging
- Set `target: "ES2020"` for modern features

#### Build Tool Configuration
Update Webpack configuration:
- Add `.ts` and `.tsx` to resolve extensions
- Configure `ts-loader` or `babel-loader` with TypeScript preset
- Ensure source maps work correctly
- Verify hot module replacement works with TypeScript

#### Linting Setup
Configure ESLint for TypeScript:
- Install `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
- Update `.eslintrc` to use TypeScript rules
- Add scripts to `package.json` for linting TypeScript

### Phase 2: Core Type Definitions

#### Create Type Files Structure
Organize types logically in `frontend/src/types/`:

**`types/course.ts`** - Course domain types:
- `Course` interface (id, department, number, title, description, etc.)
- `Section` interface (section number, CRN, professor, GPA, times, etc.)
- `Professor` interface (id, name, averageGPA, averageRating, etc.)
- `ProfessorInfo` interface (more detailed prof info)
- `Semester` type ('Fall' | 'Spring' | 'Summer')
- `TimeSlot` interface (day, startTime, endTime)
- `GradeDistribution` interface (A, B, C, D, F counts)

**`types/api.ts`** - API contract types:
- `CourseResponse` - Shape of `/api/search2/course` response
- `ProfessorResponse` - Shape of `/api/search2/professors` response
- `PlannerResponse` - Shape of `/api/planner2/*` responses
- `HealthCheckResponse` - Shape of `/api/health` response
- Generic `ApiResponse<T>` wrapper type
- `ApiError` interface for error handling

**`types/planner.ts`** - Planner-specific types:
- `PlannerData` - Map of semester name to courses
- `CourseEntry` - Course with selected professor info
- `SemesterInfo` - Semester with courses and metadata
- `ProfessorSelection` - Selected professor for a course

**`types/auth.ts`** - Authentication types:
- `User` interface (id, email, name, picture)
- `AuthState` interface (user, isAuthenticated, loading)
- `LoginResponse` - OAuth callback response shape

**`types/search.ts`** - Search context types:
- `SearchContextValue` - All context properties
- `ComparedCard` - Card ID format for comparisons
- `GraphData` - Chart data structures
- `ProfessorFilters` - Filter state

**`types/common.ts`** - Shared utility types:
- `LoadingState<T>` - Generic loading wrapper
- `Result<T, E>` - Success/error union type
- `Nullable<T>` - Shorthand for `T | null`
- `NonEmptyArray<T>` - Array with at least one element

#### Type Definition Best Practices
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and mapped types
- Export all types from their respective files
- Use JSDoc comments for complex types
- Prefer explicit types over inferred types for public APIs
- Use utility types (`Pick`, `Omit`, `Partial`, etc.) to DRY

### Phase 3: Context and Hooks Migration

#### Context Conversion Strategy
Convert `frontend/src/context/search.js` → `search.tsx`:
- Define `SearchContextValue` interface with all properties
- Type the context provider's state
- Type all setter functions
- Export typed `useSearchContext` hook
- Document context shape with JSDoc

#### Hook Conversion Strategy
Convert custom hooks to TypeScript:

**Data Fetching Hooks** (`useSearchData`, `useAllCourses`, etc.):
- Define explicit return types
- Type loading states properly
- Type error states (use `Error` or custom error type)
- Type request parameters
- Add generics for flexible data types

**State Management Hooks** (if custom hooks exist):
- Type hook parameters
- Type return tuples explicitly
- Ensure useState initial values match types
- Document hook behavior with JSDoc

### Phase 4: Component Migration Strategy

#### Bottom-Up Conversion Order
Start with components that have no/few dependencies:

**Tier 1 - Pure UI Components** (no external dependencies):
- `frontend/src/components/ui/` - Icons, buttons, basic elements
- `frontend/src/components/modals/` - Modal components
- `frontend/src/components/LoginButton.js` - Simple button

**Tier 2 - Display Components** (presentational only):
- `ProfessorCard` - Display professor info
- `ProfessorRatingCard` - Display ratings
- `GradeDistributionBar` - Display grades
- `AttributeColors` - Color utilities

**Tier 3 - Chart Components** (use charting libraries):
- `GPATrendsChart` - Chart with professor GPA trends
- `LineGraph` - Generic line graph
- `BarGraph` - Generic bar graph
- Ensure chart library types are installed

**Tier 4 - Table Components** (complex display logic):
- `HistoricalDataTable` - Display historical sections
- `TeacherTable` - Main professor comparison table
- Properly type sorting and filtering logic

**Tier 5 - Interactive Components** (state and events):
- `Search` / `AutoCompleteSearch` - Search with autocomplete
- `SearchButton` - Search in navbar
- `Compare` - Professor comparison view

**Tier 6 - Complex Components** (multiple dependencies):
- `Planner` / `PlannerDisplay` - Degree planner
- `ScheduleFinder` - Schedule optimization
- `Navbar` - Navigation with auth

#### Component Conversion Checklist
For each component:
1. Create props interface (e.g., `TeacherTableProps`)
2. Type all props destructuring
3. Type all useState declarations
4. Type all useEffect dependencies
5. Type all event handlers (onClick, onChange, etc.)
6. Type all refs (`useRef<HTMLDivElement>(null)`)
7. Type all callbacks passed to children
8. Type all context consumption
9. Add explicit return type to component function
10. Remove `.js` extension, rename to `.tsx`

#### Event Handler Typing Patterns
Common event handler type signatures:
- Button clicks: `React.MouseEvent<HTMLButtonElement>`
- Input changes: `React.ChangeEvent<HTMLInputElement>`
- Form submissions: `React.FormEvent<HTMLFormElement>`
- Key presses: `React.KeyboardEvent<HTMLInputElement>`
- Generic callbacks: Explicit function signatures

#### Props Interface Patterns
Standard patterns for component props:
- Optional props: Use `?` or provide defaults
- Children: Use `React.ReactNode` type
- Callbacks: Explicit function signatures
- Styling: `className?: string`
- Complex objects: Reference centralized types from `types/`

### Phase 5: Page Component Migration

#### Page-Specific Concerns

**Landing Page** (`Landing.tsx`):
- Type animation library props (Framer Motion)
- Type all motion variants
- Type floating element props

**Course Details** (`CourseDetails.tsx`):
- Type URL parameters (useParams)
- Type professor aggregation logic
- Type semester data structures
- Complex nested data requires careful typing

**Planner** (`Planner.tsx`):
- Type localStorage interactions
- Type planner data structure
- Type modal states
- Type semester CRUD operations

**Scheduler** (`Scheduler.tsx`):
- Type schedule generation algorithm input/output
- Type constraint objects
- Type schedule display data

### Phase 6: Testing and Validation

#### Type-Checking Validation
Continuous validation during migration:
```bash
# Check for type errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit --watch

# Generate declaration files
npx tsc --declaration --emitDeclarationOnly
```

#### Runtime Validation
Ensure migrated code works:
- Start dev server after each phase
- Manually test affected features
- Check browser console for errors
- Verify hot reload still works
- Test production build

#### Code Quality Checks
Run quality checks:
```bash
# Lint TypeScript files
npm run lint

# Check for unused exports
npx ts-unused-exports tsconfig.json

# Check for circular dependencies
npx madge --circular src/
```

### Incremental Strictness Strategy

Start permissive, gradually increase strictness:

**Stage 1** - Allow JavaScript:
```json
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "noImplicitAny": false
  }
}
```

**Stage 2** - After 50% migrated:
```json
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "noImplicitAny": true
  }
}
```

**Stage 3** - After 100% migrated:
```json
{
  "compilerOptions": {
    "strict": true,
    "allowJs": false,
    "noImplicitAny": true
  }
}
```

### Build Configuration Updates

#### Webpack Changes
Update `webpack.config.js`:
- Add `.ts` and `.tsx` to resolve.extensions
- Add ts-loader or babel-loader with TypeScript preset
- Configure source map generation
- Ensure CSS/asset imports work
- Verify environment variables work

#### Package.json Scripts
Add TypeScript-specific scripts:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "build": "tsc && webpack --mode production",
    "lint:ts": "eslint 'src/**/*.{ts,tsx}'"
  }
}
```

### Migration Workflow

#### Daily Workflow
For each migration session:
1. Pull latest code from main branch
2. Create feature branch (e.g., `migrate-components-tier-2`)
3. Convert 3-5 related files
4. Run `tsc --noEmit` to check types
5. Run `npm start` to verify runtime behavior
6. Commit with descriptive message
7. Push and create PR when tier is complete

#### Pull Request Strategy
- One PR per tier or logical group
- Include before/after type coverage metrics
- Document any breaking changes
- Request review from team members
- Merge frequently to avoid conflicts

### Common Migration Patterns

#### useState Typing
```typescript
// Explicit type
const [user, setUser] = useState<User | null>(null);

// Inferred type (when initial value is sufficient)
const [count, setCount] = useState(0);

// Complex state
const [state, setState] = useState<LoadingState<Course>>({
  loading: false,
  data: null,
  error: null
});
```

#### useEffect Typing
```typescript
// No return (no cleanup)
useEffect(() => {
  fetchData();
}, [dependency]);

// With cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

#### Event Handler Typing
```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

#### Props Typing
```typescript
interface ComponentProps {
  title: string;
  count?: number;
  onSave: (data: FormData) => void;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ title, count = 0, onSave, children }) => {
  // ...
};
```

## Relevant Code / Links

### Files Requiring Migration (90+ files)

**Core Infrastructure** (5 files):
- `frontend/src/App.js` → `App.tsx`
- `frontend/src/index.js` → `index.tsx`
- `frontend/src/context/search.js` → `search.tsx`
- `frontend/src/hooks/useAllCourses.js` → `useAllCourses.ts`
- `frontend/src/hooks/useAllProfs.js` → `useAllProfs.ts`
- `frontend/src/hooks/useSearchData.js` → `useSearchData.ts`

**Pages** (10 files):
- `frontend/src/pages/Landing.js` → `Landing.tsx`
- `frontend/src/pages/CourseDetails.js` → `CourseDetails.tsx`
- `frontend/src/pages/Planner.js` → `Planner.tsx`
- `frontend/src/pages/Scheduler.js` → `Scheduler.tsx`
- `frontend/src/pages/SearchResults.js` → `SearchResults.tsx`
- `frontend/src/pages/Compare.js` → `Compare.tsx`
- `frontend/src/pages/Home.js` → `Home.tsx`
- `frontend/src/pages/Search.js` → `Search.tsx` (or move to components)
- `frontend/src/pages/Navbar.js` → move to components
- `frontend/src/pages/DashboardRedirect.js` → `DashboardRedirect.tsx`

**Components** (30+ files):
- `frontend/src/components/Navbar.js` → `Navbar.tsx`
- `frontend/src/components/Search.js` → `Search.tsx`
- `frontend/src/components/SearchButton.js` → `SearchButton.tsx`
- `frontend/src/components/TeacherTable.js` → `TeacherTable.tsx`
- `frontend/src/components/GPATrendsChart.js` → `GPATrendsChart.tsx`
- `frontend/src/components/HistoricalDataTable.js` → `HistoricalDataTable.tsx`
- `frontend/src/components/Planner.js` → `Planner.tsx`
- `frontend/src/components/PlannerDisplay.js` → `PlannerDisplay.tsx`
- `frontend/src/components/Planner_Mobile.js` → `PlannerMobile.tsx`
- `frontend/src/components/ScheduleFinder.js` → `ScheduleFinder.tsx`
- `frontend/src/components/Compare.js` → `Compare.tsx`
- `frontend/src/components/ProfessorCard.js` → `ProfessorCard.tsx`
- `frontend/src/components/ProfessorRatingCard.js` → `ProfessorRatingCard.tsx`
- `frontend/src/components/LoginButton.js` → `LoginButton.tsx`
- `frontend/src/components/Actions.js` → `Actions.tsx`
- `frontend/src/components/LineGraph.js` → `LineGraph.tsx`
- `frontend/src/components/BarGraph.js` → `BarGraph.tsx`
- And all files in `frontend/src/components/modals/`
- And all files in `frontend/src/components/ui/`
- And all files in `frontend/src/components/scheduler/`

**Configuration Files** (new):
- `frontend/tsconfig.json` (create)
- `frontend/.eslintrc.js` (update)
- `frontend/webpack.config.js` (update)

### External Resources
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [React + TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)

## Risk Mitigation

### Potential Risks and Mitigation Strategies

**Risk 1**: Migration takes longer than estimated
- **Mitigation**: Use incremental approach, merge frequently, track velocity
- **Contingency**: Adjust timeline, prioritize critical files first

**Risk 2**: Type errors are overwhelming
- **Mitigation**: Start with permissive config, gradually increase strictness
- **Contingency**: Use `@ts-ignore` temporarily, document for later fix

**Risk 3**: Build configuration breaks
- **Mitigation**: Test configuration with sample file first
- **Contingency**: Have rollback plan, keep JavaScript config alongside

**Risk 4**: Third-party libraries lack types
- **Mitigation**: Check DefinitelyTyped first, create custom declarations if needed
- **Contingency**: Wrap in typed facade, use `any` only at boundary

**Risk 5**: Team unfamiliar with TypeScript
- **Mitigation**: Provide training, pair programming, code review support
- **Contingency**: Assign experienced TypeScript developer as mentor

**Risk 6**: Performance degradation
- **Mitigation**: Monitor build times, bundle sizes during migration
- **Contingency**: Optimize tsconfig, use incremental compilation

## Success Metrics

### Quantitative Metrics
- **Type Coverage**: >95% of codebase typed (measured by TypeScript strict mode)
- **Build Success**: Zero type errors in `tsc --noEmit`
- **Lint Success**: Zero TypeScript ESLint errors
- **Bundle Size**: <5% increase (TypeScript should not significantly affect bundle size)
- **Build Time**: <20% increase (TypeScript compilation adds overhead)
- **Any Usage**: <5 occurrences of `any` type
- **Migration Progress**: Track percentage of files converted weekly

### Qualitative Metrics
- **Developer Experience**: Team reports improved autocomplete and error detection
- **Code Quality**: Fewer type-related bugs in code reviews
- **Onboarding**: New developers can understand code faster
- **Refactoring Confidence**: Team feels safer making large changes
- **Documentation**: Types serve as inline documentation

## Timeline Estimate

### 6-Week Migration Plan

**Week 1: Infrastructure and Foundation**
- Days 1-2: Install TypeScript, configure tsconfig.json
- Days 3-4: Create core type definitions in `types/`
- Day 5: Convert one sample component as proof-of-concept

**Week 2: Context and Hooks**
- Days 1-2: Convert context providers to TypeScript
- Days 3-4: Convert all custom hooks
- Day 5: Convert utility functions

**Week 3: Component Tier 1-2**
- Days 1-2: Convert UI components and modals
- Days 3-5: Convert display components (cards, badges, etc.)

**Week 4: Component Tier 3-5**
- Days 1-2: Convert chart components
- Days 3-4: Convert table components
- Day 5: Convert interactive components

**Week 5: Component Tier 6 and Pages**
- Days 1-3: Convert complex components (Planner, ScheduleFinder, Navbar)
- Days 4-5: Convert page components

**Week 6: Testing and Cleanup**
- Days 1-2: Remove all JavaScript files, fix remaining type errors
- Days 3-4: Increase tsconfig strictness, fix new errors
- Day 5: Documentation, team training, celebrate! 🎉

## Labels
`enhancement`, `typescript`, `migration`, `frontend`, `refactoring`, `difficulty level: high`, `priority level: high`, `epic`

## Dependencies
- Blocks: TypeScript Migration Project completion
- Depends on: TypeScript Configuration and Tooling Setup (Issue #4)
- Related to: Backend TypeScript Migration (Issue #2), Zod Schema Implementation (Issue #3)