# Project Guidance

## User Preferences

- Luxury noir brand theme: pure black background, magenta-pink primary (#E91E63 family), gold accents (#FFD700 family), white text
- Elegant serif display font (Fraunces) for the brand wordmark with a pink-to-white gradient; General Sans for body text
- Arabic RTL Moroccan storefront; keep all UI copy in Arabic
- Brand logo is the two glossy shopping bags mark (magenta-pink + white with gold outlines) on black
- Keep the store fully functional: catalog browsing, product detail, cart, and admin CRUD

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- The design system is centralized in src/frontend/src/index.css OKLCH tokens plus tailwind.config.js; components consume semantic classes (bg-gradient-primary, text-price, bg-accent, card-product, badge-pill) so a token swap propagates widely.
- Dark-first theming works by putting the dark palette in :root and mirroring it in .dark, so components that toggle the dark class get a no-op and existing semantic class names keep working.
- Brand gradient text needs -webkit-text-fill-color transparent alongside color:transparent to render reliably across browsers.
- generate_image appends .dim_<W>x<H> to the filename, so reference the returned frontendSrc rather than the requested filename.
- A produced brand asset is only satisfied when a component actually references it; an orphaned file in public/ does not meet a 'placeholder uses brand colors' criterion. ProductImagePlaceholder is the shared branded fallback.
- The bundled font set has no Arabic-capable family; Arabic glyphs fall back to the system stack via --font-arabic.
- The existing Branding.test.tsx asserts the hero browse button keeps the bg-gradient-price class; a rebrand must preserve that hook or the test fails.
