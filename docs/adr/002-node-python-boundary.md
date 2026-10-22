# 002 - Node and Python boundary

Status: Accepted for Stage A, 19 October 2026. The later retrieval contract
remains subject to the 3 November corpus/checkpoint decision.

## Context and decision

Node owns authentication, application persistence, orchestration, permission
checks, model requests, usage and execution traces. Stage A runs entirely in
Node. Python, embeddings, retrieval, pgvector and Azure resources are not part
of the foundation or Stage A acceptance.

Keep server modules separated by responsibility under apps/web/src/server.
The reserved services/retrieval directory remains documentation until Increment
2. Do not create a second runtime or public endpoint for an unused abstraction.

When retrieval is introduced, Node calls a private, bounded, versioned
POST /retrieve contract. Python owns corpus ingestion, chunking, embeddings and
retrieval. Evidence must retain source URL, document/chunk IDs, corpus version
and ranking information. Service authentication, input bounds, timeouts,
correlation IDs and failure semantics must be resolved before connecting it.
Node remains the user-facing security boundary; Python does not receive browser
sessions or select which user's conversations it may read.

## Alternatives and consequences

Splitting runtimes now would consume operational work before retrieval exists.
Keeping everything in Node indefinitely would simplify deployment but remove
the planned Python/retrieval learning and evidence. Defer the service while
preserving clear module ownership; revisit the HTTP details with a real corpus.

## Validation

The shell has no Python dependencies, retrieval claims or calls. Later evidence
and retrieval results will be recorded separately, rather than inferred from
sample execution events.
