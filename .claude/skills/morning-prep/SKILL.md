---
name: morning-prep
description: One-page morning briefing — calendar, inbox, priorities. Trigger when the user says good morning, asks what's on today, or asks for their morning prep/briefing/daily rundown.
---

# Morning Prep

Build the user's one-page start-of-day briefing. Fast, grouped, decision-
ready — this is read with coffee, not studied.

## Method

1. **Calendar:** pull today's events. Flag conflicts, back-to-backs with no
   gap, and anything needing prep (a doc to read, numbers to have ready) —
   and say what the prep is.
2. **Inbox:** scan for what arrived since yesterday evening. Surface only
   what needs action or awareness today; everything else waits for
   inbox-triage.
3. **Priorities:** check CLAUDE.md and any open commitments (including
   coach commitments coming due). Name the ONE thing that must move today.
4. If a connector (calendar/Gmail) is unavailable, say which section is
   missing and build the rest — don't fail the whole briefing.

## Output (one page max, in this order)

- **The one thing:** today's must-move item, one line.
- **Schedule:** today's events with flags (conflict / needs prep / could
  decline).
- **Needs your decision:** grouped, each with a recommended default.
- **Inbox highlights:** max 5 lines, action-relevant only.
- **Already handled:** one-line log of what was resolved without you.
