# Contributing to shipit.fun

Welcome. shipit.fun is a collective for browser-native creative experiments: gesture control, body tracking, voice, AI-augmented games, generative interactivity, things you'd want to demo at 2am. If you build weird, interactive web stuff, this is your place.

This guide covers everything you need to ship an experiment, and what we need from you so we can host it for real visitors.

## Who this is for

shipit.fun is for:

- Front-end engineers and creative coders shipping interactive prototypes
- Designers who code and want a public home for one-off experiments
- AI / ML builders integrating models into playful interfaces
- Students learning by shipping
- Anyone who finds a normal portfolio site too quiet

You don't need to be invited. Open a PR and you're in.

## Local development

### Prerequisites

- Node.js 18.17+
- npm 10+

### Get the repo running

```bash
git clone https://github.com/irsaliendraDF/ShipIt.git
cd ShipIt
npm install
npm run dev
```

The web app boots at [http://localhost:3000](http://localhost:3000).

### Repo tour

```
ShipIt/
├── apps/web/             # The site (Next.js)
├── games/                # Where your experiment lives
│   └── _template/        # Copy this to start
├── packages/
│   ├── gesture-core/     # MediaPipe Hands + Pose helpers
│   └── ui/               # Shared React primitives
├── scripts/
│   └── scan-experiment.js   # Static safety scan run by CI on every PR
└── .github/
    └── workflows/        # CI checks
```

Each game in `games/` is self-contained: an `index.html`, a `main.js`, and an `experiment.json`. No build step is required for games. Open the HTML file, it runs.

## Scaffolding a new experiment

1. Copy the template:

   ```bash
   cp -r games/_template games/your-experiment-slug
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item -Recurse games/_template games/your-experiment-slug
   ```

2. Pick a slug. Lowercase, hyphen-separated, descriptive: `voice-maze`, `palm-paint`, `kung-fu-tracker`. The slug becomes your URL: `/experiments/your-experiment-slug`.

3. Edit `games/your-experiment-slug/experiment.json`. See the metadata spec below.

4. Build your experiment in `main.js` and `index.html`. Use `@shipit-fun/gesture-core` if you need MediaPipe.

5. Register the experiment in `apps/web/data/experiments.ts` so it shows up in the gallery.

6. Add yourself to `apps/web/data/contributors.ts` if you're new. See the contributor schema below.

7. Drop a thumbnail at `apps/web/public/thumbnails/your-slug.svg` (or `.png`, 800x450 ideal). The site uses it as the card thumbnail. If you don't, the card falls back to a generated tile.

## Experiment metadata (`experiment.json`)

```json
{
  "slug": "your-experiment-slug",
  "title": "Your Experiment Title",
  "description": "One short sentence (max 120 chars) explaining what it does.",
  "contributor": "yourhandle",
  "tags": ["gesture", "ai", "game"],
  "status": "live",
  "tech": ["MediaPipe Hands", "Canvas API", "Vanilla JS"],
  "controls": "Hold up an open palm to activate. Pinch to fire.",
  "createdAt": "2026-05-09"
}
```

### Field reference

| Field         | Required | Notes                                                                                       |
| ------------- | -------- | ------------------------------------------------------------------------------------------- |
| `slug`        | yes      | Must match the folder name in `games/`. Lowercase, hyphens, no spaces.                      |
| `title`       | yes      | Display title.                                                                              |
| `description` | yes      | Short pitch. Max 120 chars.                                                                 |
| `contributor` | yes      | Your handle. Must match an entry in `apps/web/data/contributors.ts`.                        |
| `tags`        | yes      | Array. Pick from: `gesture`, `voice`, `body`, `ai`, `audio`, `game`, `fx`, `mediapipe`, `3d`, `react`, `tool`. Tags drive iframe permissions (see Safety). |
| `status`      | yes      | `live`, `wip`, or `archived`.                                                               |
| `tech`        | yes      | Array of technologies you used. Free-form.                                                  |
| `controls`    | no       | Plain-language control instructions shown on the experiment page.                           |
| `createdAt`   | no       | ISO date.                                                                                   |
| `externalUrl` | no       | If your experiment is hosted on its own domain, set this and the gallery tile + iframe links to that URL instead of the in-repo `games/` folder. |

## Contributor schema (`apps/web/data/contributors.ts`)

```ts
{
  handle: 'yourhandle',                       // lowercase, no spaces, URL-safe
  name: 'Your Name',                          // display name
  bio: 'two sentences. who you are, what you build.',
  avatarColor: '#ff6fb5',                     // hex used if no avatar image
  avatar: '/crew/yourhandle.jpg',             // optional, 256x256+ square
  links: {
    github: 'https://github.com/yourhandle',
    site: 'https://yoursite.dev',
    linkedin: 'https://www.linkedin.com/in/yourhandle',
    twitter: 'https://twitter.com/yourhandle',
  },
}
```

- **Required:** `handle`, `name`, `bio`, `avatarColor`
- **Encouraged:** `avatar` (drop the file in `apps/web/public/crew/`)
- **Encouraged:** `links.github` + 1 or 2 of `site`, `linkedin`, `twitter`
- Bio shows up everywhere your work is credited. One to three sentences. Lowercase is on-brand but not enforced.

## Pull request process

1. Fork the repo. Branch from `main`: `git checkout -b experiment/your-slug`.
2. Build your experiment. Test it locally, both standalone and embedded in the web app at [http://localhost:3000/experiments/your-slug](http://localhost:3000).
3. Make sure `npm run type-check` and `npm run lint` pass at the repo root.
4. Run the safety scan locally (optional, CI runs it on every PR):

   ```bash
   node scripts/scan-experiment.js
   ```

5. Open a PR. The PR template includes a safety checklist. Tick what applies; leave a note on anything you're unsure about.
6. A maintainer reviews and merges. We try to turn around within a week.

## Safety rules

Your experiment runs in a sandboxed iframe on a public site visited by real people, so we keep a small list of hard rules. These are enforced two ways: a strict Content Security Policy on the `/games-static/` route (which the browser enforces at runtime), and a static scan that runs on every PR and surfaces anything risky for a maintainer to eyeball before merging.

### Hard rules

- **No fetch / XHR to external servers** outside the CSP allowlist: `cdn.jsdelivr.net`, `unpkg.com`, `storage.googleapis.com`. If you need a different host (e.g. you're calling an LLM API), open an issue first and we'll discuss adding it.
- **No `<script src="http(s)://...">`** pulling code from outside the allowlist. The CSP will block it; the scan will surface it.
- **No `eval()`, `new Function()`, `document.write()`** unless the experiment legitimately interprets a small DSL. Flag it for the reviewer if you must use one.
- **No tracking**: no third-party analytics scripts, no pixel beacons, no fingerprinting, no telemetry without an obvious opt-in surfaced to the visitor.
- **No `localStorage` / `sessionStorage` / cookies** without declaring what's stored in your `description` field.
- **No `navigator.geolocation`** unless the experiment shows a clear explanation before requesting it.
- **No NSFW, hateful, or deceptive content.**
- **No hidden workloads**: crypto miners, background uploads, unbounded loops eating CPU/GPU.
- **All third-party assets** (images, sounds, fonts) must be licensed for redistribution under MIT or compatible terms. Cite the source in your PR description.

### Iframe permissions (tag-driven)

The site embeds your experiment with a Permissions Policy that's derived from your `tags`. You get what your tags justify, nothing more:

| Tag(s) on experiment                  | Granted permission     |
| ------------------------------------- | ---------------------- |
| `gesture`, `mediapipe`, `body`, `fx`  | camera                 |
| `voice`, `audio`                      | microphone             |
| `body`, `gesture`                     | gyroscope, accelerometer |
| Everything                            | autoplay, fullscreen    |

If your experiment needs camera but isn't tagged appropriately, it'll be silently denied by the browser. Tag it accurately.

### Auto-scan on every PR

`.github/workflows/pr-experiment-scan.yml` runs `scripts/scan-experiment.js` on every PR that touches `games/` or the data files. It flags:

- External `fetch` / `XMLHttpRequest`
- External `<script src>`
- `eval` / `new Function` / `document.write`
- `localStorage` / `sessionStorage` / `document.cookie`
- `navigator.geolocation`
- `getUserMedia` (against your tag set)
- `RTCPeerConnection`, `sendBeacon`

Findings appear in the PR check logs. The scan doesn't auto-fail — it's a notice for the maintainer. If you're using something flagged for a legitimate reason, leave a note in your PR description.

## Code of conduct

Three rules:

1. **Ship things.** Done beats perfect. shipit.fun is for finished experiments, not pitches.
2. **Be kind.** Critique work, not people. Help newcomers.
3. **Credit your inspirations.** If your piece riffs on someone else's, link them in your description.

That's it. No further legalese.

## How contributor credit works

When your PR merges:

- A "shipped by @yourhandle" chip appears on your experiment's card in every gallery
- Your handle and avatar appear on the contributor grid
- Your card on the Crew section expands in place to show your bio, every experiment you've shipped, and your social links
- You get a profile page at `/contributors/your-handle` showing all your work
- You're listed on the about page once you've shipped two or more experiments

## Discord

Join the shipit.fun Discord: _(invite link coming soon, placeholder)_

In `#welcome`, post your handle and the experiment you're working on. A mod will assign you the **Experimenter** role and unlock the building channels.

## Licensing

shipit.fun is MIT-licensed. By submitting a PR, you agree your contribution can be redistributed under the same terms. You retain copyright on your work; you're granting the project a license to host and showcase it.

---

Questions? Open an issue with the `question` label, or DM in Discord.
