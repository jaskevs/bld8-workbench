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
execution. No application deployment is configured.

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
