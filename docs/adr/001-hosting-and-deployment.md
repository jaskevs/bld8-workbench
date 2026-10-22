# 001 - Hosting and deployment

Status: Accepted for the Stage A implementation, 19 October 2026.

## Context

Stage A needs an independently deployable web application, authenticated
ownership, persistent requests and bounded model spending. The existing website
and component library remain separate products. No Workbench cloud resources or
credentials have been configured as part of the foundation.

## Decision

- Use Next.js App Router on the Node runtime. Keep application routes and UI in
  apps/web inside a pnpm/Turborepo repository. Node 22 is the baseline.
- Target an independent personal Vercel project and Neon Postgres. Add Auth.js
  with GitHub OAuth in the first service integration slice. Do not share the
  website's deployment, database or authentication secrets.
- Install the small set of BLD8 UI components the application uses through the
  published source registry. Preserve upstream notices and record the source
  version. Do not depend on absolute paths into the sibling repository.
- Keep session validation, ownership queries, model credentials, request limits,
  trace redaction and budget reservation on the server. Use one model through
  the AI SDK. No live execution is exposed until its controls are implemented.
- Before a public release, ownership must cover reads, updates and deletes;
  concurrent requests must reserve against both user and application budgets
  before calling the provider. Environment secrets must never reach client
  modules, logs, sample fixtures or source downloads.
- Production delivery must pass lint, types, a production build and meaningful
  domain/browser checks. Git integration and CI are separate release settings.

## Alternatives and consequences

A self-managed server would provide more runtime control but add operations to
this small milestone. Azure is reserved for the later Python service. SQLite
would reduce local setup, but would not establish the production Postgres
ownership/concurrency path. Local samples are therefore explicitly illustrative,
with no substitute database or authentication bypass.

The shell can be built and reviewed without credentials. Service configuration,
provider selection and a production deployment are separate verified steps.
Serverless pooling, database migrations, connection limits and model timeouts
must be verified during integration; this decision does not claim they exist.

## Foundation validation

The first implementation establishes the workspace, source-registry boundary,
sample UI and repeatable checks. Actual results belong in docs/verification.md.
No Vercel project, Neon database, OAuth application or paid service is created.
