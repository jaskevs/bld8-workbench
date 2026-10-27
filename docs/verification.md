# Workbench verification - 19 October 2026

Current service evidence is in the final section. Earlier sections record the
foundation and theme iterations, not the latest service capability.

## Passed locally

- Node 22.22.0, pnpm 11.25.0; frozen lockfile/offline installation passes with
  no dependency-resolution changes. Tooling and package stores stay isolated.
- Production Next.js build, ESLint and standalone workspace type checks pass.
- All five domain tests pass: draft validation/normalisation, malformed stored
  data, bounded sample lookup, combined filters and unknown usage semantics.
- All twelve production-browser cases pass in one final Edge run, with no skips
  or retries. They cover inspector tabs and keyboard activation, event details,
  replay cancellation/restart, explicit failure/unknown usage, draft validation
  and persistence, dialog focus return, failed storage writes, sample filtering
  and empty recovery, read-only health, reduced motion, skip navigation and 404.
- Routes are contained at 320, 390, 820 and 1440 px. The four primary route states
  at each size pass automated axe WCAG A/AA checks (sixteen page/viewport scans).
- The actual registry CLI installed the application controls and licences.
  Installed styles.css, tokens.css and tailwind.css match canonical UI output.
  Runtime dependency versions and source fingerprints are in docs/ui-source.md.

The first browser pass identified a table overflow issue caused by an absolutely
positioned hidden header label. A positioned scroll container fixes containment
and is labelled/focusable for keyboard scrolling. Final keyboard assertions use
the tabs' Enter-to-activate behaviour and scope application errors independently
of the framework route announcer.

## Scope and remaining work

These are local foundation checks. GitHub CI is prepared but has not run for
this slice; no commit, push, cloud resource or Workbench deployment was made.
Auth.js, Neon, actual model requests, owned database records, server-side traces,
redaction, request/rate limits and concurrent budget controls remain unimplemented.
Samples are authored fixtures and are not evidence of an operating AI workflow.

Manual assistive-technology review and non-Chromium coverage remain open.
Automated accessibility results are not accessibility certification. Desktop
workspace/inspector and sample-table screenshots and a 390 px phone preview
were visually reviewed. Fresh preview navigation and interaction reported no
browser errors. The local source-watching preview is running on port 3135.

## Independent application theme - 19 October 2026

Workbench now has cool slate surfaces, indigo actions, its own connected-node
SVG mark and a matching favicon. Public BLD8 UI tokens are overridden in
apps/web/src/app/theme.css; application navigation and branding use separate
Workbench tokens. The default component library and all eighteen installed
source/style/licence files remain byte-for-byte unchanged.

Production build, lint and standalone type checks pass. All twelve existing
browser cases pass again with no skips/retries, including sixteen automated
accessibility scans. Muted text was strengthened to preserve contrast on the
slate sample cards. Keyboard focus, reduced motion and responsive containment
remain intact. Desktop and mobile screenshots were reviewed; extra branding
checks at 431, 480, 520 and 760 px found no overflow or browser errors.

The source-watching preview remains on port 3135. No commit, push or deployment
was made. See theming.md for the editable tokens and brand files.

## Vermilion palette and WB monogram - 19 October 2026

The application now uses vivid vermilion actions, warm stone surfaces and dark
ink text. The SVG mark is a W with a smaller uppercase B; their cap-height
centres share y=16. Rendered desktop measurements confirm W at 18 px and B at
10 px, with identical vertical centres. The favicon uses the same paths.

Production build (including TypeScript), lint and all twelve browser cases pass.
The browser suite includes sixteen contrast/accessibility page scans, mobile
containment, keyboard focus and reduced motion. Primary and hover text pairings
also retain at least 4.5:1 contrast. Desktop/mobile and monogram screenshots were
reviewed. All eighteen installed BLD8 UI source/style/licence files remain
byte-for-byte unchanged; the palette lives entirely in application overrides.

The homepage description now states the inspection purpose and sample-preview
status explicitly. No service integration, package change, commit, push or
Workbench deployment was performed.

## Petrol and mint identity - 19 October 2026

