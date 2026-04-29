# Slide 1 — What is FrontX?

## Layout
- Title + one-line subtitle at the top.
- Body split into three blocks, top to bottom:
  1. **Three parts** (the ecosystem — small icons or a 3-circle diagram)
  2. **Two audiences** (two-column)
  3. **Three problems** (three short bullets)
- No long prose on slide. Bullets are cue cards; the talk carries it.

## Title
**FrontX**

## Subtitle
An ecosystem for building SaaS UIs — *CLI · AI tooling · MFE framework* — so humans and AI can ship together.

## Slide content

### Three parts, one loop
- **CLI** — scaffolds projects, installs Cypilot with FrontX kit, validates what you build
- **AI tooling** — Cypilot kit: FrontX-aware skills, templates, validators
- **MFE framework** — runtime-composed, explicit contracts, isolated by design

### Two audiences, one product
- **PMs · UX designers** — prototype with AI, hand off to developers
- **Engineering teams** — build production SaaS, ship MFEs independently

### The problems FrontX solves
- **Build-time coupling** — classic MFE hosts need build-time knowledge of remotes → platform rebuild on every MFE release
- **Contract drift** — implicit host↔MFE boundaries → breaking changes propagate silently
- **AI-collaboration gap** — without explicit contracts, AI agents guess → unsafe for production

## Speaker notes
FrontX isn't one thing — it's an ecosystem of three parts that work as a closed loop. The CLI lays the ground, AI tooling does the work, and the framework runs it safely at runtime. Over the next ten minutes I'll show what each part does and — more importantly — what they add up to.

Two audiences matter here. For PMs and UX designers, FrontX is an AI-powered prototyping tool: describe what you want, get a working screen, hand it to developers to polish. For engineering teams, it's an MFE-based framework for shipping SaaS platforms where features deploy independently of the platform itself.

The three problems this exists to solve: first, traditional MFE setups couple build time and runtime — the platform has to know about every MFE at build time, so teams can't actually ship independently. Second, those setups rely on implicit contracts, which makes evolution risky. Third — relevant to everyone in the room — you can't hand a production frontend to an AI agent if it has to guess the rules. FrontX addresses all three with the same architectural ideas.
