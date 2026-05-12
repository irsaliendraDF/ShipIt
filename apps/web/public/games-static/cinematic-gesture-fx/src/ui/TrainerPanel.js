// TrainerPanel — modal overlay for recording, listing, binding, testing,
// import/exporting custom gestures.

import { TemplateStore } from '../trainer/TemplateStore.js';
import { Recorder } from '../trainer/Recorder.js';
import { CONFIG } from '../../config.js';

const EFFECT_OPTIONS = [
  // [effectId, displayName] — lasers removed per user request
  ['repulsor', 'Iron Man Repulsor'],
  ['portal', 'Dr. Strange Portal'],
  ['jarvis', 'JARVIS HUD'],
  ['shockwave', 'Shockwave'],
  ['spiderweb', 'Spider Web'],
  ['lightbeam', 'Light Beam'],
  ['swipeslash', 'Swipe Slash'],
  ['holoorb', 'Holo Orb'],
  ['fistburst', 'Fist Burst'],
  ['shield', 'Shield'],
  ['whip', 'Whip'],
  ['chargeorb', 'Charge Orb'],
  ['pillar', 'Pillar'],
  ['realitywarp', 'Reality Warp'],
  ['energyball', 'Energy Ball'],
];

function uuid() { return 'g_' + Math.random().toString(36).slice(2, 11); }

export class TrainerPanel {
  constructor({ classifier, onTemplatesChanged }) {
    this.classifier = classifier;
    this.onTemplatesChanged = onTemplatesChanged;
    this.templates = [];
    this.recorder = new Recorder();
    this.recordingState = null; // null | 'countdown' | 'capturing' | 'naming'
    this.pendingTemplate = null;
    this.testScores = new Map(); // id:hand -> conf
    this._buildDOM();

    this.classifier.setTestCallback((id, hand, conf) => {
      this.testScores.set(`${id}:${hand}`, conf);
    });
  }

  async load() {
    this.templates = await TemplateStore.list();
    this.classifier.setTemplates(this.templates);
    this.onTemplatesChanged?.(this.templates);
    this._render();
  }

  show() { this.root.style.display = 'flex'; this._render(); }
  hide() { this.root.style.display = 'none'; }
  toggle() { this.root.style.display === 'flex' ? this.hide() : this.show(); }
  isOpen() { return this.root.style.display === 'flex'; }

  // Quick-record from Shift+T: instant 3..2..1..capture, default name.
  quickRecord(name = `gesture-${this.templates.length + 1}`) {
    this.show();
    this._startRecord(name, EFFECT_OPTIONS[0][0]);
  }

