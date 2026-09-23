# Intended architecture

Status: proposed roadmap direction, not an implemented system.

Stage A: Next.js UI -> Node runtime -> one model through the AI SDK and Neon
Postgres for application persistence. Auth.js/GitHub OAuth identifies users.
Node owns ownership, limits, model execution and trace capture.

Increment 2 adds Node -> POST /retrieve -> Python -> ranked evidence. Python owns
ingestion and retrieval over the approved corpus snapshot. Define service auth,
timeouts, correlation IDs and source metadata before connecting the service.

Keep orchestration, retrieval client, tools and trace modules separate. One
application workspace; no plugin or multiple-workspace abstraction. The website
is an independently deployed sibling repository. The Python service deploys to
Azure Container Apps only when that increment is implemented.
