// =====================================================================
// POKEMON NOVA SCOTIA - game engine
// Vanilla JavaScript. No frameworks. No build step.
// Scenes/dialogue/NPCs are defined in world.js.
// Visuals upgraded from strict GB greens to a Pokemon-Crystal-era
// palette with Nova Scotia themed tiles (lighthouse, lupines, sand,
// ocean, granite rocks).
// =====================================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 16;
const VIEW_W = 10;   // 10 tiles wide  = 160px
const VIEW_H = 9;    // 9 tiles tall   = 144px

// ---------------------------------------------------------------------
// Viewport-aware canvas sizing
// Internal resolution stays at 160x144. CSS size is scaled to the
// largest integer multiple that fits comfortably in the window so the
// Game Boy chassis always sits inside the viewport without scrolling.
// ---------------------------------------------------------------------
function fitCanvas() {
  // Reserve room for the chassis around the screen + controls below it.
  const chromeV = 200;
  const chromeH = 80;
  const availH = Math.max(144, window.innerHeight - chromeV);
  const availW = Math.max(160, window.innerWidth - chromeH);
  const scaleH = Math.floor(availH / 144);
  const scaleW = Math.floor(availW / 160);
  // Clamp scale to [2x, 6x]. 2x = 320x288, 6x = 960x864.
  const scale = Math.max(2, Math.min(6, Math.min(scaleH, scaleW)));
  canvas.style.width  = (160 * scale) + 'px';
  canvas.style.height = (144 * scale) + 'px';
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

// ---------------------------------------------------------------------
// Color palette
// PAL keeps the original 4-tone Game Boy greens (used as fallbacks
// and for grass authenticity). COL adds the richer themed colors.
// ---------------------------------------------------------------------
const PAL = {
  lightest: '#9bbc0f',
  light:    '#8bac0f',
  dark:     '#306230',
  darkest:  '#0f380f',
};

const COL = {
  // Sky and Atlantic sea
  skyTop:        '#9cd0e8',
  oceanLight:    '#6ec0d8',
  oceanMid:      '#2e7aa0',
  oceanDeep:     '#1a4a70',
  waveCap:       '#e8f4f8',

  // Sand and earth
  sandLight:     '#f0dca0',
  sandMid:       '#d8b870',
  pathLight:     '#d8c890',
  pathDark:      '#9a8460',
  earth:         '#704830',

  // Granite (Peggy's Cove rocks)
  stoneLight:    '#b8b8b0',
  stoneMid:      '#7a7a72',
  stoneDark:     '#3e3e3a',

  // Wood / structures
  woodLight:     '#b07a40',
  woodMid:       '#7a4820',
  woodDark:      '#4a2810',

  // Houses / roofs
  roofRed:       '#a83020',
  roofRedDark:   '#681810',
  roofRedHi:     '#d04830',
  wallCream:     '#e8d8a8',
  wallCreamDark: '#a89868',
  windowBlue:    '#5090c0',

  // Lighthouse
  lhWhite:       '#f4f0e0',
  lhRed:         '#c43020',
  lhDark:        '#601810',
  lhBeam:        '#fff8c0',

  // Foliage
  leafLight:     '#7ec048',
  leafMid:       '#3a8030',
  leafDark:      '#184820',
  trunkLight:    '#8a5a30',
  trunkDark:     '#4a2810',

  // Flowers
  mayflowerPink: '#ffa0c0',
  mayflowerHi:   '#ffd0e0',
  lupinePurple:  '#8050b8',
  lupineDark:    '#503070',
  lupineLeaf:    '#406020',
  flowerYellow:  '#f8d040',
  flowerWhite:   '#f8f0e0',

  // People
  skin:          '#f0c090',
  skinDark:      '#a8704a',
  hairBrown:     '#5a3a18',
  hairRed:       '#c46028',
  hairGray:      '#a8a89a',

  shirtTeal:     '#308088',  // player
  shirtPink:     '#d878a0',  // mom
  shirtWhite:    '#e8e8d8',  // mackay (lab coat)
  shirtBlue:     '#3850a0',  // angus
  shirtPlaid:    '#a83020',  // doug (red plaid)
  shirtPlaidDk:  '#3a2010',
  shirtYellow:   '#f8c840',  // kid
  shirtBrown:    '#705030',  // lighthouse townie

  pantsBlue:     '#1a3a68',
  pantsBrown:    '#3a2010',
  pantsKhaki:    '#807040',

  // Interior
  floorLight:    '#d0a878',
  floorDark:     '#9a7848',
  rugRed:        '#a83020',
  rugRedDark:    '#681810',
  bedSheet:      '#f0e0d0',
  bedFrame:      '#7a4820',
  bedPillow:     '#ffd0e0',
  bookRed:       '#a83020',
  bookBlue:      '#3060a8',
  bookGreen:     '#3a8030',
  shelfWood:     '#5a3a18',

  // Items / signs
  pokeballRed:   '#d83020',
  pokeballWhite: '#f4f0e0',
  pokeballDark:  '#202020',
  signWood:      '#7a4820',
  signLight:     '#b07a40',

  // UI
  black:         '#181818',
  textDark:      '#202028',
  textGray:      '#686878',
  uiCream:       '#f4f0e0',
  uiBorder:      '#202028',
  uiHighlight:   '#a8c4d8',
};

// ---------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------
const state = {
  titleScreen: true,
  scene: 'player_house',
  player: { x: 3, y: 4, dir: 'down', moving: false, mx: 0, my: 0, frame: 0 },
  flags: {},
  dialogue: null,
  cutscene: null,
  battle: null,
};

// ---------------------------------------------------------------------
// Tile properties
// ---------------------------------------------------------------------
const TILES = {
  // --- Outdoor base ---
  '.': { color: COL.leafLight, blocked: false, decoration: 'grass' },
  ',': { color: COL.leafLight, blocked: false, decoration: 'grass-tuft' },
  'g': { color: COL.leafMid,   blocked: false, decoration: 'tall-grass', encounter: true },
  'T': { color: COL.leafMid,   blocked: true,  decoration: 'tree' },
  'w': { color: COL.oceanMid,  blocked: true,  decoration: 'water' },
  's': { color: COL.sandLight, blocked: false, decoration: 'sand' },
  'p': { color: COL.pathLight, blocked: false, decoration: 'path' },
  'r': { color: COL.roofRed,   blocked: true,  decoration: 'roof' },
  'W': { color: COL.wallCream, blocked: true,  decoration: 'wall' },
  'd': { color: COL.woodMid,   blocked: false, decoration: 'door' },
  'c': { color: COL.leafLight, blocked: true,  decoration: 'sign' },
  'f': { color: COL.leafLight, blocked: true,  decoration: 'fence' },
  'F': { color: COL.leafLight, blocked: false, decoration: 'flower' },

  // --- New NS-themed outdoor ---
  '~': { color: COL.oceanMid,  blocked: true,  decoration: 'ocean' },
  'L': { color: COL.leafLight, blocked: true,  decoration: 'lighthouse' },
  'l': { color: COL.leafLight, blocked: false, decoration: 'lupine' },
  'm': { color: COL.leafLight, blocked: false, decoration: 'mayflower' },
  'R': { color: COL.leafLight, blocked: true,  decoration: 'rock' },
  'h': { color: COL.sandLight, blocked: true,  decoration: 'lobster-trap' },
  'P': { color: COL.woodMid,   blocked: false, decoration: 'pier' },
  'y': { color: COL.oceanLight,blocked: true,  decoration: 'dory' },
  'C': { color: COL.stoneLight,blocked: true,  decoration: 'cliff' },

  // --- Interior ---
  'D': { color: COL.floorLight, blocked: false, decoration: 'floor' },
  'K': { color: COL.wallCream,  blocked: true,  decoration: 'wall-interior' },
  'M': { color: COL.floorLight, blocked: false, decoration: 'mat' },
  'b': { color: COL.bedFrame,   blocked: true,  decoration: 'bed' },
  't': { color: COL.floorLight, blocked: true,  decoration: 'table' },
  'B': { color: COL.shelfWood,  blocked: true,  decoration: 'bookshelf' },
  'o': { color: COL.floorLight, blocked: true,  decoration: 'pokeball' },
  'S': { color: COL.stoneLight, blocked: false, decoration: 'stairs' },
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function substituteText(t) {
  return String(t).replace(/IRENE/g, getPlayerName());
}
function getPlayerName() { return state.flags.playerName || 'IRENE'; }

function pokeballTaken(scene, x, y) {
  const ball = (scene.pokeballs || []).find(b => b.x === x && b.y === y);
  return ball && state.flags['took_' + ball.id];
}

// Tweens 0..1 used for animated tiles (water, lighthouse beam)
function anim(periodMs) {
  return ((Date.now() / periodMs) | 0);
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------
function render() {
  if (state.titleScreen) { renderTitleScreen(); return; }
  if (state.battle) {
    renderBattle();
    if (state.dialogue) drawDialogue();
    return;
  }

  const scene = SCENES[state.scene];
  if (!scene) return;

  // Clear with the scene's base outdoor green
  ctx.fillStyle = COL.leafLight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Camera centered on player, clamped to scene bounds
  let cx = state.player.x - Math.floor(VIEW_W / 2);
  let cy = state.player.y - Math.floor(VIEW_H / 2);
  cx = Math.max(0, Math.min(scene.width - VIEW_W, cx));
  cy = Math.max(0, Math.min(scene.height - VIEW_H, cy));
  if (scene.width < VIEW_W) cx = Math.floor((scene.width - VIEW_W) / 2);
  if (scene.height < VIEW_H) cy = Math.floor((scene.height - VIEW_H) / 2);

  // Tiles
  for (let y = 0; y < VIEW_H; y++) {
    for (let x = 0; x < VIEW_W; x++) {
      const wx = cx + x, wy = cy + y;
      if (wx < 0 || wy < 0 || wx >= scene.width || wy >= scene.height) continue;
      let ch = scene.tiles[wy][wx];
      // Hide pokeballs that have been taken
      if (ch === 'o' && pokeballTaken(scene, wx, wy)) ch = 'D';
      drawTile(ch, x * TILE, y * TILE);
    }
  }

  // NPCs
  for (const npc of scene.npcs || []) {
    if (npc.condition && !npc.condition()) continue;
    if (npc.x < 0 || npc.y < 0) continue;
    const sx = (npc.x - cx) * TILE;
    const sy = (npc.y - cy) * TILE;
    if (sx < -TILE || sy < -TILE || sx >= canvas.width || sy >= canvas.height) continue;
    drawCharacter(sx, sy, npc.dir || 'down', npc.style || NPC_STYLES.default, 0);
  }

  // Player
  const px = (state.player.x - cx) * TILE + state.player.mx;
  const py = (state.player.y - cy) * TILE + state.player.my;
  drawCharacter(px, py, state.player.dir, PLAYER_STYLE, state.player.frame);

  if (state.dialogue) drawDialogue();
}

// ---------------------------------------------------------------------
// Title screen - waving Atlantic horizon + multi-color logo
// ---------------------------------------------------------------------
function renderTitleScreen() {
  // Sky gradient (banded, no real gradients in pixel art)
  ctx.fillStyle = COL.skyTop;
  ctx.fillRect(0, 0, canvas.width, 70);
  ctx.fillStyle = COL.uiHighlight;
  ctx.fillRect(0, 70, canvas.width, 12);

  // Sea
  ctx.fillStyle = COL.oceanLight;
  ctx.fillRect(0, 82, canvas.width, 8);
  ctx.fillStyle = COL.oceanMid;
  ctx.fillRect(0, 90, canvas.width, 18);
  ctx.fillStyle = COL.oceanDeep;
  ctx.fillRect(0, 108, canvas.width, canvas.height - 108);

  // Animated wave caps drifting east
  const t = anim(180);
  ctx.fillStyle = COL.waveCap;
  for (let i = 0; i < 9; i++) {
    const wx = ((i * 22 + t * 4) % (canvas.width + 22)) - 12;
    ctx.fillRect(wx,      92 + (i % 2) * 6, 4, 1);
    ctx.fillRect(wx + 10, 100 + (i % 2) * 8, 3, 1);
  }

  // Distant lighthouse silhouette on the right
  ctx.fillStyle = COL.lhWhite;
  ctx.fillRect(canvas.width - 22, 60, 5, 22);
  ctx.fillStyle = COL.lhRed;
  ctx.fillRect(canvas.width - 22, 64, 5, 2);
  ctx.fillRect(canvas.width - 22, 70, 5, 2);
  ctx.fillRect(canvas.width - 23, 56, 7, 4);
  ctx.fillStyle = COL.lhBeam;
  ctx.fillRect(canvas.width - 21, 58, 3, 1);
  ctx.fillStyle = COL.stoneDark;
  ctx.fillRect(canvas.width - 24, 80, 9, 4);

  // Tiny boat sailing across
  const bx = (anim(120) * 1) % (canvas.width + 20) - 10;
  ctx.fillStyle = COL.woodDark;
  ctx.fillRect(bx, 96, 8, 2);
  ctx.fillStyle = COL.lhRed;
  ctx.fillRect(bx + 3, 92, 1, 4);
  ctx.fillStyle = COL.lhWhite;
  ctx.fillRect(bx + 4, 92, 3, 4);

  // Logo: yellow with red shadow
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = COL.lhDark;
  ctx.fillText('POKéMON', canvas.width / 2 + 1, 11);
  ctx.fillStyle = COL.lhRed;
  ctx.fillText('POKéMON', canvas.width / 2 + 1, 10);
  ctx.fillStyle = COL.flowerYellow;
  ctx.fillText('POKéMON', canvas.width / 2, 10);

  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillStyle = COL.oceanDeep;
  ctx.fillText('NOVA SCOTIA', canvas.width / 2 + 1, 31);
  ctx.fillStyle = COL.uiCream;
  ctx.fillText('NOVA SCOTIA', canvas.width / 2, 30);

  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = COL.uiCream;
  ctx.fillText('A BLUENOSE ADVENTURE', canvas.width / 2, 46);

  // Press Z to start (blink)
  if ((Date.now() / 600 | 0) % 2 === 0) {
    ctx.fillStyle = COL.flowerYellow;
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('PRESS Z TO START', canvas.width / 2, 128);
  }

  ctx.textAlign = 'left';
}

// ---------------------------------------------------------------------
// Tile / decoration drawing
// ---------------------------------------------------------------------
function drawTile(ch, x, y) {
  const t = TILES[ch] || TILES['.'];
  ctx.fillStyle = t.color;
  ctx.fillRect(x, y, TILE, TILE);
  if (t.decoration) drawDecoration(t.decoration, x, y);
}

function drawDecoration(kind, x, y) {
  switch (kind) {
    // ---------- Outdoor ----------
    case 'grass':
      ctx.fillStyle = COL.leafMid;
      ctx.fillRect(x + 4, y + 11, 1, 1);
      ctx.fillRect(x + 11, y + 4, 1, 1);
      break;

    case 'grass-tuft':
      ctx.fillStyle = COL.leafDark;
      ctx.fillRect(x + 3, y + 10, 2, 5);
      ctx.fillRect(x + 11, y + 10, 2, 5);
      ctx.fillStyle = COL.leafMid;
      ctx.fillRect(x + 4, y + 12, 1, 2);
      ctx.fillRect(x + 12, y + 12, 1, 2);
      break;

    case 'tall-grass':
      ctx.fillStyle = COL.leafDark;
      ctx.fillRect(x + 1, y + 10, 3, 5);
      ctx.fillRect(x + 6, y + 10, 3, 5);
      ctx.fillRect(x + 11, y + 10, 3, 5);
      ctx.fillRect(x + 3, y + 4, 2, 4);
      ctx.fillRect(x + 9, y + 4, 2, 4);
      ctx.fillStyle = COL.leafMid;
      ctx.fillRect(x + 1, y + 14, 3, 1);
      ctx.fillRect(x + 6, y + 14, 3, 1);
      ctx.fillRect(x + 11, y + 14, 3, 1);
      break;

    case 'tree':
      // Canopy
      ctx.fillStyle = COL.leafDark;
      ctx.fillRect(x + 1, y, 14, 12);
      ctx.fillStyle = COL.leafMid;
      ctx.fillRect(x + 2, y + 1, 12, 10);
      ctx.fillStyle = COL.leafLight;
      ctx.fillRect(x + 4, y + 2, 2, 2);
      ctx.fillRect(x + 9, y + 4, 2, 2);
      ctx.fillRect(x + 6, y + 7, 2, 2);
      // Trunk
      ctx.fillStyle = COL.trunkDark;
      ctx.fillRect(x + 6, y + 11, 4, 5);
      ctx.fillStyle = COL.trunkLight;
      ctx.fillRect(x + 7, y + 12, 1, 3);
      break;

    case 'water': {
      // Stagnant pond: lighter band over base oceanMid
      const phase = anim(700) % 2;
      ctx.fillStyle = COL.oceanLight;
      ctx.fillRect(x + 1, y + 4 + phase, 6, 1);
      ctx.fillRect(x + 8, y + 9 - phase, 6, 1);
      ctx.fillRect(x + 3, y + 13, 5, 1);
      ctx.fillStyle = COL.waveCap;
      ctx.fillRect(x + 2 + phase, y + 4 + phase, 1, 1);
      ctx.fillRect(x + 9, y + 9 - phase, 1, 1);
      break;
    }

    case 'ocean': {
      const phase = anim(450) % 4;
      // Dark band on bottom for depth
      ctx.fillStyle = COL.oceanDeep;
      ctx.fillRect(x, y + 11, TILE, 5);
      // Shimmer ripples drift across
      ctx.fillStyle = COL.oceanLight;
      ctx.fillRect(x + ((phase * 3) % 14), y + 3, 4, 1);
      ctx.fillRect(x + ((phase * 4 + 6) % 14), y + 8, 5, 1);
      ctx.fillRect(x + ((phase * 2 + 10) % 14), y + 13, 4, 1);
      ctx.fillStyle = COL.waveCap;
      ctx.fillRect(x + ((phase * 3 + 1) % 14), y + 3, 1, 1);
      ctx.fillRect(x + ((phase * 4 + 7) % 14), y + 8, 1, 1);
      break;
    }

    case 'sand':
      ctx.fillStyle = COL.sandMid;
      ctx.fillRect(x + 3, y + 6, 1, 1);
      ctx.fillRect(x + 10, y + 3, 1, 1);
      ctx.fillRect(x + 6, y + 12, 2, 1);
      ctx.fillRect(x + 13, y + 11, 1, 1);
      ctx.fillStyle = COL.uiCream;
      ctx.fillRect(x + 11, y + 7, 1, 1);
      break;

    case 'path':
      ctx.fillStyle = COL.pathDark;
      ctx.fillRect(x + 4, y + 7, 1, 1);
      ctx.fillRect(x + 11, y + 3, 1, 1);
      ctx.fillRect(x + 2, y + 13, 1, 1);
      ctx.fillRect(x + 9, y + 11, 1, 1);
      ctx.fillStyle = COL.sandMid;
      ctx.fillRect(x + 7, y + 5, 1, 1);
      break;

    case 'roof':
      // Layered red shingles
      ctx.fillStyle = COL.roofRedDark;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COL.roofRed;
      ctx.fillRect(x, y + 1, TILE, 3);
      ctx.fillRect(x, y + 5, TILE, 3);
      ctx.fillRect(x, y + 9, TILE, 3);
      ctx.fillRect(x, y + 13, TILE, 2);
      ctx.fillStyle = COL.roofRedHi;
      ctx.fillRect(x, y + 1, TILE, 1);
      ctx.fillRect(x, y + 5, TILE, 1);
      ctx.fillRect(x, y + 9, TILE, 1);
      ctx.fillStyle = COL.roofRedDark;
      ctx.fillRect(x + 4, y + 4, 1, 1);
      ctx.fillRect(x + 12, y + 4, 1, 1);
      ctx.fillRect(x + 4, y + 12, 1, 1);
      ctx.fillRect(x + 12, y + 12, 1, 1);
      break;

    case 'wall':
      // Cream wall with stone divisions
      ctx.fillStyle = COL.wallCreamDark;
      ctx.fillRect(x, y + 5, TILE, 1);
      ctx.fillRect(x, y + 11, TILE, 1);
      ctx.fillRect(x + 5, y, 1, 5);
      ctx.fillRect(x + 11, y + 6, 1, 5);
      ctx.fillRect(x + 3, y + 12, 1, 4);
      ctx.fillRect(x + 13, y + 12, 1, 4);
      // Tiny window panes
      ctx.fillStyle = COL.windowBlue;
      ctx.fillRect(x + 2, y + 1, 4, 3);
      ctx.fillRect(x + 10, y + 1, 4, 3);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 2, y + 1, 4, 1);
      ctx.fillRect(x + 10, y + 1, 4, 1);
      ctx.fillRect(x + 3, y + 1, 1, 3);
      ctx.fillRect(x + 11, y + 1, 1, 3);
      break;

    case 'door':
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 3, y, 10, 16);
      ctx.fillStyle = COL.woodLight;
      ctx.fillRect(x + 4, y + 2, 8, 13);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 4, y + 8, 8, 1);
      ctx.fillRect(x + 8, y + 2, 1, 6);
      ctx.fillRect(x + 8, y + 9, 1, 6);
      ctx.fillStyle = COL.flowerYellow; // brass knob
      ctx.fillRect(x + 10, y + 9, 1, 1);
      break;

    case 'sign':
      // Wooden post
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 7, y + 9, 2, 7);
      // Sign board
      ctx.fillStyle = COL.signWood;
      ctx.fillRect(x + 2, y + 3, 12, 7);
      ctx.fillStyle = COL.signLight;
      ctx.fillRect(x + 3, y + 4, 10, 5);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 4, y + 5, 8, 1);
      ctx.fillRect(x + 4, y + 7, 6, 1);
      break;

    case 'fence':
      // White picket fence
      ctx.fillStyle = COL.uiCream;
      ctx.fillRect(x, y + 6, TILE, 2);
      ctx.fillRect(x + 2, y + 3, 2, 9);
      ctx.fillRect(x + 7, y + 3, 2, 9);
      ctx.fillRect(x + 12, y + 3, 2, 9);
      ctx.fillRect(x + 2, y + 2, 2, 1);
      ctx.fillRect(x + 7, y + 2, 2, 1);
      ctx.fillRect(x + 12, y + 2, 2, 1);
      ctx.fillStyle = COL.wallCreamDark;
      ctx.fillRect(x, y + 8, TILE, 1);
      break;

    case 'flower':
      // Pink mayflower (small)
      ctx.fillStyle = COL.mayflowerPink;
      ctx.fillRect(x + 6, y + 6, 4, 4);
      ctx.fillStyle = COL.mayflowerHi;
      ctx.fillRect(x + 7, y + 7, 2, 2);
      ctx.fillStyle = COL.flowerYellow;
      ctx.fillRect(x + 8, y + 8, 1, 1);
      ctx.fillStyle = COL.leafDark;
      ctx.fillRect(x + 8, y + 10, 1, 4);
      break;

    // ---------- New NS-themed outdoor ----------
    case 'lighthouse':
      // Foundation
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x + 3, y + 14, 10, 2);
      ctx.fillStyle = COL.stoneMid;
      ctx.fillRect(x + 4, y + 13, 8, 1);
      // Body
      ctx.fillStyle = COL.lhWhite;
      ctx.fillRect(x + 5, y + 4, 6, 10);
      // Red bands
      ctx.fillStyle = COL.lhRed;
      ctx.fillRect(x + 5, y + 6, 6, 2);
      ctx.fillRect(x + 5, y + 10, 6, 2);
      // Body shading
      ctx.fillStyle = COL.lhDark;
      ctx.fillRect(x + 5, y + 4, 1, 10);
      ctx.fillRect(x + 10, y + 4, 1, 10);
      // Lantern room (wider top)
      ctx.fillStyle = COL.lhDark;
      ctx.fillRect(x + 4, y + 3, 8, 1);
      ctx.fillStyle = COL.flowerYellow;
      ctx.fillRect(x + 5, y + 1, 6, 2);
      // Animated beam glow
      if (anim(700) % 2 === 0) {
        ctx.fillStyle = COL.lhBeam;
        ctx.fillRect(x + 6, y + 1, 4, 2);
      }
      // Dome cap
      ctx.fillStyle = COL.lhRed;
      ctx.fillRect(x + 6, y, 4, 1);
      break;

    case 'lupine':
      // Stem and leaves
      ctx.fillStyle = COL.lupineLeaf;
      ctx.fillRect(x + 7, y + 9, 1, 7);
      ctx.fillRect(x + 5, y + 12, 2, 1);
      ctx.fillRect(x + 9, y + 13, 2, 1);
      // Purple flower spike
      ctx.fillStyle = COL.lupineDark;
      ctx.fillRect(x + 6, y + 2, 4, 8);
      ctx.fillStyle = COL.lupinePurple;
      ctx.fillRect(x + 7, y + 2, 2, 7);
      ctx.fillStyle = COL.mayflowerHi;
      ctx.fillRect(x + 7, y + 3, 1, 1);
      ctx.fillRect(x + 7, y + 6, 1, 1);
      ctx.fillRect(x + 8, y + 9, 1, 1);
      break;

    case 'mayflower':
      // Provincial flower: white petals with pink center
      ctx.fillStyle = COL.flowerWhite;
      ctx.fillRect(x + 5, y + 6, 6, 6);
      ctx.fillStyle = COL.mayflowerPink;
      ctx.fillRect(x + 6, y + 7, 4, 4);
      ctx.fillStyle = COL.flowerYellow;
      ctx.fillRect(x + 7, y + 8, 2, 2);
      ctx.fillStyle = COL.leafDark;
      ctx.fillRect(x + 7, y + 12, 2, 3);
      ctx.fillRect(x + 4, y + 13, 2, 1);
      ctx.fillRect(x + 10, y + 13, 2, 1);
      break;

    case 'rock':
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x + 2, y + 5, 12, 10);
      ctx.fillStyle = COL.stoneMid;
      ctx.fillRect(x + 3, y + 6, 10, 8);
      ctx.fillStyle = COL.stoneLight;
      ctx.fillRect(x + 5, y + 7, 5, 3);
      ctx.fillRect(x + 11, y + 9, 1, 2);
      // Cracks
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x + 8, y + 9, 1, 4);
      ctx.fillRect(x + 5, y + 11, 2, 1);
      break;

    case 'lobster-trap':
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 1, y + 4, 14, 11);
      ctx.fillStyle = COL.woodLight;
      ctx.fillRect(x + 2, y + 5, 12, 9);
      // Slats (vertical)
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 5, y + 4, 1, 11);
      ctx.fillRect(x + 8, y + 4, 1, 11);
      ctx.fillRect(x + 11, y + 4, 1, 11);
      // Bands (horizontal)
      ctx.fillRect(x + 1, y + 8, 14, 1);
      ctx.fillRect(x + 1, y + 12, 14, 1);
      // Yellow rope coil on top
      ctx.fillStyle = COL.flowerYellow;
      ctx.fillRect(x + 5, y + 2, 6, 2);
      ctx.fillStyle = COL.pathDark;
      ctx.fillRect(x + 6, y + 3, 1, 1);
      ctx.fillRect(x + 9, y + 3, 1, 1);
      break;

    case 'pier':
      // Wood plank base, then dark seams
      ctx.fillStyle = COL.woodLight;
      ctx.fillRect(x, y, TILE, 4);
      ctx.fillRect(x, y + 5, TILE, 4);
      ctx.fillRect(x, y + 10, TILE, 4);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x, y + 4, TILE, 1);
      ctx.fillRect(x, y + 9, TILE, 1);
      ctx.fillRect(x, y + 14, TILE, 2);
      ctx.fillRect(x + 5, y, 1, 16);
      ctx.fillRect(x + 11, y, 1, 16);
      break;

    case 'dory':
      // Hull
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 1, y + 7, 14, 7);
      ctx.fillStyle = COL.woodLight;
      ctx.fillRect(x + 2, y + 8, 12, 5);
      // Red stripe along the gunwale
      ctx.fillStyle = COL.lhRed;
      ctx.fillRect(x + 1, y + 7, 14, 1);
      // Seats
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 5, y + 9, 1, 3);
      ctx.fillRect(x + 10, y + 9, 1, 3);
      // Ripple under
      ctx.fillStyle = COL.waveCap;
      ctx.fillRect(x + 2, y + 14, 4, 1);
      ctx.fillRect(x + 10, y + 14, 4, 1);
      break;

    case 'cliff':
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COL.stoneMid;
      ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
      ctx.fillStyle = COL.stoneLight;
      ctx.fillRect(x + 3, y + 3, 4, 2);
      ctx.fillRect(x + 9, y + 8, 4, 2);
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x + 7, y + 4, 1, 6);
      ctx.fillRect(x + 4, y + 10, 8, 1);
      break;

    // ---------- Interior ----------
    case 'floor':
      ctx.fillStyle = COL.floorDark;
      ctx.fillRect(x, y + 7, TILE, 1);
      ctx.fillRect(x, y + 15, TILE, 1);
      ctx.fillRect(x + 4, y, 1, 7);
      ctx.fillRect(x + 12, y + 8, 1, 7);
      break;

    case 'wall-interior':
      ctx.fillStyle = COL.wallCream;
      ctx.fillRect(x, y, TILE, TILE);
      // Subtle wallpaper specks
      ctx.fillStyle = COL.wallCreamDark;
      ctx.fillRect(x + 3, y + 4, 1, 1);
      ctx.fillRect(x + 11, y + 6, 1, 1);
      ctx.fillRect(x + 7, y + 11, 1, 1);
      ctx.fillRect(x + 4, y + 13, 1, 1);
      ctx.fillRect(x + 13, y + 2, 1, 1);
      break;

    case 'mat':
      // Cover the floor first
      ctx.fillStyle = COL.floorLight;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COL.rugRedDark;
      ctx.fillRect(x + 1, y + 4, 14, 9);
      ctx.fillStyle = COL.rugRed;
      ctx.fillRect(x + 2, y + 5, 12, 7);
      ctx.fillStyle = COL.flowerYellow;
      ctx.fillRect(x + 3, y + 7, 1, 3);
      ctx.fillRect(x + 12, y + 7, 1, 3);
      ctx.fillStyle = COL.uiCream;
      ctx.fillRect(x + 6, y + 8, 4, 1);
      break;

    case 'bed':
      ctx.fillStyle = COL.bedFrame;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COL.bedSheet;
      ctx.fillRect(x + 1, y + 3, 14, 12);
      // Pillow
      ctx.fillStyle = COL.bedPillow;
      ctx.fillRect(x + 2, y + 4, 5, 5);
      ctx.fillStyle = COL.mayflowerPink;
      ctx.fillRect(x + 3, y + 5, 3, 3);
      // Quilt patch
      ctx.fillStyle = COL.lupinePurple;
      ctx.fillRect(x + 1, y + 10, 14, 1);
      ctx.fillStyle = COL.lupineDark;
      ctx.fillRect(x + 1, y + 12, 14, 1);
      break;

    case 'table':
      // Floor under it
      ctx.fillStyle = COL.floorLight;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 1, y + 4, 14, 4);
      ctx.fillStyle = COL.woodLight;
      ctx.fillRect(x + 2, y + 5, 12, 2);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x + 2, y + 7, 2, 8);
      ctx.fillRect(x + 12, y + 7, 2, 8);
      // Mug on top
      ctx.fillStyle = COL.lhWhite;
      ctx.fillRect(x + 7, y + 2, 2, 2);
      ctx.fillStyle = COL.lhRed;
      ctx.fillRect(x + 7, y + 2, 2, 1);
      break;

    case 'bookshelf':
      ctx.fillStyle = COL.shelfWood;
      ctx.fillRect(x, y, TILE, TILE);
      // Books row 1
      ctx.fillStyle = COL.bookRed;
      ctx.fillRect(x + 1, y + 2, 2, 4);
      ctx.fillStyle = COL.bookBlue;
      ctx.fillRect(x + 4, y + 2, 2, 4);
      ctx.fillStyle = COL.bookGreen;
      ctx.fillRect(x + 7, y + 1, 2, 5);
      ctx.fillStyle = COL.bookRed;
      ctx.fillRect(x + 10, y + 2, 2, 4);
      ctx.fillStyle = COL.bookBlue;
      ctx.fillRect(x + 13, y + 2, 2, 4);
      // Shelf line
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x, y + 6, TILE, 1);
      // Books row 2
      ctx.fillStyle = COL.bookGreen;
      ctx.fillRect(x + 2, y + 8, 2, 4);
      ctx.fillStyle = COL.bookRed;
      ctx.fillRect(x + 5, y + 8, 2, 4);
      ctx.fillStyle = COL.bookBlue;
      ctx.fillRect(x + 8, y + 7, 2, 5);
      ctx.fillStyle = COL.bookGreen;
      ctx.fillRect(x + 11, y + 8, 2, 4);
      ctx.fillStyle = COL.woodDark;
      ctx.fillRect(x, y + 12, TILE, 1);
      // Books row 3
      ctx.fillStyle = COL.bookRed;
      ctx.fillRect(x + 1, y + 13, 2, 3);
      ctx.fillStyle = COL.bookBlue;
      ctx.fillRect(x + 4, y + 13, 2, 3);
      ctx.fillStyle = COL.bookGreen;
      ctx.fillRect(x + 9, y + 13, 2, 3);
      break;

    case 'pokeball':
      // Floor under it
      ctx.fillStyle = COL.floorLight;
      ctx.fillRect(x, y, TILE, TILE);
      // Outer black ring
      ctx.fillStyle = COL.pokeballDark;
      ctx.fillRect(x + 4, y + 5, 8, 7);
      ctx.fillRect(x + 5, y + 4, 6, 1);
      ctx.fillRect(x + 5, y + 12, 6, 1);
      // Red top half
      ctx.fillStyle = COL.pokeballRed;
      ctx.fillRect(x + 5, y + 5, 6, 3);
      // White bottom half
      ctx.fillStyle = COL.pokeballWhite;
      ctx.fillRect(x + 5, y + 9, 6, 3);
      // Center band + button
      ctx.fillStyle = COL.pokeballDark;
      ctx.fillRect(x + 5, y + 8, 6, 1);
      ctx.fillStyle = COL.pokeballWhite;
      ctx.fillRect(x + 7, y + 8, 2, 1);
      // Highlight
      ctx.fillStyle = COL.mayflowerHi;
      ctx.fillRect(x + 6, y + 6, 1, 1);
      break;

    case 'stairs':
      ctx.fillStyle = COL.stoneDark;
      ctx.fillRect(x, y + 6, TILE, 2);
      ctx.fillRect(x, y + 11, TILE, 2);
      ctx.fillStyle = COL.stoneMid;
      ctx.fillRect(x, y + 8, TILE, 3);
      ctx.fillRect(x, y + 13, TILE, 3);
      break;
  }
}

