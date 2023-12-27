---
title: CI info
description: Details on how the CI was setup
---

### Syncpack

[Syncpack](https://jamiemason.github.io/syncpack/) is an NPM tool to help keep a monorepo consistent. It is able to scan all the package.json files, make them consistent, sort items alphabetically and spot dependencies where one project is using a different version to another. 

Occasionally run the 'syncpack' script in the root package.json to keep things consistent. However depenceny consistency is enforced via dependabot. 

### .github/workflows/main.yml

This action uses an extension which checks for file changes in a folder and then only runs the job if there are changes. [Source helper](https://how.wtf/run-workflow-step-or-job-based-on-file-changes-github-actions.html).
