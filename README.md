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

As of December 2023 [Bun](https://bun.sh/) is being used which limits development to Linux and MacOS with Windows support only on [WSL](https://learn.microsoft.com/en-us/windows/wsl/about). However native windows support is excpted to be added to bun any week now.

Bun was chosen because of it's speed. It provides a package manager and unit test framework that is super fast. However not all tools are compatible with it. For example Dependabot automatic updates are not supported. To work around this the repo also maintains a 'working' [Pnpm](https://pnpm.io) config. Currently it should not be used for dev work, but it's there as a plan B if Bun starts to breakdown as the Monorepo evolves.

## CI / DevOps
The CI is powerered by github acctions and the aims are:
1. Full CI run should only take 1 min for the entire monorepo.
2. CI costs should happily fit inside githubs free tier. That's 2000 minutes a month. But runs under 1min don't seem to count!?
3. Try and use some of the new generation of Rust based tools to keep every stage as fast as possible.

Dependabot is enabled on the repo and runs everyday. In general the number of dependencies is kept as low as possible. However the aim is to only have items updated on a weekly basis.
