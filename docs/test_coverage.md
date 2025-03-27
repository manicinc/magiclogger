# Test Coverage Report

Magiclogger maintains high test coverage to ensure reliability and stability.

## Latest Coverage Report

```
--------------------------------|---------|----------|---------|---------|-------------------
File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------|---------|----------|---------|---------|-------------------
All files                       |   99.13 |    98.25 |   98.72 |   99.07 |                   
 src                            |   99.31 |    98.66 |   98.53 |   99.27 |                   
  Logger.ts                     |   99.46 |    98.65 |   98.48 |   99.44 | 427               
  index.ts                      |     100 |      100 |     100 |     100 |                   
 src/compatibility              |   98.82 |    96.77 |     100 |   98.79 |                   
  index.ts                      |   98.82 |    96.77 |     100 |   98.79 | 156,312           
 src/types                      |     100 |      100 |     100 |     100 |                   
  console.ts                    |     100 |      100 |     100 |     100 |                   
  index.ts                      |     100 |      100 |     100 |     100 |                   
--------------------------------|---------|----------|---------|---------|-------------------
```

## Coverage Breakdown

- **Statements**: 99.13% covered
- **Branches**: 98.25% covered  
- **Functions**: 98.72% covered
- **Lines**: 99.07% covered

## Running the Coverage Report

You can generate the coverage report locally by running:

```bash
npm run test:coverage
```

This will generate a detailed report in the `coverage` directory and output a summary to the console.

## Coverage Goals

We maintain a minimum coverage threshold of 95% for all new code. The thresholds are configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
},
```

## Continuous Integration

Our CI pipeline automatically runs tests and checks coverage on every pull request and commit to the main branch. Pull requests that reduce coverage below the thresholds will not be merged until coverage is improved.

## Uncovered Areas

The few uncovered lines are primarily in edge cases and error handling paths that are difficult to test deterministically, such as:

- File system errors in specific environments
- Race conditions in async operations
- Platform-specific code paths

We continuously work to improve coverage in these areas where possible.