# Slide 1 — What is FrontX

## Layout
Three Content Blocks

## Title
FrontX

## Items
1. **CLI** — Scaffold · install kit · validate
2. **AI tooling** — Cypilot kit, FrontX-aware
3. **MFE framework** — Runtime-composed · isolated · explicit

## Speaker notes
FrontX isn't one thing — it's an ecosystem of three parts that work as a closed loop. The CLI lays the ground, AI tooling does the work, and the framework runs it safely at runtime. Over the next ten minutes I'll show what each part does and — more importantly — what they add up to.

Two audiences matter here. For PMs and UX designers, FrontX is an AI-powered prototyping tool: describe what you want, get a working screen, hand it to developers to polish. For engineering teams, it's an MFE-based framework for shipping SaaS platforms where features deploy independently of the platform itself.

The three problems this exists to solve: first, traditional MFE setups couple build time and runtime — the platform has to know about every MFE at build time, so teams can't actually ship independently. Second, those setups rely on implicit contracts, which makes evolution risky. Third — relevant to everyone in the room — you can't hand a production frontend to an AI agent if it has to guess the rules. FrontX addresses all three with the same architectural ideas.
