import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const isOnlineGameAvailable = isSupabaseConfigured;

function requireClient(client) {
  if (!client) {
    throw new Error("Configura Supabase antes de usar salas online.");
  }
  return client;
}

export function normalizeRoomCode(code) {
  return String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export async function ensureAnonymousSession(client = supabase) {
  const activeClient = requireClient(client);
  const { data: sessionData, error: sessionError } =
    await activeClient.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data, error } = await activeClient.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

async function callRoomFunction(functionName, args, client) {
  const activeClient = requireClient(client);
  await ensureAnonymousSession(activeClient);
  const { data, error } = await activeClient.rpc(functionName, args);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export function createOnlineRoom(playerName, client = supabase) {
  return callRoomFunction(
    "create_game_room",
    { player_name: playerName.trim() },
    client,
  );
}

export function joinOnlineRoom(roomCode, playerName, client = supabase) {
  return callRoomFunction(
    "join_game_room",
    {
      join_code: normalizeRoomCode(roomCode),
      player_name: playerName.trim(),
    },
    client,
  );
}

export async function getOnlineRoom(gameId, client = supabase) {
  const activeClient = requireClient(client);
  const { data, error } = await activeClient.rpc("get_game_room", {
    target_game_id: gameId,
  });
  if (error) throw error;
  return data;
}

export function subscribeToOnlineRoom(gameId, onChange, client = supabase) {
  const activeClient = requireClient(client);
  const channel = activeClient
    .channel(`game-room-${gameId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_players",
        filter: `game_id=eq.${gameId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "moves", filter: `game_id=eq.${gameId}` },
      onChange,
    )
    .subscribe();

  return () => activeClient.removeChannel(channel);
}
