# Cinematic Hand Gesture FX

Browser webapp that tracks your hands via webcam (MediaPipe) and triggers
cinematic Marvel/DC-style effects rendered with Three.js — Iron Man
repulsors, Dr. Strange portals, Spider-Man webs, JARVIS HUDs, lasers,
shockwaves, and more.

## Run

No build step required — just serve the folder over HTTP (the camera API and
ES module imports need a real server, not `file://`).

```bash
# from this folder
python -m http.server 8080
# then open http://localhost:8080
```

Or with Node:

```bash
npx serve -l 8080
```

Chrome or Edge recommended. Allow camera access when prompted.

## Gestures

| Gesture | Effect |
|---|---|
| Open palm forward (all 5 fingers out, palm faces camera) | Iron Man repulsor blast |
| Fist, then open it quickly | Shockwave + particle burst |
| Both hands pinched (thumb+index) then pulled apart | Dr. Strange portal opens between them |
| Point with index (other fingers curled) | Laser beam from fingertip |
| Both hands make an "L" (thumb+index extended) | JARVIS HUD between hands, scales with distance |
| Web shooter (thumb+index+middle extended, ring+pinky curled) | Spider web line from wrist |
| Both palms forward | Wide volumetric light beam |
| Clap / hands together | Big shockwave ring + flash |
| Open palm moving sideways fast | Particle slash |
| Open palm facing up, held 1s+ | Floating holographic orb above palm |

Held gestures (repulsor, laser, HUD, beam, orb) keep firing continuously
while the pose is held. Use **hysteresis** — the gesture must be stable
for a few frames (configurable in `config.js`) before firing.

## Keybinds

| Key | Action |
|---|---|
| `H` | Toggle help overlay |
| `D` | Toggle debug landmark overlay |
| `M` | Mirror webcam (default ON) |
| `1` | Manually trigger repulsor |
| `2` | Manually trigger fist burst |
| `3` | Manually trigger Dr. Strange portal |
| `4` | Manually trigger laser |
| `5` | Manually trigger JARVIS HUD |
| `6` | Manually trigger Spider web |
| `7` | Manually trigger light beam |
| `8` | Manually trigger clap shockwave |
| `9` | Manually trigger swipe slash |

## Project layout

```
index.html
config.js                 tunable constants (read this first)
src/
  main.js                 bootstrap + gesture->effect routing + render loop
  AppState.js             single shared state container
  SceneManager.js         three.js scene, post-processing, render loop helpers
  HandTracker.js          MediaPipe wrapper + camera stream
  GestureDetector.js      per-frame classifier for all 10 gestures
  DebugOverlay.js         2D canvas overlay for landmark debugging
  shaders/
    ParticleShaders.js    particle + volumetric + shockwave shader source
  effects/
    BaseEffect.js         lifecycle contract (trigger / update / dispose)
    ParticlePool.js       6000-particle GPU pool (custom ShaderMaterial)
    IronManRepulsor.js
    DrStrangePortal.js
    Laser.js
    JarvisHUD.js
    Shockwave.js
    SpiderWeb.js
    LightBeam.js
    SwipeSlash.js
    HoloOrb.js
    FistBurst.js
```

## How to add a new effect (5 steps)

1. **Create the file.** Copy `src/effects/Shockwave.js` or any existing
   effect into `src/effects/MyEffect.js` and extend `BaseEffect`.
2. **Implement `trigger(params)`.** Build your geometry/material, add to
   `this.scene`, and register it with `this._track(obj)` so it disposes
   automatically. `params` is `{ anchor, direction, hand, extra }`.
3. **Implement `update(dt)`.** Advance animation. Set `this.done = true`
   when the effect is finished and should be removed.
4. **Register it in `src/main.js`.** Import the class at the top, then add
   a case to `handleGesture()` mapping a gesture name to it. If it's a
   "held" effect, use `spawnOrReuse(MyEffect, heldKey(...), g)` so the same
   instance is reused frame-to-frame while the gesture holds.
5. **(Optional) Add a gesture classifier.** If you need a new gesture, add
   a feature check in `src/GestureDetector.js` and push an event into the
   returned list. Use `_hysteresis(state, key, active)` to avoid flicker.

That's it — no build step to rerun, just reload the page.

## Performance

- Target is 60 fps on a modern laptop.
- `CONFIG.MAX_PARTICLES` caps the GPU pool.
- `CONFIG.AUTO_PERF_DROP` (on by default) halves particle counts if fps
  drops below 35 sustained.
- Dropping `CONFIG.BLOOM_STRENGTH` is the biggest single performance win
  if you're on integrated graphics.
