---
name: inbox-triage
description: Triage the inbox into action / FYI / archive, with draft replies for action items. Trigger when the user asks to triage, clear, sort, or catch up on email/inbox — "triage my inbox", "what's in my email", "help me get to inbox zero".
---

# Inbox Triage

Sort everything into three buckets. The user should be able to process the
whole result in one pass, top to bottom.

## Buckets

1. **Action** — needs a reply or a decision from the user. Each item gets a
   drafted reply ready to send or edit. Order by deadline, then by sender
   importance.
2. **FYI** — worth knowing, needs nothing. One line each. Group by theme
   (never 8 separate items if 3 categories would do).
3. **Archive** — no action, no lasting value. Report only the count and the
   categories (newsletters: 6, receipts: 3), not the items.

## Rules

- **Drafts sound like the user.** Check the editor agent's voice sections
  (`.claude/agents/editor.md`) if filled; short, direct, no invented
  commitments — never promise dates or amounts the user didn't state.
- **Don't send anything.** Draft only. Sending is the user's click.
- **Flag the genuinely ambiguous** (could be action, could be archive) as
  its own short list with a recommended bucket, rather than guessing
  silently on important mail.
- **Speed over completeness of prose.** Bucket counts and one-liners, not
  summaries of every email.

## Output

**Action** (items + drafts) → **FYI** (grouped one-liners) → **Archive**
(counts by category) → **Ambiguous** (only if any, with recommendations).
