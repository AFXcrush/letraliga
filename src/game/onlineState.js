import { GAME_PHASES } from "./constants.js";

export function countBagTiles(bag) {
  return bag.reduce((counts, tile) => {
    const letter = tile.letter ?? "";
    counts[letter] = (counts[letter] ?? 0) + 1;
    return counts;
  }, {});
}

export function createOnlinePublicState(state) {
  return {
    phase: state.phase,
    currentPlayerIndex: state.currentPlayerIndex,
    currentPlayerId: state.players[state.currentPlayerIndex]?.id ?? null,
    placedTiles: state.placedTiles,
    playedWords: state.playedWords,
    finalTurnPlayerId: state.finalTurnPlayerId,
    scorelessTurnCount: state.scorelessTurnCount,
    gameEndReason: state.gameEndReason,
    statusMessage: state.statusMessage,
    bagCount: state.bag.length,
    bagCounts: countBagTiles(state.bag),
  };
}

export function hydrateOnlineRoom(room, playerId) {
  const game = room?.game;
  const publicState = game?.public_state ?? {};
  const finishedRacks = new Map(
    (room?.racks ?? []).map((entry) => [entry.playerId, entry.tiles]),
  );
  const players = (room?.players ?? []).map((player) => ({
    id: player.id,
    userId: player.user_id,
    name: player.name,
    score: player.score,
    rack:
      finishedRacks.get(player.id) ??
      (player.id === playerId ? room?.rack ?? [] : []),
  }));

  return {
    phase:
      game?.status === "waiting"
        ? GAME_PHASES.ONLINE_WAITING
        : publicState.phase ?? GAME_PHASES.PLAYING,
    players,
    currentPlayerIndex: publicState.currentPlayerIndex ?? 0,
    bag: room?.bag ?? [],
    placedTiles: publicState.placedTiles ?? {},
    playedWords: publicState.playedWords ?? [],
    finalTurnPlayerId:
      publicState.finalTurnPlayerId ??
      (publicState.isFinalTurn
        ? players[publicState.currentPlayerIndex ?? 0]?.id ?? null
        : null),
    scorelessTurnCount: publicState.scorelessTurnCount ?? 0,
    gameEndReason: publicState.gameEndReason ?? null,
    statusMessage: publicState.statusMessage ?? null,
    stateVersion: game?.state_version ?? 0,
    bagCount: publicState.bagCount ?? 0,
    bagCounts: publicState.bagCounts ?? {},
  };
}
