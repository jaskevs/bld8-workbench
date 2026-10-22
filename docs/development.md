# Local development

Run the repository on Node 22.13+ within Node 22 with pnpm 11.25.0. The lockfile
belongs to this repository. Do not install dependencies from the parent workspace
or link to absolute paths in sibling repositories.

`pnpm dev` runs the app on 127.0.0.1:3135. It reloads application and installed UI
source on save. The production browser suite uses 127.0.0.1:3136 and requires a
completed `pnpm build`. Ports 3117 and 3120 belong to other projects.

## What is real in the foundation

Routes, responsive layouts, keyboard interactions, filtering, trace detail
selection, replay/cancellation and local draft validation/storage run in the
application. A save failure keeps the editor open and preserves its text.
Drafts are a single versioned localStorage record; invalid stored data is ignored.
They are neither uploaded nor shared between accounts.

Sample responses, durations, tokens and prices are authored fixtures. Replay is
a cancellable local UI sequence, not network execution. The failure fixture has
unknown usage rather than fabricated zero usage. The sample input is fixed;
edited request drafts never appear to have been answered by the fixture.

The GET-only health route reports application-shell/sample mode by default.
Its capability flags describe configuration, not external connectivity. When
the private workflow is enabled it reports private-workspace/private-live mode.
Environment values are never returned. Indexing remains disabled.

## Private service workflow

Read docs/service-setup.md and apps/web/.env.local.example. The local application
file apps/web/.env.local is ignored by Git and must retain any user-entered
credentials. Never load the parent workspace environment. The migration command
loads only the application directory and never prints connection details.

The service layer implements owner-scoped reads, rename/delete, request bounds,
idempotency, safe errors, filtered traces and transactional user/application
spending. One request/response is saved per conversation. Real personal GitHub
sign-in and Neon persistence are verified. The first OpenAI execution failed
with unknown usage. Groq Free with GPT-OSS 120B is selected locally and its
authenticated model-catalogue access is verified. The preview was restarted to
load the saved key. One real Groq response and its owner-scoped saved answer
are now verified, with matching model identity, usage and accounting. The user
reported success and supplied the completed saved-result view. Manual browser
reload/reopen review, two-account OAuth verification and application deployment
remain separate acceptance work. See docs/verification.md for the evidence.

Use WORKBENCH_TEST_DATABASE_URL for the disposable loopback PostgreSQL database.
Run pnpm test:services, then pnpm test:e2e:services and pnpm test:e2e:groq
after building. The default browser suite explicitly blanks both provider keys
even if local configuration has been filled in. Each service browser server
uses test credentials, encrypted sessions and a test-process HTTP transport
that refuses external network calls. It cannot use either personal provider
key. Production source has no authentication bypass or fixture endpoint.
No fixture test establishes real generation or provider billing.

WORKBENCH_PROVIDER selects groq or openai. Only the selected provider's key and
approved model are used; there is no automatic fallback or model gateway.
Missing selected credentials disable live execution. Keep credentials in the
ignored application .env.local, and restart the production preview after
changing them. Groq's Free plan has its own rate limits; the USD ledger uses
published list-rate estimates for comparison and guards, not an invoice.

The first implementation uses self-hosted font packages and compiled BLD8 styles.
No Tailwind compiler is needed to consume the shipped controls; application
layout is ordinary CSS. Keep server modules out of the client dependency graph.

## CI

The prepared workflow installs the frozen lockfile, runs lint/build/types, checks
domain/SQL ownership/spending behaviour and runs sample/authenticated Chromium
interaction/accessibility checks. A PostgreSQL test service is configured. It needs no
service secrets. A workflow file is not evidence of a completed GitHub CI run or
a required deployment gate. No deployment is connected in this slice.


## Response presentation

Saved model text is rendered by the application-owned ResponseContent component
using react-markdown and remark-gfm. It supports paragraphs, semantic headings,
emphasis, lists, blockquotes, links, inline/fenced code and tables. Copy actions
use the saved Markdown or exact code text and report clipboard failures without
removing the answer. Code and table regions scroll locally and accept keyboard
focus. The theme uses cobalt actions and ink text on white/cool grey surfaces.

Treat model text as untrusted: no raw HTML plugin or dangerouslySetInnerHTML,
no remote image loading, and only HTTP(S) links or local fragment references.
External links open with noopener/noreferrer. The rendered result does not turn
model links into verified citations; documentation retrieval is still absent.
Changing presentation does not rerun a model or rewrite a stored conversation.
The existing BLD8 UI source and licences remain unchanged.
