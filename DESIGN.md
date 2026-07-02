---
name: SmartGreenhouse
description: Glanceable, daylight-first environmental monitoring dashboard
colors:
  primary: "#111827"
  neutral-bg: "#fcfbfa"
  surface: "#ffffff"
  muted-ink: "#4b5563"
  border: "#e5e7eb"
  status-normal: "#10b981"
  status-normal-strong: "#047857"
  status-warning: "#f59e0b"
  status-warning-strong: "#b45309"
  status-alert: "#ef4444"
  status-alert-strong: "#b91c1c"
  control-track-off: "#6b7280"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  card-container:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  status-badge:
    rounded: "9999px"
    padding: "4px 8px"
  primary-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
---

# Design System: SmartGreenhouse

## 1. Overview

**Creative North Star: "The Modern Greenhouse Operator"**

SmartGreenhouse is a high-contrast, task-oriented design system made to serve greenhouse operators under bright, sun-drenched environments. The design prioritizes scannability, clarity, and daylight accessibility above all else. Information density is carefully balanced to allow rapid health checks of critical crops within two seconds.

This system explicitly rejects complex engineering-style graphs, hacker-mode neon aesthetics, and saturated dark themes. The interface should behave as a silent, reliable tool, fading into the background unless an active alert demands attention.

**Key Characteristics:**
- Daylight-first high-contrast palette
- Clear, descriptive visual hierarchy
- Restrained color strategy focusing attention on semantic status alerts
- Large, touch-friendly interactive targets
- Every semantic color ships in two roles — a saturated "fill" tone for backgrounds/tints, and a darker "strong" tone reserved for anything that must pass text/icon contrast (badge text, chart lines, status dots)

## 2. Colors

The color palette is highly restrained, using clean off-whites and dark grays as the foundation, reserving saturated colors strictly for telemetry states and alert messaging.

