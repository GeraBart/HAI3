# Slide 5 — Roadmap

## Layout
Timeline (5 years)

## Title
Roadmap

## Items
1. **0.1** | **pre-MFE** | AI tooling + CLI · no MFE framework
2. **0.2-alpha** | **MFE foundation** | Framework · isolation · API cache · AI tooling cut
3. **0.2** | **AI tooling returns** | FrontX Cypilot kit · SDLC cleanup · bug fixes
4. **0.3** | **Distribution** | Template-agnostic CLI · 3 templates · tests + auth
5. **0.?** | **Vision** | Lovable-like UX · screensets · perf + observability

## Speaker notes
Where we are and where we're going. I want to be honest about both.

Quick context: 0.1 was a pre-MFE version. It had the early AI tooling and the CLI, but no MFE framework. We're now on 0.2-alpha, and what shipped is significant: the MFE framework with the four pillars I just described, and the cross-runtime API cache. Every architectural prerequisite for a strict, well-optimized MFE ecosystem is in place.

One honest call-out: AI tooling and screensets were intentionally cut during this migration. Evolving them alongside the framework would have meant a much larger change surface, so we deliberately scoped them out to keep the migration tractable. So 0.2-alpha is the framework foundation — strong, but currently without the AI tooling and screensets that 0.1 had. That's by design. AI tooling returns in 0.2; screensets restoration is in the longer-horizon milestone.

From here:

0.2 (planned ~3 weeks out). The big bet is AI tooling — shipping the FrontX Cypilot kit aligned with the new framework. That brings the third leg of the ecosystem back online. Alongside it: a deep cleanup of SDLC artifacts and targeted bug fixes in the MFE and API packages.

0.3. Distribution and the starting experience. The CLI evolves from "templates baked in" — which doesn't scale as new MFE templates are added — to template-agnostic. The first formal template lineup ships too: simple no-MFE app, host app, and MFE. This turns FrontX from a framework into a repeatable workflow. Unit tests and auth/RBAC are on the list for this milestone but still tentative.

0.? (longer horizon). Screensets restoration; performance, observability, and proper test coverage; and the Lovable-like experience where AI-first UI building becomes a product surface of FrontX itself. Not dating it yet — that's the vision, not the commitment.

If you remember one thing from this talk: FrontX is the CLI, the AI tooling, and the MFE framework together — not any one of them alone. Today the framework lead is shipped. Next we bring AI tooling back to match.
