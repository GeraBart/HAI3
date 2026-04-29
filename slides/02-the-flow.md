# Slide 2 — The flow: install to production

## Layout
- Centerpiece slide. Horizontal 6-step flow across the middle of the slide.
- Each step: icon + one-line label + tiny sub-line with the command or artifact.
- Color code the three ecosystem parts: **CLI** (e.g. blue), **AI tooling** (e.g. purple), **Framework** (e.g. teal). Each step tinted by which part is "active".
- Short caption under the flow naming the closed loop.

## Title
**One flow, three parts working together**

## Slide content (the 6 steps)

1. **Install the CLI** *(CLI)*
   `npm i -g @cyberfabric/cli`

2. **Create a project** *(CLI)*
   `frontx create` → pick a template (simple app · MFE-based platform · MFE)

3. **CLI scaffolds + installs Cypilot with FrontX kit** *(CLI → AI tooling)*
   Project skeleton · Cypilot installed · **FrontX Cypilot kit** installed

4. **Build features with AI skills** *(AI tooling)*
   `frontx-new-screen` · `frontx-new-mfe` · `frontx-new-component` · …

5. **Validate via the CLI** *(AI tooling → CLI)*
   AI skills call `frontx validate` → deterministic feedback → agent self-corrects

6. **Ship — MFE on its own track** *(Framework)*
   MFE ships without rebuilding the host · platform evolves separately · runtime discovery via contracts

### Caption under flow
**CLI lays the ground · AI does the work · framework runs it safely at runtime.**

## Speaker notes
This is the flow, end to end. One engineer or one PM starts with an empty directory and ends with a production MFE — without the platform team rebuilding anything.

You install the CLI once, globally. You run `frontx create` and pick a template: a simple no-MFE app if you're building a standalone product, or an MFE-based platform if you're building something composable. The CLI scaffolds the project, and — this is the important part — it also installs Cypilot and the **FrontX Cypilot kit** into your project. So from the moment the project exists, it comes with AI tooling tuned for FrontX baked in.

From there, whoever is driving — PM, designer, developer — uses AI skills from the kit to add functionality. New screen, new MFE, new component. Each skill knows the FrontX rules. And crucially, the skills don't just generate code — they call the CLI's validators to check their own output. So when the AI agent makes a mistake, the CLI tells it, and the agent fixes it. That's the deterministic feedback loop that makes AI collaboration actually safe in production.

When you're ready to ship new content, you deploy the MFE alone — the host doesn't need to rebuild to pick it up. The platform still evolves — it has its own release track, and AI tooling helps there too — but the two tracks don't block each other. The framework also makes it obvious which work is which: are you changing the platform, or are you bringing new content into it? That clean separation is what makes team independence real.

Three parts. One loop. The rest of this talk is about why the framework underneath makes this possible.
