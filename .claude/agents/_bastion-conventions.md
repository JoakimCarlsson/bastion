# Bastion conventions (all delivery agents)

This repo is an **agent pipeline scaffold** — three homes (`.claude/agents/`, `.cursor/agents/`, `.github/agents/`) carrying the same planner → red-team → coder → smoke-tester → reviewer chain. There is no application code in this tree; the agents are intended to be copied or referenced into other projects.

## Verification — mandatory E2E

1. **Everything observable must be verified end-to-end.** Unit tests alone are not enough for running services.
2. **New or changed routes/endpoints:** start the service, then exercise every new/changed surface (curl, browser, CLI as appropriate) — record output; compare to acceptance criteria.
3. **smoke-tester** must not mark pass without live evidence when the issue touches a network surface.
4. **coder** must list every new/changed surface in its handoff with concrete `expect` values.

## Pipeline note

Claude Code has no auto-handoff buttons. Chaining is done by `/pipeline` (see `.claude/commands/pipeline.md`), which invokes each agent in sequence via the `Agent` tool and routes the next stage based on the verdict in each agent's final output. Agents end with a structured `HANDOFF:*` block — same shape across all three homes — and `/pipeline` parses that block to validate, log, and decide what to do next. The schema for those blocks lives in `.claude/commands/pipeline.md` under "HANDOFF schema".

The full chain is **planner → red-team → coder → smoke-tester → reviewer**. The red-team subagent walks every `assumptions[]` entry in the plan; on `RED-TEAM:REFUTED` the plan goes back to the user (ambiguity gate), not to the coder. The orchestrator additionally enforces a **failure-signature circuit breaker** (repeat hash = stop), a **per-issue token budget** (default 400000, override via `BASTION_PIPELINE_BUDGET`), and writes a **per-run JSONL log** under `.pipeline-runs/<issue>/<run-id>.jsonl`.
