// =====================================================================
// POKEMON NOVA SCOTIA - world data
// All scenes (towns and interiors), NPCs, dialogue, and triggers.
// To add new content, just add or edit entries in the SCENES object.
//
// Tile legend:
//   Outdoor:  . grass | T tree | w pond | s sand | p path | g tall grass
//             r roof  | W wall | d door | c sign | f fence | F flower
//             ~ ocean | L lighthouse | l lupine | m mayflower
//             R rock  | h lobster trap | P pier | y dory | C cliff
//   Interior: D floor | K wall | M doormat (exit) | b bed | t table
//             B bookshelf | o pokeball | S stairs
//
// NPC `style` is a preset name in NPC_STYLES (game.js) -
// e.g. 'mom', 'mackay', 'angus', 'doug', 'kid', 'elder'.
// =====================================================================

const SCENES = {

  // -------------------------------------------------------------------
  // PLAYER HOUSE INTERIOR (the game starts here)
  // -------------------------------------------------------------------
  player_house: {
    name: "Home",
    width: 8,
    height: 6,
    tiles: [
      "KKKKKKKK",
      "K.bB.B.K",
      "K......K",
      "K....t.K",
      "K......K",
      "KKKMKKKK",
    ],
    npcs: [
      {
        id: 'mom',
        x: 4, y: 3, dir: 'down',
        style: 'mom',
        script: () => {
          if (state.flags.beatRival) {
            return [
              { type: 'dialogue', lines: [
                "You're a real trainer now!",
                "Don't forget your jacket. The wind off the harbour is wicked this time of year."
              ]},
            ];
          }
          if (state.flags.gotStarter) {
            return [
              { type: 'dialogue', lines: ["Off to the Bluenose League, are we? Be safe out there, dear."] },
            ];
          }
          return [
            { type: 'dialogue', lines: [
              "Good morning, dear!",
              "Professor MacKay was just looking for you.",
              "He's at the lab - I think he has a Pokemon for you!"
            ]},
          ];
        }
      },
    ],
    triggers: [
      // Walk onto the doormat -> exit to Peggy's Cove
      { x: 3, y: 5, type: 'transition', target: 'peggys_cove', tx: 4, ty: 5, tdir: 'down' },
    ],
  },

  // -------------------------------------------------------------------
  // PEGGY'S COVE - starting town
  // (Now with ocean to the east, a working lighthouse, sand beach,
  //  lupines, lobster trap, and mayflowers.)
  // -------------------------------------------------------------------
  peggys_cove: {
    name: "Peggy's Cove",
    width: 14,
    height: 12,
    tiles: [
      "TTTTTTTTTTTTTT",
      "T..Fl..lF.l..T",
      "T..rrrr.....FT",
      "T..rrrr....c.T",
      "T..WdWW......~",
      "Tl..........s~",
      "T..F........L~",
      "T.......rrrrs~",
      "T.......rrrrh~",
      "T.......WdWWs~",
      "T...l.l.....s~",
      "TTTTTTpTTTTTTT",
    ],
    npcs: [
      {
        id: 'townie_lighthouse',
        x: 11, y: 6, dir: 'right',
        style: 'elder',
        lines: [
          "See that fog rolling in?",
          "Perfect weather for Ghost-types, they say.",
          "Stay on the path, dear."
        ],
      },
      {
        id: 'townie_kid',
        x: 2, y: 8, dir: 'right',
        style: 'kid',
        lines: [
          "My dad's a fisherman.",
          "He says he saw a LAPRAS out past the cove last week.",
          "I don't believe him... mostly."
        ],
      },
    ],
    signs: [
      {
        x: 11, y: 3,
        lines: ["Welcome to PEGGY'S COVE!", "The smallest village with the biggest wave."]
      }
    ],
    triggers: [
      // Player house door
      { x: 4, y: 4, type: 'transition', target: 'player_house', tx: 3, ty: 4, tdir: 'up' },
      // MacKay's lab door (was wrongly placed on the wall at x=8 before)
      { x: 9, y: 9, type: 'transition', target: 'mackay_lab', tx: 5, ty: 6, tdir: 'up' },
      // South exit to Route 333
      { x: 6, y: 11, type: 'transition', target: 'route_333', tx: 5, ty: 0, tdir: 'down' },
    ],
  },

  // -------------------------------------------------------------------
  // PROFESSOR MACKAY'S LAB
  // -------------------------------------------------------------------
  mackay_lab: {
    name: "MacKay's Lab",
    width: 11,
    height: 8,
    tiles: [
      "KKKKKKKKKKK",
      "K.B.B.B.B.K",
      "K.........K",
      "K.........K",
      "K.........K",
      "K..o.o.o..K",
      "K.........K",
      "KKKKKMKKKKK",
    ],
    npcs: [
      {
        id: 'mackay',
        x: 5, y: 3, dir: 'down',
        style: 'mackay',
        script: () => {
          if (!state.flags.metMacKay) {
            return [
              { type: 'dialogue', lines: [
                "There you are, IRENE!",
                "I'm Professor MacKay.",
                "Here in Nova Scotia we have all sorts of Pokemon - from the foggy coves to the highland forests.",
                "The Bluenose League begins soon, and I think you've got what it takes.",
                "Pick a Pokemon. They're yours to keep!"
              ]},
              { type: 'setFlag', flag: 'metMacKay' },
            ];
          }
          if (!state.flags.gotStarter) {
            return [{ type: 'dialogue', lines: ["Go on, pick a Pokemon!"] }];
          }
          if (!state.flags.beatRival) {
            return [{ type: 'dialogue', lines: ["Looks like Angus wants a battle. Show him what you've got!"] }];
          }
          return [{ type: 'dialogue', lines: [
            "Well done out there, IRENE!",
            "Head south through Route 333 when you're ready.",
            "Bedford is just up the road."
          ]}];
        }
      },
      {
        id: 'angus',
        x: -1, y: -1, dir: 'up',
        style: 'angus',
        condition: () => state.flags.angusVisible && !state.flags.angusLeft,
        // No script: dialogue is part of the starter cutscene
      },
    ],
    pokeballs: [
      {
        id: 'starter_grass',
        x: 3, y: 5,
        script: () => starterScript('grass', 'MAYFLOWER', "Calm and steady - like a Mayflower in spring."),
      },
      {
        id: 'starter_fire',
        x: 5, y: 5,
        script: () => starterScript('fire', 'EMBERCAT', "Hot-tempered, like a kitchen on a Saturday night."),
      },
      {
        id: 'starter_water',
        x: 7, y: 5,
        script: () => starterScript('water', 'RIPPLOB', "Right at home in the Atlantic."),
      },
    ],
    triggers: [
      // Exit through doormat - now lands directly south of the cove door
      { x: 5, y: 7, type: 'transition', target: 'peggys_cove', tx: 9, ty: 10, tdir: 'down' },
    ],
  },

  // -------------------------------------------------------------------
  // ROUTE 333 - connects Peggy's Cove to Bedford (Bedford coming soon)
  // (Sprinkled with lupines and mayflowers along the path.)
  // -------------------------------------------------------------------
  route_333: {
    name: "Route 333",
    width: 10,
    height: 14,
    tiles: [
      "TTTTTpTTTT",
      "T..l.p.l.T",
      "T..gg.gg.T",
      "T..gg.gg.T",
      "T..gg.gg.T",
      "T....p.mcT",
      "T....p...T",
      "T..gg.gg.T",
      "T..gg.gg.T",
      "T..gg.gg.T",
      "T..l.p.l.T",
      "T....p...T",
      "T..F.p.F.T",
      "TTTTTpTTTT",
    ],
    npcs: [
      {
        id: 'hiker_doug',
        x: 3, y: 6, dir: 'right',
        style: 'doug',
        script: () => {
          if (state.flags.beatHikerDoug) {
            return [{ type: 'dialogue', lines: ["Some hike that turned into. Good luck up the road."] }];
          }
          return [
            { type: 'dialogue', lines: [
              "Out for a walk, b'y?",
              "Let's see what your Pokemon can do!"
            ]},
            { type: 'battle', config: () => {
              const playerMon = state.flags.starterName || 'MAYFLOWER';
              return {
                player: { mon: playerMon },
                opp: { trainer: 'Hiker Doug', mon: 'RATTATA' },
                beats: [
                  { say: "Doug sent out RATTATA!", action: 'enterOpp' },
                  { say: "Go! " + playerMon + "!", action: 'enterPlayer' },
                  { say: playerMon + " used Tackle!", action: 'attackPlayer', dmg: 9 },
                  { say: "RATTATA fainted!", action: 'faintOpp' },
                ],
              };
            }},
            { type: 'dialogue', lines: ["Some hike that turned into. Good luck up the road."] },
            { type: 'setFlag', flag: 'beatHikerDoug' },
          ];
        }
      },
    ],
    signs: [
      { x: 8, y: 5, lines: ["ROUTE 333", "Watch for moose."] },
    ],
    triggers: [
      // North exit back to Peggy's Cove
      { x: 5, y: 0, type: 'transition', target: 'peggys_cove', tx: 6, ty: 10, tdir: 'up' },
      // South - end of demo for now
      { x: 5, y: 13, type: 'dialogue', lines: [
        "BEDFORD is just past here.",
        "(More towns coming soon - thanks for playing the demo!)"
      ]},
    ],
  },
};

