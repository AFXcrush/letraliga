import test from "node:test";
import assert from "node:assert/strict";
import { getPostTurnAction, getScorelessTurnAction } from "./turnFlow.js";

test("inicia un último turno cuando se vacía la bolsa", () => {
  assert.equal(
    getPostTurnAction({ isFinalTurn: false, remainingBagCount: 0 }),
    "start-final-turn",
  );
});

test("termina la partida después de jugar el último turno", () => {
  assert.equal(
    getPostTurnAction({ isFinalTurn: true, remainingBagCount: 0 }),
    "gameover",
  );
});

test("avanza normalmente mientras queden fichas", () => {
  assert.equal(
    getPostTurnAction({ isFinalTurn: false, remainingBagCount: 4 }),
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