// ---------------------------------------------------------------------
// Character sprites
// Each style is a partial { hair, hat, shirt, pants, skin } - missing
// fields fall back to defaults so older code paths keep working.
// ---------------------------------------------------------------------
const PLAYER_STYLE = {
  hat: COL.lhRed,
  hair: COL.hairBrown,
  shirt: COL.shirtTeal,
  pants: COL.pantsBlue,
  skin: COL.skin,
};

const NPC_STYLES = {
  default: { hair: COL.hairBrown, shirt: COL.shirtBrown, pants: COL.pantsBrown, skin: COL.skin },
  mom:     { hair: COL.hairBrown, shirt: COL.shirtPink,  pants: COL.pantsBlue,  skin: COL.skin },
  mackay:  { hair: COL.hairGray,  shirt: COL.shirtWhite, pants: COL.pantsKhaki, skin: COL.skin },
  angus:   { hair: COL.hairRed,   shirt: COL.shirtBlue,  pants: COL.pantsBlue,  skin: COL.skin, hat: COL.shirtBlue },
  doug:    { hair: COL.hairRed,   shirt: COL.shirtPlaid, pants: COL.pantsBrown, skin: COL.skin, hat: COL.flowerYellow },
  kid:     { hair: COL.hairBrown, shirt: COL.shirtYellow,pants: COL.pantsBlue,  skin: COL.skin },
  elder:   { hair: COL.hairGray,  shirt: COL.shirtBrown, pants: COL.pantsBrown, skin: COL.skinDark },
};