The current identity supersedes the earlier colour and letter-stack experiments.
Deep petrol primary actions, fresh mint accents and pale neutral surfaces are
application-owned overrides. A geometric W with a separated terminal replaces
the stacked WB; the favicon uses the same solid vector paths and palette.

Production build including TypeScript and all twelve existing browser cases
pass, including sixteen axe page/viewport scans, keyboard navigation, dialog
focus return, reduced motion and mobile containment. Additional visual checks
at eight widths (320-1440 px) found no horizontal overflow or browser errors.
Desktop/mobile workspace and brand images were visually reviewed. Primary text
contrast is 6.34:1, mint-action text 8.08:1 and the mark/tile pair 9.08:1.
All eighteen installed UI source/style/licence files remain unchanged. No package
change, service integration, commit, push or deployment is part of this revision.

## Private request workflow - 19 October 2026

The private service slice is implemented locally and supersedes the earlier
foundation-only capability description. GitHub OAuth/session code, owned
PostgreSQL conversations, bounded OpenAI execution, filtered trace metadata and
transactional spending controls exist. Real GitHub OAuth, Neon connectivity,
OpenAI account/model access, a real model response and second-account OAuth
verification are still pending. The local file has live execution disabled.

Passed locally on the final implementation:

- Production build including TypeScript, ESLint and standalone workspace types.
- All five existing domain tests and sixteen PostgreSQL/SDK service tests.
- All thirteen sample/unconfigured browser cases and twelve authenticated
  workflow cases, without skips or retries: forty-six cases across the suites.
- Thirty-six axe page/viewport scans, with containment at 320, 390, 820 and
  1440 px. Accessibility scans wait for fonts and finite entrance animation;
  reduced-motion behaviour is checked separately.
- An actual OAuth authorisation handoff with the browser request intercepted,
  encrypted session/allowlist checks, cross-owner read/update/delete rejection,
  browser-draft import, save/reopen, rename/delete focus return, unknown usage,
  failure handling, input bounds, CSRF/origin checks and spend exhaustion.
- Real PostgreSQL transactions demonstrate duplicate-call prevention,
  concurrent global/per-user budgets, active-request/per-minute limits,
  original-day reconciliation, interrupted-worker recovery and deletion
  without refunds. The SDK HTTP contract verifies a bounded, non-stored
  Responses request and zero automatic retries.
- The migration CLI succeeds when repeated against the disposable test database;
  the frozen lockfile installs offline. Server values are absent from compiled
  client JavaScript. The actual local environment file is ignored by Git.
- Desktop/phone compose, saved and inspection screens were visually reviewed;
  all three views remain contained at eight widths from 320 to 1440 px, without
  browser errors. Visual data was an explicitly labelled HTTP fixture.
- All eighteen installed UI source/style/licence files remain byte-for-byte
  unchanged. Company/global account and tooling settings remain unchanged.

The browser-service server uses test-only credentials and a process-level HTTP
fixture that refuses external requests. Application source has no authentication
bypass or fixture endpoint. No test establishes real cloud connectivity or actual
provider billing. Manual assistive-technology/non-Chromium review remains open.
The PostgreSQL test container is disposable and is stopped after verification;
compose.test.yml documents how to recreate it for future tests.

The new CI PostgreSQL/workflow configuration is prepared locally, not run on
GitHub. No commit, push, Workbench cloud resource or deployment was created.
Read service-setup.md for personal account activation and the approved US$1/user,
US$5/app UTC-day policy. Do not call this completed Stage A acceptance.

## Personal service configuration - 22 October 2026

The user created the separate bld8-workbench Neon Free database through the
personal Vercel team. The local app environment contains all required credentials;
no secret values were printed or copied into documentation. A scan of the
existing compiled client JavaScript found none of the configured server secrets.

The application's actual PostgreSQL connection applied migration version 1
successfully. A separate read confirmed schema version 1 and no personal request
records at the time of this check. No reset tests targeted Neon. An authenticated
GET to OpenAI's model endpoint returned HTTP 200 for gpt-6-luna; this verifies
catalogue access, not generation, available credits or a completed model request.
No model tokens were generated by this check.

