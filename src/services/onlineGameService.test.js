import test from "node:test";
import assert from "node:assert/strict";
import {
  createOnlineRoom,
  ensureAnonymousSession,
  joinOnlineRoom,
  normalizeRoomCode,
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
