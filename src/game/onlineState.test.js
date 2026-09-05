import test from "node:test";
import assert from "node:assert/strict";
import {
  createOnlinePublicState,
  hydrateOnlineRoom,
} from "./onlineState.js";

test("el estado público online no expone atriles ni el orden de la bolsa", () => {
  const state = createOnlinePublicState({
    phase: "playing",
    players: [
      { id: "p1", name: "Ana", score: 4, rack: [{ letter: "X" }] },
      { id: "p2", name: "Luis", score: 2, rack: [{ letter: "Z" }] },
    ],
    currentPlayerIndex: 1,
    bag: [{ letter: "A" }, { letter: "A" }, { letter: "B" }],
    placedTiles: {},
    playedWords: [],
    finalTurnPlayerId: null,
    celebration: {
      id: "move-1",
      playerName: "Luis",
      words: ["casa"],
      points: 8,
    },
    scorelessTurnCount: 0,
    gameEndReason: null,
    statusMessage: null,
  });

  assert.equal(state.currentPlayerId, "p2");
  assert.equal(state.bagCount, 3);
  assert.deepEqual(state.bagCounts, { A: 2, B: 1 });
  assert.equal(state.celebration.playerName, "Luis");
  assert.equal("players" in state, false);
  assert.equal("bag" in state, false);
});

test("sincroniza qué jugador tendrá el último turno", () => {
  const state = createOnlinePublicState({
    phase: "playing",
    players: [{ id: "p1" }, { id: "p2" }],
    currentPlayerIndex: 1,
    bag: [],
    placedTiles: {},
    playedWords: [],
    finalTurnPlayerId: "p1",
    scorelessTurnCount: 0,
  });

  assert.equal(state.finalTurnPlayerId, "p1");

  const hydrated = hydrateOnlineRoom(
    {
      game: { status: "playing", public_state: state },
      players: [
        { id: "p1", user_id: "u1", name: "Ana", score: 0 },
        { id: "p2", user_id: "u2", name: "Luis", score: 0 },
      ],
      rack: [],
      bag: [],
    },
    "p2",
  );

  assert.equal(hydrated.finalTurnPlayerId, "p1");
});

test("hidrata únicamente el atril del jugador conectado", () => {
  const hydrated = hydrateOnlineRoom(
    {
      game: {
        status: "playing",
        state_version: 3,
        public_state: {
          phase: "playing",
          currentPlayerIndex: 1,
          bagCount: 8,
          celebration: {
            id: "move-2",
            playerName: "Ana",
            words: ["sol"],
            points: 5,
          },
        },
      },
      players: [
        { id: "p1", user_id: "u1", name: "Ana", score: 4 },
        { id: "p2", user_id: "u2", name: "Luis", score: 2 },
      ],
      rack: [{ id: "tile-1", letter: "A", points: 1 }],
      bag: [],
    },
    "p2",
  );

  assert.deepEqual(hydrated.players[0].rack, []);
  assert.equal(hydrated.players[1].rack[0].letter, "A");
  assert.equal(hydrated.stateVersion, 3);
  assert.equal(hydrated.celebration.id, "move-2");
});

test("revela todos los atriles solamente en el estado final recibido", () => {
  const hydrated = hydrateOnlineRoom(
    {
      game: { status: "finished", public_state: { phase: "gameover" } },
      players: [
        { id: "p1", user_id: "u1", name: "Ana", score: 4 },
        { id: "p2", user_id: "u2", name: "Luis", score: 2 },
      ],
      rack: [{ letter: "A", points: 1 }],
      racks: [
        { playerId: "p1", tiles: [{ letter: "A", points: 1 }] },
        { playerId: "p2", tiles: [{ letter: "Z", points: 10 }] },
      ],
    },
    "p1",
  );

  assert.equal(hydrated.players[0].rack[0].letter, "A");
  assert.equal(hydrated.players[1].rack[0].letter, "Z");
});
