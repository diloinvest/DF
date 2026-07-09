# Workflow Best Practices

## LAYER 01: Workflow + Mindset

### Plan before you prompt

Claude talking is cheap. Claude building is expensive. Most people figure out what they want while prompting — that's where tokens die. Write the intent down in one line before opening a chat.

### Ask for clarifying questions

Before any large task: 'Ask me 5 clarifying questions before building anything.' One good build beats six rebuilds. This single prompt saves hours.

### Control output length

Most people let Claude default to 2,000 words when they need 100. 'One paragraph.' 'Five bullets.' 'Checklist format.' Massive lever nobody talks about.

### Long chats are a tax

Every message re-sends the full history. 50 turns deep = roughly 10x the cost of a fresh chat. Context carry-over feels productive. It isn't. Start new chats aggressively.

### Parallel beats long

Three focused chats on three problems beats one mega-chat juggling all three. Context bloat is exponential. Split, don't stack.

### Projects over re-pasting

Stop re-pasting the same documents every chat. Load them into a Project once. Reuse forever. Project content is cached and doesn't count against your limit when reused.

### Attach files, don't paste them

Attached files sit in one place. Pasted text sits in every message going forward. Paste a 10-page doc into a 50-turn chat — that's the doc sent 50 times.

### Turn off extended thinking for simple tasks

Extended thinking burns tokens. Leave it off for routine work. Turn it on only when the task genuinely requires deep reasoning. Most people leave it permanently on and wonder why they hit walls.

### Build a memory file system

Keep a folder of instructions Claude auto-loads at the start of every chat. Self-updating — it writes back to the file as sessions end. Next session starts from where you left off. I never re-explain context. This one system saves me ~30% of my usage.

### In Claude Code: /compact and /clear

/clear wipes the chat. /compact summarizes it and keeps going. Use /clear when switching tasks, /compact when continuing a long one. The single most effective lever in Claude Code.

## THE ROOT CAUSE

Most 'I hit my limit by lunchtime' reports trace back to one of these:

- Long wandering sessions
- Opus left on by default
- Huge pastes that sit in context forever

Fix those three and the limit feels very different.
