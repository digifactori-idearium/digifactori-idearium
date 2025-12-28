# Developers guidelines

This document describes how to contribute, develop, test, and release the project. It complements the automated quality gates enforced by Husky, Commitlint, ESLint, Prettier, CodeQL, SonarQube, and Turborepo.

## The branch management policy

The project follows a Git Flow–inspired workflow with two major long‑living branches and Short‑living feature branches:

### Main branches

- **dev**: This branch is a gate where we test the application as a whole.
  - Integration branch.
  - All completed features, bug fixes, or test implementations are merged here.

- **main**: This branch will contain the last, validate and tested version of the application.
  - Production-ready branch.
  - Any pull request merged into main triggers integration and quality tests.

### Short‑living feature branches

To contribute on the **dev** branch, a developer create a short-living branch from **dev**:

- This branch name must follow this pattern : `<contributor_name>/<type of work>/<modified module name>`,
  where the type of work is either `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test` like commit convention.
- The branch should correspond to a user story in the sprint backlog, and as so, should not live longer
  than 3 days.
- The developer makes its commits on this branch, which respect the code conventions described below. The
  commits names should respect the conventions, described below as well.
- Once the code is finished and the unit tests has been run and has succeeded, the **dev** can make a PR
  to merge on the **dev** branch.

#### Example of a complete integration

**Context**: Alice wants to fix a bug in the account manager.

**Steps**:

1. She creates a branch she call `Alice/fix/account-manager`.
2. She fixes the bug and commits the correction. If the unit tests are ok and
   the static rules are respected, she can push on her branch.
3. She makes a pull request on **dev**. If the tests and recommendations of the PR are ok, the PR passes
   and is merged on **dev**.
4. Once on **dev**, the fix can be tested in integration with the whole application. If this goes well, it
   is finally pushed on **main**.

## Commit messages conventions

The commit messages are verified by commitlint (see the commitlint.config.js file, and https://commitlint.js.org/reference/rules.html to access to the documentation). It blocks the commit if the specified conventions are not respected.

Format: `<type>(optional-scope): <subject><body><footer>`

Example: ✅`fix(auth): handle password validation` | ❌ `handle password validation` | ❌ `fix(Auth): handle password validation`

Those conventions are:

- The body, the footer and the header can not be longer than 100 characters
- The subject can be in any case style, except in start-case or pascal-case
- The subject can not be empty, and can not end with "."
- The type is in lowercase and not empty, and is either: `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`.
  It checks also the footer and the body starts by a blank line, and emits a warning if the commit does not.

## Code conventions

### ESLint

The code conventions are verified with static tests by ESLint (see the eslint.config.js file). It blocks the commit if any ESLint error occurs.
Some of the rules are (see [Eslint Rules for more info](https://eslint.org/docs/latest/rules/)):

- All imported modules must be used: Unused imported cause a warning

- Imports must follow a specific order: Wrong imported order cause a warning

- All variables and function arguments must be used: Unused variables or arguments cause a warning, except those starting with \_

- All promises must be properly handled: Unhandled promises cause a warning.

To help enforce these rules, VS Code is configured to automatically organize imports and remove unused imports on file save.

### Prettier

The project uses Prettier for code formating. Whenever a file is saved, Prettier does automatically the following formatting (see the .prettierrc file, and https://prettier.io/docs/options for more info):

- Adds a semicolon at the end of each statement
- Adds trailing commas where valid in ES5
- Remplaces any double quotes by single quotes
- Wraps on code lines when they are longer than 80 chars
- Sets the tabulation to two spaces
- Print spaces around brackets in data structures
- Omits parenthesis when possible in arrow functions
- Sets end of line characters to \n

## Automated Tooling

### Husky

Husky runs Git hooks locally to prevent and to ensure no invalid code or commit messages reach the repository.

- pre-commit: ESLint and Prettier check
- commit-msg: Commitlint validation
- pre-push:
  - Runs tests before pushing
  - If the current branch is main, master, or develop, it also runs a build

### SonarQube

SonarQube is used for continuous code quality inspection:

- Code smells
- Bugs & vulnerabilities
- Test coverage
- Duplications
- Technical debt

Analysis is triggered during CI on pull requests and merges(dev and main).
A PR cannot be merged if it fails the Sonar Quality Gate.

### CodeQL

CodeQL performs security-focused static analysis to add an additional security layer to every pull request.

- Detects security vulnerabilities
- Identifies unsafe patterns
- Runs automatically via GitHub Actions

## Release policy

A new version is realesed each time a modification is pushed on **main**, and the first complete version is expected for May 2026.

- Releases are created only from `main`.

- `main` always reflects a production‑ready state.

- Versioning follows Semantic Versioning: `MAJOR.MINOR.PATCH`
  - MAJOR: breaking changes

  - MINOR: new backward‑compatible features

  - PATCH: bug fixes

### Deployment

- **Frontend (Web)**: Deployed on **Netlify** – provides live hosting for the React application.
- **Backend (API)**: Deployed on **Render** – hosts the Node.js + Express server with Prisma database integration.

## Getting Started

To start contributing to the project, please read the contribution guide:

➡️ [Contributing Guide](CONTRIBUTING.md)
