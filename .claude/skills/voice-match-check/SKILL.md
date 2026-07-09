---
name: voice-match-check
description: Check whether a draft sounds like the user. Trigger when the user pastes a draft and asks if it sounds like them — "does this sound like me?", "is this my voice?", "voice check". Compares against the voice examples on file and returns the off-voice lines as a diff.
---

# Voice Match Check

The user pasted a draft and wants to know if it sounds like them. Answer
with a diff, not an essay.

## Method

1. Load the voice reference: the "My voice characteristics" and "Examples of
   my voice" sections in the editor agent definition
   (`.claude/agents/editor.md`), or the equivalent in project memory. If the
   voice sections are still unfilled placeholders, say so in one line and
   stop — there is nothing to compare against, and guessing a voice is worse
   than no check.
2. Compare the draft against the reference: sentence length and rhythm,
   vocabulary register, hedging vs. declarative habits, tics the user does
   and doesn't have.
3. Pick the **3 lines that least sound like the user**. Worst offenders
   first. If fewer than 3 lines are off, return fewer and say the rest
   passes — don't manufacture a third.

## Output

No prose introduction. Just the diff — one block per line:

> **Original:** <the line, quoted exactly>
> **Why it's off:** <one sentence naming the specific mismatch — "hedged
> twice in one sentence; you don't hedge", not "doesn't match your tone">
> **Rewrite:** <the same line in the user's voice>

End after the last block. One-line verdict at most ("rest of it passes" /
"whole draft reads off, these are just the worst") — nothing more.
