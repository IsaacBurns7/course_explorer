# TypeScript Configuration and Tooling Setup - Project Infrastructure

## Problem Description / Summary

Before any TypeScript code can be written, the project requires comprehensive TypeScript infrastructure setup across both frontend and backend. This encompasses build configuration, linting, development tooling, and CI/CD integration. Without proper configuration, the migration will face:

### Configuration Issues
- **Inconsistent Compiler Options**: Different parts of codebase compiled with different settings
- **Module Resolution Problems**: Imports fail or resolve incorrectly
- **Build Output Issues**: Compiled JavaScript ends up in wrong locations or with wrong format
- **Source Map Problems**: Debugging doesn't map back to TypeScript source correctly
- **Performance Issues**: Slow compilation times frustrate developers

### Development Experience Problems
- **No Hot Reload**: Changes require full rebuild and restart
- **Slow Feedback Loop**: Long compile times between code changes and seeing results
- **Missing IDE Support**: IntelliSense doesn't work without proper configuration
- **Linting Gaps**: JavaScript linting rules don't apply to TypeScript
- **Format Inconsistency**: No automated TypeScript formatting

### Build and Deployment Issues
- **Production Builds**: No clear process to compile TypeScript for production
- **Build Artifacts**: Unclear which files should be deployed (source vs compiled)
- **Environment Variables**: No type-safe way to access configuration
- **Dependency Management**: Missing or incorrect type definition packages
- **Build Caching**: Slow CI builds without incremental compilation

### Testing Integration
- **Test Framework**: Jest/Mocha not configured for TypeScript
- **Test Coverage**: Coverage tools don't understand TypeScript
- **Mock Types**: Mocking libraries need TypeScript configuration
- **Test Utilities**: Test helpers not typed correctly

### CI/CD Pipeline Gaps
- **No Type Checking in CI**: PRs can merge with type errors
- **Build Failures**: CI builds fail due to misconfiguration
- **Deployment Issues**: Wrong files deployed to production
- **Slow CI**: No caching, full rebuild every time

## Expected Behavior

After infrastructure setup:

### Configuration
- **Separate tsconfig Files**: Frontend and backend have independent TypeScript configs
- **Strict Mode Enabled**: TypeScript strictness appropriate for each phase of migration
- **Module System**: Clear CommonJS/ESM choice for backend, React JSX for frontend
- **Path Mapping**: Clean import paths (e.g., `@/components` instead of `../../../components`)
- **Build Output**: Compiled JavaScript in separate `/dist` or `/build` folders
- **Source Maps**: Full source map support for debugging

### Development Workflow
- **Fast Incremental Builds**: Only changed files recompile
- **Hot Module Reload**: Frontend changes reflected immediately
- **Auto-Restart**: Backend restarts automatically on changes
- **Type Checking**: IDE shows type errors in real-time
- **Linting**: TypeScript-specific linting rules enforced
- **Formatting**: Consistent TypeScript code formatting

### Build Process
- **Development Build**: Fast compilation for local development
- **Production Build**: Optimized, minified output for deployment
- **Build Scripts**: Clear npm scripts for all build tasks
- **Build Folder**: Compiled output isolated from source
- **Clean Builds**: Easy to clean and rebuild from scratch

### Testing
- **Test Framework**: Jest or Mocha configured for TypeScript
- **Test Runners**: Tests run without compilation errors
- **Coverage Reports**: TypeScript coverage calculated correctly
- **Type Checking Tests**: Tests benefit from type safety

### CI/CD
- **Automated Type Checking**: CI fails on type errors
- **Build Caching**: Subsequent builds are fast
- **Deployment**: Correct artifacts deployed (compiled JS, not TS)
- **Environment**: CI environment matches local development

## Context

### Technical Environment
- **Node Version**: 20.11 LTS
- **Package Manager**: npm
- **Backend Framework**: Express.js 4.x
- **Frontend Framework**: React 18.x
- **Build Tool (Frontend)**: Webpack (currently)
- **Build Tool (Backend)**: TypeScript compiler directly
- **Test Framework**: Mocha (backend), Jest (frontend likely)
- **CI/CD**: GitHub Actions
- **Current Language**: JavaScript (ES6+, CommonJS)
- **Target Language**: TypeScript 5.x

### Project Structure
```
course_explorer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── types/       (new)
│   ├── package.json
│   ├── tsconfig.json    (new)
│   ├── webpack.config.js (update)
│   └── .eslintrc.js     (update)
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── types/           (new)
│   ├── package.json
│   ├── tsconfig.json    (new)
│   └── .eslintrc.js     (update)
└── .github/
    └── workflows/
        └── ci.yml       (update)
```

## Acceptance Criteria

