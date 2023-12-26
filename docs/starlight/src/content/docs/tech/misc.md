---
title: Misc
description: Details on previous tech trials
---

December 2023: I did try to use [Bun](https://bun.sh/) which limits development to Linux and MacOS with Windows support only on [WSL](https://learn.microsoft.com/en-us/windows/wsl/about). However the monorepo and full node ecosystem support isn't quite there yet. Thus Node and [Pnpm](https://pnpm.io) are used instead. CI runs as of 25.12.2023 are ~25 seconds with PNPM and probably would be 5-8 seconds faster with Bun. I will revisit Bun later in 2024 when its compatibility and Monorepo support improves.