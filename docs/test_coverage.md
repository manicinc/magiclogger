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

`codecov.yml` sets two statuses ([Codecov: status checks](https://docs.codecov.com/docs/commit-status)):

- **codecov/patch** measures only the lines the pull request changes: `target: 70%`, with `threshold: 10%`. Codecov reports it on each pull request and on each push to `master`.
- **codecov/project** measures the whole project's coverage against the pull request's base: `target: auto` takes the base's coverage as the target, and `threshold: 5%` lets coverage drop by up to 5% and still pass. Codecov has reported no `codecov/project` on this repository (none on pull requests 48 to 56 or on the last 40 `master` commits, back to September 2025), so read the project figure on the pull request's page on Codecov.

A status passes only on a report that arrived. Both statuses fail when Codecov has no report for the commit (`if_not_found: failure`), and the test-linux job fails when an upload made with the `CODECOV_TOKEN` secret does not reach Codecov (`fail_ci_if_error`). Pull requests from forks and from Dependabot run without the secret, and their upload's failure does not fail the job. Codecov takes a fork's upload without a token. Any other upload needs one while the organisation requires tokens for its public repositories, Codecov's default for an organisation that joined before the setting existed ([Codecov: tokens](https://docs.codecov.com/docs/codecov-tokens)), so Dependabot's upload needs `CODECOV_TOKEN` stored as a Dependabot secret as well ([codecov-action: Dependabot](https://github.com/codecov/codecov-action#dependabot)); Dependabot's pull requests 48 to 50 carry no Codecov status. When no upload arrives, no Codecov status appears on the pull request.

Jest enforces no minimum of its own: every `coverageThreshold` value in `jest.config.ts` is 0.
