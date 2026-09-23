# BLD8 Workbench

A developer-facing environment for building and inspecting grounded AI workflows:
model calls, retrieval, tools, evidence, latency, token usage and estimated cost.

**Status:** docs-first local scaffold. No runnable app, service, database, model
integration, CI run or deployed system exists yet.

## Repository layout

```text
apps/web/                  Future Next.js application and Node orchestration
  src/server/
    orchestration/         Model/workflow execution
    retrieval/             Client for the future Python retrieval contract
    tools/                 Schemas, permissions and tool execution
    trace/                 Trace/usage/estimated-cost capture
services/retrieval/        Reserved for the later Python service
docs/adr/                  Draft decisions to resolve before related code
docs/eval/                 Evaluation case format and questions
docs/results/              Actual evaluation results when available
```

The future pnpm/Turborepo workspace lives in this repository. The public BLD8
website lives in the separate `bld8-web` repository.

## Stage A

Next.js/Node, GitHub OAuth through Auth.js, Neon Postgres and one model through
Vercel AI SDK. Include ownership enforcement, bounded requests, concurrent budget
reservations, persistence, basic trace and estimated cost. No Python or RAG in Stage A.

Resolve the [draft ADRs](docs/adr/README.md) before implementation.
See [architecture](docs/architecture.md) and [decision capture](docs/decisions-log.md).
The future Python/retrieval work is reserved, not implemented.

No install or run commands exist yet. Add dependency manifests, lockfiles and
CI with the first implementation slice. Record validation honestly in each change.

**Licence:** choose and add a licence before publishing source.