// Rival picks the starter that beats the player's (classic Pokemon).
function angusStarter() {
  if (state.flags.starter === 'grass') return 'EMBERCAT';
  if (state.flags.starter === 'fire')  return 'RIPPLOB';
  return 'MAYFLOWER';  // water -> grass
}

// Reusable starter-pickup cutscene
function starterScript(elementKey, name, flavor) {
  return [
    { type: 'dialogue', lines: [
      name + " (" + elementKey.toUpperCase() + "-type)",
      flavor,
      "You took " + name + "!"
    ]},
    { type: 'setFlag', flag: 'starter', value: elementKey },
    { type: 'setFlag', flag: 'starterName', value: name },
    { type: 'setFlag', flag: 'gotStarter' },
    { type: 'setFlag', flag: 'took_starter_grass' },
    { type: 'setFlag', flag: 'took_starter_fire' },
    { type: 'setFlag', flag: 'took_starter_water' },

    // Angus burst in
    { type: 'moveNPC', id: 'angus', x: 5, y: 6, dir: 'up' },
    { type: 'setFlag', flag: 'angusVisible' },
    { type: 'wait', ms: 400 },
    { type: 'dialogue', lines: [
      "ANGUS: IRENE! Heh, took you long enough.",
      "I picked one too - and mine's stronger.",
      "Let's go right now. First battle - me and you.",
      "Don't cry when you lose, b'y!"
    ]},
    // Real battle scene with sprites
    { type: 'battle', config: () => {
      const playerMon = state.flags.starterName;
      const oppMon = angusStarter();
      return {
        player: { mon: playerMon },
        opp: { trainer: 'Angus', mon: oppMon },
        beats: [
          { say: "ANGUS sent out " + oppMon + "!", action: 'enterOpp' },
          { say: "Go! " + playerMon + "!", action: 'enterPlayer' },
          { say: playerMon + " used Tackle!", action: 'attackPlayer', dmg: 8 },
          { say: "It's super effective!" },
          { say: oppMon + " used Scratch!", action: 'attackOpp', dmg: 5 },
          { say: playerMon + " hung on!" },
          { say: playerMon + " used Tackle!", action: 'attackPlayer', dmg: 12 },
          { say: "A critical hit!" },
          { say: oppMon + " fainted!", action: 'faintOpp' },
        ],
      };
    }},
    { type: 'dialogue', lines: [
      "ANGUS: Tch. Beginner's luck.",
      "I'm headed to Bedford - see you there, if you can keep up!"
    ]},
    { type: 'setFlag', flag: 'beatRival' },
    { type: 'setFlag', flag: 'angusLeft' },  // hides Angus afterwards
  ];
}