function drawCharacter(x, y, dir, style, frame) {
  // Accept a style preset name ('mom'), an inline object, or a legacy color string.
  if (typeof style === 'string') {
    style = NPC_STYLES[style] || { shirt: style };
  }
  style = style || NPC_STYLES.default;

  const skin = style.skin || COL.skin;
  const hair = style.hair || COL.hairBrown;
  const hat  = style.hat || null;
  const shirt = style.shirt || PAL.dark;
  const pants = style.pants || COL.pantsBrown;

  // Head (skin)
  ctx.fillStyle = skin;
  ctx.fillRect(x + 4, y + 2, 8, 5);

  // Hair / hat
  if (hat) {
    ctx.fillStyle = hat;
    ctx.fillRect(x + 4, y + 1, 8, 3);
    if (dir !== 'up') {
      // Brim peek
      ctx.fillStyle = COL.black;
      ctx.fillRect(x + 3, y + 4, 4, 1);
    }
  } else {
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 1, 8, 3);
    if (dir === 'up') ctx.fillRect(x + 4, y + 4, 8, 2);
  }

  // Eyes / face direction
  ctx.fillStyle = COL.black;
  if (dir === 'down') {
    ctx.fillRect(x + 6, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
  } else if (dir === 'left') {
    ctx.fillRect(x + 5, y + 5, 1, 1);
  } else if (dir === 'right') {
    ctx.fillRect(x + 10, y + 5, 1, 1);
  }

  // Body (shirt) with one-pixel shadow on left side
  ctx.fillStyle = shirt;
  ctx.fillRect(x + 4, y + 7, 8, 5);
  ctx.fillStyle = COL.black;
  ctx.fillRect(x + 3, y + 8, 1, 3);
  ctx.fillRect(x + 12, y + 8, 1, 3);

  // Arms (skin)
  ctx.fillStyle = skin;
  if (dir === 'down' || dir === 'up') {
    ctx.fillRect(x + 3, y + 9, 1, 2);
    ctx.fillRect(x + 12, y + 9, 1, 2);
  } else if (dir === 'left') {
    ctx.fillRect(x + 3, y + 9, 1, 2);
  } else if (dir === 'right') {
    ctx.fillRect(x + 12, y + 9, 1, 2);
  }

  // Legs (alternate based on frame for walk animation)
  ctx.fillStyle = pants;
  if (frame % 2 === 0) {
    ctx.fillRect(x + 4, y + 12, 3, 3);
    ctx.fillRect(x + 9, y + 12, 3, 3);
  } else {
    ctx.fillRect(x + 5, y + 12, 3, 3);
    ctx.fillRect(x + 8, y + 12, 3, 3);
  }

  // Shoes (black)
  ctx.fillStyle = COL.black;
  if (frame % 2 === 0) {
    ctx.fillRect(x + 4, y + 15, 3, 1);
    ctx.fillRect(x + 9, y + 15, 3, 1);
  } else {
    ctx.fillRect(x + 5, y + 15, 3, 1);
    ctx.fillRect(x + 8, y + 15, 3, 1);
  }
}

