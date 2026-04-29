# Slide 5 — Roadmap

## Layout
- Five-column matrix: rows = ecosystem capabilities, columns = versions (0.1 · 0.2-alpha · 0.2 · 0.3 · 0.?).
- Highlight the **0.2-alpha (now)** column with a "you are here" tint or marker.
- Cells stay short: feature name or "—" for "no work this version". **Bold** for headline items per version.
- Brief "Where we are" framing above the matrix to tell the migration story honestly (0.1 → 0.2-alpha → next).
- Footer: small italic note about the 0.2 SDLC artifacts cleanup (one-time process work).

## Title
**Roadmap**

## Slide content

### Where we are

**0.1 was pre-MFE.** It had early AI tooling and the CLI, but no MFE framework.

**0.2-alpha (now)** ships the MFE framework — pluggable handlers, source sharing + blob-URL isolation, explicit versioned contracts — plus cross-runtime API cache sharing. Every architectural prerequisite for a strict, well-optimized MFE ecosystem is in place. **AI tooling and screensets were intentionally cut** during the migration to keep the change surface manageable; both come back in later releases.

### Roadmap matrix

|  | 0.1 (Feb 14 snapshot, pre-MFE) | **0.2-alpha (now)** | 0.2 (~mid-May) | 0.3 | 0.? |
|---|---|---|---|---|---|
| **AI tooling** | initial | — | **FrontX Cypilot kit** | FrontX Cypilot kit | FrontX Cypilot kit · Lovable-like experience |
| **CLI** | templates baked in | templates baked in | templates baked in | template-agnostic | template-agnostic |
| **Templates** | — | — | — | simple no-MFE · host · MFE | simple no-MFE · host · MFE |
| **MFE framework** | — | **shipped** | shipped | shipped | shipped |
| **Tooling & quality** | — | **API cache** | API cache | API cache · [?] unit tests · [?] auth + RBAC | API cache · performance · observability · unit tests · [?] auth + RBAC |
| **Screensets** | shipped | — | — | — | restored |

### Footer (small print)
*0.2 also includes a deep cleanup of SDLC artifacts (one-time process work, not a runtime feature).*

## Speaker notes
Where we are and where we're going. I want to be honest about both.

Quick context: **0.1 was a pre-MFE version.** It had the early AI tooling and the CLI, but no MFE framework. We're now on **0.2-alpha**, and what shipped is significant: the MFE framework with the four pillars I just described, and the cross-runtime API cache. Every architectural prerequisite for a strict, well-optimized MFE ecosystem is in place.

One honest call-out: **AI tooling and screensets were intentionally cut** during this migration. Evolving them alongside the framework would have meant a much larger change surface, so we deliberately scoped them out to keep the migration tractable. So 0.2-alpha is the framework foundation — strong, but currently without the AI tooling and screensets that 0.1 had. That's by design. AI tooling returns in 0.2; screensets restoration is in the longer-horizon milestone.

From here:

**0.2** (planned ~3 weeks out)**.** The big bet is **AI tooling — shipping the FrontX Cypilot kit** aligned with the new framework. That brings the third leg of the ecosystem back online. Alongside it: a deep cleanup of SDLC artifacts and targeted bug fixes in the MFE and API packages.

**0.3.** Distribution and the starting experience. The CLI evolves from "templates baked in" — which doesn't scale as new MFE templates are added — to template-agnostic. The first formal template lineup ships too: simple no-MFE app, host app, and MFE. This turns FrontX from a framework into a repeatable workflow. Unit tests and auth/RBAC are on the list for this milestone but still tentative.

**0.? (longer horizon).** Screensets restoration; performance, observability, and proper test coverage; and the **Lovable-like experience** where AI-first UI building becomes a product surface of FrontX itself. Not dating it yet — that's the vision, not the commitment.

If you remember one thing from this talk: FrontX is the CLI, the AI tooling, and the MFE framework together — not any one of them alone. Today the framework lead is shipped. Next we bring AI tooling back to match.