Local live requests are now enabled, restricted to the existing personal GitHub
account allowlist and the approved US$1/user, US$5/app per-UTC-day caps. The
previously verified production build runs only on 127.0.0.1:3135. The health route
reports private-live configuration, the GitHub provider is available, the
conversations page returns HTTP 200 and its sign-in control is present. A private
API request without a session returns HTTP 401. Configuration booleans alone
are not external connection evidence.

Real personal GitHub OAuth sign-in, the first generated response, saved-result
reopening and second-account isolation remain pending. No production hosting,
Git import, commit or push was performed. Earlier dated sections remain history;
their statements about missing credentials and absent cloud databases are
superseded by this section. The existing local suite was not rerun because no
application source changed in this account-configuration step.

## OAuth credential and callback correction - 22 October 2026

The first manual sign-in returned a GitHub 404. GitHub's documented read-only
application token-check endpoint rejected the configured client ID/secret with
HTTP 401 (bad credentials). The user corrected the personal OAuth app settings
and local values. Rechecking with a deliberately invalid fixture token then
returned the expected token-not-found result rather than bad app credentials;
no real user token was created, reset, revoked or logged. This app-credential
check does not establish completed browser OAuth.

The existing sign-in button already sent the configured 127.0.0.1 origin.
Independent route checks exposed NextRequest rewriting its loopback host to
localhost, which could make the callback/token-exchange redirect differ from
the authorization URL. Enabling the supported skipProxyUrlNormalize option
preserves the configured host. The existing OAuth handoff test now also checks
the provider callback and CSRF-protected direct sign-in route, including the
absence of the fixture secret in the authorization URL.

The production build, lint and standalone types pass. All 46 existing cases
pass again: 5 domain, 16 PostgreSQL/SDK service, 13 sample-browser and 12 private
browser cases, with no skipped tests or retries. All automated accessibility
scans included in those cases pass. These suites use the disposable loopback
test database and fixture accounts/provider responses; they do not execute a
paid model call or reset cloud data. The temporary test container was removed.

The rebuilt local production preview runs on 127.0.0.1:3135. Its real sign-in
button and direct route both send the configured callback and client ID. An
unauthenticated GitHub request redirects to login; that is not a completed OAuth
exchange. Configured secrets remain absent from compiled client JavaScript and
the app environment remains ignored by Git. Real sign-in, first generation and
saved-result reopening await the fresh browser attempt requested from the user.
No commit, push or application deployment was performed.


## Groq provider implementation and local verification - 22 October 2026

The user completed real personal GitHub sign-in and submitted an owned request.
A read-only metadata check confirmed one conversation/run in the separate Neon
database. Its OpenAI execution failed with unknown usage, no saved answer and
no provider response ID; its reservation remains. The user reported an unfunded
API account. The stored generic failure does not prove a particular raw billing
error. This is evidence of authentication and persistence, not successful generation.

The user selected Groq's Free hosted plan with openai/gpt-oss-120b. The local
application now selects that provider explicitly through the native Groq SDK.
Only its own key is used, with a fixed endpoint, 1,024 output-token bound,
30-second timeout, hidden reasoning, zero automatic retries and no provider
fallback or gateway. OpenAI remains an explicit configuration option, and older
records preserve their original identity. No Ollama installation was performed.

Each provider has reviewed list rates and its own saved model/usage metadata.
The approved US$1/user and US$5/app UTC-day guards remain. These are list-rate
accounting limits; they do not measure an actual Groq Free invoice or upgrade
an account. Safe static errors distinguish quota, rate limits, access and rejected
requests without saving raw response bodies, headers or private reasoning.

The production build, lint and standalone TypeScript checks pass. All 56 cases pass with no
skips or retries: 5 domain, 22 PostgreSQL/SDK service, 13 sample-browser,
12 OpenAI private-browser and 4 Groq private-browser cases. The browser suites
ran against the final build; domain/service cases also passed before the final
responsive accessibility-only correction. The Groq transport contract checks the
native SDK's supported max_tokens bound, selected endpoint/key, hidden reasoning
and no retries. Browser cases exercise save/reopen, safe quota failures, unknown
cost and preservation of older OpenAI history using simulated HTTP responses.

