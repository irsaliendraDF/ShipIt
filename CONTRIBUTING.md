# Contributing to shipit.fun

Welcome. shipit.fun is a collective for browser-native creative experiments: gesture control, body tracking, voice, AI-augmented games, generative interactivity, things you'd want to demo at 2am. If you build weird, interactive web stuff, this is your place.

This guide covers everything you need to ship an experiment.

## Who This Is For

shipit.fun is for:

- Front-end engineers and creative coders shipping interactive prototypes
- Designers who code and want a public home for one-off experiments
- AI / ML builders integrating models into playful interfaces
- Students learning by shipping
- Anyone who finds a normal portfolio site too quiet

You don't need to be invited. Open a PR and you're in.

## Local Development

### Prerequisites

- Node.js 18.17+
- npm 10+ (or pnpm / yarn; workspaces are configured for npm by default)

### Get the repo running

```bash
git clone https://github.com/irsaliendraDF/ShipIt.git
cd ShipIt
npm install
npm run dev
```

The web app boots at [http://localhost:3000](http://localhost:3000) and watches every workspace package.

### Repo Tour

```
shipit-fun/
├── apps/web/          # The site (Next.js)
├── games/             # Where your experiment lives
│   └── _template/     # Copy this to start
├── packages/
│   ├── gesture-core/  # MediaPipe Hands + Pose helpers
│   └── ui/            # Shared React primitives
```

Each game in `games/` is fully self-contained: an `index.html`, a `main.js`, and an `experiment.json`. No build step is required for games. Open the HTML file, it runs.

## Scaffolding a New Experiment

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

6. Add yourself to `apps/web/data/contributors.ts` if you're new.

7. Drop a `screenshot.png` (600x400 ideal) into your experiment folder. The site uses it as the card thumbnail.

## Experiment Metadata Spec (`experiment.json`)

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
| `tags`        | yes      | Array. Pick from: `gesture`, `voice`, `body`, `ai`, `audio`, `game`, `fx`, `mediapipe`.     |
| `status`      | yes      | `live`, `wip`, or `archived`.                                                               |
| `tech`        | yes      | Array of technologies you used. Free-form.                                                  |
| `controls`    | no       | Plain-language control instructions shown on the experiment page.                           |
| `createdAt`   | no       | ISO date.                                                                                   |

## Pull Request Process

1. Fork the repo. Branch from `main`: `git checkout -b experiment/your-slug`.
2. Build your experiment. Test it locally, both standalone and embedded in the web app.
3. Make sure `npm run type-check` and `npm run lint` pass at the repo root.
4. Open a PR with:
   - Title: `Add experiment: Your Experiment Title`
   - A short description of what it does and how to use it
   - A screenshot or short clip
5. A maintainer reviews and merges. We try to turn around within a week.

## Code of Conduct

Three rules:

1. **Ship things.** Done beats perfect. shipit.fun is for finished experiments, not pitches.
2. **Be kind.** Critique work, not people. Help newcomers.
3. **Credit your inspirations.** If your piece riffs on someone else's, link them in your description.

That's it. No further legalese.

## How Contributor Credit Works

When your PR merges:

- Your handle and avatar appear on every experiment card you contributed
- You get a profile page at `/contributors/[your-handle]` showing all your work
- You're listed on the about page once you've shipped two or more experiments

## Discord

Join the shipit.fun Discord: _(invite link coming soon, placeholder)_

In `#welcome`, post your handle and the experiment you're working on. A mod will assign you the **Experimenter** role and unlock the building channels.

## Licensing

shipit.fun is MIT-licensed. By submitting a PR, you agree your contribution can be redistributed under the same terms. You retain copyright on your work; you're granting the project a license to host and showcase it.

---

Questions? Open an issue with the `question` label, or DM in Discord.
