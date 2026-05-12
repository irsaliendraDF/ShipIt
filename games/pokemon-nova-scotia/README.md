# Pokémon Nova Scotia — Game Boy-styled Web Game

A Game Boy–styled top-down adventure set in Nova Scotia, built as a plain web app. No install. No build step. Just open `index.html` in a browser.

## Quick start

1. **Double-click `index.html`** to open the game in your browser
2. **Press Z** on the title screen
3. **Arrow keys** to move, **Z** to talk / interact

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The web page — open this to play |
| `style.css` | Game Boy chassis look |
| `game.js` | Game engine (don't edit unless you know JS) |
| `world.js` | All the towns, NPCs, and dialogue (**edit this** to change content) |
| `DEMO_PLAN.md` | The design doc — story, characters, towns, target dialogue |
| `BUILD_GUIDE.md` | How to play and how to extend the game |

## Demo content (Phase 1 — playable now)

- Wake up in Peggy's Cove → talk to Mom
- Visit Professor MacKay's lab and pick a starter (Mayflower / Embercat / Ripplob)
- Battle your rival Angus
- Walk south to Route 333 (meet Hiker Doug)
- Demo ends at the south edge of Route 333

## Phase 2 (not built yet — see `DEMO_PLAN.md` for plans)

- Bedford (Pokémon Center, shop, locked gym)
- Hemlock Ravine (mini-dungeon, bug catchers)
- Truro (first gym — Quarryman Bruce, rock-type)
- Save game state to browser storage
- Real battles with HP and turn-based moves

## How to make changes

Open `world.js` in any text editor (Notepad works fine). Edit dialogue, move NPCs, add new towns. Save the file. Refresh the browser (F5). Done.

Full editing instructions are in `BUILD_GUIDE.md`.