Accessibility scans now include WCAG 2.1 A rules as well as the previous A/AA
rules. Visible navigation labels determine their accessible names. The brand
wordmark has a text separator and remains available to screen readers when
visually hidden on narrow screens. All scanned routes pass at 320, 390, 820 and
1440 px. These are automated checks, not a completed assistive-technology review.

All tests use a disposable loopback PostgreSQL database and test-process HTTP
fixtures with fake credentials; none target Neon or call a real model. The
temporary container and its test storage were removed afterwards. All eighteen
installed UI source/style/licence files remain unchanged. The application
environment remains ignored by Git, and configured secrets were absent from
compiled client JavaScript. Personal/global tooling and account settings were
not changed.

The rebuilt preview is running only on 127.0.0.1:3135. Its new-request page returns
HTTP 200 and identifies Groq. The last configuration check found GROQ_API_KEY
missing, so health correctly reports model execution disabled. No Groq model
catalogue access, successful real generation or saved-answer reopening is claimed.
After the user saves that key in apps/web/.env.local, restart the preview, verify
model access and complete a real request/reopen from the signed-in browser.
Second-account OAuth isolation and application hosting remain separate work.
No commit, push or application deployment was performed.


## Personal Groq key activation - 22 October 2026

The user saved the personal Groq key in the ignored application environment file.
A selected-provider check confirms that only Groq is selected, with
openai/gpt-oss-120b and the approved US$1/user, US$5/app UTC-day list-rate guards.
An authenticated GET to Groq's model catalogue returned HTTP 200 and listed
that model. No model tokens were generated. Catalogue access does not prove a
successful completion, available generation quota or the account's billing tier.

Only the identified Workbench loopback process was restarted to load the key.
Health now reports private-workspace/private-live configuration, the new-request
page returns HTTP 200 and GitHub sign-in is still available. These configuration
flags do not establish a completed OAuth exchange or a generated answer. The
existing OAuth secret and other credentials were preserved. A scan found no
configured server secret in compiled client JavaScript.

A read-only metadata check still shows one owned failed run, zero completed
runs and no saved answer; both daily guards remain within their limits. The
user has been asked to send a small question through the real signed-in browser
and reload its saved conversation. First successful real generation and answer
reopening are therefore still open. Second-account OAuth review and application
hosting also remain open. No source changes required repeating the passing
56-case suite. No commit, push or deployment was performed.


## First real Groq response and saved result - 22 October 2026

The user reported the real workflow working and supplied the completed saved
conversation screen. A separate read-only Neon metadata check confirms two
owned runs: the earlier failed OpenAI attempt and one completed Groq request.
There are no active or interrupted runs at the time of this check.

The completed run records Groq with requested and reported model both
openai/gpt-oss-120b. Provider-reported usage is 135 input and 323 output tokens;
Workbench measured 1,094 ms. A provider response ID and non-empty saved answer
are present, and run/conversation ownership matches. No question, answer,
conversation ID, response ID or credentials were printed or copied here.

The reviewed list-rate estimate is US$0.000215 and matches its reconciled
accounted amount. Both approved daily caps remain within limits. This is a
list-rate estimate, not evidence of an actual Free-plan charge. The earlier
failed request and its unknown-usage reservation remain unchanged. The
verification query did not execute another model request or modify data.

The supplied screenshot matches the saved provider, model, timing and token
metadata. It is evidence of the completed saved-result view; a manual full-page
reload/reopen was not independently observed through the personal Brave session.
Automated fixture save/reopen coverage remains separate from this real account
evidence. Second-account OAuth verification, manual assistive-technology review,
additional live failure scenarios and application deployment remain open.

The response currently displays raw Markdown markers as plain text. Record safe,
accessible response formatting as the next polish task; no renderer or source
change is included in this verification. The existing 56-case passing suite,
build, lint and type results remain applicable. No additional test run was needed
for these documentation-only updates. No commit, push or deployment was performed.


## Cobalt theme and formatted responses - 22 October 2026

The user requested a stronger application palette and completion of the response
formatting task. The application now uses cool grey canvas #f3f4f7, white panels,
ink text #202636, cobalt actions #3658e8 and pale blue accent #c9d9ff. Navigation,
focus, selected controls, logo tile and favicon share the application-owned
tokens. Existing control geometry, shared easing and reduced-motion/forced-colour
overrides remain. No installed BLD8 UI component/style/licence file was changed.