// ---------------------------------------------------------------------
// Dialogue box - cream w/ dark border, classic Pokemon style
// ---------------------------------------------------------------------
function drawDialogue() {
  const boxY = 90;
  const boxH = 52;
  // Outer dark border
  ctx.fillStyle = COL.uiBorder;
  ctx.fillRect(2, boxY, canvas.width - 4, boxH - 2);
  // Inner cream background
  ctx.fillStyle = COL.uiCream;
  ctx.fillRect(5, boxY + 3, canvas.width - 10, boxH - 8);
  // Subtle inner accent
  ctx.fillStyle = COL.wallCreamDark;
  ctx.fillRect(5, boxY + 3, canvas.width - 10, 1);
  ctx.fillRect(5, boxY + boxH - 6, canvas.width - 10, 1);

  // Text
  const text = substituteText(state.dialogue.lines[state.dialogue.line] || '');
  drawText(text, 9, boxY + 8, canvas.width - 18);

  // Blinking advance arrow
  if ((Date.now() / 350 | 0) % 2 === 0) {
    ctx.fillStyle = COL.uiBorder;
    ctx.fillRect(canvas.width - 12, boxY + boxH - 11, 4, 4);
    ctx.fillStyle = COL.uiCream;
    ctx.fillRect(canvas.width - 11, boxY + boxH - 10, 2, 1);
  }
}

