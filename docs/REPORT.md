# Report

## Link to our directory

Our GitHub directory is available at https://github.com/digifactori-idearium/digifactori-idearium.

## How to trigger a build

To trigger a build on the pipeline, you can:
1. create a branch (<contributor_name>/correction/docs) on **dev**
2. make a dumy modification (such as correcting adding "m" to "dumy")
3. commit the correction on the branch (header: docs: spelling correction, body: just a test to trigger a build)
4. Make a pull request

## Tasks repartition

Bénédicte has:
- crated the issue templates
- created the workflows
- set up the ESLint analyser
- set up the Prettier analyser
- set up the commitLint analyser
- set up the sonar analyser
- set up Husky
- created the backbones of our future application (backend and frontend)
- reviewed the documentation

Robin has:
- written the documentations
- doing so, reviewed the choice of rules for the ESLint, Prettier and commitlint

## Self-reflection

The set up has been made quite easily, as Bénédicte has strong bases on the elaboration of development pipelines. The only difficulty was to connect Sonar, because ...
The documentation writing was a little bit tedious for Robin, as he had to understand how the different analyser has been set up, to correctly explain what they do and how the developers should compose with those.
For next time, Robin should try to work on things he does not know, rather than counting on the others.