ResponseContent renders saved text using react-markdown 10.1.0 and remark-gfm
4.0.1. Semantic headings, emphasis, lists, quotes, inline/fenced code, tables and
footnote relationships are preserved. Code and table regions scroll locally and
are keyboard focusable. Copy actions cover individual code blocks and the saved
Markdown, with success feedback and an explicit manual alternative on clipboard
failure. Button widths stay stable during feedback. Native clipboard newline
normalisation is accounted for by the browser assertion on Windows.

Raw HTML is skipped; no raw-HTML plugin or innerHTML path is enabled. Images
render as alternative text without making remote requests. Link URLs accept
only HTTP(S) without embedded credentials, or local fragment references; unsafe
links remain readable text. External links use noopener/noreferrer. Formatting
does not turn model links into retrieved or verified citations. Stored answers
are neither rewritten nor regenerated when viewed through the renderer.

Production build, lint and standalone TypeScript checks pass. All 58 cases pass:
5 domain, 22 PostgreSQL/SDK service, 13 sample-browser, 12 OpenAI private-browser
and 6 Groq private-browser cases. The six affected Groq cases pass again against
the final build after the footnote/sizing refinement. The final response component
also passes a targeted lint check. The additional cases cover formatting after
reload, copy/code copy, clipboard denial, footnote references, HTML/script/iframe
and unsafe-link suppression, zero remote image requests and local scrolling.

Automated accessibility/containment checks pass at 320, 390, 820 and 1440 px for
the existing routes, plus the formatted response at 320/1440 px. Final desktop
1440 px and phone 390 px fixture screenshots were visually reviewed from the top
of the page. Test-only snapshots contain authored fixture material, not personal
conversation contents. Manual assistive-technology/cross-browser review remains
open; automated axe results are not accessibility certification.

The suites use disposable loopback PostgreSQL and fake model transports. No
additional real model call was made for this slice. A safe metadata read before
restarting the real preview confirmed no active personal request and the existing
two real records unchanged. The test container and storage were removed after
verification. All eighteen installed UI files remain identical to the canonical
source, and configured server secrets were absent from compiled client JavaScript.

The tested build is running on 127.0.0.1:3135. Home returns HTTP 200 with the cobalt
theme attribute, and health still reports private-live configuration. Reload an
existing saved conversation to see its formatted answer without spending model
tokens. No commit, push, application deployment or global account/tooling change
was performed. Second-account OAuth and independent application hosting remain
separate acceptance work; Stage A is not marked complete.


## Secondary colour accents - 22 October 2026

The user requested more colour/flavour while keeping the accepted cobalt base.
Application-owned tokens now add lavender #eee9fc with #65469b text, and peach
#fff0e6 with #9a4f32 text. Inspector headers and code/table surfaces use lavender;
workspace notes and preview labels use peach. Sample cards have blue/lavender/
peach tints, matching small edge details and coloured labels. Reading panels
stay white on the neutral canvas, and semantic status colours/labels remain.

The existing W geometry is unchanged. Its tile blends cobalt into violet, with
a white W and peach terminal; the SVG favicon matches. Decoration remains outside
the installed UI source. Forced-colour overrides restore system colours and hide
decorative marks; existing motion and reduced-motion handling are retained.

Production build, lint, standalone types and all 58 existing cases pass again
with no skips or retries: 5 domain, 22 service and 31 browser cases. Browser axe
and containment checks pass at 320, 390, 820 and 1440 px; formatted responses and
clipboard behaviour remain covered. No new behavioural tests were added for
this styling-only change. The suites use disposable loopback SQL and HTTP
fixtures, and their database/container storage was removed afterwards.

Desktop 1440 px and phone 390 px home views were captured and visually reviewed
in an isolated browser with no personal session. Both return HTTP 200, stay
contained and produce no page errors. Configured server secrets remain absent
from client JavaScript, and all eighteen installed UI files remain identical.
A safe personal metadata read showed no active request before preview restart;
the two existing real records were unchanged. No real model request was made.

