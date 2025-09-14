---
title: Infrastructure
description: Tech stack
---

### Source Control and Issue tracking

[Github](https://github.com) is used to host all the code and issue/bug tracking.

### CI

[Github Actions](https://github.com/features/actions) are used to run the CI.

### Dependancy Updating

[Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates) is used to keep all dependencies upto date. It checks
daily for updates to the Github Actions and NPM packages. This ensures the project stays on 
top of updates that cover security, bugs and enhancements.


### Security

[CodeQL](https://codeql.github.com/) runs on every push, PR and on a schedule of once a week. This
checks for security vulnerabilities in any of the code.


### Code Quality

Locally and in CI [Biome](https://biomejs.dev/) is used to enforce standard code formatting. Biome is also used in place of
eslint to lint the code.






