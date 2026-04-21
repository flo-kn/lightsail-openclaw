# Pulumi TypeScript Standards

This repo contains a Pulumi infrastructure-as-code project that follows the standards below

## General principles

- Follow the principles of infrastructure-as-code and config-as-code
- Value the DevOps working habits such as GitOps, Shift-left
- It's a public project. Do not commit secrets, personal identifiers, or credentials



## Package Manager

Use **bun**. Do not use yarn, npm, or pnpm.

Every `Pulumi.yaml` must declare bun as the package manager:

```yaml
runtime:
  name: nodejs
  options:
    packagemanager: bun
```

Install dependencies with `bun install`, not `npm install` or `yarn`.

## Project Structure

```
<project-name>/
├── index.ts          # Pulumi entry point (always index.ts)
├── src/
│   └── types.ts      # Shared TypeScript interfaces (when needed)
├── Pulumi.yaml
├── Pulumi.<stack>.yaml
├── package.json
├── tsconfig.json
└── .gitignore
```

- Entry point is always `index.ts` at the project root.
- Use `src/types.ts` for shared interfaces (e.g. config types like `IAWSDetails`).
- Do not commit `node_modules/` or `bin/`.

## `package.json`

```json
{
    "name": "<project-name>",
    "main": "index.ts",
    "devDependencies": {
        "@types/node": "^22",
        "typescript": "^5.7"
    },
    "dependencies": {
        "@pulumi/pulumi": "^3.150.0",
        "@pulumi/aws": "^7.0.0"
    }
}
```

- No build/deploy `scripts` — Pulumi handles that. Lint scripts (e.g. `lint:sh`) are allowed.
- `"license"` is `"UNLICENSED"`.
- Add provider packages (e.g. `@pulumi/awsx`, `@pulumi/cloudflare`) only when the project uses them.
- Always use caret (`^`) ranges, not pinned versions.
- Check [npmjs.com](https://www.npmjs.com) for the latest versions when creating a new project.

## `tsconfig.json`

```json
{
    "compilerOptions": {
        "strict": true,
        "outDir": "bin",
        "target": "ES2022",
        "module": "commonjs",
        "moduleResolution": "node",
        "sourceMap": true,
        "experimentalDecorators": true,
        "pretty": true,
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "forceConsistentCasingInFileNames": true
    },
    "files": [
        "index.ts"
    ]
}
```

- Target is `ES2022` for new projects.
- `strict: true` is non-negotiable.


## pulumi nameing convention

backend in s3: <projectname>-pulumi-backend

## `Pulumi.yaml`

```yaml
name: <project-name>
description: <one-line description>
runtime:
  name: nodejs
  options:
    packagemanager: bun
config:
  pulumi:tags:
    value:
      pulumi:template: aws-typescript
```

- Use lowercase kebab-case for `name`.
- Include a meaningful `description`.
- The `pulumi:template` tag reflects the primary cloud provider (e.g. `aws-typescript`, `cloudflare-typescript`).

## `.gitignore`

```
/bin/
/node_modules/
```

## TypeScript Conventions

- Use `async` Pulumi component resources or plain resource declarations — no class-based components unless complexity warrants it.
- Define config interfaces in `src/types.ts` when more than one config value is passed around (e.g. `IAWSDetails`).
- Use `pulumi.Config` for reading stack config values.
- Export all top-level resources so Pulumi can track outputs.

## Updating Existing Projects

When touching an older project:
- Migrate the package manager to bun (remove `yarn.lock`, `package-lock.json`, `pnpm-lock.yaml`; run `bun install`).
- Update `Pulumi.yaml` to set `packagemanager: bun`.
- Bump `@types/node` to `^22`, `typescript` to `^5.7`, and Pulumi providers to their latest `^x.y.z` ranges.
- Update `tsconfig.json` target to `ES2022` if it is older.

