# Workbench work

Read README.md, docs/architecture.md, docs/verification.md and docs/adr/README.md.
In this workspace also read ../CLAUDE.md, ../bld8-planning/NOW.md and the v2.2
roadmap. The 19 October foundation supersedes the earlier docs-only status.

The Next.js/BLD8 UI application runs locally on 3135. Samples and local drafts
remain available without credentials. The service slice implements GitHub OAuth
through Auth.js, JWT identity, owner-scoped PostgreSQL conversations, one bounded
model request, filtered trace metadata and transactional spending reservations.
The default private workflow stays disabled until personal services are configured.

Current service status, 22 October: personal GitHub OAuth sign-in and separate
Neon persistence are verified. The user corrected invalid OAuth app credentials;
skipProxyUrlNormalize preserves the configured 127.0.0.1 callback. One real
OpenAI run is saved as failed with unknown usage and no saved answer. The user
reported no API balance; the stored generic failure does not prove its raw
billing cause. The later Groq run succeeded; this does not complete Stage A.

The latest user choice is Groq's Free hosted plan with openai/gpt-oss-120b.
Ollama was considered but not installed. WORKBENCH_PROVIDER selects groq or
openai, each with its own key/model and reviewed rates. Only the selected key
is used; there is no gateway or automatic provider fallback. Keep US$1/user and
US$5/app UTC-day guards, now clearly labelled as provider list-rate accounting.
Free-tier actual charges can differ. Historical OpenAI records stay unchanged.
The user saved the Groq key. Authenticated model-catalogue access returned
HTTP 200 and lists the selected model; this generated no tokens. The production
preview was restarted on 127.0.0.1:3135 and reports private-live configuration.
A real Groq run is now completed and saved: requested/reported model both
openai/gpt-oss-120b, duration 1,094 ms, 135 input and 323 output tokens, with a
US$0.000215 list-rate estimate matching its accounted amount. The owner matches
its conversation and both daily guards remain within limits. A read-only Neon
metadata check confirms the saved answer and provider response ID presence;
the user reported the flow working and supplied its completed saved-result view.
No private question, answer, provider ID or conversation ID belongs in this handoff.
Manual reload/reopen was not independently observed through the personal browser.
Keep second-account OAuth review and independent deployment open; do not bypass
OAuth or mark Stage A complete. The response-formatting polish is now implemented
locally with react-markdown and remark-gfm, copy actions, contained code/tables and
semantic headings. HTML is skipped, remote images render as alt text, and links
accept only HTTP(S) or local fragments. Never enable raw HTML for model text.
Existing saved answers render through the same component without modifying their
database contents. See docs/verification.md for the latest validation evidence.

Read docs/service-setup.md. Credentials belong only in apps/web/.env.local;
preserve its generated secret and user-entered values. Never read parent .env.
The model provider defaults to OpenAI only for compatibility when the provider
variable is absent; this local environment explicitly selects Groq. Unknown
providers, missing selected keys, mismatched models and stale rates disable
execution. A protected build is now hosted; the current private-release status follows.

Private release, 27 October: read docs/deployment.md before hosting changes.
Workbench is deployed at **https://bld8-workbench.vercel.app** on the personal
jaskevs-4920s-projects Hobby team, project prj_bnDEPbHmbHGURn6g6L7XRB82CbHQ.
The first verified live-configured release was dpl_9xTa8AEv5FahYaTaQcDH8oJ1NfLd, built from
f4677012630a6036e804be803328a1e6df30cbb8. Next.js compilation and TypeScript passed.
Its required **Workbench checks** GitHub check completed with **succeeded** before
production aliases were assigned. Git is connected to jaskevs/bld8-workbench/main;
future main pushes are configured to build and pass that gate before promotion.
That functional release used an already-pushed Git revision. Later documentation-only
source releases preserve the runtime; their CI/deployment outcome is recorded in
the private planning handoff.

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

The initial private release stays jaskevs only. Real second-account isolation,
manual assistive-technology review and the shell review/checkpoint remain open;
Stage A is not marked complete. The fixed dates and 135-hour baseline are unchanged.

The ignored .local/production.env is loaded explicitly by release tooling; never
rename it to a Next.js auto-loaded environment filename. Local and production
share only Workbench's existing Neon records/spending ledger and the user-approved
personal OAuth app/Groq key; keep their session secrets different. Do not reset
cloud data, force-bypass the release gate or create public bypass links. The
real production sign-in/question/reopen/reload is now reported successful and
the fresh saved run is independently verified through safe database metadata.
Keep the token-ceiling observation for response-quality review and the explicitly
deferred two-account check open. The verification above preceded the
documentation-only source publication recorded in private planning.

Server tests use a disposable loopback PostgreSQL database ending in _test.
Authenticated browser tests use genuine encrypted test sessions and an isolated
HTTP fixture loaded only by the test process; application code has no auth bypass.
Never point reset tests at personal/cloud data. Keep provider headers, bodies,
OAuth tokens, raw errors and private reasoning out of saved records and logs.
Unknown usage/lost workers retain their reservation; deletion cannot refund spend.

Stage A has no Python, retrieval, vector storage, agents or Azure resources.
Keep a future model wrapper limited to trace/usage/cost/request IDs/error
normalisation. Enforce ownership for reads, updates and deletes; reserve
concurrent model cost against per-user and overall budgets before calls. v1
tools are explicitly registered read-only capabilities with default denial.

ADRs 001-003 are accepted implementation directions; their acceptance does not
mean the related services or controls have been implemented. Revisit the later
retrieval contract after the checkpoint/corpus decision. Keep provenance and
versions with any future corpus. Follow CONTRIBUTING.md and preserve UI licences.

Do not commit, push, create cloud resources or deploy without an explicit user
request. Preserve the isolated personal identity/SSH/hooks and the daily
08:00-17:00 Australia/Melbourne commit/push restriction. Never change company or
global Git, SSH, GitHub or package-manager configuration. Do not read parent .env
values into the client, sample data, logs or public documents.

Workbench uses cobalt actions, pale blue selection, peach/lavender details and
ink text on cool grey and white surfaces. Inspector headers and sample cards
carry restrained tints; reading panels remain white. The geometric W has a peach
terminal on a cobalt-to-violet tile. Keep
application overrides in apps/web/src/app/theme.css and branding outside the
installed UI source. Read docs/theming.md; do not restore the showcase yellow
palette or edit vendored components to change application branding.
