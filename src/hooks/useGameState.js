import { useState } from "react";
import { GAME_PHASES } from "../game/constants.js";
import { loadGameSnapshot } from "../services/gameStorage.js";

/** Estado mutable central. Las reglas viven en hooks especializados. */
export function useGameState() {
  const [savedGame] = useState(loadGameSnapshot);
  const [phase, setPhase] = useState(savedGame?.phase ?? GAME_PHASES.LOBBY);
  const [players, setPlayers] = useState(savedGame?.players ?? []);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(
    savedGame?.currentPlayerIndex ?? 0,
  );
  const [bag, setBag] = useState(savedGame?.bag ?? []);
  const [placedTiles, setPlacedTiles] = useState(savedGame?.placedTiles ?? {});
  const [pendingTiles, setPendingTiles] = useState(
    savedGame?.pendingTiles ?? {},
  );
  const [lastMoveKeys, setLastMoveKeys] = useState(
    savedGame?.lastMoveKeys ?? [],
  );
  const [statusMessage, setStatusMessage] = useState(
    savedGame?.statusMessage ?? null,
  );
  const [celebration, setCelebration] = useState(null);
  const [checking, setChecking] = useState(false);
  const [darkMode, setDarkMode] = useState(savedGame?.darkMode ?? false);
  const [playedWords, setPlayedWords] = useState(savedGame?.playedWords ?? []);
  const [finalTurnPlayerId, setFinalTurnPlayerId] = useState(
    savedGame?.finalTurnPlayerId ??
      (savedGame?.isFinalTurn
        ? savedGame.players?.[savedGame.currentPlayerIndex]?.id ?? null
        : null),
  );
  const [scorelessTurnCount, setScorelessTurnCount] = useState(
    savedGame?.scorelessTurnCount ?? 0,
  );
  const [gameEndReason, setGameEndReason] = useState(
    savedGame?.gameEndReason ?? null,
  );
  const [onlineSession, setOnlineSession] = useState(
    savedGame?.onlineSession ?? null,
  );

  return {
    phase,
    setPhase,
    players,
    setPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    bag,
    setBag,
    placedTiles,
    setPlacedTiles,
    pendingTiles,
    setPendingTiles,
    lastMoveKeys,
    setLastMoveKeys,
    statusMessage,
    setStatusMessage,
    celebration,
    setCelebration,
    checking,
    setChecking,
    darkMode,
    setDarkMode,
    playedWords,
    setPlayedWords,
    finalTurnPlayerId,
    setFinalTurnPlayerId,
    scorelessTurnCount,
    setScorelessTurnCount,
    gameEndReason,
    setGameEndReason,
    onlineSession,
    setOnlineSession,
  };
}
