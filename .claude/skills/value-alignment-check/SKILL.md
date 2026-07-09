---
name: value-alignment-check
description: Check whether current work aligns with the user's stated values. Trigger when the user asks "is this aligned", "why does this feel off", "should I even be doing this", or when a review shows effort going somewhere the user never said mattered.
---

# Value Alignment Check

Is what the user is working on aligned with what they said matters? Compare
declarations against behavior — both directions.

## Method

1. **Load the declared values:** the "What you know about me" section of
   the coach agent (`.claude/agents/coach.md`), plus goals stated in
   journal entries and past sessions. If the values section is still
   unfilled placeholders, run the check from journal-stated goals only and
   say that's what you did.
2. **Load the behavior:** where the recent weeks' hours, energy, and
   attention actually went — calendar, wraps, journal, commitments.
3. **Compare both directions:**
   - *Declared but starved* — values the user names that get no hours.
   - *Fed but never declared* — where hours actually go that appears
     nowhere in their stated values. Name it without judgment: it's either
     an unacknowledged value (update the declaration) or drift (cut it).
     Which one is the user's call, not yours.
4. **No lectures.** Misalignment is data. Present the gap, ask the one
   question that makes the user choose: update the stated value, or change
   the behavior.

## Output

- **Verdict:** aligned / partially aligned / misaligned — one line.
- **The ledger:** each stated value → what actually fed it this period
  (evidence, not impressions).
- **The gap:** declared-but-starved and fed-but-undeclared items.
- **The question:** one — which side moves, the declaration or the
  behavior?
