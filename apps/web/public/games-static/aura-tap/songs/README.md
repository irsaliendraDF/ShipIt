# Drop your demo song here

The beatmap at `public/beatmaps/demo.json` expects a file named **`demo.mp3`** in this folder.

## Quick option

1. Grab any CC0 / royalty-free track from one of these:
   - https://pixabay.com/music/
   - https://freemusicarchive.org/
   - https://incompetech.com/music/royalty-free/
2. Save it here as `public/songs/demo.mp3`.
3. Reload the dev server.

## Tip

The demo beatmap is timed to a 120 BPM track of about 60 seconds. A track at a different BPM will still play, but the notes won't line up with what you're hearing. To recalibrate, edit `bpm` and the note `t` values in `public/beatmaps/demo.json`, or just enjoy the desync as ✨ avant-garde ✨.

## Optional: warmup loop

Drop a chill loopable track at `public/songs/warmup-loop.mp3` (any length, will loop seamlessly) and the **UNMUTE LOOP** button in Warm Up will play it. With no file present, the button shows a hint in the menu status line and otherwise does nothing.
