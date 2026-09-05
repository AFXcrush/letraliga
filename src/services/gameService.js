// Capa de "partida" separada del estado de React (ver context/GameContext.jsx).
//
// Hoy todas las funciones operan en modo LOCAL (pasar y jugar en un solo
// dispositivo): no hacen falta cambios en GameContext para usarlas.
//
// Para pasar a modo ONLINE con Supabase, este es el único archivo que
// debería cambiar. Esquema de tablas sugerido:
//
//   games    (id uuid pk, status text, letter_bag jsonb, board jsonb,
//              current_player_index int, created_at timestamptz)
//   players  (id uuid pk, game_id uuid fk -> games.id, name text,
//              score int, rack jsonb, turn_order int)
//   moves    (id uuid pk, game_id uuid fk, player_id uuid fk, word text,
//              points int, created_at timestamptz)
//
// Con Realtime activado en la tabla `games` y `players`, cada cliente puede
// suscribirse a los cambios (supabase.channel(...).on('postgres_changes', ...))
// para reflejar el tablero y los puntajes de todos los jugadores en vivo.

import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

export const isOnlineModeAvailable = isSupabaseConfigured;

// Crea una partida nueva. En modo local simplemente genera un id de sala
// (útil para mostrarlo en pantalla aunque todavía no haya backend real).
export async function createGame(players) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("games")
      .insert({ status: "playing" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  return {
    id: `local-${Math.random().toString(36).slice(2, 8)}`,
    status: "playing",
    players,
  };
}

// Envía una jugada confirmada (palabra válida) al backend, si existe.
// En modo local es un no-op: el estado ya vive en GameContext.
export async function submitMove({ gameId, playerId, word, points }) {
  if (!isSupabaseConfigured) return { ok: true };

  const { error } = await supabase
    .from("moves")
    .insert({ game_id: gameId, player_id: playerId, word, points });
  if (error) throw error;
  return { ok: true };
}

// Se suscribe a cambios de la partida en tiempo real. En modo local no hace
// nada y devuelve una función de "unsubscribe" vacía para mantener la misma
// interfaz en ambos modos.
export function subscribeToGame(gameId, onChange) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel(`game-${gameId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `game_id=eq.${gameId}` },
      onChange,
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
