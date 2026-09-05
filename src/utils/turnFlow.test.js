import test from "node:test";
import assert from "node:assert/strict";
import { getPostTurnAction, getScorelessTurnAction } from "./turnFlow.js";

test("inicia la ronda final cuando un jugador roba la última ficha", () => {
  assert.equal(
    getPostTurnAction({
      finalTurnPlayerId: null,
      currentPlayerId: "player-1",
      remainingBagCount: 0,
    }),
    "start-final-round",
  );
});

test("los oponentes juegan antes del último turno del jugador que vació la bolsa", () => {
  assert.equal(
    getPostTurnAction({
      finalTurnPlayerId: "player-1",
      currentPlayerId: "player-2",
      remainingBagCount: 0,
    }),
    "advance",
  );
});

test("termina después del turno final del jugador que vació la bolsa", () => {
  assert.equal(
    getPostTurnAction({
      finalTurnPlayerId: "player-1",
      currentPlayerId: "player-1",
      remainingBagCount: 0,
    }),
    "gameover",
  );
});

test("avanza normalmente mientras queden fichas", () => {
  assert.equal(
    getPostTurnAction({
      finalTurnPlayerId: null,
      currentPlayerId: "player-1",
      remainingBagCount: 4,
    }),
    "advance",
  );
});

test("termina después de dos rondas completas sin palabras", () => {
  assert.deepEqual(
    getScorelessTurnAction({
      currentCount: 5,
      playerCount: 3,
      roundsToEnd: 2,
    }),
    { nextCount: 6, gameOver: true },
  );
});

test("continúa antes de completar las dos rondas sin palabras", () => {
  assert.equal(
    getScorelessTurnAction({
      currentCount: 4,
      playerCount: 3,
      roundsToEnd: 2,
    }).gameOver,
    false,
  );
});
