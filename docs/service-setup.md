# Connect the private Workbench preview

The implementation uses GitHub OAuth, PostgreSQL and one bounded request to the selected provider.
Samples remain available without accounts or credentials. The first slice saves
one question/response per conversation; earlier conversations are not sent as
model context. No documentation search or tools are enabled.

## Local account configuration

Use your personal accounts. These are application credentials; do not change
the PC's Git, SSH, GitHub CLI, package-manager or company account configuration.

The application reads `apps/web/.env.local`. A blank local file with a random
Auth.js secret is prepared when none exists. Never paste credentials into chat,
source files or the parent workspace `.env`. The complete variable template is
`apps/web/.env.local.example`.

1. In [GitHub OAuth Apps](https://github.com/settings/developers), signed in as
   jaskevs, create a separate local OAuth application named **BLD8 Workbench Local**.
   Homepage: `http://127.0.0.1:3135`. Callback:
   `http://127.0.0.1:3135/api/auth/callback/github`.
   Put its client ID and secret in `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.
   Use the same hostname in the browser. For production, the user's latest
   choice is to reuse this personal OAuth app with an additional HTTPS callback;
   keep the local callback and use separate AUTH_SECRET values. Read
   [the deployment runbook](deployment.md) for that approved exception.
2. Create a separate **bld8-workbench** Neon database. In a Vercel-managed Neon
   organisation, use your personal Vercel team: Storage -> Create Database ->
   Neon. Select the Free plan if offered and skip **Connect a Project** while
   testing locally; importing a GitHub repository and deploying an application
   are separate later steps. A standalone Neon organisation can create the
   project directly in the [Neon console](https://console.neon.tech).
   Copy only the pooled `DATABASE_URL` line from the connection details into
   the existing app environment file, preserving its other settings. Do not
   reuse another application's database. Remote connections validate TLS
   certificates; never disable certificate validation.
   See [Vercel native integrations](https://vercel.com/docs/integrations/install-an-integration/product-integration).
3. For the selected **Groq Free** setup, create a personal key in
   [Groq Console](https://console.groq.com/keys), keeping the account on its Free
   plan. Set `GROQ_API_KEY`, `WORKBENCH_PROVIDER=groq` and
   `WORKBENCH_MODEL=openai/gpt-oss-120b` in the app environment file. The existing
   OpenAI key can stay in the file; it is not sent to Groq or used as fallback.
   If deliberately switching back later, set `WORKBENCH_PROVIDER=openai` and
   `WORKBENCH_MODEL=gpt-6-luna` with `OPENAI_API_KEY` and separate API billing.
   Account balance, model access and quota must be checked with the selected
   provider. Populated fields or a model-catalogue lookup do not prove generation.
4. Keep `WORKBENCH_ALLOWED_GITHUB_IDS` restricted to your numeric GitHub user ID.
   The initial value is the personal account ID recorded in this workspace.
   Additional testers need explicit IDs. Their daily allowance is separate.
5. Run `pnpm db:migrate` from the repository root. It loads this app's local
   environment, applies the versioned migration in one transaction, and is safe
   to repeat. Never run test reset scripts against this database.
6. Set `WORKBENCH_LIVE_ENABLED=true`, restart `pnpm dev`, open
   `http://127.0.0.1:3135/conversations` and sign in. Send a small request, reopen
   it, and verify the reported model, usage and cost. Sign in with a second
   allowlisted test account before any public release and verify isolation.

Missing or invalid configuration keeps requests disabled. Setup indicators mean
configured, not externally tested. Failed migrations/connections return a safe
error without printing the connection URL. Never expose `.env.local` in a report.

## GitHub sign-in troubleshooting

If GitHub shows a 404, verify the **Client ID** and matching client secret from
the personal **BLD8 Workbench Local** application under GitHub Settings ->
Developer settings -> OAuth Apps. A populated environment value is not proof
that GitHub accepts it. Update only AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in the
existing application environment file; keep AUTH_SECRET and other settings.
If the original client secret is unavailable, generate a new secret for that
application. Never paste credentials or callback query parameters into chat.

For this local setup, the browser origin and AUTH_URL are
`http://127.0.0.1:3135`, and the registered callback must be
`http://127.0.0.1:3135/api/auth/callback/github`. Restart the local server after
editing credentials and begin a new sign-in from Conversations. Do not reuse
an old authorization page or mix localhost with 127.0.0.1.

The application keeps `skipProxyUrlNormalize: true` in next.config.ts so Next.js
preserves the loopback hostname in Auth.js route-handler callbacks. The OAuth
handoff regression checks both the button and the direct sign-in route. Keep
CSRF, state/PKCE, certificate validation and account restrictions in place.

## Request and spending controls

- One provider call, no tools, no automatic retries, 30-second timeout and
  at most 1,024 output tokens. Titles are bounded to 80 characters, questions
  to 4,000 characters and the JSON request body to 24,000 bytes.
- The user chose **US$1 per user per UTC day** and **US$5 overall per UTC day**.
  Configuration may lower these limits; increasing them requires a code review
  and explicit approval. All days reset at 00:00 UTC, not Melbourne midnight.
- A short PostgreSQL transaction locks the shared ledger before the call,
  reserves a conservative input-byte/output-token bound against both limits,
  and enforces one active request per user/four overall and six starts per minute.
- An intent UUID prevents repeat submissions from repeating a model call. The
  same intent with changed content is rejected. Network errors retain the form
  and intent; inspect saved conversations before resubmitting.
- Known usage reconciles the original day's reservation once. Unknown usage,
  timeouts, lost workers and failed persistence retain the reservation. Requests
  older than two minutes become interrupted; no automatic refund is issued.
- Deleting a conversation removes its prompt, response and provider response ID.
  Minimal ownership/idempotency/accounting records remain so deletion cannot
  reset spend. Live requests cannot be deleted while running.

## Model, rates and trace boundary

The server selects one reviewed model. Request bodies cannot change provider,
model, owner or tools. Calls go directly to that provider, with no gateway,
automatic retries or fallback to a paid account. Switching providers does not
rewrite saved runs. Reusing an intent with another provider/model is rejected.

| Provider | Model | Input / cached input / cache writes / output USD per million | Reviewed |
|---|---|---|---|
| Groq | openai/gpt-oss-120b | 0.15 / 0.075 / 0.15 / 0.60 | 22 October 2026 |
| OpenAI | gpt-6-luna | 0.10 / 0.01 / 0.125 / 0.50 | 19 October 2026 |

These are published standard/on-demand list-rate estimates for comparisons and
local accounting. They are not invoices: a Groq Free account has no token charge
within its free quota. The application cannot establish an account's billing
tier from the key alone. Keep that account on Free; quota exhaustion stops the
request. Do not upgrade or add payment details to increase the free allowance.
See [Groq rates](https://console.groq.com/docs/model/openai/gpt-oss-120b),
[Groq limits](https://console.groq.com/docs/rate-limits) and
[OpenAI rates](https://developers.openai.com/api/docs/models/gpt-6-luna).

Reservations use the conservative input rate and full output bound. Missing
cache details use conservative rates; missing total usage stays unknown. Review
rates within 30 days; stale pricing disables execution until reviewed. The
reported model is saved separately from the requested model.

Groq uses its native AI SDK adapter and on-demand Chat Completions with low
reasoning effort and hidden reasoning output. OpenAI uses Responses with
`store:false`, standard service tier and no reasoning effort. No tools or
conversation history are sent. Only the filtered answer and selected usage,
model, timing and accounting fields are saved. Raw provider payloads, headers,
access tokens, error text and private reasoning are excluded. Provider retention
policies still apply; this is not a zero-retention claim.

Safe error categories distinguish provider quota, request/token throttling,
key/access problems, rejected requests and timeouts. Failure keeps its unknown
reservation and never triggers another provider. Credential-pattern filtering
includes Groq keys; filtering is best effort, so keep sensitive material out of
requests. See [Groq data handling](https://console.groq.com/docs/your-data) and
[AI SDK Groq adapter](https://ai-sdk.dev/providers/ai-sdk-providers/groq).

## Local verification

`pnpm test:unit` covers the authored sample/draft contracts. `pnpm test:services`
requires a dedicated PostgreSQL database on loopback whose name ends in `_test`;
it refuses other targets. Tests reset only the Workbench-prefixed test tables.
Set `WORKBENCH_TEST_DATABASE_URL` explicitly. The test provider is an HTTP fixture
or injected function and never calls a paid endpoint.

For a disposable local database, run these from the repository root in PowerShell:

```powershell
docker compose -f compose.test.yml up -d --wait
$env:WORKBENCH_TEST_DATABASE_URL='postgresql://postgres:workbench-local-tests@127.0.0.1:3145/workbench_test'
pnpm test:services
pnpm build
pnpm test:e2e
pnpm test:e2e:services
pnpm test:e2e:groq
docker compose -f compose.test.yml down
```

The published database port binds only to loopback. This container holds test
fixtures, not the personal Neon application data. Stop it after testing.

Build before `pnpm test:e2e`. Authenticated browser checks use genuine encrypted
Auth.js test sessions against the disposable test database, not a production
authentication bypass. No local test establishes real GitHub OAuth, Neon cloud
connectivity, API account access or a completed live model request. Record those
checks separately after configuration. The protected Git-backed deployment and
promotion check are now verified; current activation and real-browser acceptance
status is recorded in [the deployment runbook](deployment.md).
