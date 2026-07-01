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
  status-warning: "#f59e0b"
  status-alert: "#ef4444"
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

## 2. Colors

The color palette is highly restrained, using clean off-whites and dark grays as the foundation, reserving saturated colors strictly for telemetry states and alert messaging.

### Primary
- **Deep Slate Ink** (#111827 / oklch(15% 0.01 240)): Used for text, structural headings, and dominant buttons.

### Neutral
- **Daylight Off-White** (#fcfbfa / oklch(98.5% 0.002 70)): The main background canvas. High-contrast under sunlight.
- **Card Surface White** (#ffffff): Card container background to separate telemetry items from the canvas.
- **Muted Ink** (#4b5563): Supporting text, secondary labels, and unit indicators.
- **Light Border** (#e5e7eb): Panel lines, dividers, and card borders.

### Status Colors
- **Vibrant Normal Green** (#10b981 / oklch(70% 0.17 150)): Safe system operations and stable sensors.
- **Warning Amber** (#f59e0b / oklch(75% 0.18 70)): Approaching thresholds.
- **Alert Red** (#ef4444 / oklch(60% 0.22 25)): Critically out-of-bounds sensor readings.

### Named Rules
**The 10% Alert Rule.** Saturated colors (green, amber, red) must never cover more than 10% of the screen area at any given time. Their high visual weight must be reserved exclusively to draw the operator’s eye to alerts.

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

### Status Badges
- **Shape:** Full pill (9999px radius)
- **Normal**: Light green background (10% opacity of #10b981) with Vibrant Normal Green (#10b981) text.
- **Warning**: Light amber background (10% opacity of #f59e0b) with Warning Amber (#f59e0b) text.
- **Alert**: Light red background (10% opacity of #ef4444) with Alert Red (#ef4444) text.

### Sensor Cards
- **Shape:** Rounded corners (8px radius)
- **Background:** Pure Card Surface White (#ffffff) with a 1px border (#e5e7eb).
- **Internal Padding:** Generous 24px (`spacing.lg`).
- **Layout**: Telemetry header, main reading text in Display weight, supporting sparkline, and status badge inline.

### Inputs / Toggles
- **Switch Toggle**: Slide button for automated equipment override. The track uses a light neutral (#e5e7eb) when off, and switches to Vibrant Normal Green (#10b981) when active.
- **Input Fields**: 1px border (#e5e7eb) with 4px border radius. Focus state uses a solid 1px Deep Slate Ink (#111827) outline.

## 6. Do's and Don'ts

### Do:
- **Do** check all text and status colors against a minimum contrast ratio of 4.5:1 for body and 3:1 for large display elements.
- **Do** ensure all clickable target elements (toggles, cards, buttons) have a minimum dimensions of 44×44px for touch safety.
- **Do** pair color changes with text labels (e.g. "Alert" + Red indicator) to accommodate color-blind operators.

### Don't:
- **Don't** use border-left or border-right accent stripes to denote status on cards. Use semantic badges instead.
- **Don't** implement dark hacker terminal interfaces. The dashboard is daylight-first.
- **Don't** use decorative page-load motion or complex transitions. Keep UI transitions snappy (under 150ms).
- **Don't** combine a 1px border with a soft wide shadow (blur > 8px) on cards or buttons. Pick one.