  _buildDOM() {
    const root = document.createElement('div');
    root.id = 'trainer-panel';
    Object.assign(root.style, {
      position: 'fixed', inset: '0', display: 'none',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 10, 20, 0.7)', backdropFilter: 'blur(4px)',
      zIndex: 25,
    });
    root.addEventListener('click', e => { if (e.target === root) this.hide(); });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: 'min(720px, 92vw)', maxHeight: '86vh', overflow: 'auto',
      padding: '20px 22px', borderRadius: '8px',
      border: '1px solid rgba(120, 220, 255, 0.5)',
      background: 'rgba(2, 18, 32, 0.95)', color: '#cfefff',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: '13px',
      boxShadow: '0 0 60px #00aaff22',
    });
    card.addEventListener('click', e => e.stopPropagation());

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <h2 style="margin:0;color:#7ae0ff;font-size:16px;letter-spacing:2px">CUSTOM GESTURE TRAINER</h2>
        <button id="t-close" style="background:transparent;border:1px solid #7ae0ff66;color:#7ae0ff;padding:4px 10px;cursor:pointer;border-radius:3px">esc</button>
      </div>
      <div id="t-status" style="margin-bottom:10px;color:#ffd27a;min-height:20px"></div>
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <button id="t-record" style="background:#003a5c;border:1px solid #7ae0ff;color:#dff6ff;padding:8px 14px;cursor:pointer;border-radius:3px">+ Record New Gesture</button>
        <button id="t-export" style="background:transparent;border:1px solid #7ae0ff66;color:#7ae0ff;padding:8px 12px;cursor:pointer;border-radius:3px">Export JSON</button>
        <input type="file" id="t-import-file" accept="application/json" style="display:none"/>
        <button id="t-import" style="background:transparent;border:1px solid #7ae0ff66;color:#7ae0ff;padding:8px 12px;cursor:pointer;border-radius:3px">Import JSON</button>
        <button id="t-clear" style="background:transparent;border:1px solid #ff6a6a66;color:#ff8a8a;padding:8px 12px;cursor:pointer;border-radius:3px;margin-left:auto">Clear All</button>
      </div>
      <div id="t-list"></div>
      <div id="t-record-ui" style="display:none"></div>
    `;
    root.appendChild(card);
    document.body.appendChild(root);
    this.root = root;

    card.querySelector('#t-close').onclick = () => this.hide();
    card.querySelector('#t-record').onclick = () => this._openNamingDialog();
    card.querySelector('#t-export').onclick = () => this._export();
    card.querySelector('#t-import').onclick = () => card.querySelector('#t-import-file').click();
    card.querySelector('#t-import-file').onchange = (e) => this._import(e.target.files[0]);
    card.querySelector('#t-clear').onclick = async () => {
      if (!confirm('Delete ALL custom gestures?')) return;
      await TemplateStore.clear();
      this.templates = [];
      this.classifier.setTemplates([]);
      this.onTemplatesChanged?.(this.templates);
      this._render();
    };

    this.statusEl = card.querySelector('#t-status');
    this.listEl = card.querySelector('#t-list');
    this.recordUI = card.querySelector('#t-record-ui');
  }

  _setStatus(text) { if (this.statusEl) this.statusEl.textContent = text; }

  _openNamingDialog() {
    const name = prompt('Name this gesture:');
    if (!name) return;
    const effectId = prompt(`Bind to which effect? (one of: ${EFFECT_OPTIONS.map(e => e[0]).join(', ')})`, 'repulsor');
    if (!effectId) return;
    this._startRecord(name, effectId);
  }

  async _startRecord(name, effectId) {
    this._setStatus('Get into position…');
    let count = 3;
    const tick = async () => {
      if (count > 0) {
        this._setStatus(`Recording in ${count}…`);
        count--;
        setTimeout(tick, 700);
      } else {
        this._setStatus('Hold the pose!');
        this.recorder.start();
        this._captureLoop(name, effectId);
      }
    };
    tick();
  }

  _captureLoop(name, effectId) {
    const tick = () => {
      const r = this.recorder.tick();
      if (r === 'collecting') { setTimeout(tick, 50); return; }
      if (r === 'done') {
        const data = this.recorder.finalize();
        if (!data) { this._setStatus('No hand detected — try again'); return; }
        const tmpl = {
          id: uuid(), name, createdAt: Date.now(),
          ...data,
          binding: { effectId, hand: 'Any', confidence: CONFIG.CUSTOM_CONFIDENCE_DEFAULT },
        };
        TemplateStore.put(tmpl).then(() => {
          this.templates.push(tmpl);
          this.classifier.setTemplates(this.templates);
          this.onTemplatesChanged?.(this.templates);
          this._setStatus(`Saved "${name}" → ${effectId}`);
          this._render();
        });
      }
    };
    tick();
  }

  async _delete(id) {
    if (!confirm('Delete this gesture?')) return;
    await TemplateStore.remove(id);
    this.templates = this.templates.filter(t => t.id !== id);
    this.classifier.setTemplates(this.templates);
    this.onTemplatesChanged?.(this.templates);
    this._render();
  }

  async _updateBinding(id, patch) {
    const t = this.templates.find(x => x.id === id);
    if (!t) return;
    t.binding = { ...t.binding, ...patch };
    await TemplateStore.put(t);
    this.classifier.setTemplates(this.templates);
  }

  _export() {
    const data = JSON.stringify(this.templates.map(t => ({
      ...t,
      meanLandmarks: Array.from(t.meanLandmarks),
      variance: Array.from(t.variance),
      weight: Array.from(t.weight),
    })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gesture-pack.json'; a.click();
    URL.revokeObjectURL(url);
  }

  async _import(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      for (const raw of arr) {
        const t = {
          ...raw,
          meanLandmarks: Float32Array.from(raw.meanLandmarks),
          variance: Float32Array.from(raw.variance),
          weight: Float32Array.from(raw.weight),
        };
        await TemplateStore.put(t);
      }
      await this.load();
      this._setStatus(`Imported ${arr.length} gestures`);
    } catch (e) {
      this._setStatus('Import failed: ' + e.message);
    }
  }

  _render() {
    if (this.templates.length === 0) {
      this.listEl.innerHTML = `<div style="opacity:0.7;padding:14px 0;text-align:center">No custom gestures yet — click <b>Record New Gesture</b>, then strike a pose.</div>`;
      return;
    }
    this.listEl.innerHTML = this.templates.map(t => this._templateRow(t)).join('');
    // bind row events
    this.listEl.querySelectorAll('[data-action]').forEach(el => {
      const id = el.getAttribute('data-id');
      const action = el.getAttribute('data-action');
      if (action === 'delete') el.onclick = () => this._delete(id);
      if (action === 'bind-effect') el.onchange = () => this._updateBinding(id, { effectId: el.value });
      if (action === 'bind-hand') el.onchange = () => this._updateBinding(id, { hand: el.value });
      if (action === 'bind-conf') el.oninput = () => {
        this._updateBinding(id, { confidence: parseFloat(el.value) });
        const lbl = this.listEl.querySelector(`[data-conf-lbl="${id}"]`);
        if (lbl) lbl.textContent = parseFloat(el.value).toFixed(2);
      };
    });
  }

  _templateRow(t) {
    return `<div style="border:1px solid #234;padding:10px;border-radius:4px;margin-bottom:8px;display:grid;grid-template-columns:80px 1fr auto;gap:10px;align-items:center">
      <div style="text-align:center">
        ${this._sketch(t)}
        <div style="font-size:10px;opacity:0.6;margin-top:3px">${t.dominantHand || ''}</div>
      </div>
      <div>
        <div style="font-size:14px;color:#cfefff">${t.name}</div>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          <select data-action="bind-effect" data-id="${t.id}" style="background:#001a2a;color:#cfefff;border:1px solid #345;padding:3px 6px;border-radius:3px">
            ${EFFECT_OPTIONS.map(([id, n]) => `<option value="${id}" ${t.binding?.effectId===id?'selected':''}>${n}</option>`).join('')}
          </select>
          <select data-action="bind-hand" data-id="${t.id}" style="background:#001a2a;color:#cfefff;border:1px solid #345;padding:3px 6px;border-radius:3px">
            ${['Any','Left','Right'].map(h => `<option value="${h}" ${t.binding?.hand===h?'selected':''}>${h}</option>`).join('')}
          </select>
          <span style="display:flex;align-items:center;gap:4px;font-size:11px">
            conf
            <input type="range" min="0.3" max="0.95" step="0.01" value="${t.binding?.confidence ?? CONFIG.CUSTOM_CONFIDENCE_DEFAULT}" data-action="bind-conf" data-id="${t.id}" style="width:80px"/>
            <span data-conf-lbl="${t.id}">${(t.binding?.confidence ?? CONFIG.CUSTOM_CONFIDENCE_DEFAULT).toFixed(2)}</span>
          </span>
        </div>
        <div style="margin-top:6px;font-size:11px;color:#7ae0ff" id="t-meter-${t.id}">match: --</div>
      </div>
      <button data-action="delete" data-id="${t.id}" style="background:transparent;border:1px solid #ff6a6a66;color:#ff8a8a;padding:5px 10px;cursor:pointer;border-radius:3px">Delete</button>
    </div>`;
  }

  // Tiny landmark "sketch" thumbnail rendered as SVG.
  _sketch(t) {
    const lm = t.meanLandmarks;
    if (!lm) return '<svg width="64" height="64"></svg>';
    // find bbox for normalized space then map to 64×64
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    for (let i = 0; i < 21; i++) {
      const x = lm[i*3+0], y = lm[i*3+1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const w = maxX - minX || 1, h = maxY - minY || 1;
    const sc = 56 / Math.max(w, h);
    const px = (i) => 4 + (lm[i*3+0] - minX) * sc;
    const py = (i) => 60 - (lm[i*3+1] - minY) * sc;
    const conn = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    const lines = conn.map(([a,b]) => `<line x1="${px(a)}" y1="${py(a)}" x2="${px(b)}" y2="${py(b)}" stroke="#7ae0ff" stroke-width="1.2"/>`).join('');
    const dots = Array.from({length:21}, (_,i) => `<circle cx="${px(i)}" cy="${py(i)}" r="1.4" fill="#fff"/>`).join('');
    return `<svg width="64" height="64" viewBox="0 0 64 64">${lines}${dots}</svg>`;
  }

  // Called every render frame to refresh live "match %" meters.
  refreshMeters() {
    if (!this.isOpen()) return;
    for (const t of this.templates) {
      const el = this.listEl.querySelector(`#t-meter-${t.id}`);
      if (!el) continue;
      const left = this.testScores.get(`${t.id}:Left`) ?? 0;
      const right = this.testScores.get(`${t.id}:Right`) ?? 0;
      const best = Math.max(left, right);
      el.textContent = `match: ${(best * 100).toFixed(0)}%`;
      el.style.color = best > (t.binding?.confidence ?? CONFIG.CUSTOM_CONFIDENCE_DEFAULT)
        ? '#4eff8a' : '#7ae0ff';
    }
  }
}
