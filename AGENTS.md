# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains planning documentation for the Mission Treasure Hunt app. Keep product and delivery docs in `docs/`; the root `README.md` is the short index. Key files include `docs/requirements.md`, `docs/implementation-plan.md`, `docs/implementation-scope.md`, and `docs/operator-fallback.md`.

When implementation starts, use the planned Next.js structure: application code in `src/` or `app/`, reusable components in `components/`, domain/server logic in `lib/`, tests beside code or in `tests/`, and static map/audio/image assets in `public/`.

## Build, Test, and Development Commands

No package manifest exists yet. Once the Next.js scaffold is added, define these scripts:

- `npm run dev` - start the local development server.
- `npm run build` - typecheck and build the production app.
- `npm run lint` - run linting.
- `npm test` - run Vitest unit/integration tests.
- `npm run test:e2e` - run Playwright smoke tests.
- `npm run coverage` - enforce 100% statements, branches, and functions.

Document any deviations in `README.md`.

## Coding Style & Naming Conventions

Use TypeScript with strict mode. Prefer small pure functions for game rules such as approval, rejection, and map reveal progression. Use PascalCase for React components, camelCase for functions and variables, and kebab-case for route slugs and asset filenames. Keep Polish user-facing copy separate from game logic where practical.

## Testing Guidelines

The project requirement is 100% code coverage at every phase: statements, branches, and functions. Use Vitest with V8 coverage for unit/integration tests and Playwright for critical browser flows. Cover at least team login, quest submission, duplicate submission blocking, rejection/resubmission, admin approval, 21-approval final reveal, and team privacy.

## Commit & Pull Request Guidelines

There is no commit history yet, so no existing convention can be inferred. Use concise imperative commits, for example `Add quest submission flow` or `Document fallback plan`. Pull requests should include a short summary, verification commands, coverage result, screenshots for UI changes, and links to relevant docs or task IDs.

## Security & Configuration Tips

Do not commit secrets. Store Supabase URL/key, team PINs, admin password, and app base URL in environment variables. The app must store proof as links/text only; do not add direct media uploads unless the requirements change.
