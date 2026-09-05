import { useCallback, useEffect, useState } from "react";
import { GAME_PHASES } from "../game/constants.js";
import { createInitialGame } from "../game/gameSetup.js";
import {
  createOnlinePublicState,
  hydrateOnlineRoom,
} from "../game/onlineState.js";
import {
  commitOnlineTurn,
  createOnlineRoom,
  ensureAnonymousSession,
  getOnlineRoom,
  joinOnlineRoom,
  leaveOnlineRoom,
  startOnlineGame,
  subscribeToOnlineRoom,
} from "../services/onlineGameService.js";
import { useBoardState } from "./useBoardState.js";
import { useGamePersistence } from "./useGamePersistence.js";
import { useGameState } from "./useGameState.js";
import { useTileActions } from "./useTileActions.js";
import { useTurnActions } from "./useTurnActions.js";

function onlineErrorMessage(error) {
  const message = error?.message ?? String(error ?? "Error desconocido");
  if (/gen_random_bytes|function .* does not exist|schema cache/i.test(message)) {
    return "El esquema de Supabase está desactualizado. Ejecuta nuevamente supabase/schema.sql en el SQL Editor.";
  }
  if (/Room is unavailable/i.test(message)) {
    return "La sala no existe o ya comenzó.";
  }
  if (/At least two players/i.test(message)) {
    return "Se necesitan al menos dos jugadores para comenzar.";
  }
  if (/state changed|reload/i.test(message)) {
    return "La partida cambió en otro dispositivo. Se recargó el estado más reciente.";
  }
  return `No se pudo sincronizar la sala: ${message}`;
}

