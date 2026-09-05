import test from "node:test";
import assert from "node:assert/strict";
import {
  createCelebration,
  createPlayedWordEntries,
  createSuccessMessage,
  createSuccessStatusMessage,
  getVisibleStatusMessage,
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

test("avisa que la ronda continúa antes del último turno", () => {
  const message = createSuccessMessage({
    words: [{ word: "casa", points: 8 }],
    wordPoints: 8,
    bonusPoints: 25,
    turnPoints: 33,
    startsFinalTurn: true,
  });

  assert.match(message, /"CASA" \(8\)/);
  assert.match(message, /bono de 25/);
  assert.match(message, /ronda continúa/);
  assert.match(message, /último turno/);
});

test("incluye al jugador en la celebración de la palabra", () => {
  const celebration = createCelebration(
    {
      word: "casa",
      words: [{ word: "casa" }],
      points: 8,
      cellsKeys: ["9-13"],
    },
    0,
    8,
    { name: "Ana" },
  );

  assert.equal(celebration.playerName, "Ana");
  assert.equal(celebration.points, 8);
});

test("dirige el aviso detallado de la última ficha sólo a quien la recibió", () => {
  const statusMessage = createSuccessStatusMessage(
    {
      words: [{ word: "casa", points: 8 }],
      wordPoints: 8,
      bonusPoints: 0,
      turnPoints: 8,
      startsFinalTurn: true,
    },
    "player-1",
  );

  assert.match(
    getVisibleStatusMessage(statusMessage, "player-1").text,
    /La bolsa quedó vacía/,
  );
  assert.equal(
    getVisibleStatusMessage(statusMessage, "player-2").text,
    "Último turno.",
  );
});
