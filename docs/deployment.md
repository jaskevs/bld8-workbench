# Private Workbench deployment

## Release status - 27 October 2026

The verified runtime baseline is f4677012630a6036e804be803328a1e6df30cbb8. Its
[Workbench validation run](https://github.com/jaskevs/bld8-workbench/actions/runs/39735518757)
passed. Local build, lint, types and all 58 domain/service/browser cases passed
before that source release. Fixture checks are distinct from real service evidence.

The user authorised the first private deployment and chose **jaskevs only**.
The real second-account OAuth/isolation check is deferred, not passed. Stage A
acceptance remains open.

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

## Isolated release configuration

Use only the personal jaskevs-4920s-projects Vercel team and an independent
bld8-workbench project. Do not change bld8-web, bld8-ui or company settings.
The CLI configuration lives outside the checkout under
../.bld8-local/vercel; supply that explicit global-config path on every command.

The verified cloud build uses Next.js, Node 22, apps/web as Root Directory and
source files outside that directory enabled. Its explicit commands pin pnpm:

- Install: npx --yes pnpm@11.25.0 install --frozen-lockfile
- Build: npx --yes pnpm@11.25.0 --filter @bld8/workbench-web build
- Output: the Next.js default .next directory in apps/web.

The first attempt used commands that changed up two directories and failed
before compilation with NEXT_NO_VERSION. Removing that directory change and
pinning pnpm in the remote commands produced the READY build. Runtime source
did not change. No paid build resources or plan upgrade were enabled.

Production values belong in Vercel's Production environment. A local handoff
draft is kept only in the ignored .local/production.env file. The checked-in
apps/web/.env.production.example lists its keys and contains no credentials.
Do not rename the draft to a Next.js auto-loaded environment filename: local
development and its OAuth callback must continue using apps/web/.env.local.
The .vercelignore file excludes secrets, generated output and local tooling from
direct CLI source uploads. Git independently ignores real environment files.

Use the existing personal Workbench GitHub OAuth app by the user's explicit
27 October choice. Keep both local and production callbacks registered. Use
different AUTH_SECRET values and the appropriate AUTH_URL in each environment.
Do not replace the local callback, change company credentials or put credentials
or callback query strings in chat. See
[GitHub callback registration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
Earlier notes requiring a separate OAuth app are superseded by this user choice.

For this first private release, reuse only the already separate Workbench Neon
database and selected Groq key. Local real usage and the private deployment
therefore share saved conversations and the same spending ledger. The website
and UI showcase use neither. Disposable test suites must never target this data.
The version 1 migration is already applied; verify it read-only before release.
Do not automatically run migrations as part of every Vercel build.

Set WORKBENCH_ALLOWED_GITHUB_IDS=26425317. Keep the selected Groq GPT-OSS 120B
model, one bounded call, no fallback, and US$1/user and US$5/app UTC-day list-rate
guards. Do not copy an OpenAI key into production. Leave WORKBENCH_LIVE_ENABLED
false until the production identity, database, selected model and protection
settings are verified. Never add live credentials to Preview/Development builds
by default, and never invoke a real model merely to check a build.

## Access and deployment gate

Configure Vercel Authentication for **All Deployments**, including production
domains, before the first upload. Do not create public share/bypass links or
add another user. Application sign-in still enforces the immutable GitHub ID
allowlist on every private request. See
[Vercel deployment protection](https://vercel.com/docs/deployment-protection).

Connect only jaskevs/bld8-workbench with main as Production Branch. GitHub
validation and Vercel Git deployment are separate controls. In Project Settings
-> Deployment Checks -> Add Checks -> GitHub, require **Workbench checks** from
the **Workbench validation** workflow. Keep production automatic aliasing enabled
when using that gate. A build must not be treated as released until that exact
commit's checks pass and the deployment is promoted. See
[Vercel Deployment Checks](https://vercel.com/docs/deployment-checks).

If the required check is not configured, keep automatic production promotion
disabled and use an explicitly verified staged release. Do not claim CI gates
are active from a passing GitHub run alone. No paid add-on is required for
Vercel Authentication for All Deployments; do not enable paid password protection.

## Acceptance and rollback

Before enabling requests: verify the exact project/team, HTTPS origin, all-URL
protection, production-only configuration, selected model, owner allowlist,
database schema and safe health result. Unauthenticated private routes must not
return conversation data. Never bypass application authentication for smoke tests.

The first real personal-browser sign-in/request/reopen/reload passed by user
report on 27 October. Safe metadata verifies the fresh saved Groq result and
accounting, including the output-ceiling observation above. Future release smoke
tests should use the stable origin and record safe metadata only.
Keep second-account isolation, manual assistive-technology review and the
3 November shell review/checkpoint explicitly open until actually completed.

If a release fails, disable live execution and redeploy or restore the last
verified Vercel deployment. Keep schema/accounting records intact and do not
refund unknown reservations or reset the database. Record the deployment ID,
source hash, configured gate, safe smoke-test evidence and rollback candidate.
