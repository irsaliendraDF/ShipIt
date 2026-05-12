# How to Play and Extend — Pokémon Nova Scotia (Web App)

This is a Game Boy–styled web game built in plain HTML/CSS/JavaScript. No install. No build step. Just open the HTML file in your browser.

---

## How to play

1. Open File Explorer, go to `C:\Users\irsal\PokemonNovaScotia`
2. **Double-click `index.html`** — it opens in your default browser
3. **Press Z** to start the game

### Controls
- **Arrow keys** — move (or WASD)
- **Z** — A button (talk to NPCs, advance dialogue, pick up Poké Balls)
- **X** — B button (cancel — not used much yet)

### What's in the demo
- Wake up at home in Peggy's Cove → Mom sends you to the lab
- Walk to Professor MacKay's lab
- Choose one of three starters: **Mayflower** (grass), **Embercat** (fire), or **Ripplob** (water)
- Battle your rival Angus (scripted cutscene)
- Walk south to Route 333 — meet Hiker Doug, see the warning sign
- The end of the demo (more towns coming!)

---

## File overview

| File | What it is |
|---|---|
| `index.html` | The web page wrapper. Loads the game canvas. |
| `style.css` | Game Boy chassis styling (the grey casing around the screen). |
| `game.js` | The engine: rendering, movement, dialogue, cutscenes. **Don't edit unless you know JavaScript.** |
| `world.js` | All the game content — towns, NPCs, dialogue. **This is the file you'll edit most.** |
| `DEMO_PLAN.md` | The design doc. Edit this first when you want to plan new content. |

---

## How to extend the game

Almost everything you'll want to change lives in **`world.js`**.

### Edit dialogue

Find the NPC in `world.js`. For example, here's the kid NPC in Peggy's Cove:

```javascript
{
  id: 'townie_kid',
  x: 2, y: 8, dir: 'right',
  lines: [
    "My dad's a fisherman.",
    "He says he saw a LAPRAS out past the cove last week.",
    "I don't believe him... mostly."
  ],
}
```

Each string in the `lines` array is one **dialogue page** (the player presses Z to advance). Just change the text.

### Move an NPC

Change the `x` and `y` numbers (`x` is column, `y` is row, both starting at 0 from the top-left).

### Add a new NPC

Inside any scene's `npcs:` list, add a new entry:

```javascript
{
  id: 'fisherman',         // unique name
  x: 5, y: 7, dir: 'down', // position and facing direction
  lines: [                 // what they say when you press Z
    "Caught nothing all day, b'y.",
    "Gonna head home for a Tim's."
  ],
},
```

### Add a new sign

Inside any scene's `signs:` list:

```javascript
{
  x: 5, y: 3,
  lines: ["Welcome to BEDFORD!", "Gateway to Halifax Harbour."]
}
```

(You also need to actually put a `c` character at that spot in the `tiles` array — that's the sign tile.)

### Edit the map

Each scene's `tiles` is an array of strings — one string per row, one character per tile. The legend is at the top of `world.js`:

| Char | Tile |
|---|---|
| `.` | grass |
| `T` | tree (blocks) |
| `w` | water (blocks) |
| `s` | sand |
| `p` | path |
| `g` | tall grass |
| `r` | building roof (blocks) |
| `W` | building wall (blocks) |
| `d` | door |
| `c` | sign (blocks but interactable) |
| `K` | interior wall (blocks) |
| `D` | interior floor |
| `M` | doormat (interior exit) |
| `b` | bed (blocks) |
| `t` | table (blocks) |
| `B` | bookshelf (blocks) |
| `o` | Poké Ball (blocks until picked up) |

So a tiny town might look like:

```javascript
tiles: [
  "TTTTTTTT",
  "T......T",
  "T..rrr.T",
  "T..WdW.T",
  "T......T",
  "TTTTpTTT",  // path exit at the bottom
],
```

### Add a new town

1. Add a new entry to the `SCENES` object in `world.js` with a unique key (e.g. `bedford`)
2. Define `width`, `height`, `tiles`, `npcs`, `triggers`
3. Wire it up: in the previous town, add a `transition` trigger pointing to your new scene name

Example transition that sends the player from Peggy's Cove to Bedford:

```javascript
{ x: 6, y: 11, type: 'transition', target: 'bedford', tx: 5, ty: 0, tdir: 'down' }
```

Where `tx`/`ty` is where they'll appear in Bedford, and `tdir` is the direction they'll face.

### Refresh the game after editing

Save the file → in your browser, press **F5** (or Ctrl+R) to reload.

---

## Common gotchas

- **Game won't load fonts:** if you're offline, the pixel font falls back to plain monospace. The game still works.
- **Edit didn't show up:** make sure you saved the file, then hard-refresh the browser (Ctrl+Shift+R).
- **Can't walk through a tile:** you probably typed a blocking tile (`T`, `W`, `K`, `b`, `t`, `B`). Use `.` for grass, `D` for floor.
- **NPC won't talk:** confirm their `x`/`y` is on a passable tile and you're standing **next to them facing toward them**.
- **Trigger fires but goes nowhere:** check that the `target` matches a real key in `SCENES`, and `tx`/`ty` is on a passable tile.

---

## Phase 2 ideas

- Add the rest of the towns (Bedford, Hemlock Ravine, Truro, etc. — see `DEMO_PLAN.md`)
- Save/load progress to `localStorage` so flags persist between sessions
- A real battle screen with HP bars and turn-based attacks
- Music using the Web Audio API
- Custom sprites (replace the procedural drawings with actual pixel art PNGs)
