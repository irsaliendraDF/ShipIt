// BindingRegistry — the live gesture → effect map. Hardcoded gestures are
// seeded from main.js on startup. Custom gestures write here when bound.
// Both share the same surface so a custom gesture can override a hardcoded one.
//
// binding shape: { gestureName, effectId, hand: 'Left'|'Right'|'Both'|'Any', enabled: true }

const _bindings = new Map(); // key = gestureName → binding

export const BindingRegistry = {
  set(gestureName, effectId, { hand = 'Any', enabled = true } = {}) {
    _bindings.set(gestureName, { gestureName, effectId, hand, enabled });
  },
  get(gestureName) { return _bindings.get(gestureName); },
  remove(gestureName) { _bindings.delete(gestureName); },
  all() { return Array.from(_bindings.values()); },
  // Apply a binding to an event and get the effectId to fire (or null).
  resolve(evt) {
    const b = _bindings.get(evt.name);
    if (!b || !b.enabled) return null;
    if (b.hand !== 'Any' && b.hand !== evt.hand && !(b.hand === 'Both' && evt.hand === 'Both')) return null;
    return b.effectId;
  },
};
