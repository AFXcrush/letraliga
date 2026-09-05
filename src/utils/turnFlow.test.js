import test from "node:test";
import assert from "node:assert/strict";
import { getPostTurnAction } from "./turnFlow.js";

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
