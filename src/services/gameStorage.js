const STORAGE_KEY = "letra-liga-game-v1";

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadGameSnapshot(storage = browserStorage()) {
  if (!storage) return null;
  try {
    const snapshot = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.players)) {
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function saveGameSnapshot(game, storage = browserStorage()) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...game }));
  } catch {
    // Una cuota llena o el modo privado no deben impedir jugar.
  }
}

export function clearGameSnapshot(storage = browserStorage()) {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // El almacenamiento local es una mejora, no una dependencia del juego.
  }
}

export { STORAGE_KEY };
