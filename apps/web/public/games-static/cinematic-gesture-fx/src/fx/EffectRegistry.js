// Central registry of all effects. Each effect registers itself with:
//   { id, name, category, ctor, defaultParams, presetOverridable }
// Used by Settings (enable/disable, intensity), Trainer (bind to custom gestures),
// and Preset system (known color/param keys to lerp).

const _registry = new Map();

export const EffectRegistry = {
  register(entry) {
    if (!entry?.id) throw new Error('EffectRegistry: id required');
    _registry.set(entry.id, entry);
  },
  get(id) { return _registry.get(id); },
  all()  { return Array.from(_registry.values()); },
  has(id) { return _registry.has(id); },
};
