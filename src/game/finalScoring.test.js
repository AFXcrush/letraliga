import test from "node:test";
import assert from "node:assert/strict";
import { applyFinalScoring } from "./finalScoring.js";

test("resta las fichas restantes y las transfiere a quien vació su atril", () => {
  const result = applyFinalScoring([
    { id: "a", score: 20, rack: [] },
    {
      id: "b",
      score: 15,
      rack: [
        { points: 3 },
        { points: 1 },
      ],
    },
  ]);

  assert.equal(result[0].finalScore, 24);
  assert.equal(result[0].rackBonus, 4);
  assert.equal(result[1].finalScore, 11);
  assert.equal(result[1].rackPenalty, 4);
});

test("en un cierre sin atriles vacíos sólo aplica las penalizaciones", () => {
  const result = applyFinalScoring([
    { id: "a", score: 10, rack: [{ points: 2 }] },
    { id: "b", score: 8, rack: [{ points: 1 }] },
  ]);

  assert.deepEqual(result.map(({ finalScore }) => finalScore), [8, 7]);
  assert.deepEqual(result.map(({ rackBonus }) => rackBonus), [0, 0]);
});