function drawText(text, x, y, maxW) {
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = COL.textDark;

  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const w of words) {
    const test = line + (line ? ' ' : '') + w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      cy += 10;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

// ---------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------
const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (state.titleScreen && (k === 'z' || k === 'enter')) {
    state.titleScreen = false;
    e.preventDefault();
    return;
  }

  if (k === 'z' || k === 'enter') {
    if (state.dialogue) advanceDialogue();
    else if (!state.cutscene) interact();
    e.preventDefault();
  }

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ---------------------------------------------------------------------
// Update / movement
// ---------------------------------------------------------------------
let lastFrameTime = performance.now();

function update(now) {
  const dt = now - lastFrameTime;
  lastFrameTime = now;

  if (state.titleScreen) return;

  if (state.battle) { runBattle(dt); return; }
  if (state.cutscene) { runCutscene(dt); return; }
  if (state.dialogue) return;

  if (!state.player.moving) {
    let dx = 0, dy = 0, dir = state.player.dir;
    if (keys['arrowup'] || keys['w'])         { dy = -1; dir = 'up'; }
    else if (keys['arrowdown'] || keys['s'])  { dy =  1; dir = 'down'; }
    else if (keys['arrowleft'] || keys['a'])  { dx = -1; dir = 'left'; }
    else if (keys['arrowright'] || keys['d']) { dx =  1; dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      state.player.dir = dir;
      tryMove(dx, dy);
    }
  } else {
    const speed = 2; // pixels per frame
    if (state.player.mx > 0) state.player.mx = Math.max(0, state.player.mx - speed);
    if (state.player.mx < 0) state.player.mx = Math.min(0, state.player.mx + speed);
    if (state.player.my > 0) state.player.my = Math.max(0, state.player.my - speed);
    if (state.player.my < 0) state.player.my = Math.min(0, state.player.my + speed);

    if (state.player.mx === 0 && state.player.my === 0) {
      state.player.moving = false;
      state.player.frame = (state.player.frame + 1) % 2;
      checkTriggers();
    }
  }
}

function tryMove(dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (!isPassable(state.scene, nx, ny)) return;
  state.player.x = nx;
  state.player.y = ny;
  state.player.mx = -dx * TILE;
  state.player.my = -dy * TILE;
  state.player.moving = true;
}

function isPassable(sceneName, x, y) {
  const scene = SCENES[sceneName];
  if (!scene) return false;
  if (x < 0 || y < 0 || x >= scene.width || y >= scene.height) return false;

  const ch = scene.tiles[y][x];

  if (ch === 'o') {
    if (!pokeballTaken(scene, x, y)) return false;
  } else {
    const t = TILES[ch];
    if (t && t.blocked) return false;
  }

  // NPCs block too
  for (const npc of scene.npcs || []) {
    if (npc.condition && !npc.condition()) continue;
    if (npc.x === x && npc.y === y) return false;
  }
  return true;
}

function checkTriggers() {
  const scene = SCENES[state.scene];
  for (const trig of (scene.triggers || [])) {
    if (trig.x === state.player.x && trig.y === state.player.y) {
      if (trig.condition && !trig.condition()) continue;
      if (trig.type === 'transition') {
        changeScene(trig.target, trig.tx, trig.ty, trig.tdir);
      } else if (trig.type === 'dialogue') {
        showDialogue(trig.lines);
      } else if (trig.type === 'cutscene') {
        startCutscene(trig.script);
      }
      return;
    }
  }
}

function changeScene(name, x, y, dir) {
  state.scene = name;
  if (x !== undefined) state.player.x = x;
  if (y !== undefined) state.player.y = y;
  if (dir) state.player.dir = dir;
  state.player.moving = false;
  state.player.mx = 0;
  state.player.my = 0;
}

function interact() {
  const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
  const [dx, dy] = dirs[state.player.dir];
  const tx = state.player.x + dx;
  const ty = state.player.y + dy;
  const scene = SCENES[state.scene];

  // NPCs
  for (const npc of scene.npcs || []) {
    if (npc.condition && !npc.condition()) continue;
    if (npc.x === tx && npc.y === ty) {
      const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
      npc.dir = opp[state.player.dir];
      if (typeof npc.script === 'function') {
        startCutscene(npc.script());
      } else if (npc.script) {
        startCutscene(npc.script);
      } else if (npc.lines) {
        showDialogue(npc.lines);
      }
      return;
    }
  }

  if (ty < 0 || tx < 0 || ty >= scene.height || tx >= scene.width) return;
  const ch = scene.tiles[ty][tx];

  if (ch === 'c') {
    const sign = (scene.signs || []).find(s => s.x === tx && s.y === ty);
    if (sign) showDialogue(sign.lines);
  } else if (ch === 'o') {
    const ball = (scene.pokeballs || []).find(b => b.x === tx && b.y === ty);
    if (ball && !state.flags['took_' + ball.id]) {
      const script = typeof ball.script === 'function' ? ball.script() : ball.script;
      startCutscene(script);
    }
  }
}

// ---------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------
function showDialogue(lines, onDone) {
  state.dialogue = {
    lines: Array.isArray(lines) ? lines : [lines],
    line: 0,
    onDone,
  };
}

function advanceDialogue() {
  if (!state.dialogue) return;
  state.dialogue.line++;
  if (state.dialogue.line >= state.dialogue.lines.length) {
    const cb = state.dialogue.onDone;
    state.dialogue = null;
    if (cb) cb();
  }
}

// ---------------------------------------------------------------------
// Cutscenes - sequence of step objects
// ---------------------------------------------------------------------
function startCutscene(script) {
  if (!script || !script.length) return;
  state.cutscene = { script, step: 0, wait: 0 };
}

function runCutscene(dt) {
  const cs = state.cutscene;
  if (state.dialogue) return;
  if (cs.wait > 0) { cs.wait -= dt; return; }

  while (cs.step < cs.script.length) {
    const s = cs.script[cs.step++];

    switch (s.type) {
      case 'dialogue':
        showDialogue(s.lines);
        return;

      case 'wait':
        cs.wait = s.ms || 500;
        return;

      case 'setFlag':
        state.flags[s.flag] = (s.value === undefined) ? true : s.value;
        break;

      case 'transition':
        changeScene(s.target, s.x, s.y, s.dir);
        break;

      case 'face':
        state.player.dir = s.dir;
        break;

      case 'moveNPC': {
        const scene = SCENES[state.scene];
        const npc = (scene.npcs || []).find(n => n.id === s.id);
        if (npc) {
          npc.x = s.x;
          npc.y = s.y;
          if (s.dir) npc.dir = s.dir;
        }
        break;
      }

      case 'battle': {
        const config = (typeof s.config === 'function') ? s.config() : s.config;
        startBattle(config);
        return; // pause cutscene; runBattle clears state.battle when done
      }
    }
  }
  state.cutscene = null;
}

// =====================================================================
// Battle system
// Pokemon sprites, HP bars, simple attack / damage / faint animations.
// Battles are scripted "beats" (no real combat math) - the demo always
// resolves in the player's favor, but you can SEE it now.
// =====================================================================

const POKEMON_DATA = {
  MAYFLOWER: { type: 'grass',  maxHP: 22 },
  EMBERCAT:  { type: 'fire',   maxHP: 22 },
  RIPPLOB:   { type: 'water',  maxHP: 22 },
  RATTATA:   { type: 'normal', maxHP: 14 },
};

// Each sprite drawer takes (x, y, frame). Frame is 0 or 1 for idle bobbing.
// Sprites are 28x28 with 4-tone shading (deep shadow / shadow / mid /
// highlight) plus type-themed accents (flame flicker, water sheen, etc.)
const POKEMON_SPRITES = {
  MAYFLOWER(x, y, frame) {
    const b = frame ? 1 : 0;
    const fy = y + b;  // head + bloom bob

    // ===== Mayflower bloom (rows 0-6) =====
    // White petals
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+12, fy+0, 4, 1);
    ctx.fillRect(x+10, fy+1, 8, 5);
    ctx.fillRect(x+12, fy+6, 4, 1);
    // Petal tips (pink edge)
    ctx.fillStyle = COL.mayflowerPink;
    ctx.fillRect(x+9,  fy+2, 1, 3);
    ctx.fillRect(x+18, fy+2, 1, 3);
    ctx.fillRect(x+13, fy+0, 2, 1);
    ctx.fillRect(x+13, fy+6, 2, 1);
    // Pink center + yellow heart
    ctx.fillStyle = COL.mayflowerPink;
    ctx.fillRect(x+12, fy+3, 4, 2);
    ctx.fillStyle = COL.flowerYellow;
    ctx.fillRect(x+13, fy+3, 2, 1);
    // Stem + tiny side leaf
    ctx.fillStyle = COL.lupineLeaf;
    ctx.fillRect(x+13, fy+7, 2, 2);
    ctx.fillRect(x+11, fy+8, 2, 1);

    // ===== Head outline (rows 9-16) =====
    ctx.fillStyle = COL.leafDark;
    ctx.fillRect(x+5,  fy+9, 18, 1);
    ctx.fillRect(x+4,  fy+10, 1, 6);
    ctx.fillRect(x+23, fy+10, 1, 6);
    ctx.fillRect(x+5,  fy+16, 18, 1);
    // Floppy ears (extending outward)
    ctx.fillRect(x+1,  fy+11, 3, 5);
    ctx.fillRect(x+24, fy+11, 3, 5);

    // Head fill (mid green)
    ctx.fillStyle = COL.leafMid;
    ctx.fillRect(x+5, fy+10, 18, 6);
    ctx.fillRect(x+2, fy+12, 2, 3);   // ear inner left
    ctx.fillRect(x+24, fy+12, 2, 3);  // ear inner right
    // Highlight
    ctx.fillStyle = COL.leafLight;
    ctx.fillRect(x+6, fy+10, 16, 4);

    // ===== Eyes (big, friendly) =====
    ctx.fillStyle = COL.leafDark;
    ctx.fillRect(x+8,  fy+11, 4, 4);
    ctx.fillRect(x+16, fy+11, 4, 4);
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+9,  fy+12, 2, 2);
    ctx.fillRect(x+17, fy+12, 2, 2);
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+10, fy+12, 1, 2);
    ctx.fillRect(x+18, fy+12, 1, 2);

    // Cheek blush
    ctx.fillStyle = COL.mayflowerPink;
    ctx.fillRect(x+6, fy+14, 2, 1);
    ctx.fillRect(x+20, fy+14, 2, 1);
    // Mouth
    ctx.fillStyle = COL.leafDark;
    ctx.fillRect(x+13, fy+15, 2, 1);

    // ===== Body (rows 17-21) =====
    ctx.fillStyle = COL.leafDark;
    ctx.fillRect(x+5, y+17, 18, 1);
    ctx.fillRect(x+4, y+18, 1, 4);
    ctx.fillRect(x+23, y+18, 1, 4);
    ctx.fillStyle = COL.leafMid;
    ctx.fillRect(x+5, y+18, 18, 4);
    ctx.fillStyle = COL.leafLight;
    ctx.fillRect(x+6, y+18, 16, 3);
    // Fluffy white belly
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+10, y+19, 8, 3);
    // Tail tuft (white pom)
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+24, y+18, 2, 2);
    // Grass-tuft accent on back
    ctx.fillStyle = COL.leafDark;
    ctx.fillRect(x+18, y+16, 1, 2);
    ctx.fillRect(x+20, y+16, 1, 2);

    // ===== Legs (rows 22-27) =====
    ctx.fillStyle = COL.trunkDark;
    ctx.fillRect(x+5,  y+22, 3, 5);
    ctx.fillRect(x+10, y+22, 3, 5);
    ctx.fillRect(x+15, y+22, 3, 5);
    ctx.fillRect(x+20, y+22, 3, 5);
    ctx.fillStyle = COL.trunkLight;
    ctx.fillRect(x+5,  y+22, 1, 4);
    ctx.fillRect(x+10, y+22, 1, 4);
    ctx.fillRect(x+15, y+22, 1, 4);
    ctx.fillRect(x+20, y+22, 1, 4);
    // Hooves
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+5,  y+27, 3, 1);
    ctx.fillRect(x+10, y+27, 3, 1);
    ctx.fillRect(x+15, y+27, 3, 1);
    ctx.fillRect(x+20, y+27, 3, 1);
  },

  EMBERCAT(x, y, frame) {
    const b = frame ? 1 : 0;
    const fy = y + b;
    const ff = b ? -1 : 0;  // flames flicker opposite to body bob
    const ORANGE = '#e87830', LIGHT = '#f8a850', DARK = '#a04020', DEEP = '#682010';

    // ===== Flame tufts on head (rows 0-5) =====
    ctx.fillStyle = COL.lhRed;
    ctx.fillRect(x+5,  fy+1+ff, 2, 4);
    ctx.fillRect(x+9,  fy+0+ff, 2, 5);
    ctx.fillRect(x+13, fy+0+ff, 2, 5);
    ctx.fillRect(x+17, fy+0+ff, 2, 5);
    ctx.fillRect(x+21, fy+1+ff, 2, 4);
    // Yellow flame cores
    ctx.fillStyle = COL.flowerYellow;
    ctx.fillRect(x+5,  fy+2+ff, 1, 2);
    ctx.fillRect(x+9,  fy+2+ff, 1, 3);
    ctx.fillRect(x+13, fy+2+ff, 1, 3);
    ctx.fillRect(x+17, fy+2+ff, 1, 3);
    ctx.fillRect(x+21, fy+2+ff, 1, 2);

    // ===== Head outline =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+4,  fy+5, 20, 1);
    ctx.fillRect(x+3,  fy+6, 1, 9);
    ctx.fillRect(x+24, fy+6, 1, 9);
    ctx.fillRect(x+4,  fy+15, 20, 1);

    // Head fill
    ctx.fillStyle = ORANGE;
    ctx.fillRect(x+4, fy+6, 20, 9);
    ctx.fillStyle = LIGHT;
    ctx.fillRect(x+5, fy+7, 18, 5);

    // ===== Slanted fierce eyes =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+7,  fy+9, 5, 3);
    ctx.fillRect(x+16, fy+9, 5, 3);
    ctx.fillStyle = COL.flowerYellow;
    ctx.fillRect(x+8,  fy+10, 3, 2);
    ctx.fillRect(x+17, fy+10, 3, 2);
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+9,  fy+10, 1, 2);
    ctx.fillRect(x+18, fy+10, 1, 2);

    // ===== Nose =====
    ctx.fillStyle = COL.lhRed;
    ctx.fillRect(x+13, fy+12, 2, 1);
    // Mouth (toothy)
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+11, fy+13, 6, 1);
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+12, fy+13, 1, 1);
    ctx.fillRect(x+15, fy+13, 1, 1);

    // ===== Whiskers =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+0, fy+11, 3, 1);
    ctx.fillRect(x+0, fy+13, 3, 1);
    ctx.fillRect(x+25, fy+11, 3, 1);
    ctx.fillRect(x+25, fy+13, 3, 1);

    // ===== Body =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+5, y+16, 18, 1);
    ctx.fillRect(x+4, y+17, 1, 5);
    ctx.fillRect(x+22, y+17, 1, 5);
    ctx.fillStyle = ORANGE;
    ctx.fillRect(x+5, y+17, 18, 5);
    ctx.fillStyle = LIGHT;
    ctx.fillRect(x+6, y+17, 16, 3);
    // Cream belly
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+9, y+19, 10, 3);

    // ===== Paws =====
    ctx.fillStyle = DARK;
    ctx.fillRect(x+5,  y+22, 4, 5);
    ctx.fillRect(x+10, y+22, 4, 5);
    ctx.fillRect(x+14, y+22, 4, 5);
    ctx.fillRect(x+19, y+22, 4, 5);
    ctx.fillStyle = ORANGE;
    ctx.fillRect(x+5,  y+22, 1, 4);
    ctx.fillRect(x+10, y+22, 1, 4);
    ctx.fillRect(x+14, y+22, 1, 4);
    ctx.fillRect(x+19, y+22, 1, 4);
    // Pink paw pads
    ctx.fillStyle = COL.mayflowerPink;
    ctx.fillRect(x+6,  y+27, 2, 1);
    ctx.fillRect(x+11, y+27, 2, 1);
    ctx.fillRect(x+15, y+27, 2, 1);
    ctx.fillRect(x+20, y+27, 2, 1);

    // ===== Tail with flame tip =====
    ctx.fillStyle = ORANGE;
    ctx.fillRect(x+22, y+18, 3, 3);
    ctx.fillRect(x+24, y+15, 3, 4);
    // Flame at tip (animated flicker)
    ctx.fillStyle = COL.lhRed;
    ctx.fillRect(x+25, y+11+ff, 2, 5);
    ctx.fillStyle = COL.flowerYellow;
    ctx.fillRect(x+25, y+12+ff, 1, 3);
  },

  RIPPLOB(x, y, frame) {
    const b = frame ? 1 : 0;
    const fy = y + b;

    // ===== Water drop crest (animated pulse) =====
    ctx.fillStyle = COL.oceanLight;
    ctx.fillRect(x+13, fy+0, 2, 1);
    ctx.fillRect(x+12-b, fy+1, 4+b*2, 2);
    ctx.fillRect(x+11-b, fy+3, 6+b*2, 2);
    ctx.fillRect(x+12-b, fy+5, 4+b*2, 1);
    // Drop highlight
    ctx.fillStyle = COL.waveCap;
    ctx.fillRect(x+12, fy+2, 1, 2);

    // ===== Head outline =====
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+5,  fy+7, 18, 1);
    ctx.fillRect(x+4,  fy+8, 1, 8);
    ctx.fillRect(x+23, fy+8, 1, 8);
    ctx.fillRect(x+5,  fy+16, 18, 1);

    // Head fill
    ctx.fillStyle = COL.oceanMid;
    ctx.fillRect(x+5, fy+8, 18, 8);
    ctx.fillStyle = COL.oceanLight;
    ctx.fillRect(x+6, fy+9, 16, 5);
    // Top sheen (sky reflection)
    ctx.fillStyle = COL.skyTop;
    ctx.fillRect(x+8, fy+9, 12, 2);

    // ===== Big friendly eyes =====
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+8,  fy+11, 4, 4);
    ctx.fillRect(x+16, fy+11, 4, 4);
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+9,  fy+12, 2, 2);
    ctx.fillRect(x+17, fy+12, 2, 2);

    // ===== Mouth (small smile) =====
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+12, fy+14, 4, 1);
    ctx.fillStyle = COL.mayflowerPink;
    ctx.fillRect(x+13, fy+14, 2, 1);

    // ===== Body =====
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+5, y+17, 18, 1);
    ctx.fillRect(x+4, y+18, 1, 5);
    ctx.fillRect(x+23, y+18, 1, 5);
    ctx.fillStyle = COL.oceanMid;
    ctx.fillRect(x+5, y+18, 18, 5);
    ctx.fillStyle = COL.oceanLight;
    ctx.fillRect(x+6, y+18, 16, 3);
    // Cream belly with little water dots
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+10, y+19, 8, 4);
    ctx.fillStyle = COL.oceanLight;
    ctx.fillRect(x+12, y+20, 1, 1);
    ctx.fillRect(x+15, y+21, 1, 1);

    // ===== Flippers =====
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+1,  y+19, 3, 5);
    ctx.fillRect(x+24, y+19, 3, 5);
    ctx.fillStyle = COL.oceanMid;
    ctx.fillRect(x+1,  y+20, 2, 3);
    ctx.fillRect(x+25, y+20, 2, 3);

    // ===== Webbed feet =====
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+6,  y+24, 7, 3);
    ctx.fillRect(x+15, y+24, 7, 3);
    ctx.fillStyle = COL.oceanMid;
    ctx.fillRect(x+7,  y+24, 5, 2);
    ctx.fillRect(x+16, y+24, 5, 2);
    // Toe nubs
    ctx.fillStyle = COL.oceanDeep;
    ctx.fillRect(x+6,  y+27, 1, 1);
    ctx.fillRect(x+9,  y+27, 1, 1);
    ctx.fillRect(x+12, y+27, 1, 1);
    ctx.fillRect(x+15, y+27, 1, 1);
    ctx.fillRect(x+18, y+27, 1, 1);
    ctx.fillRect(x+21, y+27, 1, 1);
  },

  RATTATA(x, y, frame) {
    const b = frame ? 1 : 0;
    const fy = y + b;
    const eshift = b;  // ear twitch
    const PURPLE = '#a080a0', LIGHT = '#c0a0c0', DARK = '#806080', DEEP = '#503050';

    // ===== Pointy ears (twitch on frame change) =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+4,  fy+0, 5, 5);
    ctx.fillRect(x+19, fy+0, 5, 5);
    // Ear tip extensions
    ctx.fillRect(x+3-eshift, fy+1, 1, 3);
    ctx.fillRect(x+24+eshift, fy+1, 1, 3);
    // Inner ear pink
    ctx.fillStyle = '#ff8aa0';
    ctx.fillRect(x+5, fy+2, 2, 2);
    ctx.fillRect(x+20, fy+2, 2, 2);

    // ===== Head outline =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+3,  fy+5, 22, 1);
    ctx.fillRect(x+2,  fy+6, 1, 10);
    ctx.fillRect(x+25, fy+6, 1, 10);
    ctx.fillRect(x+3,  fy+16, 22, 1);

    // Head fill
    ctx.fillStyle = PURPLE;
    ctx.fillRect(x+3, fy+6, 22, 10);
    ctx.fillStyle = LIGHT;
    ctx.fillRect(x+4, fy+7, 20, 5);

    // ===== Big alert eyes =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+6,  fy+9, 5, 4);
    ctx.fillRect(x+17, fy+9, 5, 4);
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+7,  fy+10, 2, 2);
    ctx.fillRect(x+18, fy+10, 2, 2);
    ctx.fillStyle = COL.black;
    ctx.fillRect(x+8,  fy+10, 1, 2);
    ctx.fillRect(x+19, fy+10, 1, 2);

    // ===== Nose (red snout tip) =====
    ctx.fillStyle = COL.lhRed;
    ctx.fillRect(x+12, fy+13, 4, 2);
    ctx.fillStyle = '#601810';
    ctx.fillRect(x+13, fy+13, 2, 1);

    // ===== Whiskers (long, both sides) =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+0, fy+12, 3, 1);
    ctx.fillRect(x+0, fy+14, 3, 1);
    ctx.fillRect(x+25, fy+12, 3, 1);
    ctx.fillRect(x+25, fy+14, 3, 1);

    // ===== Big front teeth =====
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+12, fy+15, 1, 2);
    ctx.fillRect(x+15, fy+15, 1, 2);
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+13, fy+15, 2, 2);

    // ===== Body =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+4, y+17, 19, 1);
    ctx.fillRect(x+3, y+18, 1, 5);
    ctx.fillRect(x+22, y+18, 1, 5);
    ctx.fillStyle = PURPLE;
    ctx.fillRect(x+4, y+18, 19, 5);
    ctx.fillStyle = LIGHT;
    ctx.fillRect(x+5, y+18, 17, 3);
    // Cream belly
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+8, y+19, 11, 4);

    // ===== Legs with claws =====
    ctx.fillStyle = DARK;
    ctx.fillRect(x+4,  y+23, 4, 4);
    ctx.fillRect(x+9,  y+23, 4, 4);
    ctx.fillRect(x+13, y+23, 4, 4);
    ctx.fillRect(x+18, y+23, 4, 4);
    ctx.fillStyle = PURPLE;
    ctx.fillRect(x+4,  y+23, 1, 3);
    ctx.fillRect(x+9,  y+23, 1, 3);
    ctx.fillRect(x+13, y+23, 1, 3);
    ctx.fillRect(x+18, y+23, 1, 3);
    // White claws
    ctx.fillStyle = COL.flowerWhite;
    ctx.fillRect(x+5,  y+27, 1, 1);
    ctx.fillRect(x+10, y+27, 1, 1);
    ctx.fillRect(x+14, y+27, 1, 1);
    ctx.fillRect(x+19, y+27, 1, 1);

    // ===== Long curling tail =====
    ctx.fillStyle = DEEP;
    ctx.fillRect(x+22, y+19, 4, 1);
    ctx.fillRect(x+25, y+15, 1, 5);
    ctx.fillRect(x+22, y+13, 4, 1);
    ctx.fillRect(x+22, y+11, 1, 3);
    ctx.fillStyle = LIGHT;
    ctx.fillRect(x+23, y+19, 2, 1);
    ctx.fillRect(x+23, y+13, 2, 1);
  },
};

