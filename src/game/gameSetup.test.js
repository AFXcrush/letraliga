import test from "node:test";
import assert from "node:assert/strict";
import { buildLetterBag } from "../layout/letterData.js";
import { isConsonant, isVowel } from "../utils/rackBalance.js";
import { createInitialGame } from "./gameSetup.js";

test("crea jugadores con identificadores estables y atriles balanceados", () => {
  const game = createInitialGame(["Ana", "Luis"], 1234);

  assert.deepEqual(
    game.players.map(({ id, name, score }) => ({ id, name, score })),
    [
      { id: "player-0-1234", name: "Ana", score: 0 },
      { id: "player-1-1234", name: "Luis", score: 0 },
    ],
  );
  for (const player of game.players) {
    assert.equal(player.rack.length, 7);
    assert.ok(player.rack.filter(isVowel).length >= 2);
    assert.ok(player.rack.filter(isConsonant).length >= 2);
  }
  assert.equal(
    game.bag.length + game.players.flatMap(({ rack }) => rack).length,
    buildLetterBag().length,
  );
});