### Phase 1: Backend TypeScript Configuration (Week 1, Days 1-3)
- [ ] TypeScript installed as dev dependency
- [ ] `backend/tsconfig.json` created with appropriate configuration
- [ ] Type definition packages installed (`@types/*`)
- [ ] Build script added to compile TypeScript
- [ ] `ts-node-dev` installed for development
- [ ] Development script runs TypeScript with hot-reload
- [ ] One sample `.ts` file compiles successfully
- [ ] Compiled output goes to `backend/dist/`
- [ ] Source maps generated and working

### Phase 2: Frontend TypeScript Configuration (Week 1, Days 3-5)
- [ ] TypeScript installed in frontend
- [ ] `frontend/tsconfig.json` created with React configuration
- [ ] Webpack configured to handle `.ts` and `.tsx` files
- [ ] React type definitions installed
- [ ] One sample `.tsx` component works
- [ ] Hot module reload works with TypeScript
- [ ] Build produces optimized bundle
- [ ] Development server serves TypeScript files

### Phase 3: Linting and Formatting (Week 2, Days 1-2)
- [ ] `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` installed
- [ ] ESLint configured for TypeScript in both frontend and backend
- [ ] Prettier configured for TypeScript (if using Prettier)
- [ ] Lint scripts added to `package.json`
- [ ] Pre-commit hooks configured (optional but recommended)
- [ ] VSCode settings configured for auto-format/lint

### Phase 4: Testing Configuration (Week 2, Days 3-4)
- [ ] Jest configured for TypeScript (frontend)
- [ ] Mocha/ts-node configured (backend)
- [ ] Test files can import TypeScript modules
- [ ] Coverage tools work with TypeScript
- [ ] Test scripts updated in `package.json`

### Phase 5: Build Optimization (Week 2, Day 5)
- [ ] Incremental compilation enabled (`tsc --incremental`)
- [ ] Build caching configured
- [ ] Development builds are fast (<10s for rebuild)
- [ ] Production builds are optimized
- [ ] Build size checked and acceptable

### Phase 6: CI/CD Integration (Week 3, Days 1-2)
- [ ] GitHub Actions workflow updated for TypeScript
- [ ] CI runs type checking (`tsc --noEmit`)
- [ ] CI runs linting
- [ ] CI runs tests with TypeScript
- [ ] Build artifacts cached between runs
- [ ] Deployment uses compiled output, not source

### Phase 7: Documentation (Week 3, Days 3-5)
- [ ] README updated with TypeScript setup instructions
- [ ] CONTRIBUTING.md includes TypeScript guidelines
- [ ] tsconfig.json options documented
- [ ] Common issues and solutions documented
- [ ] Example of adding new TypeScript file provided

### Quality Checks
- [ ] Both frontend and backend compile without errors
- [ ] Development servers start successfully
- [ ] Hot reload works in both environments
- [ ] Production builds succeed
- [ ] Tests run successfully
- [ ] CI pipeline passes

## Proposed Solution / Ideas

### Phase 1: Backend TypeScript Configuration

#### Installation
Install TypeScript and all necessary type definitions:
```bash
cd backend
npm install --save-dev typescript
npm install --save-dev @types/node @types/express
npm install --save-dev @types/pg @types/passport
npm install --save-dev @types/passport-google-oauth20
npm install --save-dev @types/jsonwebtoken @types/cookie-parser
npm install --save-dev @types/cors @types/dotenv
npm install --save-dev ts-node-dev  # For development hot-reload
```

#### Backend tsconfig.json
Create `backend/tsconfig.json` with Node.js-appropriate settings:

**Key Configuration Decisions**:
- **target**: "ES2022" - Modern Node.js supports this
- **module**: "commonjs" - Express ecosystem uses CommonJS
- **moduleResolution**: "node" - Standard Node.js resolution
- **outDir**: "./dist" - Compiled output separate from source
- **rootDir**: "./" - Source files at root
- **strict**: Start false, gradually enable
- **esModuleInterop**: true - Better interop with ESM libraries
- **skipLibCheck**: true - Faster compilation
- **forceConsistentCasingInFileNames**: true - Cross-platform compatibility
- **resolveJsonModule**: true - Import JSON files
- **sourceMap**: true - Enable debugging

**Include/Exclude**:
- Include: All `.ts` files in backend
- Exclude: `node_modules`, `dist`, test files (handle separately)

#### Backend Build Scripts
Update `backend/package.json`:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

**Script Purposes**:
- `dev`: Development with auto-restart on changes
- `build`: Compile TypeScript to JavaScript
- `start`: Run compiled JavaScript (production)
- `clean`: Remove build artifacts
- `type-check`: Check types without emitting files
- `type-check:watch`: Continuous type checking

#### Development Workflow
Use `ts-node-dev` for development:
- `--respawn`: Restart on file changes
- `--transpile-only`: Skip type checking for speed (rely on editor)
- Watches all imported files
- Fast restart times

