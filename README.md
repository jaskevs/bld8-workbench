# BLD8 Workbench

A developer-facing workspace for inspecting AI requests, responses, execution
steps, evidence, usage and estimated cost.

**Current status:** the local implementation includes the sample workspace and
a private request workflow: GitHub sign-in, owner-scoped saved conversations,
one bounded model request, a usage/trace inspector, rename/delete and spending controls.
Samples still run without credentials and remain explicitly illustrative.
Saved answers render Markdown with readable headings/lists, links, code and tables,
plus copy actions. The application uses white/cool grey surfaces with cobalt and
pale blue accents plus peach/lavender details, independently of the BLD8 UI showcase.

On 22 October, real personal GitHub sign-in and Neon persistence were verified.
The first OpenAI request was saved as failed with unknown usage; the user reported
an unfunded API account. The selected replacement is Groq's Free hosted plan with
GPT-OSS 120B. OpenAI remains an explicit configuration option, with no automatic
provider fallback. Authenticated Groq catalogue access, a real generated
response and its owner-scoped saved conversation are verified. The user reported
the workflow working and showed the completed saved-result view; see
[verification](docs/verification.md) and [service setup](docs/service-setup.md).

US$1/user and US$5/app UTC-day guards remain, using published provider list-rate
estimates. Free-plan charges can differ within its quota. The first slice saves
one question and response per conversation; retrieval and tools come later.
The private application is deployed at https://bld8-workbench.vercel.app, with
Groq execution enabled for the owner account. Git is connected and its required
GitHub check passed before production promotion. On 27 October the user completed
hosted sign-in, a request, reopening and reload; a new owned Groq result and its
accounting are independently verified. That response reached the configured token
ceiling. See the [private release status](docs/deployment.md).

## Intended use

Workbench is intended to help developers build and debug inspectable AI features.
The proposed first use case answers questions about component/design-system
material. A request such as "How should this dialog handle keyboard focus?"
would put its answer beside the supporting sources, execution steps, timing and
usage/estimated cost. That makes unsupported answers and failures easier to review.
The sample workspace demonstrates this with authored examples. The private
workflow can call the configured model; source retrieval is not implemented.

## Run locally

Use Node 22.13 or later within Node 22, and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3135. No environment variables, accounts or API keys are
needed. Keep the existing portfolio and component-library previews independent.
Commands are run from the Workbench repository root. Source edits reload locally.

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test:unit
pnpm test:services      # Dedicated loopback PostgreSQL test database required
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:e2e:services  # OpenAI fixtures, encrypted sessions and disposable database
pnpm test:e2e:groq      # Groq fixtures; no real provider requests
```

Set WORKBENCH_TEST_DATABASE_URL explicitly for the service suites. They reject
non-loopback targets or database names without the _test suffix. They never call
a paid model endpoint. Browser tests start their own production server on 3136; build first and keep
that port free. On this Windows PC an installed Edge browser can be used with
`PLAYWRIGHT_CHANNEL=msedge`, in an isolated test profile. No personal browser
session or company credentials are needed.

## Repository layout

```text
apps/web/src/app/             Workspace, sample runs, setup and health routes
apps/web/src/components/      Application compositions
apps/web/src/components/ui/   Installed BLD8 UI source and preserved licences
apps/web/src/domain/          Sample contracts and draft validation
apps/web/src/lib/             Browser-local draft integration
apps/web/src/server/          Identity, persistence, execution, accounting and redaction
services/retrieval/           Documentation for the later Python service
docs/adr/                    Accepted implementation decisions and boundaries
tests/                       Domain and production-browser checks
```

## Stage A acceptance still open

- Verify real ownership isolation with a second explicitly allowlisted
  account. The user deferred this for the initial jaskevs-only private release.
  Real production sign-in, response, reopening and reload are reported successful
  on 27 October; fresh saved-result ownership/usage/accounting are checked separately.
- Extend live-provider acceptance to rate limits, timeouts and price assumptions.
  Actual Groq model identity and token metadata are verified for one response.
  Existing local SQL/route tests cover ownership, concurrency,
  idempotency, unknown usage, redaction and both approved daily caps.
- Review the private workflow with the proposed real tasks, including response
  truncation at the configured output ceiling. Git-backed hosting, the release
  gate and the first real hosted owner workflow are verified.
  Stage A has no Python, RAG, agents, vector storage or Azure service.

Read [architecture](docs/architecture.md), [decisions](docs/adr/README.md),
[development notes](docs/development.md), [application theming](docs/theming.md)
and [verification](docs/verification.md).
The released source passed [Workbench validation on GitHub](https://github.com/jaskevs/bld8-workbench/actions/runs/39735518757).
The private deployment and first hosted owner flow are verified; see the [release runbook](docs/deployment.md).

**Licensing:** application licence selection remains open; the application and
workspace packages are private/unpublished. Installed BLD8 UI source retains its
MIT and dependency notices. Do not remove those notices or treat the application's
licence as decided by the component library's licence.
