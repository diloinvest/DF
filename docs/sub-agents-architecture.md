# Sub-Agents: Run a Team of Specialized Claudes

*Български превод: [sub-agents-architecture.bg.md](sub-agents-architecture.bg.md)*

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

## Practical Setup Options, Easiest to Hardest

- **Easiest:** separate Projects on Claude.ai — one Project per agent. You
  manually pick which one to use.
- **Middle:** Claude Code with role-specific CLAUDE.md files in different
  folders. Spawn sub-agents from a master orchestrator session.
- **Advanced:** always-on agents on a Mac Mini or VPS. Each runs as its own
  service, with a Telegram or webhook frontend routing tasks to them.

## Worked Example: Invoking the Strategist

This repository contains a complete Strategist agent
(`.claude/agents/strategist.md`) and its two skills
(`.claude/skills/decision-stress-test/`, `.claude/skills/pre-mortem/`).
To run it as an easiest-tier setup:

1. Create a dedicated Project on Claude.ai called **"Strategist"**.
2. Paste the agent's CLAUDE.md content as the Project's custom instructions.
3. Add the two skills as project files.
4. Whenever you're weighing something — *before* you commit to it — open the
   project and dump the decision in.

The two skills split the timeline: `decision-stress-test` runs while you're
still weighing (assumptions, steelman, regret analysis); `pre-mortem` runs
once you've committed (failure modes, leading indicators, check-in dates).

In the middle-tier setup (this repo), the same agent and skills are invoked
automatically: the orchestrator in the root CLAUDE.md routes decision-shaped
tasks to the `strategist` worker, and the skills trigger on their own when
you describe a decision or an imminent commitment.

## The Dispatch Formula

Prompts to an agent team follow one shape:

> **[Action verb] + [specific input] + [specific output] + [constraint]**

Example:

> "Look at my calendar tomorrow morning. For each meeting before noon, run
> my meeting-prep skill on it. Put the briefs in a doc on my desktop called
> Tomorrow Briefs."

Every part earns its place: the action verb picks the agent, the specific
input scopes the work, the specific output makes done checkable, and the
constraint stops the agent from inventing its own definition of finished.
Vague prompts get generalist output — the exact drift this architecture
exists to eliminate.

## Putting It All Together: The Full Stack

Every layer composes. A single morning flow, end to end:

1. **I send a voice memo** *(voice input)*
2. **Whisper transcribes it and dispatches to the right agent**
   *(sub-agents — this guide)*
3. **The agent runs Claude Code on my machine, with my preferences loaded
   from memory** *(Claude Code + memory/CLAUDE.md)*
4. **It triggers the meeting-prep skill** *(skills)*
5. **It writes the output to an artifact I built, which saves it
   permanently for later review** *(artifacts + persistent storage)*
6. **The result lands on my phone before I sit down for coffee.**

The point of the stack: no single layer is impressive alone. Memory makes
the agent sound like you, skills make it repeatable, tools let it touch the
world, sub-agents keep each role on-target — and composed, they turn a
30-second voice memo into finished work.

## Appendix: Request Templates

Fill these in and hand them to any agent. The blanks are the spec — an
unfilled bracket means an invented behavior.

### Skill request

```text
Build me a skill called "[name]".
Trigger: [phrases that activate it]
Behavior: [step-by-step instructions]
Output: [exact format spec]
Constraints: [length, tone, what to avoid]
```

### Artifact request

```text
Build me an artifact called "[name]".
WHAT IT DOES: [input → action → output]
BEHAVIOR: [API call spec]
PERSISTENT STORAGE: [storage key + Vault tab]
SYSTEM PROMPT: [voice + constraints]
STYLE: [light/dark, layout, animation]
```

### Personal memory (CLAUDE.md sections)

```text
About me
My team / network
How I want you to work with me
Tools and stack
Currently working on
Pet peeves
```
