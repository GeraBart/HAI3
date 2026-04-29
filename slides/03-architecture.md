# Slide 3 — How the MFE framework works

## Layout
- Left third: vertical **layer stack** L1 → L4 (SDK → Framework → React → App). Small labels; not the focus.
- Right two thirds: **four pillars** as a 2×2 grid. Each cell: short name (with optional tag) + brief "what" + italicized "why it matters". Length varies — pillar 3's takeaway is intentionally longer because it carries the keystone insight.
- Subtle caption at bottom tying pillars to runtime composition.

## Title
**Under the hood — four architectural pillars**

## Slide content

### Layer stack (left)
- **L4 — App** (product)
- **L3 — React bindings**
- **L2 — Framework** (plugin composition: `createHAI3().use(...)`)
- **L1 — SDK** (state · screensets · api · i18n — zero cross-deps)

### Four pillars (right)

**1. Explicit versioned contracts**
Every boundary — domains, actions, shared properties — is a typed, versioned ID.
Default type system: **GTS**. Pluggable — this project uses **CTI**, the company's own.
*→ typed boundaries, your choice of type system.*

**2. Pluggable MFE handlers**
MFE loading is abstracted. Different handlers can coexist for different MFE types — iframe-based, shared-instance, and others.
*→ new MFE approaches ship as new handlers; FrontX itself stays free to evolve; projects aren't locked in if they ever need something different.*

**3. Source sharing + blob-URL isolation**
Shipped as the default recommended MFE handler. Shared package source is cached once (LRU-bounded); each MFE gets its own isolated instance of each shared package.
*→ Without isolation, shared singletons would become implicit contracts that bypass the explicit ones — breaking compatibility on updates. Isolation is what makes Pillar 1 actually enforceable. Stateful packages safe to share too. Projects can swap the handler if needs differ.*

**4. Cross-runtime API cache** — *tooling, not contractual*
Implicit transport-layer optimization. Not part of MFE contracts.
*→ duplicate fetches collapse when enabled. If absent, requests duplicate — nothing breaks.*

### Bottom caption
**Together, the pillars enable runtime composition — the platform discovers MFEs at runtime through typed, runtime-validated contracts, not build-time configuration.**

## Speaker notes
Four layers, zero cross-dependencies at L1, plugin composition at L2. The interesting part is the four pillars.

**First: explicit versioned contracts.** Every boundary between host and MFE — the domains it registers into, the actions it can emit, the shared properties it can read — is a typed, versioned identifier, validated at runtime. FrontX ships with GTS as the default type system, but the type system itself is pluggable. This project will use CTI, the company's own. The point isn't which system you pick; it's that every boundary is typed and explicit. When a host speaks v1 and an MFE speaks v2, both coexist cleanly.

**Second: pluggable handlers.** How an MFE actually gets loaded into the page is abstracted. Different handlers can coexist for different MFE types — one for iframe-based MFEs if you need strict isolation, one for shared-instance modules if you need tight integration, and the default handler for the approach I'll describe next. New MFE strategies ship as new handlers rather than as framework forks. That's how FrontX itself can evolve, and it's how individual projects adapt when a single strategy doesn't fit.

**Third — this is where FrontX's vision for MFE isolation lives — source sharing with blob-URL isolation.** It's shipped as the default recommended MFE handler. And here's why it matters more than it might first appear: without isolation, shared singletons become implicit contracts. Two MFEs that both import React or the same store slice can communicate through that shared instance — bypassing the explicit contract surface entirely. Once that's possible, the explicit contracts are wishful thinking; you can't guarantee that an MFE update or a host update won't break something. So isolation isn't just about safety — it's what makes the contract system from Pillar 1 actually enforceable.

Mechanically: shared packages are cached once as source text, LRU-bounded, then re-evaluated into a fresh blob URL on every MFE load. Every MFE gets its own instance. No singletons, no implicit backchannels. Stateful packages — React, store slices — become safe to share. This project will use this handler. If another project needs a different approach, they write their own.

**Fourth: cross-runtime API cache.** Different character from the first three — it's tooling-level, not part of MFE contracts. A shared transport-layer cache that sits outside the contract surface entirely. When it's active, duplicate fetches across MFEs collapse. If it's absent, nothing breaks — requests duplicate, latency rises a bit, the app keeps working. It's an optimization, not a dependency. That's why MFEs don't have to know anything about it.

Put these four together and the platform no longer needs build-time knowledge of any MFE. It discovers them at runtime through typed, runtime-validated contracts. That's the unlock — and it's what the next slide is about.
