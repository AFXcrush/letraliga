import assert from "node:assert/strict";
import test from "node:test";
import { readTileDragData, writeTileDragData } from "./tileDrag.js";

function createDataTransfer(rejectedType) {
  const values = new Map();
  return {
    effectAllowed: "all",
    setData(type, value) {
      if (type === rejectedType) throw new Error("Formato no admitido");
      values.set(type, value);
    },
    getData(type) {
      if (type === rejectedType) throw new Error("Formato no admitido");
      return values.get(type) ?? "";
    },
  };
}

test("mantiene el arrastre si el navegador rechaza application/json", () => {
  const dataTransfer = createDataTransfer("application/json");
  const tile = { id: "tile-a", letter: "A", from: "rack" };

  assert.equal(writeTileDragData(dataTransfer, tile), true);
  assert.equal(dataTransfer.effectAllowed, "move");
  assert.deepEqual(readTileDragData(dataTransfer), tile);
});
