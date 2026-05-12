// Base class: lifecycle contract enforced by SceneManager.
export class BaseEffect {
  constructor(sceneMgr) {
    this.sceneMgr = sceneMgr;
    this.scene = sceneMgr.scene;
    this.particles = sceneMgr.particles;
    this.done = false;
    this.age = 0;
    this.objects = []; // track meshes we add for easy disposal
  }
  // Called when the gesture first fires. Params contain anchor, direction, etc.
  trigger(_params) {}
  // Called every frame with dt (seconds). Set this.done=true when finished.
  update(_dt) {}
  // Clean up any geometry, materials, and scene objects.
  dispose() {
    for (const o of this.objects) {
      if (o.parent) o.parent.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    }
    this.objects.length = 0;
  }
  // Track for disposal AND mark the subtree as bloomable. Any Mesh/Points/Line
  // added later as a child of `obj` should also call `_markBloom(child)`, or
  // call `_track` on the whole root once construction is done.
  _track(obj) {
    this.objects.push(obj);
    obj.traverse(o => o.layers.enable(1));
    return obj;
  }
  _markBloom(obj) { obj.traverse(o => o.layers.enable(1)); return obj; }
}
