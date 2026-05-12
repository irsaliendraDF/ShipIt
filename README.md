# shipit.fun

> ship it for fun. a home for vibe coders building whimsical alternative entertainment together. canada-based. weirdness welcome.

shipit.fun is an open creative collective showcasing AI-powered, gesture-controlled, and interactive web experiences. Every experiment runs entirely in the browser. Every contributor gets credited. Founding contributor: [Digital Flow Consulting](https://digitalflowconsulting.ca).

**Live site:** _(coming soon. deploy target: shipit.fun)_

## Tech Stack

- **Monorepo:** Turborepo + npm workspaces
- **Web app:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Games:** Vanilla JS / HTML / Canvas (zero build step, iframe-embeddable)
- **Gesture / pose:** Shared `@shipit-fun/gesture-core` package wrapping MediaPipe Hands and Pose
- **UI primitives:** Shared `@shipit-fun/ui` package
- **Deploy:** Vercel

## Repository Layout

```
shipit-fun/
├── apps/web/          # Next.js marketing + showcase site
├── games/             # Self-contained HTML/JS experiments
│   └── _template/     # Scaffold for new experiments
├── packages/
│   ├── gesture-core/  # MediaPipe Hands + Pose utilities
│   └── ui/            # Shared React component library
├── turbo.json
└── package.json
```

## Quick Start

```bash
git clone https://github.com/irsaliendraDF/ShipIt.git
cd ShipIt
npm install
npm run dev
```

`npm run dev` boots the Next.js site at [http://localhost:3000](http://localhost:3000) and watches every package in the monorepo.

To open a single game directly without the site:

```bash
# any modern static server works
npx serve games/qigong
```

## Available Scripts

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the web app + watch all packages        |
| `npm run build`      | Build every workspace in dependency order     |
| `npm run lint`       | Run ESLint across the monorepo                |
| `npm run type-check` | Run strict-mode TypeScript checks             |
| `npm run clean`      | Remove build output and `node_modules`        |

## Contributing

shipit.fun is open. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the contributor guide, the experiment metadata spec, and how submissions get featured on the site.

Every contributor gets a profile at `/contributors/[handle]` and credit on every experiment they ship.

## License

MIT. See [LICENSE](./LICENSE).

## Founding Contributor

shipit.fun is sponsored and maintained by [Digital Flow Consulting](https://digitalflowconsulting.ca). The site is open to anyone who wants to ship weird, browser-native interactive work.
