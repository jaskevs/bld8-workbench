# Workbench work

Read README.md and docs/architecture.md. In the local workspace also read
../CLAUDE.md and ../bld8-planning/NOW.md and the v2.2 roadmap.

This is currently docs-first. Do not treat reserved directories as implemented services.
Stage A has no Python, retrieval, vector storage, agents or Azure resources.
Keep the model wrapper limited to trace/usage/cost/request IDs/error normalisation.
Enforce ownership for reads, updates and deletes; reserve concurrent model cost
against per-user and overall budgets before calls. Read-only tools are the v1 default.
ADRs are draft until a reasoned decision is recorded; do not claim them accepted.
Keep corpus licences/provenance and source versions with later ingestion work.
Do not commit, push, create cloud resources or deploy without an explicit request.
