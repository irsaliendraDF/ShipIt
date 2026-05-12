<!--
  Welcome to shipit.fun! Fill out the checklist below so a maintainer can
  merge your experiment quickly. Anything you're unsure about, leave a note.
-->

## What you're shipping

<!-- One paragraph: what does the experiment do? What's the user supposed to do? -->

**Slug:** `games/your-slug/`
**Contributor handle:** `@your-handle`

## Safety checklist

The site embeds your experiment in an iframe and serves it to real visitors,
so we run through this before merging. Tick what applies. If something's
unchecked, drop a note explaining why.

- [ ] No `fetch()` / `XMLHttpRequest` to external servers (except the CSP allowlist: `cdn.jsdelivr.net`, `unpkg.com`, `storage.googleapis.com`)
- [ ] No external `<script src="...">` tags pulling code from other origins
- [ ] No `eval()` / `new Function()` / `document.write`
- [ ] No `localStorage` / `sessionStorage` / cookies (or if used, declared in the description)
- [ ] No `navigator.geolocation` (or if used, with a clear opt-in prompt)
- [ ] `getUserMedia` (camera / mic) only requested if the experiment's tags justify it (`gesture`, `mediapipe`, `body`, `fx` for camera; `voice`, `audio` for mic)
- [ ] All third-party assets (images, fonts, sound) are licensed for redistribution under MIT or compatible terms
- [ ] No NSFW, hateful, or deceptive content
- [ ] No hidden tracking, crypto miners, or background workloads
- [ ] Runs cleanly in Firefox + Chrome + Safari latest

## Content checklist

- [ ] Added entry in `apps/web/data/experiments.ts`
- [ ] Added or updated my entry in `apps/web/data/contributors.ts`
- [ ] Set a `thumbnail` path (or included a `screenshot.png` in the experiment folder)
- [ ] Picked tags from the allowed set: `gesture`, `voice`, `body`, `ai`, `audio`, `game`, `fx`, `mediapipe`, `3d`, `react`, `tool`
- [ ] Wrote a `controls` string so visitors know how to interact

## What I'd love feedback on

<!-- Optional. Anything you weren't sure about or want a maintainer's eye on. -->

## How to test it

<!-- Quickest path for a reviewer to verify it runs end-to-end. -->
