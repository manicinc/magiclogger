# Test Coverage Report

Magiclogger maintains high test coverage to ensure reliability and stability.

## Latest Coverage Report

<!-- COVERAGE_TABLE_PLACEHOLDER -->
```
| File |  | Statements |  | Branches |  | Functions |  | Lines |  |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| src |  | 70.4% | 352/500 | 64.59% | 166/257 | 55.55% | 85/153 | 69.48% | 321/462 |
| src/async |  | 90.98% | 222/244 | 79.23% | 103/130 | 94.23% | 49/52 | 91.45% | 214/234 |
| src/async/workers |  | 86.11% | 62/72 | 71.87% | 23/32 | 76.47% | 13/17 | 87.87% | 58/66 |
| src/compatibility |  | 100% | 26/26 | 100% | 0/0 | 71.42% | 10/14 | 100% | 20/20 |
| src/compatibility/loggers |  | 84.9% | 686/808 | 76.68% | 375/489 | 87.73% | 143/163 | 87.02% | 671/771 |
| src/constants |  | 92.3% | 120/130 | 87.27% | 48/55 | 93.33% | 28/30 | 93.02% | 120/129 |
| src/core |  | 75.82% | 1807/2383 | 73.08% | 899/1230 | 67.34% | 332/493 | 76.28% | 1718/2252 |
| src/parsers |  | 91.44% | 171/187 | 84.78% | 78/92 | 95.65% | 22/23 | 92.61% | 163/176 |
| src/theme |  | 90.29% | 186/206 | 77.19% | 88/114 | 76.47% | 26/34 | 91.53% | 173/189 |
| src/transports |  | 84.11% | 90/107 | 38.09% | 16/42 | 57.5% | 23/40 | 82.1% | 78/95 |
| src/transports/base |  | 71.25% | 714/1002 | 72.47% | 337/465 | 63.02% | 121/192 | 72.81% | 699/960 |
| src/transports/base/implementations |  | 82.81% | 1359/1641 | 73.73% | 671/910 | 87.27% | 247/283 | 83.71% | 1326/1584 |
| src/transports/formatters |  | 76.28% | 222/291 | 73.27% | 159/217 | 82.08% | 55/67 | 77.28% | 211/273 |
| src/types |  | 33.33% | 11/33 | 0% | 0/14 | 25% | 2/8 | 34.61% | 9/26 |
| src/utils |  | 85.32% | 285/334 | 88.64% | 164/185 | 63.15% | 36/57 | 86.75% | 275/317 |
```
<!-- /COVERAGE_TABLE_PLACEHOLDER -->

## Coverage Breakdown

<!-- COVERAGE_BREAKDOWN_PLACEHOLDER -->
- **Statements**: 79.26% covered
- **Branches**: 73.88% covered
- **Functions**: 73.30% covered
- **Lines**: 80.16% covered
<!-- /COVERAGE_BREAKDOWN_PLACEHOLDER -->

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