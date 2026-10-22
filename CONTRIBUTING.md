# Contributing

Use Node 22.13+ within Node 22 and pnpm 11.25.0. Work from the repository root;
run lint, the production build, types and the domain/browser suites before a
release. Keep the first application in apps/web. The sibling website and UI
library remain independently built and deployed repositories.

Workbench uses white panels, a cool grey canvas and cobalt/pale blue with peach/lavender accents through
application-owned theme overrides. Keep aligned controls and shared BLD8 UI
motion/focus tokens. Read docs/theming.md before changing the brand palette. Respect reduced motion, keyboard
focus, labelled actions and mobile containment. Imported UI source lives under
apps/web/src/components/ui/bld8; preserve its licences and record upgrades in
docs/ui-source.md. Prefer changes in the canonical library when they are reusable.

Sample fixtures must stay visibly distinct from real provider output and stored
executions. Do not invent measured usage, successful authentication, retrieved
sources, database persistence, accessibility certification or deployment results.
Browser drafts are not an authentication or database substitute.

Service work follows the accepted ADRs. Check authentication and ownership on
every read/update/delete. Reserve concurrent spending before a model call. Keep
secrets and trace redaction server-side. No live execution is released before
the Stage A controls are tested. Never read the parent .env into the sample UI.

Keep personal repository-local SSH settings and identity guards. Do not alter
company/global Git, SSH, GitHub, npm or pnpm configuration. Commits use Jaison
<26425317+jaskevs@users.noreply.github.com> as both author and committer, without
co-author trailers. Commits and pushes are prohibited from 08:00 inclusive to
17:00 exclusive in Australia/Melbourne every day. Check the actual time; do not
backdate or bypass hooks. Committing, pushing, creating cloud resources and
deploying require explicit user authorisation.
