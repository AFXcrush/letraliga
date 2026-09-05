import test from "node:test";
import assert from "node:assert/strict";
import {
  clearGameSnapshot,
  loadGameSnapshot,
  saveGameSnapshot,
} from "./gameStorage.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test("guarda, recupera y elimina una partida local", () => {
  const storage = memoryStorage();
  saveGameSnapshot({ phase: "playing", players: [{ id: "a" }] }, storage);
  assert.equal(loadGameSnapshot(storage).phase, "playing");
  clearGameSnapshot(storage);
  assert.equal(loadGameSnapshot(storage), null);
});

test("ignora datos dañados o de una versión incompatible", () => {
  const brokenStorage = {
    getItem: () => "{invalid",
  };
  const oldStorage = {
    getItem: () => JSON.stringify({ version: 0, players: [] }),
  };
  assert.equal(loadGameSnapshot(brokenStorage), null);
  assert.equal(loadGameSnapshot(oldStorage), null);
});
