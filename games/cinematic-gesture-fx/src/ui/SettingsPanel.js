// SettingsPanel — single tabbed modal opened with `,`. Live-edits CONFIG;
// changes take effect immediately because the renderer + effects read CONFIG
// each frame.
//
// Tabs: General, Gestures, Effects, Preset, Recording, Custom Gestures
//
// All settings persist to localStorage under fx_settings; we restore on init.

import { CONFIG } from '../../config.js';
import { TIERS, setCurrentTier, getCurrentTier } from '../config/quality.js';

const LS_KEY = 'fx_settings';

const TABS = ['General', 'Gestures', 'Effects', 'Preset', 'Custom'];

function persistSetting(key, value) {
  try {
    const cur = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    cur[key] = value;
    localStorage.setItem(LS_KEY, JSON.stringify(cur));
  } catch {}
}
function loadPersistedSettings() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}

export class SettingsPanel {
  constructor({ presetManager, sceneMgr, handTracker, openTrainer }) {
    this.presetManager = presetManager;
    this.sceneMgr = sceneMgr;
    this.handTracker = handTracker;
    this.openTrainer = openTrainer;
    this.activeTab = 'General';
    this._build();
    this._restore();
  }

  show() { this.root.style.display = 'flex'; this._renderTab(); }
  hide() { this.root.style.display = 'none'; }
  toggle() { this.root.style.display === 'flex' ? this.hide() : this.show(); }
  isOpen() { return this.root.style.display === 'flex'; }

  _restore() {
    const saved = loadPersistedSettings();
    for (const [k, v] of Object.entries(saved)) {
      if (k in CONFIG) CONFIG[k] = v;
    }
    if (saved._qualityTier && TIERS[saved._qualityTier]) {
      setCurrentTier(TIERS[saved._qualityTier]);
    }
    if (saved._preset) this.presetManager.apply(saved._preset, { transitionMs: 0 });
  }

