# Decisions

Captures every judgement call made in the scaffold that wasn't fully specified in the brief. Each entry is a decision + reasoning so future maintainers can see why something is the way it is.

## Rebrand (May 2026): Arcade Lab → shipit.fun

The project was scaffolded under the working name "Arcade Lab" and rebranded to **shipit.fun** before launch. "Arcade Lab" was killed because of crowded space (Arcade.dev, Arcade.software, Arcade.ai, Arcade.studio, Chris Pirillo's Vibe Coding Arcade). shipit.fun was chosen for: (a) "ship it" is universal dev culture phrase, (b) ".fun" is a real entertainment-purpose gTLD, (c) zero brand collisions.

The visual identity moved from dark + electric cyan (v0 scaffold) to the sunset / mixtape palette (cream, off-white, bubblegum, sunset orange, riso purple, jet) per the brand hub. This commit does a **minimal palette swap**: token names in Tailwind (bg, accent, warm, lime) are kept and merely redefined to the new values, so existing className references keep working without component-level redesign. A full visual rebuild with cassette motifs, Press Start 2P pixel accents, and dedicated component patterns is planned as a follow-up.

## Stack

- **Package manager:** npm (workspaces) instead of pnpm. The brief said monorepo via Turborepo and Vercel deployment, and npm is the path of least friction with both. Contributors don't need to install pnpm globally.
- **Next.js version:** 14.2.x (App Router) per the brief. Pinned via caret range.
- **TypeScript strict:** enabled at root with `noUncheckedIndexedAccess` and `noImplicitOverride` for stricter contracts.
- **Tailwind:** v3.4 (not v4 alpha) for stability across packages.
- **Framer Motion:** v11.

## Visual Identity (current — sunset / mixtape edition)

- **Page background:** cream `#fde9c8`
- **Card / surface background:** off-white `#faf7f0`
- **Primary accent:** bubblegum `#ff6fb5` (replaces the v0 electric cyan)
- **Secondary warm:** sunset orange `#ff7a3d`
- **Tertiary cool:** riso purple `#8b5cf6` (occupies the slot of the v0 acid lime)
- **Text / depth:** jet `#1a1a1a` (no pure black, no pure white)
- **Type pairing:** Fraunces (display serif, weights 300/400/500/600 + italics) for headlines, DM Sans (400/500/600) for body, Press Start 2P (loaded via `var(--font-pixel)`) for future pixel accents.
- **Texture:** Multiply-blend grain at ~4% opacity. Scanlines retained but tuned to jet 4%.

## Information Architecture

- `/`: hero + experiments grid + contributors strip + footer
- `/experiments/[slug]`: full-bleed iframe + about-this-experiment + related
- `/contributors`: grid of contributor cards
- `/contributors/[handle]`: bio + experiments authored
- `/about`: mission, contributing CTA, founding-contributor credit

## Iframe Strategy for Games

- Games are static HTML in `/games/[slug]/`. In dev they're served by Next.js as static assets via the `public/games-static/` symlink convention.
- For V0 we copy `games/` into `apps/web/public/games-static/` at build time using a postinstall-style script. To keep V0 zero-config, the dev path uses `iframe src="/games-static/[slug]/index.html"` and we document that contributors should symlink or copy. A `prebuild` script copies on Vercel.
- This avoids needing CORS or a separate domain in V0.

## Experiment Registry vs Filesystem Discovery

- The brief shows `experiments.ts` as the source of truth. We honor that: the array in `apps/web/data/experiments.ts` is canonical for what shows in the gallery.
- The `experiment.json` file inside each game folder is the contributor-authored truth and is referenced in CONTRIBUTING.md, but for V0 the web app reads the `.ts` array directly. A future iteration can introspect `experiment.json` files at build time.

## Gesture-Core API Shape

- Detection thresholds for `getGesture` are intentionally simple (angle/distance heuristics on landmark points) and documented inline so contributors can swap in better detectors. Real production gesture detection often needs ML; V0 ships heuristics that work well enough for "fist / open palm / pointing / peace / thumbs_up / gun".
- MediaPipe is loaded from the `@mediapipe/hands` and `@mediapipe/pose` npm packages with their CDN-hosted WASM, since the bundlers don't ship the binaries gracefully.

## What V0 Deliberately Skips

- No CMS. Registries are TypeScript files, edited via PR.
- No auth, no submissions form, no payments.
- No actual game logic for `superhero-gesture` or `finger-gun-shooter`. Just the shells.
- No animation on the iframe content itself; the lift/glow is on the card only.
- No analytics. Add later via Vercel Analytics if desired.

## Post-V0 Open Questions

- Should `experiment.json` be the source of truth and the `.ts` registry be auto-generated? Probably yes once there are 10+ experiments.
- Should we move to a real CMS (Sanity / Contentlayer) for contributor profiles? Only if the contributor count grows.
- Custom domain plan: `shipit.fun` is the target. Procure when launching publicly.
- Full visual rebuild to add cassette mockups, Side A / Side B treatments, mixtape vocabulary in section headers, and Press Start 2P pixel accents on eyebrows / marquee strips. Scoped as a separate iteration.