### Primary
- **Deep Slate Ink** (#111827 / oklch(15% 0.01 240)): Used for text, structural headings, and dominant buttons.

### Neutral
- **Daylight Off-White** (#fcfbfa / oklch(98.5% 0.002 70)): The main background canvas. High-contrast under sunlight.
- **Card Surface White** (#ffffff): Card container background to separate telemetry items from the canvas.
- **Muted Ink** (#4b5563): Supporting text, secondary labels, and unit indicators. Verified 7.56:1 against both surface whites — safe for body-size supporting text.
- **Light Border** (#e5e7eb): Panel lines and card dividers only. Decorative — never use to convey a state (see Control Track Off below for that case).
- **Control Track Off** (#6b7280): Dedicated color for toggle/switch tracks in the "off" position. 4.83:1 against white — #e5e7eb was measured at only 1.24:1 and is not distinguishable enough to convey an interactive state.

### Status Colors
Each status has a **fill** tone (saturated, for badge/tint backgrounds and large decorative accents — not required to pass text contrast) and a **strong** tone (darker, for anything that has to be read or must pass 3:1/4.5:1 — badge text, status dots, chart lines, icons).

- **Vibrant Normal Green** — fill `#10b981`, strong `#047857` (5.48:1 on white, 3.77:1+ as a chart line, 4.5:1+ on its own 10%-tint badge background)
- **Warning Amber** — fill `#f59e0b`, strong `#b45309` (5.02:1 on white, 4.65:1 on its own 10%-tint badge background)
- **Alert Red** — fill `#ef4444`, strong `#b91c1c` (6.47:1 on white, 5.69:1 on its own 10%-tint badge background)

### Named Rules
**The 10% Alert Rule.** Saturated *fill* colors (green, amber, red) must never cover more than 10% of the screen area at any given time. Their high visual weight must be reserved exclusively to draw the operator's eye to alerts.

**The Fill/Strong Split Rule.** Never set a fill color as text, icon fill, chart-line stroke, or status-dot fill directly against a light background (white, off-white, or its own 10%-tint) — measured contrast is as low as ~2.3:1, well under AA. Always use the matching `-strong` token for those roles. Fill tones exist only to color badge/tint backgrounds and large non-informational accents.

## 3. Typography

**Display Font:** Inter, system-ui, sans-serif
**Body Font:** Inter, system-ui, sans-serif

The system uses a single clean sans-serif typeface to ensure consistency and readability across dense panels and small device screens.

### Hierarchy
- **Display** (Bold (700), 2.25rem, 1.2): Main page headers or large overview telemetry numbers.
- **Headline** (Semi-bold (600), 1.5rem, 1.3): Main section titles, card title emphasis.
- **Title** (Semi-bold (600), 1.125rem, 1.4): Sensor card titles, active alert headers.
- **Body** (Regular (400), 0.875rem, 1.5): Standard telemetry data, sidebar metadata, and descriptions. Max line length: 65ch.
- **Label** (Medium (500), 0.75rem, 1.4, Uppercase with 0.05em tracking): Badge labels, status titles, and table headers.

## 4. Elevation

The system utilizes tonal layering and subtle borders instead of soft, wide shadows. This reinforces a crisp, flat aesthetic that remains legible under direct sunlight.

### Shadow Vocabulary
- **At Rest**: Flat, no shadows. Containers use a solid 1px border (#e5e7eb) to separate themselves.
- **Hover / Active State**: A sharp, minimal shadow (`box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)`) is applied exclusively to interactive items (cards, primary buttons) when triggered.

### Named Rules
**The Flat-By-Default Rule.** Do not use shadows to convey depth or beauty. Depth is conveyed strictly by color tone (off-white vs. pure white) and solid borders.

## 5. Components

### Buttons
- **Shape:** Soft rectangular (4px radius)
- **Primary:** Deep Slate Ink (#111827) background with Daylight Off-White (#fcfbfa) text. Padding: 8px 16px.
- **Hover:** Light transition to an oklch tint, or a subtle opacity shift (90%).
- **Secondary:** Transparent background with 1px border (#e5e7eb) and Deep Slate Ink text.
- **Semantic action buttons** (e.g. "Trigger Hot Alert"): background = status `fill` tone at full opacity (not 10% tint), text = white (`#fcfbfa`). Do not pair a status `fill`/tint background with a same-hue text color — that combination consistently fails contrast (~2–3:1 measured across all three status hues).

### Status Badges
- **Shape:** Full pill (9999px radius)
- **Normal**: Light green background (10% opacity of `status-normal` #10b981) with `status-normal-strong` (#047857) text.
- **Warning**: Light amber background (10% opacity of `status-warning` #f59e0b) with `status-warning-strong` (#b45309) text.
- **Alert**: Light red background (10% opacity of `status-alert` #ef4444) with `status-alert-strong` (#b91c1c) text.

### Sensor Cards
- **Shape:** Rounded corners (8px radius)
- **Background:** Pure Card Surface White (#ffffff) with a 1px border (#e5e7eb).
- **Internal Padding:** Generous 24px (`spacing.lg`).
- **Layout**: Telemetry header, main reading text in Display weight, supporting sparkline, and status badge inline.
- **Sparkline stroke**: use the matching `-strong` status color (e.g. `#047857` for a normal reading), never the raw fill tone — the fill tone measures below 3:1 against a white card and fails the non-text contrast requirement for meaningful graphics.

### Inputs / Toggles
- **Switch Toggle**: Slide button for automated equipment override. The track uses `control-track-off` (#6b7280) when off, and switches to `status-normal` (#10b981) when active. (Do not use `border` #e5e7eb for the off-state track — it's nearly invisible against white/off-white surfaces and fails to convey the control's state.)
- **Input Fields**: 1px border (#e5e7eb) with 4px border radius. Focus state uses a solid 1px Deep Slate Ink (#111827) outline.
- **Focus indicator**: every interactive control (toggle, button, card, input) must render a visible focus ring on keyboard focus — minimum 2px, Deep Slate Ink or equivalent, never relying on color/background change alone.

## 6. Do's and Don'ts

### Do:
- **Do** check all text and status colors against a minimum contrast ratio of 4.5:1 for body and 3:1 for large display elements.
- **Do** ensure all clickable target elements (toggles, cards, buttons) have a minimum dimensions of 44×44px for touch safety.
- **Do** pair color changes with text labels (e.g. "Alert" + Red indicator) to accommodate color-blind operators.
- **Do** use the `-strong` variant of a status color for any text, icon, dot, or chart line — reserve the raw `fill` tone for backgrounds/tints only.
- **Do** give every toggle/switch a visible focus ring and an off-state track color that clears 3:1 against its surface.

### Don't:
- **Don't** use border-left or border-right accent stripes to denote status on cards. Use semantic badges instead.
- **Don't** implement dark hacker terminal interfaces. The dashboard is daylight-first.
- **Don't** use decorative page-load motion or complex transitions. Keep UI transitions snappy (under 150ms).
- **Don't** combine a 1px border with a soft wide shadow (blur > 8px) on cards or buttons. Pick one.
- **Don't** set a status `fill` color as text or stroke on a light/tint background of the same hue — this pattern measures as low as ~2.3:1 and fails AA every time.
- **Don't** reuse the neutral `border` (#e5e7eb) token for anything that needs to communicate state (e.g. toggle tracks) — it's a decorative divider color only, not a UI-component-contrast-safe color.