# Gesta repository guidelines

## Build, test, and lint

- Use Node.js `>=22.14.0` (Node 24 LTS is recommended) and run commands from the repository root.
- Install the locked dependencies with `npm ci`, then initialize local configuration and demo data with `npm run setup`.
- Start both applications with `npm run dev`: the API listens on `http://localhost:3000` and the Vite app on `http://localhost:5173`.
- Before a substantial change, run `npm run check`. It runs, in order, workspace linting, TypeScript checks, Vitest, and both builds.
- Individual commands are available as `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
- Run one backend test file with `npm run test -w backend -- tests/offers.test.ts`, or one frontend test file with `npm run test -w frontend -- tests/OffersPage.test.tsx`. Add Vitest's `-t "test name"` after the file path to select one test.
- Useful database commands are `npm run db:init` and `npm run db:reset`; stop the dev server before resetting the database, especially on Windows.

See [README.md](../README.md) for setup/troubleshooting and [docs/architecture.md](../docs/architecture.md) for the tested request flows.

## Architecture

- This is an npm-workspaces monorepo: `backend/` is an Express/TypeScript API backed by SQLite and `frontend/` is a React/TypeScript/Vite application.
- Backend requests flow through `app.ts` into authentication/authorization middleware, controllers, services, repositories, and SQLite. Keep HTTP parsing/validation in controllers, business rules in services, SQL in repositories, and DBO/domain/DTO conversion in mappers.
- Backend dependencies are assembled with `create...` factory functions in `app.ts`, which lets tests construct the complete application over an isolated in-memory database.
- Backend errors must be raised as `HttpError`; the centralized error middleware returns `{ "error": { "code", "message" } }`.
- Frontend flow is `pages -> hooks -> services/utils -> models`, with reusable presentational components below pages. `App.tsx` is the single owner of `useAuth`; pass the token and logout callback down to pages.
- The frontend calls `/api/...`; Vite proxies that prefix to the backend and removes `/api`. API routes themselves do not include the prefix.
- Read [backend/API.md](../backend/API.md) and the relevant files under [backend/http/](../backend/http/) when changing an endpoint. Update both when the endpoint contract changes.

## Repository-specific conventions

- Backend relative imports use the `.ts` extension because TypeScript rewrites them to `.js` during the build.
- The `Authorization` header contains the JWT directly, without a `Bearer` prefix. Authentication re-reads the user, roles, and companies from the database on every request; frontend visibility checks never replace backend authorization.
- Put named access rules in `backend/src/services/permissions.ts`. Apply them with `authorize(...)` at the route boundary and repeat data filtering in the service where needed.
- Validate frontend API responses with type guards through `readJson`; represent non-2xx responses with `ApiError`. On a 401, hooks should call the supplied `onUnauthorized` callback so the session returns to login.
- SQLite stores English enum/status codes such as `PUBLISHED`; frontend label helpers translate them to French for display.
- Never edit an applied migration. Add the next numbered SQL file under `backend/src/db/migrations/` (for example `002_....sql`); migrations are applied in filename order.
- Backend tests use Vitest/Supertest and an in-memory SQLite database created by `tests/helpers/testApp.ts`; do not use the development database. Use stable seed identifiers from `backend/src/db/seed/seedIds.ts`.
- Frontend tests use Vitest/Testing Library with the fetch stub in `frontend/tests/helpers/fetchMock.ts`.
- Demo authentication is for local development only. It must not be enabled with `NODE_ENV=production`; do not treat the demo login as real authentication.
- Keep API authorization and error cases covered when adding routes. For changes submitted through a PR, follow [.github/pull_request_template.md](./pull_request_template.md), including API/http documentation, migration, browser/profile, and conversation-export checklist items where applicable.

## Reference documentation

- [docs/cdc_gesta_developpement.md](../docs/cdc_gesta_developpement.md) — business requirements
- [docs/architecture.md](../docs/architecture.md) — layer responsibilities and reference flows
- [docs/seed.md](../docs/seed.md) — demo users, stable data, and seed invariants
- [backend/API.md](../backend/API.md) — API contracts and error formats