// ---------------------------------------------------------------------
// Battle state + sequencer
// A battle config looks like:
//   {
//     player: { mon: 'MAYFLOWER' },
//     opp:    { trainer: 'Angus', mon: 'EMBERCAT' },  // trainer optional
//     beats: [
//       { say: '...', action: 'enterOpp' | 'enterPlayer' |
//                              'attackPlayer' | 'attackOpp' |
//                              'faintPlayer' | 'faintOpp', dmg: N }
//     ]
//   }
// ---------------------------------------------------------------------
function startBattle(config) {
  const pName = config.player.mon;
  const oName = config.opp.mon;
  const pData = POKEMON_DATA[pName] || { maxHP: 20 };
  const oData = POKEMON_DATA[oName] || { maxHP: 14 };
  state.battle = {
    player: {
      name: pName,
      maxHP: pData.maxHP,
      hp: pData.maxHP,
      hpDisplay: pData.maxHP,
      entered: false,
      fainted: false,
    },
    opp: {
      name: oName,
      trainer: config.opp.trainer || null,
      maxHP: oData.maxHP,
      hp: oData.maxHP,
      hpDisplay: oData.maxHP,
      entered: false,
      fainted: false,
    },
    beats: config.beats || [],
    step: 0,
    wait: 600,   // initial breather before first beat
    anim: null,
  };
}

