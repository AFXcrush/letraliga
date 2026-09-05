import test from "node:test";
import assert from "node:assert/strict";
import {
  createPlayedWordEntries,
  createSuccessMessage,
} from "./turnResult.js";

test("convierte palabras resueltas en entradas del historial", () => {
  assert.deepEqual(
    createPlayedWordEntries(
      [{ word: "casa", points: 8 }],
      { id: "player-1", name: "Ana" },
    ),
    [
      {
        word: "casa",
        points: 8,
        playerId: "player-1",
        playerName: "Ana",
      },
    ],
  );
});

test("arma el resumen de puntaje y avisa el último turno", () => {
  const message = createSuccessMessage({
    words: [{ word: "casa", points: 8 }],
    wordPoints: 8,
    bonusPoints: 25,
    turnPoints: 33,
    startsFinalTurn: true,
  });

  assert.match(message, /"CASA" \(8\)/);
  assert.match(message, /bono de 25/);
  assert.match(message, /último turno/);
});