### Phase 2: Frontend TypeScript Configuration

#### Installation
Install TypeScript and React type definitions:
```bash
cd frontend
npm install --save-dev typescript
npm install --save-dev @types/react @types/react-dom
npm install --save-dev @types/react-router-dom
npm install --save-dev @types/node
```

#### Frontend tsconfig.json
Create `frontend/tsconfig.json` with React-specific settings:

**Key Configuration Decisions**:
- **target**: "ES2020" - Modern browsers support this
- **module**: "esnext" - Webpack handles module bundling
- **lib**: ["DOM", "DOM.Iterable", "ES2020"] - Browser APIs
- **jsx**: "react-jsx" - New JSX transform (React 18)
- **moduleResolution**: "node"
- **outDir**: "./build" - Compiled output
- **strict**: Start false, gradually enable
- **esModuleInterop**: true
- **allowSyntheticDefaultImports**: true - Better imports
- **skipLibCheck**: true
- **resolveJsonModule**: true
- **isolatedModules**: true - Required for Babel/SWC
- **noEmit**: true - Webpack handles output, not tsc

**Path Mapping** (optional but recommended):
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"]
    }
  }
}
```

This allows:
```typescript
// Instead of:
import Component from '../../../components/Component';

// Use:
import Component from '@/components/Component';
```

#### Webpack Configuration
Update `frontend/webpack.config.js`:

**Add TypeScript Loader**:
- Install `ts-loader` or use `babel-loader` with TypeScript preset
- Add `.ts` and `.tsx` to resolve.extensions
- Configure loader for `.ts(x)` files

**Source Maps**:
- Enable source maps for development
- Configure for production (source-map vs none)

**Hot Module Replacement**:
- Ensure HMR works with TypeScript
- May need `react-refresh` for React HMR

#### Frontend Build Scripts
Update `frontend/package.json`:
```json
{
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

### Phase 3: Linting Configuration

#### Installation
Install TypeScript ESLint:
```bash
# For both frontend and backend
npm install --save-dev @typescript-eslint/parser
npm install --save-dev @typescript-eslint/eslint-plugin
```

#### ESLint Configuration
Update `.eslintrc.js` in both frontend and backend:

**Parser Configuration**:
- Set parser to `@typescript-eslint/parser`
- Configure parser options for TypeScript

**Plugin Configuration**:
- Add `@typescript-eslint` plugin
- Extend recommended TypeScript rules

**Rules**:
- Enable TypeScript-specific rules
- Disable conflicting JavaScript rules
- Customize based on team preferences

**File Patterns**:
- Apply TypeScript rules only to `.ts` and `.tsx` files
- Maintain JavaScript rules for remaining `.js` files during migration

#### Prettier Integration (Optional)
If using Prettier:
- Install `prettier`
- Configure for TypeScript
- Integrate with ESLint (`eslint-config-prettier`)
- Add format scripts

### Phase 4: Testing Configuration

#### Backend Testing (Mocha)
Configure Mocha for TypeScript:
- Install `ts-node` for Mocha
- Configure Mocha to use `ts-node/register`
- Update test file extensions to `.test.ts`
- Ensure test files can import TypeScript modules

**Mocha Configuration** (`.mocharc.json`):
- Set `require: ['ts-node/register']`
- Set `extensions: ['.ts']`
- Configure coverage tools (`nyc`) for TypeScript

#### Frontend Testing (Jest)
Configure Jest for TypeScript:
- Install `ts-jest`
- Configure Jest to use `ts-jest` preset
- Update test file patterns to `.test.ts(x)`
- Configure coverage to include TypeScript

**Jest Configuration** (`jest.config.js`):
- Set `preset: 'ts-jest'`
- Configure `testEnvironment`
- Set up module name mapping for path aliases
- Configure coverage collection

### Phase 5: Build Optimization

#### Incremental Compilation
Enable TypeScript incremental compilation:
- Add `"incremental": true` to tsconfig
- TypeScript creates `.tsbuildinfo` file
- Subsequent builds only compile changed files
- Significantly faster rebuild times

#### Build Caching
Configure caching:
- **Webpack**: Enable persistent caching
- **TypeScript**: Use incremental flag
- **CI**: Cache `node_modules` and build artifacts

#### Performance Tuning
Optimize for speed:
- Use `--transpileOnly` in development (skip type checking)
- Run type checking separately (in watch mode)
- Enable `skipLibCheck` to skip checking node_modules types
- Use SWC or esbuild for transpilation if needed (faster than tsc)

### Phase 6: CI/CD Integration

#### GitHub Actions Workflow
Update `.github/workflows/ci.yml`:

**Job Structure**:
1. **Checkout code**
2. **Setup Node.js** (version 20.11)
3. **Cache dependencies** (cache node_modules)
4. **Install dependencies** (npm install)
5. **Type checking** (tsc --noEmit)
6. **Linting** (eslint)
7. **Testing** (npm test)
8. **Build** (npm run build)

**Caching Strategy**:
- Cache `node_modules` between runs
- Cache TypeScript build info
- Cache Webpack cache (frontend)
- Speeds up subsequent CI runs

**Deployment**:
- Build artifacts (dist/ folder) uploaded
- Only compiled JavaScript deployed, not source
- Source maps deployed separately (optional)

#### Branch Protection
Configure GitHub branch protection:
- Require CI checks to pass before merge
- Require type check job to succeed
- Prevent merging with TypeScript errors

### Phase 7: Documentation and Guidelines

#### README Updates
Add TypeScript section to README:
- Prerequisites (Node.js, npm versions)
- Installation instructions
- Development commands
- Build commands
- Troubleshooting common issues

#### Contributing Guidelines
Create or update CONTRIBUTING.md:
- TypeScript coding standards
- How to add new TypeScript files
- Type safety best practices
- When to use `any` (never, ideally)
- How to handle type errors

#### VSCode Configuration
Create `.vscode/settings.json` (recommended):
- Enable TypeScript format on save
- Configure ESLint integration
- Set up path IntelliSense
- Recommend extensions

#### Common Issues Documentation
Document solutions to common problems:
- "Cannot find module" errors
- Type definition conflicts
- Build failures
- HMR not working
- Source map issues

## Relevant Code / Links

### Configuration Files to Create

**Backend**:
- `backend/tsconfig.json` (new)
- `backend/.eslintrc.js` (update)
- `backend/.mocharc.json` (update/create)
- `backend/.prettierrc` (optional)

**Frontend**:
- `frontend/tsconfig.json` (new)
- `frontend/.eslintrc.js` (update)
- `frontend/webpack.config.js` (update)
- `frontend/jest.config.js` (update/create)
- `frontend/.prettierrc` (optional)

**Root**:
- `.github/workflows/ci.yml` (update)
- `.vscode/settings.json` (create)
- `.vscode/extensions.json` (create)
- `README.md` (update)
- `CONTRIBUTING.md` (update/create)

### Package.json Changes

Both frontend and backend `package.json` need:
- TypeScript dependencies added
- Build scripts updated
- Lint scripts updated
- Test scripts updated

### External Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ts-node-dev](https://github.com/wclr/ts-node-dev)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)
- [Webpack TypeScript](https://webpack.js.org/guides/typescript/)

## Risk Mitigation

### Potential Risks

**Risk 1**: Configuration conflicts between tools
- **Mitigation**: Follow established patterns, test configurations
- **Contingency**: Simplify configuration, remove conflicting options

**Risk 2**: Slow build times
- **Mitigation**: Enable incremental compilation, use caching
- **Contingency**: Use faster transpilers (SWC, esbuild) if needed

**Risk 3**: CI/CD failures
- **Mitigation**: Test CI locally, use act or similar tools
- **Contingency**: Gradual rollout, feature flags for CI checks

**Risk 4**: Development workflow disruption
- **Mitigation**: Ensure hot reload works before rollout
- **Contingency**: Provide fallback development commands

**Risk 5**: Team unfamiliarity with tools
- **Mitigation**: Document thoroughly, provide training
- **Contingency**: Office hours for configuration support

## Success Metrics

### Quantitative Metrics
- **Build Time**: Development rebuild <10 seconds
- **Build Time**: Production build <2 minutes
- **CI Time**: Full CI run <5 minutes (with caching)
- **Type Check Time**: <30 seconds for full check
- **Configuration Complete**: All 7 phases completed

### Qualitative Metrics
- **Developer Experience**: Team reports smooth workflow
- **Reliability**: Builds succeed consistently
- **Maintainability**: Configuration is documented and understandable
- **Scalability**: Configuration supports future growth

## Timeline Estimate

### 3-Week Setup Timeline

**Week 1: Core Configuration**
- Days 1-3: Backend TypeScript configuration and testing
- Days 3-5: Frontend TypeScript configuration and testing

**Week 2: Tooling and Testing**
- Days 1-2: ESLint and Prettier setup
- Days 3-4: Testing framework configuration
- Day 5: Build optimization

**Week 3: CI/CD and Documentation**
- Days 1-2: GitHub Actions integration
- Days 3-5: Documentation, guidelines, team training

## Labels
`enhancement`, `typescript`, `infrastructure`, `tooling`, `configuration`, `frontend`, `backend`, `difficulty level: medium`, `priority level: critical`

## Dependencies
- Blocks: Frontend TypeScript Migration (Issue #1)
- Blocks: Backend TypeScript Migration (Issue #2)
- Blocks: Zod Schema Implementation (Issue #3)
- This issue must be completed FIRST before any migration work begins