function makeBattleAnim(action) {
  switch (action) {
    case 'enterOpp':     return { type: 'enter', side: 'opp', t: 0, duration: 500 };
    case 'enterPlayer':  return { type: 'enter', side: 'player', t: 0, duration: 500 };
    case 'attackPlayer': return { type: 'attack', side: 'player', t: 0, duration: 700 };
    case 'attackOpp':    return { type: 'attack', side: 'opp', t: 0, duration: 700 };
    case 'faintPlayer':  return { type: 'faint', side: 'player', t: 0, duration: 800 };
    case 'faintOpp':     return { type: 'faint', side: 'opp', t: 0, duration: 800 };
    default: return null;
  }
}

function finalizeBattleAnim(b, beat) {
  const a = b.anim;
  if (a.type === 'enter') {
    (a.side === 'player' ? b.player : b.opp).entered = true;
  } else if (a.type === 'attack') {
    const target = a.side === 'player' ? b.opp : b.player;
    target.hp = Math.max(0, target.hp - (beat.dmg || 0));
  } else if (a.type === 'faint') {
    (a.side === 'player' ? b.player : b.opp).fainted = true;
  }
}

function runBattle(dt) {
  const b = state.battle;

  // HP bar drain animation (always tick)
  if (b.player.hpDisplay > b.player.hp) {
    b.player.hpDisplay = Math.max(b.player.hp, b.player.hpDisplay - dt * 0.04);
  }
  if (b.opp.hpDisplay > b.opp.hp) {
    b.opp.hpDisplay = Math.max(b.opp.hp, b.opp.hpDisplay - dt * 0.04);
  }

  // Tick current animation regardless of dialog state so it plays
  // visually while the player reads the line of text.
  if (b.anim) {
    b.anim.t += dt;
    if (b.anim.t >= b.anim.duration) {
      finalizeBattleAnim(b, b.currentBeat || {});
      b.anim = null;
    }
  }

  // Wait for both dialog and animation to clear before the next beat
  if (state.dialogue) return;
  if (b.anim) return;
  if (b.wait > 0) { b.wait -= dt; return; }

  if (b.step >= b.beats.length) {
    state.battle = null;  // battle over - cutscene resumes next tick
    return;
  }

  const beat = b.beats[b.step++];
  b.currentBeat = beat;
  if (beat.action) b.anim = makeBattleAnim(beat.action);
  if (beat.say) showDialogue([substituteText(beat.say)]);
  else if (beat.wait) b.wait = beat.wait;
}

