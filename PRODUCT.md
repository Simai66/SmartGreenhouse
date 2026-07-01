# Product

## Register

product

## Users

Thai farmers and greenhouse owners who monitor and control their growing environment. They check conditions (temperature, humidity, light, soil moisture) throughout the day — often on a phone at the farm, sometimes on a laptop at home. Their primary job: confirm that everything is running within safe ranges, adjust settings when it's not, and catch problems before crops are damaged. Many are not tech-native; the interface must feel immediately understandable without training.

## Product Purpose

SmartGreenhouse gives greenhouse operators a single dashboard to observe real-time environmental conditions and control automated systems (fans, irrigation, shading). Success looks like: a grower opens the app, sees green (everything normal) or gets a clear, actionable alert — and trusts what the system tells them enough to act on it.

## Brand Personality

Functional, clean, trustworthy.

- **Functional**: every element earns its space. No decoration for its own sake.
- **Clean**: generous whitespace, clear hierarchy, calm palette. Information is scannable at a glance.
- **Trustworthy**: the interface communicates accuracy and reliability. Data feels precise; controls feel safe. The system earns confidence through consistency and clarity, not flashy visuals.

## Anti-references

- Generic IoT dashboards overloaded with dense charts, raw numbers, and engineering-grade graphs that feel intimidating rather than informative. Data presentation should be human-first: summarized, visualized simply, with detail on demand.
- Overly complex admin panels where every feature is visible at once. Progressive disclosure over feature sprawl.
- Dark/hacker terminal aesthetics. This is a tool for farmers under daylight, not a DevOps console.

## Design Principles

1. **Glanceable before deep** — The first thing a user sees answers "is everything okay?" in under 2 seconds. Detail is always available, never forced.
2. **Calm confidence** — The interface should feel calm when things are normal, and clearly (but not alarmingly) urgent when they're not. Status communication through color and hierarchy, not noise.
3. **Respect the operator** — Farmers are domain experts. Don't patronize with over-simplified toy UI or gamification. Show real data, presented clearly.
4. **One task, one screen** — Each view has a primary job. Avoid multi-purpose Swiss-army screens. Guide the user's attention.
5. **Daylight-first** — The primary use context is outdoors or in bright environments. Light theme by default; high contrast and readability are non-negotiable.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum across all surfaces.
- Body text contrast ≥ 4.5:1; large text ≥ 3:1.
- Touch targets ≥ 44×44px for mobile/tablet use at the farm.
- Color is never the sole indicator of status — always paired with icons, labels, or patterns.
- Reduced motion support via `prefers-reduced-motion`.
- Thai and English language support (i18n already scaffolded).
