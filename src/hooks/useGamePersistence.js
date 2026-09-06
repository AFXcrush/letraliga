import { useEffect } from "react";
import { saveGameSnapshot } from "../services/gameStorage.js";

export function useGamePersistence(state) {
  useEffect(() => {
    saveGameSnapshot({
      phase: state.phase,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      bag: state.bag,
      placedTiles: state.placedTiles,
      pendingTiles: state.pendingTiles,
      lastMoveKeys: state.lastMoveKeys,
      statusMessage: state.statusMessage,
      darkMode: state.darkMode,
      playedWords: state.playedWords,
      finalTurnPlayerId: state.finalTurnPlayerId,
      scorelessTurnCount: state.scorelessTurnCount,
      gameEndReason: state.gameEndReason,
      onlineSession: state.onlineSession,
    });
  }, [
    state.bag,
    state.currentPlayerIndex,
    state.darkMode,
    state.gameEndReason,
    state.onlineSession,
    state.finalTurnPlayerId,
    state.pendingTiles,
    state.lastMoveKeys,
    state.phase,
    state.placedTiles,
    state.playedWords,
    state.players,
    state.scorelessTurnCount,
    state.statusMessage,
  ]);
}
