# Test Coverage Report

[![Coverage on master, from Codecov](https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg)](https://app.codecov.io/gh/manicinc/magiclogger/tree/master)

The CI workflow (`.github/workflows/ci.yml`) runs the test suite with coverage on every push to `master` and on every pull request into it, and uploads `coverage/lcov.info` to [Codecov](https://app.codecov.io/gh/manicinc/magiclogger). The badge above shows Codecov's coverage figure for `master`, which each upload from a push to `master` updates. The README carries the same badge.

## Coverage by Directory and File

[Codecov's file view](https://app.codecov.io/gh/manicinc/magiclogger/tree/master) gives the coverage of each directory and file on `master` and marks the uncovered lines. The sunburst below draws the same data: a slice's size is its number of tracked lines and its colour its coverage, from green for more to red for less ([Codecov: graphs](https://docs.codecov.com/docs/graphs)).

[![Coverage sunburst for master, from Codecov](https://codecov.io/gh/manicinc/magiclogger/branch/master/graphs/sunburst.svg)](https://app.codecov.io/gh/manicinc/magiclogger/tree/master)

Each CI run also keeps its full report as an artifact named `coverage-` plus the commit's SHA.

## Running the Coverage Report

You can generate the coverage report locally by running:

```bash
npm run test:coverage
```

This will generate a detailed report in the `coverage` directory and output a summary to the console.

## Coverage Checks on Pull Requests

Codecov reports two statuses on each pull request, set in `codecov.yml` ([Codecov: status checks](https://docs.codecov.com/docs/commit-status)):

- **codecov/project** measures the whole project's coverage against the pull request's base: `target: auto` takes the base's coverage as the target, and `threshold: 5%` lets coverage drop by up to 5% and still pass.
- **codecov/patch** measures only the lines the pull request changes: `target: 70%`, with `threshold: 10%`.

Jest enforces no minimum of its own: every `coverageThreshold` value in `jest.config.ts` is 0.
