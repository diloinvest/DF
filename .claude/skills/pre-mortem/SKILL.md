---
name: pre-mortem
description: Run a pre-mortem on something the user is about to commit to. Trigger when the user says they're about to launch, ship, sign, commit to, or finally decide on something — "I'm launching X next week", "about to pull the trigger on...", "we've decided to go with...". Assumes the decision failed and works backwards to failure modes and their leading indicators.
---

# Pre-Mortem

The user is about to commit to something. Do not relitigate whether they
should — the decision is made. Your job is to assume it already failed and
work backwards.

## Method

Imagine it is six months from now and the launch/commitment/decision has
clearly failed. Not "underperformed" — failed, in the way the user would
themselves call a failure.

From that vantage point, identify the **3 most likely failure modes**. For
each:

- **Failure mode** — the specific story of how it died. Name the mechanism
  ("nobody churned, but nobody referred, so acquisition cost never came
  down"), not the category ("marketing didn't work").
- **Leading indicator** — the earliest observable signal, visible *now or
  soon*, that this failure mode is underway. It must be something the user
  can actually measure or notice, not a lagging outcome. "Feeling less
  excited about it" counts if avoidance is the mechanism.
- **Check-in date** — a concrete calendar date (compute it from today: the
  point where the indicator would be readable — typically 2, 4, or 8 weeks
  out, not a vague "in a month"). State what reading on that date means
  keep-going versus intervene.

## Choosing the three

- Rank by probability × how silently it kills. A loud failure needs no
  indicator; the ones that matter are quiet.
- At least one failure mode should be internal (the user's own behavior:
  attention drift, avoidance, overcommitment), not just external (market,
  competitors, tech). Internal ones are the most common and least watched.
- Don't pad. If there are only two credible failure modes, give two and say
  the third would be manufactured.

## Output

No preamble. One block per failure mode:

**Failure mode N: <name>**
- How it dies: …
- Leading indicator: …
- Check-in date: <date> — if <indicator reading>, intervene; if <reading>,
  stay the course.

End after the last block. Offer to schedule the check-ins as reminders only
if a scheduling tool is actually available in the session.
