# Architecture and current boundaries

## Implemented foundation - 19 October 2026

One pnpm/Turborepo repository contains a Next.js application in apps/web.
Server-rendered routes compose client interactions built with installed BLD8 UI
source. No sibling checkout is required. Self-hosted font packages and ordinary
application CSS share the library's colour, geometry, focus and motion tokens.

| Boundary | Implemented responsibility |
|---|---|
| app/ | Workspace, sample library, setup, 404 and read-only shell-health routes. |
| components/ | Request/response composition, trace inspection, local replay and draft editor. |
| domain/ | Typed authored samples, bounded lookup/filtering and versioned draft validation. |
| lib/ | Browser-local draft read/write and cross-tab change subscription. |
| components/ui/bld8/ | Registry-installed reusable controls and preserved notices. |

Samples are authored fixture data. Local replay uses cancellable timers and
cleans them up on unmount. Drafts are one versioned localStorage record, rendered
as text; invalid data is ignored and failed writes do not close the editor.
No fixture answers an edited draft or represents actual provider output.

## Private service implementation - 19 October 2026

Next.js/Node implements Auth.js GitHub OAuth with encrypted JWT sessions. An
immutable provider account ID becomes the owner; login and every subsequent
request must remain on the configured account allowlist. OAuth access tokens
are not stored in application execution records. No credentials provider,
development auth bypass or client-supplied owner ID is supported.

PostgreSQL stores conversations and runs with owner predicates on reads, updates
and deletes and a composite ownership foreign key. Versioned SQL migrations run
explicitly. A bounded connection pool validates remote TLS certificates. Request
keys are unique per owner and prevent duplicate provider execution.

A short transaction locks the shared UTC-day ledger before reserving maximum
estimated request cost against both user and application limits. It also checks
active-request and per-minute limits. The model call happens outside the database
transaction; finalisation reconciles the original day once. Unknown usage and
lost workers retain their cap. Deletion erases content while retaining minimal
accounting/idempotency records. Read docs/service-setup.md for the exact policy.

One selected Groq Chat Completions or OpenAI Responses request runs through the
native AI SDK adapter with no tools, no retries or automatic provider fallback,
a timeout and bounded output. Common credential patterns are filtered before
sending and saving. Only filtered response text and explicitly selected metadata
are persisted; raw errors, SDK bodies/headers and hidden reasoning are excluded.
The inspector shows measured model duration, provider-reported usage and reviewed
token estimates, with honest unknown and truncated-output states.

Local SQL tests use PostgreSQL 17. Browser-service tests use encrypted Auth.js
test sessions, the same API/SQL implementation and a process-level HTTP fixture.
The application has no test-only authentication or model endpoint. These checks
do not verify real OAuth, Neon connectivity, model availability or a cloud release.
Real personal GitHub sign-in and Neon request persistence were verified on
22 October. The first OpenAI execution failed with unknown usage. The user chose
Groq Free with GPT-OSS 120B. One real Groq response and its saved answer are
verified, including model identity, provider-reported usage, measured duration,
ownership and reconciled list-rate accounting. The user reported success and
showed the completed saved-result view. This does not establish a second-account
OAuth test, an independently observed manual reload or an application deployment.

## Later retrieval increment

Node will call a private Python retrieval contract once the checkpoint and
corpus decision justify it. Python will own ingestion and retrieval; Azure and
pgvector are later work. No Python runtime, corpus, vector database, agents,
tool execution or retrieval is introduced in the foundation.

The website and UI showcase remain independent repositories/deployments. Read
the accepted ADRs for alternatives, consequences and future contract decisions.