The refreshed production preview runs on 127.0.0.1:3135 and health still reports
private-live configuration. Theme and Claude instructions reflect the new
secondary palette. No commit, push, deployment or global account/tooling change
was performed. This styling update does not close Stage A acceptance work.


## Private release preparation - 27 October 2026

The user authorised the first private deployment and restricted access to
jaskevs. The real second-account OAuth/isolation check remains deferred and open;
fixture ownership tests do not replace it. Stage A is not marked complete.

The released f4677012630a6036e804be803328a1e6df30cbb8 source still has a successful
Workbench validation run on GitHub. A new read-only API lookup confirms that
exact hash and successful conclusion. No application behaviour changed, so the
previous passing build, lint, types and 58-case suite were not repeated.

Prepared .vercelignore, a credential-free production template and a deployment
runbook. The ignored .local/production.env draft contains a fresh session secret,
the existing Workbench-specific Neon connection and selected Groq key. The
production owner allowlist contains only 26425317; live execution stays false.
Local OAuth settings are preserved. No OpenAI key is copied into the draft.

Production draft verification passes: distinct session secret, selected model,
approved daily caps, no fallback key and disabled requests. AUTH_URL and the
separate Production OAuth app credentials are deliberately pending. Git ignores
both real environment files. Configured local and draft server secrets are
absent from the existing compiled client JavaScript.

A read-only Neon transaction verifies schema version 1, two existing runs,
one completed run and zero running requests. No model call, migration, record
reset or content query was made. Local real usage and the initial private
deployment will share those records and the spending ledger.

The stored isolated personal Vercel credential returns HTTP 403. A fresh login
was started using only ../.bld8-local/vercel and needs the user's personal browser
approval. The cause of the rejected credential is not established. Project
discovery, all-URL protection, Git linking, required promotion checks, production
OAuth and actual deployment are not yet verified. No cloud project setting,
commit, push or deployment changed during this preparation.


## First protected Vercel build - 27 October 2026

The personal Vercel account/team is verified and the independent bld8-workbench
project now exists (prj_bnDEPbHmbHGURn6g6L7XRB82CbHQ). Its protected build is READY
as dpl_HjB8oe63a5HTcye8bZYvd85fvDet, from the unchanged runtime source at
f4677012630a6036e804be803328a1e6df30cbb8. The private build address is
https://bld8-workbench-jaskevs-4920s-projects.vercel.app.

Anonymous requests to Conversations, its API and health on both the generated
deployment URL and that project alias redirect to Vercel sign-in. All Deployments
protection was enabled before uploading. Live model execution remains false and
production OAuth is not configured. This is a hosted private shell, not a verified
production request workflow. The intended stable origin
https://bld8-workbench.vercel.app currently returns 404 because it has not been
promoted; it is the registered project domain for the pending Production OAuth app.

The required GitHub check is configured: Workbench checks, source git-provider /
github, external check name Workbench checks, Production only, blocks deployment
aliasing, timeout 1,800 seconds. Vercel's Git connection is still missing: the
personal Vercel GitHub app needs access to jaskevs/bld8-workbench. Automatic
production domain assignment stays false until linkage and the gate are verified.
No automatic deployment/promotion claim is made from this configuration alone.

The user has been asked to create the separate BLD8 Workbench Production OAuth
app with homepage https://bld8-workbench.vercel.app and callback
https://bld8-workbench.vercel.app/api/auth/callback/github, then save its Client ID
and secret in the ignored .local/production.env draft. The Local OAuth app and
apps/web/.env.local remain unchanged. Only jaskevs is allowlisted. Second-account
isolation remains explicitly deferred, not passed; Stage A acceptance stays open.

The earlier HTTP 403 is resolved after the isolated CLI refreshed its credential;
API access verifies the personal account and Hobby team. Company/global settings
were not changed. The first remote build failed with NEXT_NO_VERSION before
compilation. Correcting the workspace commands and explicitly pinning pnpm 11.25.0
produced READY, with Next.js build/type validation passing remotely.

