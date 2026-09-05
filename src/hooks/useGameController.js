import { useCallback } from "react";
import { GAME_PHASES } from "../game/constants.js";
import { createInitialGame } from "../game/gameSetup.js";
import { useBoardState } from "./useBoardState.js";
import { useGameState } from "./useGameState.js";
import { useTileActions } from "./useTileActions.js";
import { useTurnActions } from "./useTurnActions.js";

export function useGameController() {
  const state = useGameState();
  const currentPlayer = state.players[state.currentPlayerIndex] ?? null;
  const boardState = useBoardState(state.placedTiles, state.pendingTiles);

  const tileActions = useTileActions({
    placedTiles: state.placedTiles,
    pendingTiles: state.pendingTiles,
    currentPlayerIndex: state.currentPlayerIndex,
    setPendingTiles: state.setPendingTiles,
    setPlayers: state.setPlayers,
    setStatusMessage: state.setStatusMessage,
  });

  const turnActions = useTurnActions({
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    currentPlayer,
    bag: state.bag,
    pendingTiles: state.pendingTiles,
    boardForWordCheck: boardState.boardForWordCheck,
    isFinalTurn: state.isFinalTurn,
    setPhase: state.setPhase,
    setPlayers: state.setPlayers,
    setCurrentPlayerIndex: state.setCurrentPlayerIndex,
    setBag: state.setBag,
    setPlacedTiles: state.setPlacedTiles,
    setPendingTiles: state.setPendingTiles,
    setStatusMessage: state.setStatusMessage,
    setCelebration: state.setCelebration,
    setChecking: state.setChecking,
    setPlayedWords: state.setPlayedWords,
    setIsFinalTurn: state.setIsFinalTurn,
  });

  const {
    setPlayers,
    setBag,
    setPlacedTiles,
    setPendingTiles,
    setCurrentPlayerIndex,
    setStatusMessage,
    setCelebration,
    setPlayedWords,
    setIsFinalTurn,
    setPhase,
  } = state;

  const startGame = useCallback(
    (names) => {
      const game = createInitialGame(names);
      setPlayers(game.players);
      setBag(game.bag);
      setPlacedTiles({});
      setPendingTiles({});
      setCurrentPlayerIndex(0);
      setStatusMessage(null);
      setCelebration(null);
      setPlayedWords([]);
      setIsFinalTurn(false);
      setPhase(GAME_PHASES.PLAYING);
    },
    [
      setBag,
      setCelebration,
      setCurrentPlayerIndex,
      setIsFinalTurn,
      setPendingTiles,
      setPhase,
      setPlacedTiles,
      setPlayedWords,
      setPlayers,
      setStatusMessage,
    ],
  );

  const resetToLobby = useCallback(() => {
    setPhase(GAME_PHASES.LOBBY);
    setPlayers([]);
    setBag([]);
    setPlacedTiles({});
    setPendingTiles({});
    setStatusMessage(null);
    setCelebration(null);
    setPlayedWords([]);
    setIsFinalTurn(false);
    setCurrentPlayerIndex(0);
  }, [
    setBag,
    setCelebration,
    setCurrentPlayerIndex,
    setIsFinalTurn,
    setPendingTiles,
    setPhase,
    setPlacedTiles,
    setPlayedWords,
    setPlayers,
    setStatusMessage,
  ]);

  const toggleDarkMode = useCallback(
    () => state.setDarkMode((darkMode) => !darkMode),
    [state.setDarkMode],
  );
  const dismissCelebration = useCallback(
    () => state.setCelebration(null),
    [state.setCelebration],
  );

  return {
    phase: state.phase,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    currentPlayer,
    bag: state.bag,
    tilesRemaining: state.bag.length,
    placedTiles: state.placedTiles,
    pendingTiles: state.pendingTiles,
    pendingWordPreview: boardState.pendingWordPreview,
    statusMessage: state.statusMessage,
    celebration: state.celebration,
    checking: state.checking,
    darkMode: state.darkMode,
    playedWords: state.playedWords,
    isFinalTurn: state.isFinalTurn,
    startGame,
    ...tileActions,
    ...turnActions,
    toggleDarkMode,
    dismissCelebration,
    resetToLobby,
  };
}
