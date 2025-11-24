# Repository Guidelines

## Project Structure & Module Organization
- Core CLI source lives in `src/index.ts`; keep new logic modular and typed.
- Published binaries reside in `bin/` (`create-telebot.js`, `add-webhook.js`, `add-scenes.js`) and are the entry points users call.
- Templates or scaffolding assets should sit alongside the relevant bin helper; avoid scattering files across the root.
- Configuration: `tsconfig.json` enforces strict ESNext TypeScript settings in bundler mode.

## Build, Test, and Development Commands
- `bun run src/index.ts` — run the CLI locally once.
- `bun run --watch src/index.ts` — develop with live reload.
- `npm version {patch|minor|major}` — bump package version; tag and changelog commit follow Git defaults.
- `node bin/add-webhook.js` / `node bin/add-scenes.js` — run helper scripts to extend generated bots.

## Coding Style & Naming Conventions
- Language: TypeScript (ESNext, ESM). Prefer async/await and strict typing; enable `strict` and keep `noEmit` in mind.
- Indentation: 2 spaces; keep functions small and pure where possible.
- Naming: kebab-case for files in `bin/`; PascalCase for classes; camelCase for variables/functions; favor descriptive command names.
- Imports: use ESM syntax and explicit file extensions when needed (`./foo.ts`), per `verbatimModuleSyntax`.
- Add concise inline comments only where control flow is non-obvious (prompt flows, IO handling).

## Testing Guidelines
- No automated test suite exists yet; add Bun tests when introducing new features.
- Place new tests under `tests/` (create if missing), mirroring `src/` paths; name files `*.spec.ts`.
- Aim to cover prompt logic, file generation, and error handling; mock network calls and file writes.
- Run with `bun test` once tests are added; ensure generated files are cleaned up in teardown.

## Commit & Pull Request Guidelines
- Follow observed prefixes: `feat(scope): ...`, `ci(scope): ...`, `Release X.Y.Z`, or concise imperative summaries.
- Keep commits focused; include CLI behavior notes in the body when changing prompts or generated outputs.
- PRs should describe: purpose, key commands to validate (`bun run src/index.ts`), and any template additions/changes.
- Link related issues; attach sample CLI runs or screenshots of generated project trees when relevant.

## Security & Configuration Tips
- Do not commit `.env` or tokens; use environment variables during local runs.
- Validate user input in prompts; sanitize file paths before writing scaffolds.
- When adding dependencies, prefer lightweight, actively maintained packages; update `peerDependencies` if TypeScript tooling changes.
