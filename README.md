# Guardian Ghost monorepo

As of Decemeber 2023 this is a monorepo built around going beyond the Ishtar Commander mobile applications.

The current short term plans are:

- [x] Setup github page and have a running CI.
- [x] Register the new domains.
- [] Learn how to setup a cloudflare D1 database and record CI related data.
- [] Setup a mini stats [dashboard](https://dashboard.guardianghost.com).
- [] Setup a mini [documentation](https://documentation.guardianghost.com) site. MKdocs or Starlight are options.
- [] Start with a React app for the main app. However React Native has potential for hitting mobile, desktop and web.

The tech choices are based on interesting new tools to learn. However the main app will use React.

## Developer environment

I did try to use [Bun](https://bun.sh/) which limits development to Linux and MacOS with Windows support only on [WSL](https://learn.microsoft.com/en-us/windows/wsl/about). However the monorepo and full node ecosystem support isn't quite there yet. Thus Node and [Pnpm](https://pnpm.io) are used instead. CI runs as of 25.12.2023 are ~25 seconds with PNPM and probably would be 5-8 seconds faster with Bun. I will revisit Bun later in 2024 when its compatibility and Monorepo support improves.



## CI / DevOps
The CI is powerered by github acctions and the aims are:
1. Full CI run should only take 1 min for the entire monorepo.
2. CI costs should happily fit inside githubs free tier. That's 2000 minutes a month. However none of these minutes is currently used as runs that take under a minute don't seem to count towards this total.
3. Try and use some of the new generation of Rust based tools to keep every stage as fast as possible.

[Dependabot](https://github.com/dependabot) is enabled on the repo and runs everyday. In general the number of dependencies is kept as low as possible. However the aim is to only have items updated on a weekly basis.

[Sonarqube](https://sonarcloud.io/organizations/nigelbreslaw/projects) offers a free tier for public projects and runs as a quality gate on every PR.

