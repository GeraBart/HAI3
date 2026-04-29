# Slide 3 — Architecture

## Layout
Four Content Blocks

## Title
Four architectural pillars

## Items
1. **Explicit versioned contracts** — GTS default · pluggable type system (CTI here)
2. **Pluggable MFE handlers** — Strategies coexist · framework stays free to evolve
3. **Source sharing + blob-URL isolation** — Default handler · isolated package instances · enables Pillar 1
4. **Cross-runtime API cache** — Tooling layer · optional · MFEs unaware

## Speaker notes
Four layers, zero cross-dependencies at L1, plugin composition at L2. The interesting part is the four pillars.

First: explicit versioned contracts. Every boundary between host and MFE — the domains it registers into, the actions it can emit, the shared properties it can read — is a typed, versioned identifier, validated at runtime. FrontX ships with GTS as the default type system, but the type system itself is pluggable. This project will use CTI, the company's own. The point isn't which system you pick; it's that every boundary is typed and explicit. When a host speaks v1 and an MFE speaks v2, both coexist cleanly.

Second: pluggable handlers. How an MFE actually gets loaded into the page is abstracted. Different handlers can coexist for different MFE types — one for iframe-based MFEs if you need strict isolation, one for shared-instance modules if you need tight integration, and the default handler for the approach I'll describe next. New MFE strategies ship as new handlers rather than as framework forks. That's how FrontX itself can evolve, and it's how individual projects adapt when a single strategy doesn't fit.

Third — this is where FrontX's vision for MFE isolation lives — source sharing with blob-URL isolation. It's shipped as the default recommended MFE handler. And here's why it matters more than it might first appear: without isolation, shared singletons become implicit contracts. Two MFEs that both import React or the same store slice can communicate through that shared instance — bypassing the explicit contract surface entirely. Once that's possible, the explicit contracts are wishful thinking; you can't guarantee that an MFE update or a host update won't break something. So isolation isn't just about safety — it's what makes the contract system from Pillar 1 actually enforceable.

Mechanically: shared packages are cached once as source text, LRU-bounded, then re-evaluated into a fresh blob URL on every MFE load. Every MFE gets its own instance. No singletons, no implicit backchannels. Stateful packages — React, store slices — become safe to share. This project will use this handler. If another project needs a different approach, they write their own.

Fourth: cross-runtime API cache. Different character from the first three — it's tooling-level, not part of MFE contracts. A shared transport-layer cache that sits outside the contract surface entirely. When it's active, duplicate fetches across MFEs collapse. If it's absent, nothing breaks — requests duplicate, latency rises a bit, the app keeps working. It's an optimization, not a dependency.

Put these four together and the platform no longer needs build-time knowledge of any MFE. It discovers them at runtime through typed, runtime-validated contracts.
