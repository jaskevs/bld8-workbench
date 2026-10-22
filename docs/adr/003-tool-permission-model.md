# 003 - Tool permission model

Status: Accepted policy for implementation, 19 October 2026.

## Context

A model's suggestion is not permission to execute a tool. Policy must be
enforced by application code after authentication and schema validation.

## Decision

Classify each registered capability on the server:

| Class | v1 policy |
|---|---|
| READ_ONLY | May run only when explicitly registered, input validated and its data scope allowed for the authenticated user. |
| EXTERNAL_SIDE_EFFECT | Denied until a separate approval interface and enforcement path are implemented. |
| SENSITIVE | Denied; classification alone is never permission. |
| PROHIBITED | Always denied. |

Unregistered capabilities and malformed input are denied. The model cannot
choose a capability class, supply its own approval or override user scope.
Approval for a later side-effect tool must bind the authenticated user, exact
action/input and expiry; neither sample UI nor an arbitrary client flag counts.

Stage A has no executable tools. The first tool increment adds the named,
read-only corpus capability after retrieval is verified. Do not expose generic
HTTP, filesystem, shell, credential access or unrestricted URL fetching.

Record permitted/denied outcomes and safe error codes in owned execution
traces. Redact inputs and provider errors before persistence. Do not store
headers, credentials or hidden reasoning. Tool execution must observe request,
time and spending limits, and must not create an unbounded model/tool loop.

## Alternatives and consequences

Prompt-only restrictions cannot enforce application policy. A single allow-all
tool interface makes the permission boundary ambiguous. Explicit registration
and default denial require more deliberate integration but keep each enabled
capability reviewable and testable.

## Validation

The foundation exposes no tool-execution endpoint. Before a real tool is enabled,
tests must cover unknown tools, invalid input, unauthenticated/wrong-owner access,
each denied class and the explicitly allowed read-only path. This accepted
decision is not a claim that those future tools or tests are implemented.
