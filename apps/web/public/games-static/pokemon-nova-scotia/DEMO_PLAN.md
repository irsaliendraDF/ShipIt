# Demo Plan — Pokémon Nova Scotia

Everything you need to know about the world, characters, and dialogue for the demo.

---

## The Story (one paragraph)

The **Bluenose League** has just announced a new tournament across Nova Scotia. Trainers from every town are heading out to challenge gyms and earn badges. You're a young trainer in Peggy's Cove, and Professor MacKay has a Pokémon waiting for you at the lab. Your friend (and rival) **Angus** is heading there too.

---

## Characters

| Character | Role | Notes |
|---|---|---|
| **Player** | You | Default name "Irene" — player can rename |
| **Mom** | Lives in Peggy's Cove | Sends you off with a jacket joke |
| **Professor MacKay** | Regional Pokémon professor | Lab is in Peggy's Cove |
| **Angus** | Rival | Same age as you, picks the starter that beats yours |
| **Quarryman Bruce** | Truro gym leader | Rock-type, granite-quarry worker |

---

## Demo Map (overview)

```
        [ Truro ]
            |
     [ Hemlock Ravine ]    <- mini-dungeon
            |
        [ Bedford ]        <- first city (PokéCenter, Mart)
            |
       [ Route 333 ]       <- tall grass, wild encounters
            |
      [ Peggy's Cove ]     <- starting town
```

---

## Scene 1 — Peggy's Cove (starting town)

**Town sign:** *"Welcome to Peggy's Cove — The smallest village with the biggest wave."*

### Buildings
- **Player's house** (interior: bedroom upstairs, mom downstairs)
- **Professor MacKay's lab**
- **2 small NPC houses** (optional, can skip)

### NPCs and dialogue

