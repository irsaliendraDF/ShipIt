# Experiment Template

Copy this folder to start a new shipit.fun experiment.

```bash
cp -r games/_template games/your-experiment-slug
```

Then:

1. Edit `experiment.json`. Slug must match the folder name.
2. Build your thing in `index.html` and `main.js`.
3. Drop a `screenshot.png` (600x400) into the folder.
4. Register the experiment in `apps/web/data/experiments.ts`.
5. Open a PR.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full guide.