The upload included 72 explicitly allowed runtime/workspace files, preserving
installed licences. Every uploaded file matched the released Git revision after
line-ending normalisation and passed an exact configured-secret check. Real
environment files, local tooling, caches, test output and planning were excluded.
Production secrets are configured only in the Production environment, never
Preview/Development; no OpenAI key is uploaded. The selected Groq model, owner
allowlist and approved daily caps remain unchanged, with execution disabled.

Nine anonymous route checks were made: the six checks on the two hosted URLs
redirect to Vercel sign-in; the three checks on the unpromoted stable domain are
404. No protection bypass/share link, application auth bypass, signed-in browser
session, model call, database mutation, commit or push was used. A real hosted
OAuth exchange and saved-request reload still need the user's browser. Earlier
local/CI test evidence remains distinct from this protected cloud build.


## Git deployment gate and shared OAuth choice - 27 October 2026

The personal Vercel project is bld8-workbench
(prj_bnDEPbHmbHGURn6g6L7XRB82CbHQ), on the jaskevs-4920s-projects Hobby team.
The stable HTTPS origin is https://bld8-workbench.vercel.app. All Deployments
protection was enabled before any upload. Anonymous requests to Conversations,
its API and health on the stable and generated URLs redirect to Vercel sign-in.

Git is connected to jaskevs/bld8-workbench, with main as Production Branch.
Git-sourced deployment dpl_HgYCSX6DoCKPwChz3NpApaL7wSGX is READY from tested source
f4677012630a6036e804be803328a1e6df30cbb8. Its Vercel check run for **Workbench
checks** completed with **succeeded** before the stable domain was assigned.
The gate uses GitHub's Workbench checks job, blocks production aliasing and has
a 1,800-second timeout. Automatic production domain assignment is now enabled.
Future main pushes are configured to build and pass that check before promotion.
This was a deployment from the existing Git revision; no new push was made.

On 27 October the user explicitly chose to reuse the existing personal Workbench
OAuth app. This supersedes the earlier separate-Production-app plan. Keep both
http://127.0.0.1:3135/api/auth/callback/github and
https://bld8-workbench.vercel.app/api/auth/callback/github registered. Local and
production AUTH_SECRET values remain different; local environment values and
company/global account settings are unchanged. The production draft is ignored
at .local/production.env and never auto-loaded by local Next.js commands.

Preflight verifies the approved shared app's credentials through a deliberately
invalid fixture-token check, selected Groq catalogue access, current pricing,
the exact successful source check, Neon schema version 1 and zero active requests.
It creates no user token, database write or model request. The user has been
asked to save both callbacks. Live execution remains disabled pending that
confirmation and the final Production-only environment/deployment update.

Access stays restricted to jaskevs (26425317). Keep the real second-account
isolation check deferred, not passed, and Stage A acceptance open. A real hosted
OAuth exchange, small Groq request and saved-result reload still need review.

The model catalogue returned HTTP 200 and lists GPT-OSS 120B. The OAuth fixture
check returned the expected token-not-found result for valid app credentials; it
does not create/reset/revoke a real token or establish a real OAuth exchange.
The final credential file is ignored. No application source changed, so existing
58-case local/CI evidence remains applicable without repeating the full suites.


## Private live configuration published - 27 October 2026

Workbench is deployed at **https://bld8-workbench.vercel.app** on the personal
jaskevs-4920s-projects Hobby team, project prj_bnDEPbHmbHGURn6g6L7XRB82CbHQ.
The live-configured release is dpl_9xTa8AEv5FahYaTaQcDH8oJ1NfLd, built from
f4677012630a6036e804be803328a1e6df30cbb8. Next.js compilation and TypeScript passed.
Its required **Workbench checks** GitHub check completed with **succeeded** before
production aliases were assigned. Git is connected to jaskevs/bld8-workbench/main;
future main pushes are configured to build and pass that gate before promotion.
The current release deployed an existing Git revision; no new commit/push was made.

All Deployments protection remains enabled. Anonymous Conversations, conversation
API and health requests on the stable and generated URLs redirect to Vercel
sign-in. Application access is separately restricted to jaskevs, ID 26425317.
Production-only variables enable Groq / openai/gpt-oss-120b, the US$1/user and
US$5/app UTC-day list-rate guards, and live requests. Server secrets use Vercel's
sensitive type; Preview/Development have no live credentials, and no OpenAI key
is configured there. There is no automatic provider fallback.

