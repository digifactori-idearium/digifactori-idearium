# Report

## Project

### digifactori-idearium

Idearium 2.0 is an educational initiative by digiFactory, a Namur-based nonprofit founded
in 2019. The project offers a 3-day workshop for children aged 6–12, modeled on a
hackathon format, to introduce them to software development in a broad sense.
Beyond coding, the workshop emphasizes collaboration, creativity, critical thinking, com-
munication, and basic technical concepts like data, networks, UX, and agile methods, all
adapted to a young audience.
Currently, the program uses Rooms.xyz, a platform for creating interactive 3D spaces.
While fun and intuitive, the platform has some limitations that Id´earium 2.0 aims to
address to enhance the learning experience.

## Link to our directory

Our GitHub directory is available at https://github.com/digifactori-idearium/digifactori-idearium.

Our telemetry with Sonarqube is available at https://sonarcloud.io/organizations/digifactori-idearium/projects

## How to trigger a build

To trigger a build on the pipeline, you can:

1. create a branch (<contributor_name>/fix/docs) on **dev**
2. make a dumy modification (such as correcting adding "m" to "dumy")
3. commit the correction on the branch (header: docs: spelling correction, body: just a test to trigger a build)
4. Make a pull request

## Tasks repartition

Bénédicte has:

- crated the issue templates
- Created CI/CD workflows with GitHub actions.
- Set up code quality and analysis tools: ESLint, Prettier, commitLint, SonarQube, Husky, and CodeQL.
- created the backbones of our future application (backend - Express and frontend- React)
- reviewed the documentation and added CONTRIBUTING.md

Robin has:

- written the documentations in docs
- doing so, reviewed the choice of rules for the ESLint, Prettier and commitlint

## Self-reflection

The implementation was not too difficult and fairly intuitive because Bénédicte had some experience with development pipelines.

We faced issues with SonarQube and CodeQL because proper code analysis and security scanning require the project to be hosted under a GitHub organization rather than a personal repository.

The documentation writing was a little tedious for Robin, as he had to understand how the different analyzers had been set up to explain correctly what they do and how the developers should interact with them.

For next time, team members should try to work on tasks outside their current experience to continue developing their technical skills, while we, as a team, continue to collaborate, learn from each other, and share knowledge.
