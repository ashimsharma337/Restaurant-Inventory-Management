# Color Tokens Guide - Culinary Architect

This explains `variables.scss`: where the runtime tokens live, why these
colors were chosen, and how components should consume them.

## 1. What the numbers (50–900) mean

This is the same convention Tailwind CSS and Material Design use — a
**tint/shade scale** built around one base color:

| Step | What it is | Typical use |
|------|-----------|--------------|
| 50–100 | Very light tints (mostly white, a hint of color) | Page section backgrounds, subtle hover backgrounds |
| 200–300 | Light tints | Borders, dividers, disabled states |
| 400 | Slightly muted version of the base | Secondary icons, less prominent accents |
| **500** | **The base color** — what you'd point to and call "the brand color" | Primary buttons, active nav items, links |
| 600 | One step darker | Hover/pressed state for a 500 fill |
| 700 | Darker still | **Text or icons on a white background** — 500 usually isn't dark enough to pass 4.5:1 contrast on its own, 700 is |
| 800–900 | Darkest | Dark-mode surfaces, high-emphasis text, rarely used in a light-only UI |

You don't need to memorize hex values — you pick the *step*, not the color.
"I need brand text on white" -> `var(--brand-700)`. "I need a hover state for a
brand button" -> `var(--brand-500)`. That's the whole system.

## 2. Why these specific colors

- **Brand (`--brand-500` `#0F6E6E`, deep teal):** Deliberately not red/orange
  (the "food app" default) because this is an operations tool, not a
  consumer menu app. Teal reads clean/professional and — critically —
  doesn't overlap with the red/amber/green used for stock status, so the
  two systems never visually collide.
- **Status colors (success/warning/danger):** Shifted off textbook
  red/amber/green toward the Okabe-Ito colorblind-safe hue set, so the two
  most common color-vision deficiencies (deuteranopia/protanopia — red-green
  confusion) don't read success and danger as similar.
- **Every status value was contrast-checked**, not eyeballed. Recheck the
  ratios if a status color changes.

## 3. The one rule that matters most: color is never the only signal

Because all three status colors have to pass WCAG AA text contrast, they end
up at nearly identical *darkness* (luminance ~0.11–0.13). That means:

- In grayscale, or for a user with total color blindness, the three status
  colors look almost the same.
- **Every status indicator must pair color with an icon shape AND a text
  label.** Use a shape-specific icon every time, never a bare
  colored dot or chip.

## 4. How to use the file

1. Change values in `variables.scss`; it is imported by `globals.scss` and
  emits the app-wide CSS custom properties.
2. In components, use `var(--brand-700)`, `var(--surface-raised)`, and
  `var(--success)` rather than raw hex values.
3. `globals.scss` is still needed because it is the global Next.js stylesheet
  entry point and loads Tailwind's base, components, and utilities.
4. MUI's theme keeps matching literal values because MUI validates and derives
  palette colors during theme creation; it cannot use `var(...)` there.

## 5. Before shipping

Run the rendered badges (color + icon + label together) through a color
blindness simulator — [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/)
or the Stark plugin for Figma — to confirm the icon shapes are doing their
job visually, not just in theory.

## 6. WCAG and contrast accessibility

### What WCAG is

**WCAG** means **Web Content Accessibility Guidelines**. It is an international
standard published by the World Wide Web Consortium (W3C) through its Web
Accessibility Initiative (WAI). WCAG explains how websites and applications
can be made usable by people with disabilities, including people with visual,
auditory, motor, speech, cognitive, and neurological disabilities.

WCAG is organized around four principles. Content should be:

- **Perceivable:** users can receive the information, for example through
  readable text, sufficient color contrast, captions, or alternative text.
- **Operable:** users can interact with controls using different input methods,
  including a keyboard.
- **Understandable:** content and interactions behave consistently and can be
  understood.
- **Robust:** content works with different browsers, devices, and assistive
  technologies.

For this color system, the most relevant WCAG topic is **contrast**. Contrast
is the visual difference between foreground content, such as text or an icon,
and its background. Sufficient contrast helps people with low vision, color
vision deficiency, age-related vision changes, or a low-quality display.

### How WCAG contrast is calculated

