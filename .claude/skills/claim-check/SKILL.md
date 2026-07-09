---
name: claim-check
description: Stress-test a specific claim against evidence. Trigger when the user asks whether a specific statement is true — "is it true that...", "check this claim", "someone said X, verify it", or pastes a stat/quote and asks if it holds up.
---

# Claim Check

The user has one specific claim. Verdict first, evidence second, no essay.

## Method

1. **State the claim precisely.** Most claims fail or pass on their exact
   wording — pin down what version you're testing (who, what magnitude,
   what timeframe). If the user's version is ambiguous, test the strongest
   reasonable reading and say so.
2. **Trace to the origin.** Find where the claim actually comes from — the
   original study, dataset, statement, or filing. A thousand articles
   repeating one source is one source.
3. **Test against independent evidence.** Look for sources that don't share
   the origin. Note what supports, what contradicts, and what's merely
   repetition.
4. **Check the load-bearing details.** Claims often go viral in a mutated
   form — right study, wrong number; real quote, wrong context. Flag
   mutations explicitly.

## Output

- **Verdict** — one of: *holds up*, *holds up with caveats*, *misleading as
  stated*, *false*, or *unverifiable* — plus one sentence why.
- **The claim, precisely** — the version tested.
- **Evidence for** — cited, primary/secondary marked.
- **Evidence against / complications** — cited; never smoothed over.
- **Origin note** — where the claim started and how it mutated, if it did.
