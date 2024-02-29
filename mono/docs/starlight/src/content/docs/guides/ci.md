---
title: Continuous Integration
description: Details on continuous integration
---

The aim is to have an ultra fast and simple CI.

The CI is powered by github actions and the aims are:
1. Full CI run should only take 1 min for the entire monorepo.
2. CI costs should happily fit inside githubs free tier. That's 2000 minutes a month. However none of these minutes are currently used as this is a public repo and runs are not counted towards this total.
3. Try and use some of the new generation of Rust based tools to keep every stage as fast as possible.

#### Mandatory Checks

The main branch is protected and requires all merges to come via a pull request (PR). Before the PR is merged the CI is run and in the github settings for branch protection the 'Main CI' has to successfully pass. The UI is a bit confusing, to add a CI job it must be 'named'. See the snippet below for an example.

```yaml
jobs:
  main-ci-mono:
    name: Main CI Mono
    timeout-minutes: 5
    runs-on: ubuntu-latest
```

The CI is powered by
[Dependabot](https://github.com/dependabot) is enabled on the repo and runs everyday. In general the number of dependencies is kept as low as possible. However the aim is to only have items updated on a weekly basis.

[Sonarqube](https://sonarcloud.io/organizations/nigelbreslaw/projects) offers a free tier for public projects and runs as a quality gate on every PR.

:::tip[Enterprise CI]
Self hosting a Gitlab runner would enable an even faster CI. Various installs and NPM packages would be auto cached. A higher end multi-core VM could build, lint and test everything faster. Finally [Turborepo](https://turbo.build/) can be used to cache stages to avoid rebuilding and retesting unchanged projects in the monorepo.
:::
