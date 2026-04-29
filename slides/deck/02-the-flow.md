# Slide 2 — The flow

## Layout
5 steps w icons

## Title
One flow, three parts working together

## Items
1. **Install** — `frontx` CLI, globally
2. **Create** — Pick template; CLI scaffolds + installs Cypilot with FrontX kit
3. **Build** — AI skills add features
4. **Validate** — CLI checks output; agent self-corrects
5. **Ship** — MFE-only deploy; host doesn't rebuild

## Speaker notes
This is the flow, end to end. One engineer or one PM starts with an empty directory and ends with a production MFE — without the platform team rebuilding anything.

You install the CLI once, globally. You run `frontx create` and pick a template: a simple no-MFE app if you're building a standalone product, or an MFE-based platform if you're building something composable. The CLI scaffolds the project, and — this is the important part — it also installs Cypilot and the FrontX Cypilot kit into your project. So from the moment the project exists, it comes with AI tooling tuned for FrontX baked in.

From there, whoever is driving — PM, designer, developer — uses AI skills from the kit to add functionality. New screen, new MFE, new component. Each skill knows the FrontX rules. And crucially, the skills don't just generate code — they call the CLI's validators to check their own output. So when the AI agent makes a mistake, the CLI tells it, and the agent fixes it. That's the deterministic feedback loop that makes AI collaboration actually safe in production.

When you're ready to ship new content, you deploy the MFE alone — the host doesn't need to rebuild to pick it up. The platform still evolves — it has its own release track, and AI tooling helps there too — but the two tracks don't block each other. The framework also makes it obvious which work is which: are you changing the platform, or are you bringing new content into it? That clean separation is what makes team independence real.

Three parts. One loop. The rest of this talk is about why the framework underneath makes this possible.
