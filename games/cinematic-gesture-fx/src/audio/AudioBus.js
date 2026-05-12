// AudioBus — tiny event-based sound stub. Drop .mp3/.wav files into src/audio/
// and map them in SOUNDS below, then calls to AudioBus.play(eventName, opts)
// will actually produce sound. Right now it logs to console.debug so you can
// verify hookups.
//
// Event naming convention:
//   gesture.<name> — fired by every gesture event (e.g. gesture.repulsor)
//   combo.<name>   — fired by every combo firing   (e.g. combo.cataclysm)
//
// Options: { volume: 0..1, pitch: 0.5..2.0 }

const SOUNDS = {
  // 'gesture.repulsor': new Audio('src/audio/repulsor.mp3'), // TODO: add sound files
  // 'combo.cataclysm':  new Audio('src/audio/cataclysm.mp3'),
};

class _AudioBus {
  constructor() {
    this.muted = false;
    this.masterVolume = 1.0;
  }
  mute(v) { this.muted = !!v; }
  setMasterVolume(v) { this.masterVolume = v; }

  play(eventName, { volume = 1.0, pitch = 1.0 } = {}) {
    if (this.muted) return;
    const snd = SOUNDS[eventName];
    if (!snd) {
      // useful for wiring up/debugging — filter out in production
      if (typeof console !== 'undefined') console.debug('[audio]', eventName, { volume, pitch });
      return;
    }
    try {
      // HTMLAudio can't be replayed mid-play; clone for overlap
      const a = snd.cloneNode();
      a.volume = Math.min(1, volume * this.masterVolume);
      a.playbackRate = pitch;
      a.play().catch(() => {}); // autoplay restrictions ignored
    } catch (e) { /* noop */ }
  }
}

export const AudioBus = new _AudioBus();
