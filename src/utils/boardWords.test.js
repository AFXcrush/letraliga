import test from "node:test";
import assert from "node:assert/strict";
import { resolvePendingWord } from "./boardWords.js";

const tiles = {
  "0-0": { id: "a", letter: "A", points: 1 },
  "0-1": { id: "b", letter: "B", points: 3 },
};

function resolve(layout, placedTiles = tiles, pendingKeys = ["0-0", "0-1"]) {
  return resolvePendingWord({
    placedTiles,
    pendingKeys,
    boardLayout: [layout],
  });
}

test("suma normalmente cuando no hay multiplicadores", () => {
  const result = resolve(["plain", "plain"]);
  assert.equal(result.points, 4);
  assert.equal(result.upgradedTiles["0-0"].points, 1);
  assert.equal(result.upgradedTiles["0-1"].points, 3);
});

test("2L mejora permanentemente sólo la ficha sobre esa casilla", () => {
  const result = resolve(["plain", "2L"]);
  assert.equal(result.points, 7);
  assert.equal(result.upgradedTiles["0-0"].points, 1);
  assert.equal(result.upgradedTiles["0-1"].points, 6);
  assert.equal(result.upgradedTiles["0-1"].scoreBonus.label, "2L");
});

test("un comodín asignado conserva cero puntos incluso sobre 3L", () => {
  const board = {
    "0-0": { id: "a", letter: "A", points: 1 },
    "0-1": {
      id: "blank",
      letter: "R",
      points: 0,
      isBlank: true,
    },
  };
  const result = resolve(["plain", "3L"], board);

  assert.equal(result.points, 1);
  assert.equal(result.upgradedTiles["0-1"].points, 0);
  assert.equal(result.upgradedTiles["0-1"].isBlank, true);
});

test("2W mejora permanentemente todas las fichas de la palabra", () => {
  const result = resolve(["plain", "2W"]);
  assert.equal(result.points, 8);
  assert.equal(result.upgradedTiles["0-0"].points, 2);
  assert.equal(result.upgradedTiles["0-1"].points, 6);
  assert.equal(result.upgradedTiles["0-0"].scoreBonus.label, null);
  assert.equal(result.upgradedTiles["0-0"].scoreBonus.tone, "2W");
  assert.equal(result.upgradedTiles["0-1"].scoreBonus.label, "2W");
});

test("combina primero el multiplicador de letra y después el de palabra", () => {
  const result = resolve(["2L", "2W"]);
  assert.equal(result.points, 10);
  assert.equal(result.upgradedTiles["0-0"].points, 4);
  assert.equal(result.upgradedTiles["0-1"].points, 6);
  assert.equal(result.upgradedTiles["0-0"].scoreBonus.label, "2L");
  assert.equal(result.upgradedTiles["0-0"].scoreBonus.tone, "2L");
  assert.equal(result.upgradedTiles["0-1"].scoreBonus.label, "2W");
});

test("no vuelve a activar la casilla bajo una ficha confirmada", () => {
  const board = {
    "0-0": { id: "a", letter: "A", points: 2 },
    "0-1": { id: "b", letter: "B", points: 3 },
  };
  const result = resolve(["2W", "plain"], board, ["0-1"]);
  assert.equal(result.points, 5);
  assert.equal(result.upgradedTiles["0-0"].points, 2);
});

test("suma la palabra principal y la palabra cruzada", () => {
  const board = {
    "1-0": { id: "new-a", letter: "A", points: 1 },
    "1-1": { id: "p", letter: "P", points: 3 },
    "1-2": { id: "a", letter: "A", points: 1 },
    "1-3": { id: "g", letter: "G", points: 2 },
    "1-4": { id: "o", letter: "O", points: 1 },
    "2-0": { id: "t", letter: "T", points: 1 },
    "3-0": { id: "new-a-2", letter: "A", points: 1 },
    "4-0": { id: "r", letter: "R", points: 1 },
  };
  const layout = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => "plain"),
  );
  const result = resolvePendingWord({
    placedTiles: board,
    pendingKeys: ["1-0", "2-0", "3-0", "4-0"],
    boardLayout: layout,
  });

  assert.deepEqual(
    result.words.map(({ word, points }) => ({ word, points })),
    [
      { word: "ATAR", points: 4 },
      { word: "APAGO", points: 8 },
    ],
  );
  assert.equal(result.points, 12);
  assert.deepEqual(new Set(result.cellsKeys), new Set(Object.keys(board)));
});