The user explicitly chose the existing personal OAuth app and confirmed both
local and production callbacks saved on 27 October. This supersedes the separate
Production-app plan. Keep http://127.0.0.1:3135/api/auth/callback/github and
https://bld8-workbench.vercel.app/api/auth/callback/github registered. Each origin
has its own AUTH_SECRET. The local environment and company/global settings remain
unchanged. Use the stable HTTPS origin for production sign-in; alternate generated
URLs are build references and may not share OAuth state cookies.

Credential/model/schema/source preflight and the final Vercel settings audit pass.
The OAuth check uses a deliberately invalid fixture token and does not establish
a real browser exchange. Groq's model catalogue returned 200 with the selected
model; that check generated no tokens. The user has been asked to sign in at the
production New request page, send one small question, reopen it and reload.
The real hosted sign-in/request/reload result remains pending. Do not substitute
the earlier local Groq record for that new production test.

The initial private release stays jaskevs only. Real second-account isolation,
manual assistive-technology review and the shell review/checkpoint remain open;
Stage A is not marked complete. The fixed dates and 135-hour baseline are unchanged.

The final Production environment audit confirms sensitive server-secret storage,
only the approved numeric owner, the selected provider/model and daily caps. Six
anonymous route checks on the stable/generated hosts redirect to Vercel sign-in.
The Git-backed release check ckr_38f32ecc-361e-40c3-8d00-d0bd23fb6101 completed as
succeeded. No force promotion, application auth bypass or public share link was
used. A read-only metadata check at 06:10 UTC found zero requests created after
this live release; its browser test was still pending at that check. All 58
previous local/CI cases remain applicable because runtime source is unchanged.
No new model request was made by release tooling and no database data was changed.


## First real hosted request - 27 October 2026

Credential/model/schema/source preflight and the final Vercel settings audit pass.
The user completed real production sign-in, sent a question, reopened its saved
conversation and reloaded it on 27 October. This is the user's browser report;
the personal Brave session was not controlled or independently observed here.
A separate read-only Neon check finds one new completed Groq run created after
this live deployment, with a saved answer/provider ID and matching ownership.
Requested/reported model both match openai/gpt-oss-120b. Usage is 133 input and
1,024 output tokens, duration 2,826 ms, list-rate estimate US$0.000635 with matching
accounting. Both daily guards remain within their approved limits.

The provider finish reason is length: this bounded test reached the 1,024-token
ceiling. The response may be incomplete; the application has a corresponding
length warning. Keep that observation in the next response-quality review rather
than silently increasing the cap or generating another test answer. This new
record is distinct from the earlier local response. No private question, answer,
conversation ID, provider ID or credentials were copied into these notes.

The live-configured deployment is dpl_9xTa8AEv5FahYaTaQcDH8oJ1NfLd from
f4677012630a6036e804be803328a1e6df30cbb8. It passed its required GitHub check
before receiving the stable production aliases. All-URL Vercel protection and
the jaskevs-only application allowlist remain. The user explicitly approved the
shared personal OAuth app; local and production keep different session secrets.
Local configuration, company/global settings and the approved spending limits
are preserved. Release tooling made no additional generation request.

The query filters runs after this production release rather than reusing the
22 October local response. It reads metadata in a read-only transaction and
does not alter model data or accounting. Pending source candidates pass the
configured-secret scan, and both real environment files remain ignored.
No runtime source changed, no extra full test run was needed, and no commit or
push was made. Real second-account isolation stays deferred by user choice;
manual accessibility and the shell review/checkpoint remain open. Stage A is
not marked complete from one successful owner flow.


## Deployment documentation source publication - 27 October 2026

The source change publishes the private deployment runbook, upload exclusions,
credential-free production template and verified production evidence. Runtime
source is unchanged from f4677012630a6036e804be803328a1e6df30cbb8; its build,
types and 58-case CI evidence remain applicable. The exact new commit is still
validated by the GitHub workflow and required Vercel promotion check. Earlier
no-commit/push statements describe their dated verification stages. The source
publication result is recorded separately in private planning. Real environment
files stay ignored and the staged source is checked for configured secrets.
