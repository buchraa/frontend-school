# Copilot instructions for this repository

These notes help an AI coding assistant become productive quickly in this Angular 21 repository.

**Big Picture**
- **Framework:** Angular v21 (standalone components are used). See `package.json` dependencies.
- **Entry points:** `src/main.ts` boots the app; `src/app/app.ts` is the root component (uses `signal` from `@angular/core`).
- **Routing:** Root routes live in `src/app/app.routes.ts` and are provided by `src/app/app.config.ts` via `provideRouter(routes)`.
- **Feature layout:** Each feature follows a module + routing pair in `src/app/<feature>/` (e.g. `teacher-module.ts` and `teacher-routing-module.ts`). Routing modules use `RouterModule.forChild(routes)`.

**What to edit when adding features**
- Follow the existing pattern: create `src/app/<feature>/<feature>-module.ts` and `<feature>-routing-module.ts`.
- Export routes from the routing module and add lazy or eager routes to `src/app/app.routes.ts`.
- Use `RouterOutlet` in `src/app/app.ts` and ensure `provideRouter(routes)` in `app.config.ts` is kept in sync.

**Component conventions & examples**
- Root component: `src/app/app.ts` — note it imports `RouterOutlet` and uses `templateUrl: './app.html'` and `styleUrl: './app.css'`.
- Components may be used as standalone: look for an `imports` array inside the `@Component` decorator (this indicates a standalone component that declares its direct imports).
- Reactive primitives: the repo uses Angular signals (`signal`) — prefer signal-based state for small local state where the codebase already uses them.

**Build / Test / Dev workflows**
- Start dev server (hot-reload): `npm start` (runs `ng serve`).
- Run unit tests: `npm test` (the project is configured to use Vitest through `ng test`).
- Build production artifacts: `npm run build` (outputs to `dist/`).
- E2E: Not preconfigured — `ng e2e` is suggested in README but no e2e framework is included by default.
- Package manager: repository notes `npm@11.6.2` in `package.json` (`packageManager` field) — prefer the same npm major if reproducing CI locally.

**Project-specific patterns**
- File naming: feature modules use the pattern `<feature>-module.ts`; routing modules are named `<feature>-routing-module.ts`.
- Empty route arrays are intentionally defined and wired: `app.routes.ts` is the single source for root routes; feature routing modules declare their child routes.
- Global providers: `src/app/app.config.ts` holds the `ApplicationConfig` and registers global providers like `provideBrowserGlobalErrorListeners()` and the router.

**Tests & TestBed usage**
- Tests import components directly in `TestBed.configureTestingModule({ imports: [App] })`. When adding tests for standalone components, import the component class in the `imports` array rather than declaring it.
- Example: `src/app/app.spec.ts` shows the preferred pattern for the root component.

**External integrations & dependencies**
- Tailwind and PostCSS packages are present in `devDependencies` (`tailwindcss`, `postcss`, `@tailwindcss/postcss`) — check project root for `tailwind.config` if styling changes are needed.

**Search tips & quick references**
- To find routes: search for `provideRouter(` and `RouterModule.forChild(`.
- To find feature modules: search for files matching `*-module.ts` under `src/app`.
- To see the app template quickly: open `src/app/app.html` (contains the current UI placeholder and CSS variables).

**DOs for AI code edits**
- Update `src/app/app.routes.ts` when wiring new top-level routes and keep `app.config.ts` unchanged unless adding new global providers.
- Keep feature routing in `src/app/<feature>/<feature>-routing-module.ts` (do not inline child routes into the root file unless intentionally restructuring routing).
- When adding a new standalone component, include its imports in the `@Component({ imports: [...] })` array and add tests that import the component in the `TestBed` `imports` array.

If anything here looks wrong or you want this guide to be stricter (code style rules, commit hooks, CI specifics), tell me which areas to expand or clarify.
