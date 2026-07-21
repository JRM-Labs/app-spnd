# 🤖 Repository Guidelines

## Project Structure & Module Organization

This repository is currently documentation-first. The planning source of truth lives under `docs/`.

- `docs/README.md` is the recommended entry point and reading order.
- `docs/prd/` contains product requirements and MVP scope.
- `docs/architecture/` captures system design, data model, parser flow, security, operations, and deployment details.
- `docs/adr/` stores numbered architecture decisions. Add new decisions as `0009-short-decision-title.md`.
- `docs/operations/` contains setup and runbook material.
- `docs/design/` and `docs/research/` hold design prompts and market research.

Application source, tests, and assets have not been scaffolded yet. When implementation begins, keep app code in a clear top-level structure such as `apps/` and shared libraries in `libs/`, matching the Angular-first direction documented in `docs/adr/0007-web-first-angular-application.md`.

## Build, Test, and Development Commands

No build system is configured yet. There is currently no `package.json`, Angular workspace, or test runner in the repository.

Useful commands today:

- `git status --short` checks pending changes before editing.
- `find docs -maxdepth 2 -type f | sort` lists documentation files.
- `sed -n '1,160p' docs/README.md` previews the documentation index.

Once the app is scaffolded, document the exact install, serve, build, lint, and test commands here.

## Coding Style & Naming Conventions

Use concise Markdown with descriptive headings. Keep file names lowercase and hyphenated, matching existing patterns such as `system-overview.md` and `firebase-cloudflare-setup.md`.

For ADRs, preserve the numeric prefix and imperative decision style. For PRDs, keep the existing numbered sequence and product-focused titles.

When Angular code is added, prefer TypeScript, Angular conventions, PrimeNG/Tailwind where appropriate, and colocated tests for meaningful behavior.

## Testing Guidelines

No automated tests exist yet. Until implementation starts, validate documentation changes by checking links, reading order, and consistency with existing ADRs.

Future parser work should include fixture-based tests as described in `docs/architecture/parser-fixtures-and-tests.md`. Add test naming and coverage expectations once the framework is chosen.

## Commit & Pull Request Guidelines

Current history uses short, imperative commit messages, for example `Add research and design documentation to project`. Keep commits focused and descriptive.

Pull requests should include a brief summary, affected docs or modules, linked issue or decision context when available, and screenshots only for UI-facing changes. Note any unresolved decisions or follow-up work explicitly.

## Project Management

GitHub Projects for this repo are managed through the linked organization-owned ProjectV2 board:

- `AppSpnd MVP`
- `https://github.com/orgs/JRM-Labs/projects/4`

Use that project as the operational work board for repo planning and delivery. GitHub ProjectV2 objects are owned by the organization, then linked from the repository's `Projects` tab.


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->
