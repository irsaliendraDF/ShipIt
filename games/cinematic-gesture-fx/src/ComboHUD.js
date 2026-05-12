// ComboHUD — DOM-based overlay sitting above the WebGL canvas.
// Shows:
//   - bottom-center chain strip (recent gestures as icons, fading left→right)
//   - gold highlight + combo name when a combo is one gesture from firing
//   - big combo-name animation on fire
//   - top-right session stats panel, toggled by `S`
import { CONFIG } from '../config.js';

// Minimal icon per gesture (emoji; easy to swap for SVG/glyph later).
const ICONS = {
  OpenPalmForward: '🖐', PointIndex: '☝', WebShooter: '🕸',
  FistToOpen: '💥', PinchAndPull: '🌀', HoldOpenPalmUp: '🔮',
  DoubleOpenPalms: '✋✋', SwipeHorizontal: '➡', ClapOrHandsTogether: '👏',
  TwoHandsFramingBox: '⬜', Fist: '✊',
  ShieldPose: '🛡', WhipPose: '〰', ChargeUp: '⚡',
  DoublePoint: '☝☝', PrayerHands: '🙏', CrossedArms: '❌',
};

export class ComboHUD {
  constructor(comboEngine) {
    this.engine = comboEngine;
    this._build();
    comboEngine.onFire((def, events) => this._flashCombo(def, events));
  }

  _build() {
    // chain strip
    this.chainEl = document.createElement('div');
    this.chainEl.id = 'combo-chain';
    Object.assign(this.chainEl.style, {
      position: 'fixed', bottom: '18px', left: '0', right: '0',
      display: 'flex', gap: '6px', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 15, fontSize: '22px',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
    });
    document.body.appendChild(this.chainEl);

    this.hintEl = document.createElement('div');
    Object.assign(this.hintEl.style, {
      position: 'fixed', bottom: '54px', left: '0', right: '0',
      textAlign: 'center', pointerEvents: 'none', zIndex: 15,
      fontSize: '12px', letterSpacing: '2px', color: '#ffd27a',
      textShadow: '0 0 8px #ffaa2288', opacity: '0',
      transition: 'opacity 120ms linear',
    });
    document.body.appendChild(this.hintEl);

    // fire animation
    this.fireEl = document.createElement('div');
    Object.assign(this.fireEl.style, {
      position: 'fixed', top: '42%', left: '0', right: '0',
      textAlign: 'center', pointerEvents: 'none', zIndex: 18,
      fontSize: '48px', fontWeight: '700', letterSpacing: '6px',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
      opacity: '0', transform: 'scale(0.6)',
      transition: 'opacity 500ms ease, transform 350ms cubic-bezier(0.2, 1.1, 0.3, 1)',
      textShadow: '0 0 18px currentColor, 0 0 40px currentColor',
    });
    document.body.appendChild(this.fireEl);

    // stats panel (top right)
    this.statsEl = document.createElement('div');
    Object.assign(this.statsEl.style, {
      position: 'fixed', top: '10px', right: '12px',
      padding: '8px 10px',
      border: '1px solid rgba(120, 220, 255, 0.35)',
      background: 'rgba(0, 20, 35, 0.55)', backdropFilter: 'blur(6px)',
      fontSize: '12px', lineHeight: '1.45', color: '#cfefff',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
      pointerEvents: 'none', zIndex: 10, display: 'none',
      borderRadius: '4px',
    });
    document.body.appendChild(this.statsEl);
  }

  toggleStats() {
    this.statsEl.style.display = this.statsEl.style.display === 'none' ? 'block' : 'none';
  }

  _flashCombo(def, events) {
    const hex = CONFIG.COMBO_COLORS[def.name] ?? 0xffffff;
    const col = '#' + hex.toString(16).padStart(6, '0');
    this.fireEl.textContent = def.name.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    this.fireEl.style.color = col;
    this.fireEl.style.opacity = '0';
    this.fireEl.style.transform = 'scale(0.6)';
    // force reflow so the transition replays
    // eslint-disable-next-line no-unused-expressions
    this.fireEl.offsetHeight;
    this.fireEl.style.opacity = '1';
    this.fireEl.style.transform = 'scale(1.1)';
    clearTimeout(this._fireT);
    this._fireT = setTimeout(() => {
      this.fireEl.style.opacity = '0';
      this.fireEl.style.transform = 'scale(0.95)';
    }, 900);
  }

  update() {
    // --- chain strip ---
    const buf = this.engine.getBuffer();
    const now = performance.now();
    // rebuild contents only if length changed (simple but fine)
    const html = buf.map((e) => {
      const age = now - e.time;
      const alpha = Math.max(0, 1 - age / CONFIG.COMBO_BUFFER_MS);
      const icon = ICONS[e.name] || '•';
      return `<span style="opacity:${alpha.toFixed(2)};text-shadow:0 0 6px #7ae0ff">${icon}</span>`;
    }).join('');
    if (this.chainEl.innerHTML !== html) this.chainEl.innerHTML = html;

    // --- near-match hints ---
    const near = this.engine.getNearMatches();
    if (near.length > 0) {
      this.hintEl.textContent = `◆ ${near[0].name} — one more: ${near[0].nextStep}`;
      this.hintEl.style.opacity = '1';
      // gold-highlight last chain icon
      const lastSpan = this.chainEl.lastElementChild;
      if (lastSpan) {
        lastSpan.style.color = '#ffd27a';
        lastSpan.style.textShadow = '0 0 10px #ffaa22';
      }
    } else {
      this.hintEl.style.opacity = '0';
    }

    // --- stats ---
    if (this.statsEl.style.display !== 'none') {
      const s = this.engine.getSession();
      this.statsEl.innerHTML =
        `<div><span style="color:#7ae0ff">Combos fired</span> ${s.combosFired}</div>` +
        `<div><span style="color:#7ae0ff">Longest chain</span> ${s.longestChain}</div>` +
        `<div><span style="color:#7ae0ff">Best combo</span> ${s.bestCombo ?? '—'}</div>`;
    }
  }
}
