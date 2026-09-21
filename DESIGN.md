# Design Brief

## Direction

Noir Magenta — a pure-black luxury boutique where magenta-pink and gold light up the page, and the serif wordmark is the jewel at the center.

## Tone

Refined feminine luxury: glossy, jewel-like, editorial — closer to a Parisian atelier than a bazaar.

## Differentiation

The brand wordmark is the loudest object: an elegant serif rendered in the logo's pink→white vertical gradient with a gold sparkle underline, echoed on every section heading.

## Color Palette

| Token            | OKLCH          | Hex       | Role                                        |
| ---------------- | -------------- | --------- | ------------------------------------------- |
| background       | 0.145 0.006 320 | #000000   | Pure black canvas                           |
| foreground       | 0.97 0.004 320  | #F7F5F6   | Near-white text, WCAG AA on black           |
| card             | 0.205 0.008 320 | #0D0D0E   | Lifted near-black product surfaces          |
| primary          | 0.62 0.24 358   | #E91E63   | Magenta-pink — brand, nav, active states    |
| accent           | 0.84 0.16 92    | #FFD700   | Metallic gold — sparkle, highlights, rules  |
| price            | 0.85 0.165 90   | #FFD84D   | Price / promo — luminous gold numerals      |
| muted            | 0.255 0.012 320 | #1A1A1C   | Section alternation, chips, skeleton fills  |
| muted-foreground | 0.68 0.012 320  | #9A979C   | Secondary labels, descriptions              |
| success          | 0.72 0.16 152   | #4ECB8A   | Availability / in-stock badge               |
| warning          | 0.82 0.15 82    | #F0C24B   | Low stock badge                             |
| destructive      | 0.62 0.21 22    | #F2455A   | Out of stock, remove item                   |
| border / input   | 0.3 0.014 320   | #2A282C   | Hairlines — subtle dark, never light        |

## Typography

- Display: Fraunces — elegant high-contrast serif matching the logo wordmark; headings, hero, product titles
- Body: General Sans — clean geometric sans for paragraphs, labels, buttons; weight 400
- Mono: JetBrains Mono — prices, quantities, SKUs (tabular-nums, `.num` / `.text-price`)
- Brand: `.brand-heading` applies the pink→white vertical gradient text used in the logo
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-4xl font-bold`, label `text-xs font-semibold tracking-widest`, body `text-base leading-relaxed`
- Note: the bundled font set has no Arabic-capable family, so Arabic glyphs render from the system Arabic stack; a webfont Arabic face can be dropped into `public/assets/fonts/` later without touching component code

## Elevation & Depth

Black canvas with near-black cards lifting off it via luminous glow — `shadow-xs` at rest, `shadow-card-hover` (pink halo) on lift; gold glow reserved for sparkle accents.

## Structural Zones

| Zone    | Background          | Border     | Notes                                                    |
| ------- | ------------------- | ---------- | -------------------------------------------------------- |
| Header  | `bg-card`           | `border-b` | Sticky, brand wordmark right, search centered, cart left |
| Content | `bg-background`     | —          | Alternates `bg-muted/40` between sections                 |
| Footer  | `bg-muted/40`       | `border-t` | Contact + payment/shipping notes, muted-foreground text  |

## Spacing & Rhythm

Sections gap `py-16 md:py-24`; page gutter `px-4 md:px-8` inside a `max-w-7xl` container; product grids `gap-5 md:gap-6`; micro-spacing `gap-2`/`gap-3` inside cards.

## Component Patterns

- Buttons: pill radius, `bg-gradient-primary` magenta for buy (pink glow on hover), gold outline for secondary; hover lifts 1px
- Cards: `rounded-[1.25rem]`, `bg-card`, 1px dark border, `shadow-xs` → pink-halo `shadow-card-hover` + `-translate-y-1` on hover
- Badges: pill, tinted fills — success for in-stock, warning/gold for low, destructive for out
- Prices: `.text-price` mono numerals, luminous gold, `price-pop` on add-to-cart
- Headings: `.brand-heading` gradient text; `.accent-sparkle` gold underline flourish

## Motion

- Entrance: `animate-fade-up` staggered ~60ms across grid items, 0.5s cubic-bezier(0.22, 1, 0.36, 1)
- Hover: `transition-smooth` (0.3s) on lift, pink glow, border color, image zoom `scale-105`
- Decorative: `animate-fade-in` for overlays; no bouncy or looping motion

## Constraints

- RTL by default: `html`/`body` set `direction: rtl`; use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`)
- Latin numerals and SKUs must use `.num` / `[dir="ltr"]` so they read left-to-right inside Arabic text
- Semantic tokens only — no hex, no `bg-[#...]`, no inline colors
- Dark is the shipped theme: `:root` holds the black luxury palette; `.dark` mirrors it exactly

## Signature Detail

Wordmark-as-jewel: the pink→white gradient serif heading with a gold sparkle underline — the one element allowed to glow.
