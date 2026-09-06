import test from "node:test";
import assert from "node:assert/strict";
import {
  commitOnlineTurn,
  createOnlineRoom,
  ensureAnonymousSession,
  joinOnlineRoom,
  leaveOnlineRoom,
  normalizeRoomCode,
  previewOnlineTurn,
  startOnlineGame,
} from "./onlineGameService.js";

test("normaliza códigos de sala", () => {
  assert.equal(normalizeRoomCode(" ab-12 c3 "), "AB12C3");
});

test("reutiliza una sesión anónima existente", async () => {
  const session = { user: { id: "user-1" } };
  const client = {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      signInAnonymously: async () => {
        throw new Error("no debe crear otra sesión");
      },
    },
  };
  assert.equal(await ensureAnonymousSession(client), session);
});

test("crea y une salas mediante funciones protegidas", async () => {
  const calls = [];
  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user: {} } }, error: null }),
    },
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: [{ game_id: "game-1", room_code: "ABC123" }], error: null };
    },
  };

  await createOnlineRoom("Ana", client);
  await joinOnlineRoom("abc-123", "Luis", client);
  assert.deepEqual(calls, [
    { name: "create_game_room", args: { player_name: "Ana" } },
    {
      name: "join_game_room",
      args: { join_code: "ABC123", player_name: "Luis" },
    },
  ]);
});

test("inicia la sala y confirma turnos mediante funciones protegidas", async () => {
  const calls = [];
  const client = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: 2, error: null };
    },
  };

  await startOnlineGame(
    {
      gameId: "game-1",
      publicState: { phase: "playing" },
      bag: [{ id: "bag-1" }],
      racks: [{ playerId: "player-1", tiles: [{ id: "rack-1" }] }],
    },
    client,
  );
  await commitOnlineTurn(
    {
      gameId: "game-1",
      expectedVersion: 1,
      publicState: { phase: "playing" },
      bag: [],
      rack: [{ id: "rack-2" }],
      score: 4,
      move: { words: [{ word: "UN" }], points: 4, boardDelta: { "9-13": {} } },
    },
    client,
  );

  assert.deepEqual(calls, [
    {
      name: "start_game_room",
      args: {
        target_game_id: "game-1",
        initial_public_state: { phase: "playing" },
        initial_bag: [{ id: "bag-1" }],
        initial_racks: [
          { playerId: "player-1", tiles: [{ id: "rack-1" }] },
        ],
      },
    },
    {
      name: "commit_game_turn",
      args: {
        target_game_id: "game-1",
        expected_state_version: 1,
        next_public_state: { phase: "playing" },
        next_bag: [],
        next_rack: [{ id: "rack-2" }],
        next_score: 4,
        move_words: [{ word: "UN" }],
        move_points: 4,
        move_board_delta: { "9-13": {} },
      },
    },
  ]);
});

test("sincroniza sólo las coordenadas de fichas pendientes", async () => {
  const calls = [];
  const client = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: null, error: null };
    },
  };

  await previewOnlineTurn("game-1", ["9-13", "9-14"], client);
  assert.deepEqual(calls, [
    {
      name: "preview_game_turn",
      args: {
        target_game_id: "game-1",
        preview_tile_keys: ["9-13", "9-14"],
      },
    },
  ]);
});

test("abandona una sala mediante una función protegida", async () => {
  const calls = [];
  const client = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: true, error: null };
    },
  };

  await leaveOnlineRoom("game-1", client);
  assert.deepEqual(calls, [
    { name: "leave_game_room", args: { target_game_id: "game-1" } },
  ]);
});