**Mom (in player's house, downstairs):**
> "Good morning, dear! Professor MacKay was just looking for you. He's at the lab — I think he has a Pokémon for you!"

**Mom (after you have a starter):**
> "Don't forget your jacket. The wind off the harbour is wicked this time of year."

**Town NPC 1 (older woman near the lighthouse):**
> "See that fog rolling in? Perfect weather for Ghost-types, they say. Stay on the path, dear."

**Town NPC 2 (kid by the wharf):**
> "My dad's a fisherman. He says he saw a Lapras out past the cove last week. I don't believe him… mostly."

**Lab sign:**
> *"PROF. MACKAY'S POKÉMON LAB"*

### Inside the lab — Professor MacKay

**On entry:**
> "%PLAYER%! There you are. I'm Professor MacKay. Here in Nova Scotia we have all sorts of Pokémon — from the foggy coves to the highland forests. The Bluenose League begins soon, and I think you've got what it takes."

> "Pick a Pokémon. They're yours to keep."

**Three starter Poké Balls on a table** (use any 3 starter sprites you like — for simplicity, reuse GB Studio sample sprites or pick Bulbasaur / Charmander / Squirtle for now and rename later):

- **Ball 1 (Grass):** "It's a Grass-type. Calm and steady — like a Mayflower in spring."
- **Ball 2 (Fire):** "A Fire-type. Hot-tempered, like a kitchen on a Saturday night."
- **Ball 3 (Water):** "A Water-type. Right at home in the Atlantic."

**Angus walks in:**
> "%PLAYER%! Heh, took you long enough. I'll take one too — and mine's gonna be stronger."

**Angus picks the starter that beats yours.**

**Angus (challenge):**
> "Let's go right now. First battle — me and you. Don't cry when you lose, b'y!"

### Rival battle (scripted)
- Show both sprites facing off
- Dialogue beats: "Angus sent out [Pokémon]!" → "%PLAYER% sent out [Pokémon]!" → 2–3 lines of attack flavor → "Angus's Pokémon fainted!"
- **Angus (after loss):**
> "Tch. Beginner's luck. I'm headed to Bedford — see you there, if you can keep up."

**Professor MacKay (after rival battle):**
> "Well done. Take these — five Poké Balls, in case you find a Pokémon you want to bring along. Now go on, the league won't wait."

→ Player exits lab and can leave town north toward Route 333.

---

## Scene 2 — Route 333 (Highway 333)

**Route sign:** *"ROUTE 333 — Watch for moose."*

### Layout
- A vertical path with patches of tall grass on either side
- 2 simple trainer encounters (optional, talk to trigger)
- Exit at the top → Bedford

### Wild encounters (flavor only — no real battles)
- Walking into tall grass triggers a brief "A wild Pokémon appeared!" cutscene, 50% chance, with text like:
> "A wild RATTATA jumped out of the grass! …It scampered away."

### Trainers

**Hiker Doug:**
> "Out for a walk, b'y? Let's see what your Pokémon can do!"
> *(scripted battle — short, you win)*
> "Some hike that turned into. Good luck up the road."

**Fisherman Sandy:**
> "Caught nothing all morning. How about a battle to pass the time?"
> *(scripted battle — short, you win)*
> "Ha! Like trying to land a Gyarados with a piece of string."

---

## Scene 3 — Bedford (first city)

**Town sign:** *"Welcome to BEDFORD — Gateway to Halifax Harbour."*

### Buildings
- **Pokémon Center** (heal — nurse heals your party)
- **PokéMart** (sells Potions, Poké Balls, Antidote)
- **Bedford Gym** — locked (story gate; come back later)
- **2 NPC houses**

### NPCs

**Pokémon Center Nurse:**
> "Welcome to the Bedford Pokémon Center! Would you like me to heal your Pokémon?"
> *(yes/no — heals on yes)*
> "Your Pokémon are fighting fit. We hope to see you again!"

**PokéMart Clerk:**
> "Gearing up for the road north? Hemlock Ravine is no joke — bring Potions."

**Gym door (locked):**
> *"BEDFORD GYM — Trainers must show 3 badges to enter. Come back when you're stronger."*

**Bedford NPC 1 (in a house):**
> "Halifax is just south of here — that's where the Saffron Gym Leader trains. Psychic types! Spooky."

**Bedford NPC 2 (kid):**
> "I hear there's a haunted lighthouse out in Lunenburg. Total Lavender Town vibes, eh?"

**Bedford NPC 3 (signpost):**
> *"NORTH — Hemlock Ravine, then Truro. SOUTH — Peggy's Cove. EAST — Halifax (closed for league construction)."*

→ Exit north → Hemlock Ravine.

---

## Scene 4 — Hemlock Ravine (mini-dungeon)

**Sign at entrance:** *"HEMLOCK RAVINE — Watch your step. The bugs bite."*

### Layout
- Narrow forest path with trees blocking the route
- Player must zigzag between tree clusters to reach the exit
- 2 trainers + 1 hidden item (Potion behind a tree)

### Trainers

**Bug Catcher Liam:**
> "Bugs in the trees, bugs in the rocks, bugs everywhere! Battle me!"
> *(scripted — short fight, you win)*
> "Aw, I knew I should've trained more."

**Bug Catcher Maeve:**
> "I'm gonna be the bug master of all Nova Scotia! Starting with you!"
> *(scripted)*
> "Hmph. Next time."

### Hidden item
- Walking into a specific tree → "%PLAYER% found a POTION!"

→ Exit north → Truro.

---

## Scene 5 — Truro (first gym town)

**Town sign:** *"Welcome to TRURO — Hub of Nova Scotia."*

### Buildings
- **Pokémon Center**
- **Truro Gym** (Rock-type — open!)
- **2 NPC houses** (optional)

### NPCs

**Truro NPC 1:**
> "Quarryman Bruce is the gym leader here. Tough as the granite he digs out of the ground."

**Truro NPC 2 (kid):**
> "My dad works the quarry with Bruce. He says Bruce's Pokémon eat rocks for breakfast. I think he's joking. I hope."

### Truro Gym

**Gym sign:**
> *"TRURO POKÉMON GYM — Leader: QUARRYMAN BRUCE — The Stone Wall of the Hub."*

**Junior Trainer (inside, before Bruce):**
> "You won't get past Bruce. He's got rocks for fists and rocks for Pokémon!"
> *(scripted battle — you win)*
> "Fine, you're tougher than you look. Boss is in the back."

**Quarryman Bruce:**
> "Welcome to my quarry, kid. My Pokémon are tougher than the granite of Cape Breton itself. Show me what you've got!"

### Gym battle (scripted boss fight)
- Bruce sends out 2 Pokémon (e.g. Geodude, Onix)
- 4–5 dialogue beats with attack flavor:
> "Bruce's Geodude used Rock Throw! …It's super effective… on the floor."
> "%PLAYER%'s Pokémon used Tackle! Bruce's Geodude fainted!"
> "Bruce sent out Onix! 'This one's been in the family three generations!'"
> *(2 more beats)*
> "Onix fainted!"

**Bruce (after loss):**
> "Cracked open like a geode. You earned this — the **QUARRY BADGE**. And take this TM too. Use it well."

> "*%PLAYER% received the QUARRY BADGE!*"
> "*%PLAYER% received TM39 — ROCK TOMB!*"

**Bruce (final):**
> "Head north when you're ready. The next gym's in New Glasgow — water types. Pack a towel."

→ End of demo. A final dialog box:
> *"Thanks for playing the Pokémon Nova Scotia demo! More coming soon."*

---

## Items in the demo

| Item | Where |
|---|---|
| 5x Poké Ball | From Prof. MacKay |
| Potion (×2) | PokéMart in Bedford (buy) |
| Potion (hidden) | Behind a tree in Hemlock Ravine |
| Quarry Badge | Beat Quarryman Bruce |
| TM39 — Rock Tomb | Beat Quarryman Bruce |

---

## Naming reference (Kanto → Nova Scotia)

For when you expand later:

| Kanto | Nova Scotia |
|---|---|
| Pallet Town | **Peggy's Cove** |
| Viridian City | **Bedford** |
| Pewter City | **Truro** |
| Cerulean City | **New Glasgow** |
| Vermilion City | **Sydney** |
| Lavender Town | **Lunenburg** |
| Celadon City | **Dartmouth** |
| Saffron City | **Halifax** |
| Fuchsia City | **Yarmouth** |
| Cinnabar Island | **Sable Island** |
| Indigo Plateau | **Cape Breton Highlands** |
| Viridian Forest | **Hemlock Ravine** |
| Mt. Moon | **Cape Split** |
| Rock Tunnel | **Cabot Trail Tunnel** |
| Indigo Plateau Victory Road | **Skyline Trail** |
