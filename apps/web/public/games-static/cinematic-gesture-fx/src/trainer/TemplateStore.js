// IndexedDB store for custom gesture templates. Falls back to localStorage
// if IDB isn't available.
//
// Template shape:
// {
//   id: string,                         // uuid
//   name: string,
//   createdAt: number,
//   meanLandmarks: Float32Array(63),    // normalized
//   variance: Float32Array(63),         // per-coord
//   weight: Float32Array(21),           // per-landmark importance (1/var)
//   binding: { effectId, hand, confidence }
// }

const DB_NAME = 'fx_trainer';
const STORE = 'templates';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function lsKey() { return 'fx_trainer_templates'; }
function fromLS() {
  try { return JSON.parse(localStorage.getItem(lsKey()) || '[]'); } catch { return []; }
}
function toLS(arr) { try { localStorage.setItem(lsKey(), JSON.stringify(arr)); } catch {} }

// Float32Arrays don't survive structured clone in localStorage (JSON), so we
// convert to plain arrays for storage and reconstruct on read.
function serialize(t) {
  return {
    ...t,
    meanLandmarks: Array.from(t.meanLandmarks),
    variance: Array.from(t.variance),
    weight: Array.from(t.weight),
  };
}
function deserialize(t) {
  return {
    ...t,
    meanLandmarks: Float32Array.from(t.meanLandmarks),
    variance: Float32Array.from(t.variance),
    weight: Float32Array.from(t.weight),
  };
}

class _Store {
  async list() {
    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result.map(deserialize));
        req.onerror = () => reject(req.error);
      });
    } catch {
      return fromLS().map(deserialize);
    }
  }
  async put(template) {
    const ser = serialize(template);
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(ser);
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = fromLS();
      const i = list.findIndex(t => t.id === ser.id);
      if (i >= 0) list[i] = ser; else list.push(ser);
      toLS(list);
    }
  }
  async remove(id) {
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = fromLS().filter(t => t.id !== id);
      toLS(list);
    }
  }
  async clear() {
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
    } catch { toLS([]); }
  }
}

export const TemplateStore = new _Store();