WCAG contrast is based on **relative luminance**, which represents how bright a
color appears to the human eye. The calculation has three main stages:

1. Convert each sRGB red, green, and blue channel from its 0-255 value to a
  normalized value between 0 and 1.
2. Linearize each channel, because sRGB values are gamma-encoded rather than
  proportional to actual light intensity.
3. Combine the linearized channels using their perceptual weights:
  red `0.2126`, green `0.7152`, and blue `0.0722`.

For two colors, let `L1` be the higher relative luminance and `L2` be the
lower. The contrast ratio is:

```text
contrast ratio = (L1 + 0.05) / (L2 + 0.05)
```

The result ranges from `1:1` for identical colors to `21:1` for black against
white. The `0.05` adjustment prevents very dark colors from producing an
unstable ratio near zero.

### WCAG conformance levels

WCAG defines three conformance levels:

- **AA:** the usual target for production websites and applications.
- **AAA:** a stricter level for cases that require enhanced accessibility.
- **A:** the minimum level, covering the most basic requirements.

For WCAG 2.1 and WCAG 2.2, the commonly used contrast targets are:

| Content | AA | AAA |
|---------|----|-----|
| Normal text | At least `4.5:1` | At least `7:1` |
| Large text | At least `3:1` | At least `4.5:1` |
| User interface components and graphical objects needed to understand content | At least `3:1` | No separate AAA ratio |

Large text generally means at least 18 point regular text or 14 point bold
text. Contrast is only one part of WCAG: passing a color ratio does not by
itself make an entire page accessible. Keyboard access, focus states, labels,
semantic structure, motion, forms, and screen-reader behavior also matter.

### Why WCAG is important

WCAG makes accessibility measurable instead of leaving it to personal
preference or visual guesswork. Good contrast can:

- make text and controls easier to read in bright light, glare, or on a dim
  display;
- reduce errors when users scan tables, warnings, and forms;
- help people with low vision or color vision deficiency distinguish content;
- improve usability for nearly everyone, including users on mobile devices;
- provide a common baseline for design, engineering, testing, and accessibility
  reviews; and
- support legal and procurement requirements where accessibility conformance is
  required.

Color must not be the only way information is communicated. A user who cannot
distinguish red from green should still be able to understand inventory state
from an icon, text label, shape, position, or another non-color signal. That is
why this guide requires status indicators to include both a shape-specific icon
and a text label.

### Where WCAG is commonly followed

WCAG is widely used as the practical accessibility benchmark for public
websites, mobile and desktop applications, government services, education,
healthcare, banking, commerce, and enterprise software. It is also referenced
by accessibility laws, regulations, contracts, and procurement standards in
many regions, including Section 508-related U.S. government work and the
European EN 301 549 framework.

The exact legal requirement depends on the product, organization, audience,
and country. Saying that a product follows WCAG is not automatically the same
as proving legal compliance; an accessibility audit must consider the complete
user experience.

### How WCAG is implemented in this project

This project uses WCAG as a design and review target for its color tokens:

1. `src/styles/variables.scss` defines the runtime brand, neutral, and status
  CSS custom properties. Components consume them through `var(--token)` so a
  palette change is centralized.
2. The status colors are dark enough to support readable text on light
  backgrounds. Representative ratios against white are approximately:
  `--success` `#04724D` at `5.97:1`, `--warning` `#8A5300` at `6.33:1`, and
  `--danger` `#B3271A` at `6.52:1`. These pass the `4.5:1` AA target for
  normal text.
3. `src/styles/globals.scss` loads the token stylesheet and exposes the
  variables globally. `src/pages/_app.js` loads that global stylesheet for
  every page.
4. Status indicators must combine color with a text label and a distinct icon
  shape. In this system, the intended shapes are a check circle for in-stock,
  an alert triangle for low stock, and an X/octagon shape for expired or out
  of stock.
5. The color-blindness review recommended in section 5 checks that the status
  meaning remains understandable when hue differences are reduced or removed.

These checks improve the color accessibility of the inventory interface, but
they do not claim that the entire application is WCAG-conformant. A complete
review would also test keyboard navigation, focus visibility, form labels,
semantic HTML, screen-reader output, zoom and reflow, motion, and error
messaging.
