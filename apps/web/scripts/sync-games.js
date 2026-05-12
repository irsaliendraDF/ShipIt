#!/usr/bin/env node
/**
 * Copies every folder under /games (except _template) into apps/web/public/games-static
 * so Next.js can serve them as static iframe sources.
 *
 * Runs automatically before next build. Run manually with `npm run sync-games`.
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const gamesDir = path.join(root, 'games');
const targetDir = path.join(__dirname, '..', 'public', 'games-static');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  if (!fs.existsSync(gamesDir)) {
    console.warn(`[sync-games] No games dir at ${gamesDir}, skipping.`);
    return;
  }

  rmrf(targetDir);
  fs.mkdirSync(targetDir, { recursive: true });

  const entries = fs
    .readdirSync(gamesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'));

  for (const entry of entries) {
    const src = path.join(gamesDir, entry.name);
    const dest = path.join(targetDir, entry.name);
    copyDir(src, dest);
    console.log(`[sync-games] Copied ${entry.name}`);
  }

  console.log(`[sync-games] Synced ${entries.length} game(s) to public/games-static`);
}

main();