export function useGameController() {
  const state = useGameState();
  const [onlineSyncRequest, setOnlineSyncRequest] = useState(null);
  useGamePersistence(state);

  const currentPlayer = state.players[state.currentPlayerIndex] ?? null;
  const localPlayer = state.onlineSession
    ? state.players.find(({ id }) => id === state.onlineSession.playerId) ?? null
    : currentPlayer;
  const isOnlineGame = Boolean(state.onlineSession?.gameId);
  const canTakeTurn =
    !isOnlineGame ||
    (state.phase === GAME_PHASES.PLAYING &&
      currentPlayer?.id === state.onlineSession?.playerId &&
      !onlineSyncRequest);
  const boardState = useBoardState(state.placedTiles, state.pendingTiles);
  const isOpeningTurn = Object.keys(state.placedTiles).length === 0;

  const markOnlineTurnForSync = useCallback(
    (move = {}) => {
      if (state.onlineSession?.gameId) {
        setOnlineSyncRequest({ id: Date.now(), move });
      }
    },
    [state.onlineSession?.gameId],
  );

  const tileActions = useTileActions({
    canInteract: canTakeTurn,
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
    isOpeningTurn,
    finalTurnPlayerId: state.finalTurnPlayerId,
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
    setFinalTurnPlayerId: state.setFinalTurnPlayerId,
    scorelessTurnCount: state.scorelessTurnCount,
    setScorelessTurnCount: state.setScorelessTurnCount,
    setGameEndReason: state.setGameEndReason,
    canTakeTurn,
    onTurnFinished: markOnlineTurnForSync,
  });

  const hydrateRoom = useCallback(
    (room, sessionDetails = {}) => {
      const playerId = sessionDetails.playerId ?? state.onlineSession?.playerId;
      if (!playerId) return;
      const hydrated = hydrateOnlineRoom(room, playerId);
      const userId = sessionDetails.userId ?? state.onlineSession?.userId;

      state.setPlayers(hydrated.players);
      state.setCurrentPlayerIndex(hydrated.currentPlayerIndex);
      state.setBag(hydrated.bag);
      state.setPlacedTiles(hydrated.placedTiles);
      state.setPendingTiles({});
      state.setPlayedWords(hydrated.playedWords);
      state.setFinalTurnPlayerId(hydrated.finalTurnPlayerId);
      state.setScorelessTurnCount(hydrated.scorelessTurnCount);
      state.setGameEndReason(hydrated.gameEndReason);
      state.setStatusMessage(hydrated.statusMessage);
      state.setPhase(hydrated.phase);
      state.setOnlineSession((current) => ({
        ...current,
        ...sessionDetails,
        playerId,
        userId,
        gameId: room.game.id,
        roomCode: room.game.room_code,
        isHost: room.game.host_user_id === userId,
        stateVersion: hydrated.stateVersion,
        bagCount: hydrated.bagCount,
        bagCounts: hydrated.bagCounts,
      }));
    },
    [
      state.onlineSession?.playerId,
      state.onlineSession?.userId,
      state.setBag,
      state.setCurrentPlayerIndex,
      state.setGameEndReason,
      state.setFinalTurnPlayerId,
      state.setOnlineSession,
      state.setPendingTiles,
      state.setPhase,
      state.setPlacedTiles,
      state.setPlayedWords,
      state.setPlayers,
      state.setScorelessTurnCount,
      state.setStatusMessage,
    ],
  );

  const refreshOnlineRoom = useCallback(async () => {
    if (!state.onlineSession?.gameId) return null;
    const room = await getOnlineRoom(state.onlineSession.gameId);
    hydrateRoom(room);
    return room;
  }, [hydrateRoom, state.onlineSession?.gameId]);

  useEffect(() => {
    const session = state.onlineSession;
    if (!session?.gameId) return undefined;
    let active = true;

    const refresh = async () => {
      try {
        const room = await getOnlineRoom(session.gameId);
        if (active) hydrateRoom(room);
      } catch (error) {
        if (active) {
          state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
        }
      }
    };

    const unsubscribe = subscribeToOnlineRoom(session.gameId, refresh);
    refresh();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrateRoom, state.onlineSession?.gameId, state.setStatusMessage]);

  useEffect(() => {
    if (!onlineSyncRequest || !state.onlineSession?.gameId) return undefined;
    let active = true;

    const sync = async () => {
      const session = state.onlineSession;
      const player = state.players.find(({ id }) => id === session.playerId);
      if (!player) return;
      try {
        const publicState = createOnlinePublicState(state);
        const version = await commitOnlineTurn({
          gameId: session.gameId,
          expectedVersion: session.stateVersion,
          publicState,
          bag: state.bag,
          rack: player.rack,
          score: player.score,
          move: onlineSyncRequest.move,
        });
        if (!active) return;
        state.setOnlineSession((current) => ({
          ...current,
          stateVersion: version,
          bagCount: publicState.bagCount,
          bagCounts: publicState.bagCounts,
        }));
        setOnlineSyncRequest(null);
      } catch (error) {
        if (!active) return;
        setOnlineSyncRequest(null);
        state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
        try {
          await refreshOnlineRoom();
        } catch {
          // El aviso anterior conserva el motivo original del fallo.
        }
      }
    };
    sync();
    return () => {
      active = false;
    };
  }, [onlineSyncRequest]);

  const createOnlineSession = useCallback(
    async (playerName) => {
      state.setChecking(true);
      try {
        const authSession = await ensureAnonymousSession();
        const created = await createOnlineRoom(playerName);
        const room = await getOnlineRoom(created.game_id);
        hydrateRoom(room, {
          playerId: created.player_id,
          userId: authSession.user.id,
        });
        return true;
      } catch (error) {
        state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
        return false;
      } finally {
        state.setChecking(false);
      }
    },
    [hydrateRoom, state.setChecking, state.setStatusMessage],
  );

  const joinOnlineSession = useCallback(
    async (roomCode, playerName) => {
      state.setChecking(true);
      try {
        const authSession = await ensureAnonymousSession();
        const joined = await joinOnlineRoom(roomCode, playerName);
        const room = await getOnlineRoom(joined.game_id);
        hydrateRoom(room, {
          playerId: joined.player_id,
          userId: authSession.user.id,
        });
        return true;
      } catch (error) {
        state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
        return false;
      } finally {
        state.setChecking(false);
      }
    },
    [hydrateRoom, state.setChecking, state.setStatusMessage],
  );

  const startOnlineMatch = useCallback(async () => {
    const session = state.onlineSession;
    if (!session?.gameId || !session.isHost) return false;
    state.setChecking(true);
    try {
      const room = await getOnlineRoom(session.gameId);
      const initial = createInitialGame(room.players.map(({ name }) => name));
      const players = room.players.map((player, index) => ({
        ...initial.players[index],
        id: player.id,
        userId: player.user_id,
      }));
      const initialState = {
        ...state,
        phase: GAME_PHASES.PLAYING,
        players,
        currentPlayerIndex: 0,
        bag: initial.bag,
        placedTiles: {},
        playedWords: [],
        finalTurnPlayerId: null,
        scorelessTurnCount: 0,
        gameEndReason: null,
        statusMessage: null,
      };
      await startOnlineGame({
        gameId: session.gameId,
        publicState: createOnlinePublicState(initialState),
        bag: initial.bag,
        racks: players.map(({ id, rack }) => ({ playerId: id, tiles: rack })),
      });
      await refreshOnlineRoom();
      return true;
    } catch (error) {
      state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
      return false;
    } finally {
      state.setChecking(false);
    }
  }, [refreshOnlineRoom, state]);

  const startGame = useCallback(
    (names) => {
      const game = createInitialGame(names);
      state.setOnlineSession(null);
      state.setPlayers(game.players);
      state.setBag(game.bag);
      state.setPlacedTiles({});
      state.setPendingTiles({});
      state.setCurrentPlayerIndex(0);
      state.setStatusMessage(null);
      state.setCelebration(null);
      state.setPlayedWords([]);
      state.setFinalTurnPlayerId(null);
      state.setScorelessTurnCount(0);
      state.setGameEndReason(null);
      state.setPhase(GAME_PHASES.PLAYING);
    },
    [state],
  );

  const resetToLobby = useCallback(() => {
    setOnlineSyncRequest(null);
    state.setOnlineSession(null);
    state.setPhase(GAME_PHASES.LOBBY);
    state.setPlayers([]);
    state.setBag([]);
    state.setPlacedTiles({});
    state.setPendingTiles({});
    state.setStatusMessage(null);
    state.setCelebration(null);
    state.setPlayedWords([]);
    state.setFinalTurnPlayerId(null);
    state.setCurrentPlayerIndex(0);
    state.setScorelessTurnCount(0);
    state.setGameEndReason(null);
  }, [state]);

  const leaveOnlineSession = useCallback(async () => {
    const gameId = state.onlineSession?.gameId;
    if (gameId) {
      try {
        await leaveOnlineRoom(gameId);
      } catch (error) {
        state.setStatusMessage({ type: "error", text: onlineErrorMessage(error) });
      }
    }
    resetToLobby();
  }, [resetToLobby, state.onlineSession?.gameId, state.setStatusMessage]);

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
    localPlayer,
    bag: state.bag,
    tilesRemaining: isOnlineGame
      ? state.onlineSession?.bagCount ?? state.bag.length
      : state.bag.length,
    bagCounts: isOnlineGame ? state.onlineSession?.bagCounts : null,
    placedTiles: state.placedTiles,
    pendingTiles: state.pendingTiles,
    isOpeningTurn,
    pendingWordPreview: boardState.pendingWordPreview,
    statusMessage: state.statusMessage,
    celebration: state.celebration,
    checking: state.checking || Boolean(onlineSyncRequest),
    darkMode: state.darkMode,
    playedWords: state.playedWords,
    isFinalTurn: Boolean(state.finalTurnPlayerId),
    isFinalTurnOwnerTurn:
      Boolean(state.finalTurnPlayerId) &&
      currentPlayer?.id === state.finalTurnPlayerId,
    scorelessTurnCount: state.scorelessTurnCount,
    gameEndReason: state.gameEndReason,
    onlineSession: state.onlineSession,
    isOnlineGame,
    canTakeTurn,
    startGame,
    createOnlineSession,
    joinOnlineSession,
    startOnlineMatch,
    leaveOnlineSession,
    refreshOnlineRoom,
    ...tileActions,
    ...turnActions,
    toggleDarkMode,
    dismissCelebration,
    resetToLobby,
  };
}