  _build() {
    const root = document.createElement('div');
    root.id = 'settings-panel';
    Object.assign(root.style, {
      position: 'fixed', inset: '0', display: 'none',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 10, 20, 0.7)', backdropFilter: 'blur(4px)',
      zIndex: 24,
    });
    root.addEventListener('click', e => { if (e.target === root) this.hide(); });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: 'min(640px, 92vw)', maxHeight: '86vh', overflow: 'hidden',
      borderRadius: '8px', border: '1px solid rgba(120, 220, 255, 0.5)',
      background: 'rgba(2, 18, 32, 0.95)', color: '#cfefff',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: '13px',
      display: 'flex', flexDirection: 'column',
    });
    card.addEventListener('click', e => e.stopPropagation());

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #234">
        <h2 style="margin:0;color:#7ae0ff;font-size:15px;letter-spacing:2px">SETTINGS</h2>
        <button id="s-close" style="background:transparent;border:1px solid #7ae0ff66;color:#7ae0ff;padding:4px 10px;cursor:pointer;border-radius:3px">esc</button>
      </div>
      <div id="s-tabs" style="display:flex;gap:0;padding:0 18px;border-bottom:1px solid #234">
        ${TABS.map(t => `<button data-tab="${t}" class="s-tab" style="background:transparent;border:none;border-bottom:2px solid transparent;color:#cfefff;padding:10px 12px;cursor:pointer;font-family:inherit;font-size:12px">${t}</button>`).join('')}
      </div>
      <div id="s-body" style="padding:18px;overflow:auto;flex:1"></div>
      <div style="padding:10px 18px;border-top:1px solid #234;display:flex;justify-content:space-between">
        <button id="s-reset" style="background:transparent;border:1px solid #ff6a6a66;color:#ff8a8a;padding:6px 10px;cursor:pointer;border-radius:3px">Reset to defaults</button>
        <span style="opacity:0.55">Settings persist to localStorage</span>
      </div>
    `;
    root.appendChild(card);
    document.body.appendChild(root);
    this.root = root;
    this.body = card.querySelector('#s-body');

    card.querySelector('#s-close').onclick = () => this.hide();
    card.querySelector('#s-reset').onclick = () => {
      if (!confirm('Reset all settings to defaults?')) return;
      try { localStorage.removeItem(LS_KEY); } catch {}
      location.reload();
    };
    card.querySelectorAll('.s-tab').forEach(b => {
      b.onclick = () => { this.activeTab = b.dataset.tab; this._renderTab(); };
    });
  }

  _renderTab() {
    // tab styles
    this.root.querySelectorAll('.s-tab').forEach(b => {
      b.style.borderBottomColor = b.dataset.tab === this.activeTab ? '#7ae0ff' : 'transparent';
      b.style.color = b.dataset.tab === this.activeTab ? '#7ae0ff' : '#cfefff';
    });
    const map = {
      General: () => this._renderGeneral(),
      Gestures: () => this._renderGestures(),
      Effects: () => this._renderEffects(),
      Preset: () => this._renderPreset(),
      Custom: () => this._renderCustom(),
    };
    this.body.innerHTML = '';
    map[this.activeTab]?.();
  }

  // --- helpers for inputs ---
  _slider(label, key, min, max, step) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:14px';
    const v = CONFIG[key];
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between"><span>${label}</span><span style="color:#7ae0ff" data-val>${(+v).toFixed(3).replace(/\.?0+$/, '')}</span></div>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${v}" style="width:100%"/>
    `;
    const input = wrap.querySelector('input');
    const valEl = wrap.querySelector('[data-val]');
    input.oninput = () => {
      const nv = parseFloat(input.value);
      CONFIG[key] = nv;
      valEl.textContent = nv.toFixed(3).replace(/\.?0+$/, '');
      persistSetting(key, nv);
    };
    this.body.appendChild(wrap);
  }
  _checkbox(label, key) {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:10px;cursor:pointer';
    wrap.innerHTML = `<input type="checkbox" ${CONFIG[key] ? 'checked' : ''}/><span>${label}</span>`;
    wrap.querySelector('input').onchange = (e) => {
      CONFIG[key] = e.target.checked;
      persistSetting(key, e.target.checked);
    };
    this.body.appendChild(wrap);
  }
  _select(label, options, current, onChange) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:14px;display:flex;gap:10px;align-items:center';
    wrap.innerHTML = `
      <span>${label}</span>
      <select style="background:#001a2a;color:#cfefff;border:1px solid #345;padding:4px 8px;border-radius:3px">
        ${options.map(o => `<option value="${o.id}" ${o.id===current?'selected':''}>${o.name}</option>`).join('')}
      </select>
    `;
    wrap.querySelector('select').onchange = (e) => onChange(e.target.value);
    this.body.appendChild(wrap);
  }
  _info(html) {
    const d = document.createElement('div');
    d.style.cssText = 'opacity:0.7;margin-bottom:10px;font-size:12px';
    d.innerHTML = html;
    this.body.appendChild(d);
  }
  _btn(label, onClick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'background:#003a5c;border:1px solid #7ae0ff;color:#dff6ff;padding:6px 12px;cursor:pointer;border-radius:3px;margin-right:8px;margin-bottom:8px';
    b.onclick = onClick;
    this.body.appendChild(b);
    return b;
  }

  _renderGeneral() {
    const t = getCurrentTier();
    const res = window.AppState?.camera?.actualResolution
      || (typeof window !== 'undefined' && window.__cameraRes) || null;
    const resTxt = res ? `${res.width}×${res.height}@${res.fps ?? '?'}fps` : '(detecting…)';
    this._info(`Webcam: <b>${resTxt}</b>`);
    this._select('Quality tier', Object.values(TIERS).map(x => ({id: x.id, name: x.name})), t?.id || 'HIGH', (id) => {
      setCurrentTier(TIERS[id]);
      persistSetting('_qualityTier', id);
    });
    this._checkbox('Mirror webcam', /* virtual key — wired via toggle below */ '_unused');
    this.body.lastElementChild.querySelector('input').checked = window.AppState?.mirror;
    this.body.lastElementChild.querySelector('input').onchange = (e) => {
      if (window.AppState) window.AppState.mirror = e.target.checked;
      this.sceneMgr.setMirror(e.target.checked);
    };
    this._checkbox('Debug overlay', '_unused');
    this.body.lastElementChild.querySelector('input').checked = window.AppState?.debugOverlay;
    this.body.lastElementChild.querySelector('input').onchange = (e) => {
      if (window.AppState) window.AppState.debugOverlay = e.target.checked;
    };
  }

  _renderGestures() {
    this._slider('Single-hand stable frames', 'GESTURE_STABLE_FRAMES', 1, 12, 1);
    this._slider('Two-hand stable frames', 'TWO_HAND_STABILITY_FRAMES', 1, 16, 1);
    this._slider('Two-hand confidence min', 'TWO_HAND_CONFIDENCE_MIN', 0.5, 1, 0.01);
    this._slider('Custom-gesture confidence default', 'CUSTOM_CONFIDENCE_DEFAULT', 0.4, 0.95, 0.01);
    this._slider('One-Euro min cutoff', 'ONE_EURO_MIN_CUTOFF', 0.1, 5, 0.05);
    this._slider('One-Euro beta', 'ONE_EURO_BETA', 0, 0.5, 0.005);
    this._checkbox('One-Euro smoothing enabled', 'ONE_EURO_ENABLED');
    // wire smoothing toggle live
    this.body.lastElementChild.querySelector('input').onchange = (e) => {
      CONFIG.ONE_EURO_ENABLED = e.target.checked;
      persistSetting('ONE_EURO_ENABLED', e.target.checked);
      this.handTracker.setSmoothingEnabled(e.target.checked);
    };
  }

  _renderEffects() {
    this._slider('Sharpening (unsharp mask)', 'SHARPEN_AMOUNT', 0, 1.5, 0.05);
    this._slider('Bloom strength', 'BLOOM_STRENGTH', 0, 3, 0.05);
    this._slider('Bloom radius', 'BLOOM_RADIUS', 0, 1.2, 0.05);
    this._slider('Bloom threshold', 'BLOOM_THRESHOLD', 0, 1, 0.01);
    this._slider('Film grain', 'FILM_GRAIN', 0, 0.4, 0.01);
    this._slider('Chromatic aberration', 'CHROMATIC_ABERRATION', 0, 0.005, 0.0001);
    this._slider('Video contrast', 'VIDEO_CONTRAST', 0.5, 2, 0.05);
    this._slider('Video brightness', 'VIDEO_BRIGHTNESS', 0.2, 1.5, 0.02);
    this._slider('Video saturation', 'VIDEO_SATURATION', 0, 2, 0.05);
    this._checkbox('Pixel trail enabled', 'PIXEL_ENABLED');
  }

  _renderPreset() {
    const list = this.presetManager.list().map(p => ({ id: p.id, name: p.name }));
    this._select('Active preset', list, this.presetManager.current.id, (id) => {
      this.presetManager.apply(id, { transitionMs: 600 });
      persistSetting('_preset', id);
    });
    this._info(this.presetManager.current.description);
    this._info('Tip: press <b>P</b> from anywhere to cycle presets.');
  }

  _renderCustom() {
    this._info('Custom gesture trainer is its own panel — open below.');
    this._btn('Open Trainer (T)', () => { this.hide(); this.openTrainer?.(); });
  }
}
