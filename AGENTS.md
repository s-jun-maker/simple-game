# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript game code and styles (`main.ts`, `style.css`).
- `index.html`: App entry wiring the canvas and module script.
- `public/`: Static assets served as-is (e.g., `vite.svg`).
- `tsconfig.json`: Strict TypeScript config (ESNext modules).
- `biome.json`: Formatter/linter configuration.

## Build, Test, and Development Commands
- `pnpm dev`: Start Vite dev server with HMR for rapid iteration.
- `pnpm build`: Type-check (`tsc`) and produce production build (`dist/`).
- `pnpm preview`: Serve the built app locally to verify production output.
- Lint/format (via Biome): `pnpm biome lint .` and `pnpm biome format .`.

## Coding Style & Naming Conventions
- Indentation: tabs (configured in `biome.json`).
- Quotes: double quotes for JS/TS.
- TypeScript: `strict` mode; avoid `any`, prefer explicit types.
- Naming: Classes `PascalCase` (e.g., `Player`), variables/functions `camelCase`, constants `UPPER_SNAKE_CASE`.
- Files: kebab-case for new modules/assets (e.g., `enemy-spawner.ts`).

## Testing Guidelines
- Framework: Not configured yet. Prefer pure, isolated logic to ease future tests (e.g., extract math/physics helpers from `animate()` to utility modules).
- Manual checks: run `pnpm dev`, verify gameplay, resizing, and click interactions across browsers.
- If you add tests, use Vitest + jsdom; name files `*.test.ts` colocated with source.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits — examples:
  - `feat: add enemy spawn system`
  - `fix: correct projectile velocity angle`
  - `chore: format with biome`
- PRs: include a clear description, linked issue, before/after screenshots or short clip for gameplay changes, and steps to reproduce. Ensure `pnpm build` and `pnpm preview` succeed and code is linted/formatted.

## Architecture Overview
- Render: Canvas 2D context; core loop `animate()` updates and draws `Player`, `Projectile`, and `Enemy` entities.
- Performance: Clear the canvas each frame, keep updates O(n); avoid allocations in the hot path.
