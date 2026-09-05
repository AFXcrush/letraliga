import test from "node:test";
import assert from "node:assert/strict";
import {
  FULL_RACK_BONUS,
  getFullRackBonus,
  getGameHighlights,
} from "./gameStats.js";

test("otorga 25 puntos sólo al usar las siete fichas", () => {
  assert.equal(getFullRackBonus(7), FULL_RACK_BONUS);
  assert.equal(getFullRackBonus(6), 0);
  assert.equal(getFullRackBonus(1), 0);
});

test("encuentra la palabra más larga y la de mayor puntaje", () => {
  const history = [
    { word: "CASA", points: 5, playerName: "Ana" },
    { word: "ELEFANTE", points: 12, playerName: "Luis" },
    { word: "SOL", points: 20, playerName: "Ana" },
  ];
  const result = getGameHighlights(history);

  assert.equal(result.longestWord.word, "ELEFANTE");
  assert.equal(result.highestScoringWord.word, "SOL");
});

test("devuelve estadísticas vacías cuando no se jugaron palabras", () => {
  assert.deepEqual(getGameHighlights([]), {
    longestWord: null,
    highestScoringWord: null,
  });
});
