# Sub-Agents: Run a Team of Specialized Claudes

## The Anatomy of an Agent

An agent is not complicated. It is three things stacked together:

- **Memory** — the agent's *identity* (CLAUDE.md). Who it is, what it knows about you.
- **Skills** — the agent's *capabilities* (skill files). The processes it runs.
- **Tools** — the agent's *agency* (MCP connectors). What it can touch in the world.

**Memory + Skills + Tools = an agent.** Building a multi-agent setup is just
stacking these three layers deliberately, per role.

## Two Key Insights

### 1. Specialization beats generalism

Most people use one Claude for everything: one CLAUDE.md, one set of skills,
generalist instructions. Then outputs feel inconsistent — content drafts get
the operator framing, financial questions get content-friendly hedging, code
reviews get prose explanations.

The fix isn't a smarter Claude. It's *multiple* Claudes, each specialized:
one for content, one for finance, one for ops — each with its own memory and
skills. You stop fighting drift and start getting on-target output every time.

### 2. Specialization compounds

A content agent that knows your voice writes better captions than general
Claude. A research agent that always cites sources writes better briefs. A
coach agent that pushes back gives better feedback. Each agent gets sharper
the more you use it — and the team gets sharper the more agents you have.

## Four Architectural Patterns

There are four ways to structure a multi-agent setup. Pick the one that
matches the problem. Most people graduate through them in this order.

### Pattern A — Single Specialist

*One Claude. One role. Always-on.*

The entry point. Pick **one** recurring task type and build a dedicated Claude
for it — Personal Editor, Strategic Coach, Research Analyst. Use a Project on
Claude.ai to give it a dedicated CLAUDE.md + skills, and only use that project
for that task.

**Use case:** you're tired of re-explaining context. A single specialist gives
you 80% of the multi-agent value with 20% of the complexity.

### Pattern B — Parallel Execution

*Multiple Claudes spawned in one task.*

In Claude Code, you spawn sub-agents that work simultaneously on different
parts of a problem. They run in parallel, return their outputs, and the main
Claude consolidates.

**Use case:** a complex task that decomposes cleanly — research X + draft Y +
build Z + review all three. 4x faster than serial.

### Pattern C — Specialist Team

*Multiple persistent agents, each with their own role.*

Each agent runs as its own Claude conversation / Project / instance, with its
own CLAUDE.md and skills. You invoke the right agent for the job. The agents
don't talk to each other directly — you orchestrate.

**Use case:** you have multiple recurring task types — content + finance + ops.

### Pattern D — Orchestrator + Workers

*One agent coordinates. Others execute.*

The most advanced pattern. One agent (the orchestrator) decomposes incoming
tasks, decides which specialist should handle each piece, dispatches the work,
and consolidates results. You only talk to the orchestrator; it talks to the
workers.

**Use case:** when you have enough specialists that picking the right one is
itself a task, or when the same task needs multiple agents to weigh in.

## Two Starting Paths: Solo or Operator

Where you start depends on what you do. Both paths are real. Pick one — don't
try to do both at once.

### Solo path — 3 personal agents anyone can build

If you're not running a team or business, build these three. They cover ~80%
of personal/professional use cases:

1. **The Strategist** — pushes back on your decisions. Devil's advocate.
   Always finds your hidden assumptions.
2. **The Editor** — reviews and improves your writing in your voice. Catches
   your tics. Tightens your drafts.
3. **The Coach** — accountability and reflection. Weekly reviews, blocker
   identification, growth tracking.

All three can be built on Claude.ai using Projects — no code required. Each
gets its own Project with its own custom instructions (= CLAUDE.md) and
uploaded skills.

### Operator path — 5 business agents

If you're running a team, a business, or multi-stream creator operations,
this is the five-specialist, always-on structure:

1. **The CFO / Orchestrator** — financial overview, daily P&L, dispatches
   tasks to the right specialist.
2. **The Researcher** — deep dives, source synthesis, competitive intel,
   market scans.
3. **The Content Lead** — channels, copy, hooks, performance review.
4. **The Engineer** — automations, scripts, internal tooling, system
   maintenance.
5. **The Quant / Specialist** — domain-specific deep work: trading, legal,
   design, ops — whatever your edge is.

Operator-path agents typically run as their own Claude Code sessions with
their own CLAUDE.md, skills, and connectors — on a Mac Mini server, a VPS, or
a laptop with energy saver disabled.
