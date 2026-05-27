# Bastion conventions (all delivery agents)

This repo is an **agent pipeline scaffold** — three homes (`.claude/agents/`, `.cursor/agents/`, `.github/agents/`) carrying the same planner → red-team → coder → smoke-tester → reviewer chain. There is no application code in this tree; the agents are intended to be copied or referenced into other projects.

## Pipeline shape

The full chain is **planner → red-team → coder → smoke-tester → reviewer**. The red-team agent walks every `assumptions[]` entry in the plan; on `RED-TEAM:REFUTED` the plan goes back to the user (ambiguity gate), not to the coder. Cursor uses `handoffs:` frontmatter to fire each next stage automatically. The canonical HANDOFF block shapes live in `.claude/commands/pipeline.md` under "HANDOFF schema".

## Verification — mandatory E2E

1. **Everything observable must be verified end-to-end.** Unit tests alone are not enough for running services.
2. **New or changed routes/endpoints:** start the service, then exercise every new/changed surface (curl, browser, CLI as appropriate) — record output; compare to acceptance criteria.
3. **Smoke-tester** must not mark pass without live evidence when the issue touches a network surface.
4. **Coder** must list every new/changed surface in `HANDOFF:IMPLEMENTATION` → `smoke_endpoints` with concrete `expect` values.
