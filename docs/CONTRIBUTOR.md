# Developers guidelines

## The branch management policy

The project contains two major branches:
-   **dev**: this branch is a gate where we test the application as a whole. The developers make PR on it whenever they have
    implemented a complete feature
-   **main**: this branch will contain the last, validate and tested version of the application. The PRs on
    main trigger the integration tests.

To contribute on the **dev** branch, a developer create a short-living branch from **dev**:
-  This branch name must follow this pattern : <contributor_name>/<type of work>/<modified module name>,
    where the type of work is either 'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style' or 'test'.
- The branch should correspond to a user story in the sprint backlog, and as so, should not live longer
    than 3 days.
- The developer makes its commits on this branch, which respect the code conventions described below. The 
commits names should respect the conventions, described below as well.
- Once the code is finished and the unit tests has been run and has succeeded, the **dev** can make a PR
    to merge on the **dev** branch.

### Example of a complete integration
**Context**: Alice wants to fix a bug in the account manager.

**Steps**:
1. She creates a branch she call Alice/Bug/account-manager.
2. She fixes the bug and commits the correction. If the unit tests are ok and 
the static rules are respected, she can push on her branch.
3. She makes a pull request on **dev**. If the tests and recommendations of thh PR are ok, the PR passes
and is merged on **dev**.
4. Once on **dev**, the fix can be tested in integration with the whole application. If this goes well, it
is finally pushed on **main**.

## Commit messages conventions
The commit messages are verified by commitlint (see the commitlint.config.js file, and https://commitlint.js.org/reference/rules.html to access to the documentation). It blocks the commit if the specified conventions are not respected .
Those conventions are:
-   The body, the footer and the header can not be longer than 100 characters
-   The subject can be in any case style, except in start-case or pascal-case
-   The subject can not be empty, and can not end with "."
-   The type is in lowercase and not empty, and is either: 'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style' or 'test'.
It checks also that the footer and the body start by a blank line, and emits a warning if not.


## Code conventions
The code conventions are verified with static tests by ESLint (see the eslint.config.js file). It blocks the commit if any test fails.
The conventions are:
-   All imported modules must be used. Unused imported modules leads to an error.
-   The modules must be imported in the following order: builtin, external, internal, parent, sibling, index (for more info, see https://github.com/import-js/eslint-plugin-import/blob/01c9eb04331d2efa8d63f2d7f4bfec3bc44c94f3/docs/rules/order.md). Another order leads to an error.
-   All variables and arguments must be used (except those starting with "_") (for more info, see https://eslint.org/docs/latest/rules/no-unused-vars). Unused variable or argument leads to a warning.
-   All promises must be properly handled (for more info, see https://typescript-eslint.io/rules/no-floating-promises). Unhandled promises lead to a warning.

The project uses Prettier too. Whenever a file is saved, Prettier does automatically the following formatting (see the .prettierrc file, and https://prettier.io/docs/options for more info):
-   Adds a semicolon at the end of each statement
-   Adds trailing commas where valid in ES5
-   Remplaces any double quotes by single quotes
-   Wraps on code lines when they are longer than 80 chars
-   Sets the tabulation to two spaces
-   Print spaces around brackets in data structures
-   Omits parenthesis when possible in arrow functions
-   Sets end of line characters to \n


The project uses Sonar and CodeQL to detect bad code smells and vulnerabilities in the code. The developers are stronly adviced to check the reports of those tools when after a pull request.


## Release policy
A new version is realesed each time a modification is pushed on **main**, and the first complete version is expected for May 2026.