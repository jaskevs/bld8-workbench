# Decisions log

## 19 October 2026 - first runnable foundation

Decision: accept ADRs 001-003 for the Stage A implementation and establish one
Next.js application in a pnpm/Turborepo repository. Install the canonical BLD8 UI
source through its registry; keep the website and UI showcase independent.

Alternative considered: create service infrastructure immediately, use a local
database/authentication bypass, or depend on a sibling UI checkout. The chosen
foundation makes the interface reviewable without credentials or cloud resources
and keeps future controls explicit rather than simulating their completion.

Implemented: sample workspace, inspectable events/input/illustrative usage,
cancellable replay, failure sample, searchable sample library, one validated
browser-local draft, setup status and a read-only shell health route. No actual
provider output, authentication, database or retrieval is claimed.

Validation: production build, lint, types, five domain cases and twelve final
production-browser cases pass. See verification.md. No PR, commit, push or
deployment occurred; no actual effort hours have been inferred.

Next: implement GitHub sign-in and Neon ownership, then one bounded model call
with saved output. Trace redaction and concurrent spending controls precede any
public live execution. Fixed milestone dates remain unchanged.

## 19 October 2026 - application-owned Workbench identity

The user requested a different theme, icon and colour to demonstrate library
customisation. Workbench now uses an indigo/slate palette and a connected-node
mark. Theme changes override public CSS tokens at the application root; source
components and licences stay untouched. Branding is application-owned SVG.
Build, lint, types, contrast, keyboard, reduced-motion and responsive checks pass;
see verification.md and theming.md. No package change, commit or deployment.

## 19 October 2026 - vermilion identity and centred WB mark

The user requested a more distinctive colour and a W with a smaller uppercase B
centred vertically beside it. Application theme tokens now use vermilion, warm
stone and dark ink. Vector cap-height bounds align the letters independently of
font metrics. The same monogram appears in the browser icon. Shared UI source
remains unchanged. The purpose copy identifies the current application as a
sample preview; real model execution and retrieval remain future work.
Build, lint and twelve browser cases pass; see verification.md.

## Private request implementation - 19 October 2026

The user approved the live-workflow slice and selected OpenAI plus daily caps of
US$1 per user and US$5 overall. The implementation uses GPT-6 Luna after reviewing
the official model/rate documentation; actual account access is unverified.
The reviewed rate catalogue expires after 30 days and must be checked again.

Auth.js GitHub JWT identity, PostgreSQL owned conversations, bounded requests,
transactional reservations, usage/trace capture and safe failures are implemented
locally. Validation uses a disposable PostgreSQL instance, signed test sessions
and simulated provider HTTP. No real OAuth, Neon or OpenAI account check, cloud
resource, commit, push or Workbench deployment is recorded. Documentation search
and executable tools remain outside this slice. See service-setup.md and
verification.md for activation steps, exact checks and remaining acceptance.
