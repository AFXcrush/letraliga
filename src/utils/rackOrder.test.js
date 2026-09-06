import assert from "node:assert/strict";
import test from "node:test";
import { moveRackTile } from "./rackOrder.js";

const rack = ["A", "B", "C"].map((id) => ({ id }));

test("mueve una ficha antes de otra dentro del atril", () => {
  assert.deepEqual(
    moveRackTile(rack, "C", "A").map(({ id }) => id),
    ["C", "A", "B"],
  );
});

test("mueve una ficha al final al soltarla sobre el atril", () => {
  assert.deepEqual(
    moveRackTile(rack, "A").map(({ id }) => id),
    ["B", "C", "A"],
  );
});