// ---------------------------------------------------------------------
// Battle rendering
// ---------------------------------------------------------------------
function renderBattle() {
  const b = state.battle;

  // Sky background
  ctx.fillStyle = COL.skyTop;
  ctx.fillRect(0, 0, canvas.width, 88);
  // Subtle horizon band
  ctx.fillStyle = COL.uiHighlight;
  ctx.fillRect(0, 50, canvas.width, 2);
  // Battle / dialog divider
  ctx.fillStyle = COL.uiBorder;
  ctx.fillRect(0, 88, canvas.width, 2);

  // Opp platform (granite ledge)
  ctx.fillStyle = COL.stoneDark;
  ctx.fillRect(108, 50, 36, 4);
  ctx.fillStyle = COL.stoneMid;
  ctx.fillRect(110, 49, 32, 1);

  // Player platform (sandy beach)
  ctx.fillStyle = COL.pathDark;
  ctx.fillRect(8, 80, 44, 4);
  ctx.fillStyle = COL.sandMid;
  ctx.fillRect(10, 79, 40, 1);

  // Compute per-side offsets and effects from the current animation
  let oppDX = 0, oppDY = 0, oppFlash = false, oppVisible = b.opp.entered && !b.opp.fainted;
  let plyDX = 0, plyDY = 0, plyFlash = false, plyVisible = b.player.entered && !b.player.fainted;
  let screenFlash = false;

  if (b.anim) {
    const a = b.anim;
    const p = Math.min(1, a.t / a.duration);

    if (a.type === 'enter') {
      if (a.side === 'opp') { oppVisible = true; oppDX = (1 - p) * 60; }
      else                  { plyVisible = true; plyDX = -(1 - p) * 60; }
    } else if (a.type === 'attack') {
      const dir = (a.side === 'player') ? 1 : -1;
      let off = 0;
      if (p < 0.4)      off = (p / 0.4) * 8 * dir;
      else if (p < 0.6) off = 8 * dir;
      else              off = (1 - (p - 0.6) / 0.4) * 8 * dir;
      if (a.side === 'player') plyDX = off;
      else                      oppDX = off;
      // Defender flashes during last ~half
      if (p > 0.4 && p < 0.95) {
        if (((a.t / 70) | 0) % 2 === 0) {
          if (a.side === 'player') oppFlash = true;
          else                     plyFlash = true;
        }
      }
    } else if (a.type === 'faint') {
      if (a.side === 'opp') { oppDY = p * 30; }
      else                  { plyDY = p * 30; }
      // Quick screen flash at faint start
      if (p < 0.15) screenFlash = true;
    }
  }

  // Opp sprite (28x28) at base (110, 22) - foot at platform y=50
  if (oppVisible) {
    const sprite = POKEMON_SPRITES[b.opp.name];
    if (sprite) {
      sprite(110 + oppDX, 22 + oppDY, anim(450) % 2);
      if (oppFlash) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(110 + oppDX, 22 + oppDY, 28, 28);
      }
    }
  }

  // Player sprite (28x28) at base (12, 52) - foot at platform y=80
  if (plyVisible) {
    const sprite = POKEMON_SPRITES[b.player.name];
    if (sprite) {
      sprite(12 + plyDX, 52 + plyDY, anim(450) % 2);
      if (plyFlash) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(12 + plyDX, 52 + plyDY, 28, 28);
      }
    }
  }

  // HP info boxes (only after each side has entered)
  if (b.opp.entered)    drawBattleInfo(4, 4,   b.opp);
  if (b.player.entered) drawBattleInfo(64, 56, b.player);

  // Screen flash overlay (faint moment)
  if (screenFlash) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(0, 0, canvas.width, 88);
  }
}

function drawBattleInfo(x, y, mon) {
  const W = 92, H = 22;
  // Outer dark border
  ctx.fillStyle = COL.uiBorder;
  ctx.fillRect(x, y, W, H);
  // Cream interior
  ctx.fillStyle = COL.uiCream;
  ctx.fillRect(x + 1, y + 1, W - 2, H - 2);

  // Name
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = COL.textDark;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(mon.name, x + 4, y + 4);

  // HP label
  ctx.fillText('HP', x + 4, y + 13);

  // HP bar background
  ctx.fillStyle = COL.uiBorder;
  ctx.fillRect(x + 22, y + 14, 66, 5);
  // HP fill - color shifts as HP drops
  const pct = Math.max(0, mon.hpDisplay) / mon.maxHP;
  const fill = pct > 0.5 ? '#5eb850' : (pct > 0.2 ? '#f8c840' : '#d04030');
  ctx.fillStyle = fill;
  ctx.fillRect(x + 23, y + 15, Math.floor(64 * pct), 3);
}

// ---------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------
function loop(now) {
  update(now);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
