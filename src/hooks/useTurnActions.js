import { useCallback } from "react";
import {
  GAME_END_REASONS,
  GAME_PHASES,
  MIN_TILES_FIRST_TURN,
  RACK_SIZE,
  SCORELESS_ROUNDS_TO_END,
  TURN_RACK_RULES,
} from "../game/constants.js";
import {
  createCelebration,
  createPlayedWordEntries,
  createSuccessMessage,
} from "../game/turnResult.js";
import { exchangeRackTiles } from "../game/tileExchange.js";
import { BOARD_LAYOUT } from "../layout/boardLayout.js";
import { checkWordExists } from "../services/dictionary.js";
import { resetBlankTile } from "../utils/blankTile.js";
import { resolvePendingWord } from "../utils/boardWords.js";
import { getFullRackBonus } from "../utils/gameStats.js";
import { balanceRack } from "../utils/rackBalance.js";
import {
  getPostTurnAction,
  getScorelessTurnAction,
} from "../utils/turnFlow.js";

async function validateWords(words) {
  return Promise.all(
    words.map(async (resolvedWord) => ({
      ...resolvedWord,
      dictionaryResult: await checkWordExists(resolvedWord.word),
    })),
  );
}

function invalidTurnMessage(checkedWords) {
  const loadError = checkedWords.find(
    ({ dictionaryResult }) => dictionaryResult.error,
  );
  if (loadError) return loadError.dictionaryResult.error;

  const invalidWords = checkedWords.filter(
    ({ dictionaryResult }) => !dictionaryResult.valid,
  );
  if (invalidWords.length === 0) return null;

  const wordList = invalidWords
    .map(({ word }) => `"${word.toUpperCase()}"`)
    .join(" y ");
  return `${wordList} no existe en el diccionario. Corrige la jugada e intenta de nuevo.`;
}

export function useTurnActions({
  players,
  currentPlayerIndex,
  currentPlayer,
  bag,
  pendingTiles,
  boardForWordCheck,
  isOpeningTurn,
  finalTurnPlayerId,
  setPhase,
  setPlayers,
  setCurrentPlayerIndex,
  setBag,
  setPlacedTiles,
  setPendingTiles,
  setStatusMessage,
  setCelebration,
  setChecking,
  setPlayedWords,
  setFinalTurnPlayerId,
  scorelessTurnCount,
  setScorelessTurnCount,
  setGameEndReason,
  canTakeTurn = true,
  onTurnFinished,
}) {
  const advanceTurn = useCallback(() => {
    setCurrentPlayerIndex((index) => (index + 1) % players.length);
  }, [players.length, setCurrentPlayerIndex]);

  const finishScorelessTurn = useCallback(
    (message = null) => {
      const action = getScorelessTurnAction({
        currentCount: scorelessTurnCount,
        playerCount: players.length,
        roundsToEnd: SCORELESS_ROUNDS_TO_END,
      });
      const scorelessLimit = players.length * SCORELESS_ROUNDS_TO_END;
      setScorelessTurnCount(action.nextCount);
      setStatusMessage({
        type: "success",
        text: `${message ?? "Turno pasado."} ${action.nextCount}/${scorelessLimit} turnos consecutivos sin palabra.`,
      });

      if (action.gameOver) {
        setFinalTurnPlayerId(null);
        setGameEndReason(GAME_END_REASONS.SCORELESS_TURNS);
        setPhase(GAME_PHASES.GAME_OVER);
      } else {
        advanceTurn();
      }
    },
    [
      advanceTurn,
      players.length,
      scorelessTurnCount,
      setGameEndReason,
      setFinalTurnPlayerId,
      setPhase,
      setScorelessTurnCount,
      setStatusMessage,
    ],
  );

  const confirmWord = useCallback(async () => {
    if (!canTakeTurn) {
      setStatusMessage({ type: "error", text: "Espera tu turno para jugar." });
      return;
    }
    const pendingKeys = Object.keys(pendingTiles);
    const minimumTiles = isOpeningTurn ? MIN_TILES_FIRST_TURN : 1;
    if (pendingKeys.length < minimumTiles) {
      setStatusMessage({
        type: "error",
        text: `Coloca al menos ${minimumTiles} ${
          minimumTiles === 1 ? "ficha nueva" : "fichas nuevas"
        } en el tablero.`,
      });
      return;
    }

    const resolved = resolvePendingWord({
      placedTiles: boardForWordCheck,
      pendingKeys,
      boardLayout: BOARD_LAYOUT,
    });
    if (!resolved || resolved.error) {
      setStatusMessage({
        type: "error",
        text: resolved?.error ?? "Jugada inválida.",
      });
      return;
    }

    setChecking(true);
    const checkedWords = await validateWords(resolved.words);
    setChecking(false);

    const validationError = invalidTurnMessage(checkedWords);
    if (validationError) {
      setStatusMessage({ type: "error", text: validationError });
      return;
    }

    const bonusPoints = getFullRackBonus(pendingKeys.length, RACK_SIZE);
    const turnPoints = resolved.points + bonusPoints;
    const replenished = balanceRack({
      rack: currentPlayer.rack,
      bag,
      rackSize: RACK_SIZE,
      ...TURN_RACK_RULES,
    });
    const postTurnAction = getPostTurnAction({
      finalTurnPlayerId,
      currentPlayerId: currentPlayer.id,
      remainingBagCount: replenished.bag.length,
    });

    setPlacedTiles((tiles) => ({ ...tiles, ...resolved.upgradedTiles }));
    setPendingTiles({});
    setPlayedWords((words) => [
      ...words,
      ...createPlayedWordEntries(resolved.words, currentPlayer),
    ]);
    setBag(replenished.bag);
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) =>
        index === currentPlayerIndex
          ? {
              ...player,
              score: player.score + turnPoints,
              rack: replenished.rack,
            }
          : player,
      ),
    );
    setStatusMessage({
      type: "success",
      text: createSuccessMessage({
        words: resolved.words,
        wordPoints: resolved.points,
        bonusPoints,
        turnPoints,
        startsFinalTurn: postTurnAction === "start-final-round",
      }),
    });
    setCelebration(
      createCelebration(resolved, bonusPoints, turnPoints, currentPlayer),
    );
    setScorelessTurnCount(0);

    if (postTurnAction === "gameover") {
      setFinalTurnPlayerId(null);
      setGameEndReason(GAME_END_REASONS.BAG_EMPTY);
      setPhase(GAME_PHASES.GAME_OVER);
    } else if (postTurnAction === "start-final-round") {
      setFinalTurnPlayerId(currentPlayer.id);
      advanceTurn();
    } else if (players.length > 0) {
      advanceTurn();
    }
    onTurnFinished?.({
      words: resolved.words,
      points: turnPoints,
      boardDelta: resolved.upgradedTiles,
    });
  }, [
    advanceTurn,
    bag,
    boardForWordCheck,
    canTakeTurn,
    currentPlayer,
    currentPlayerIndex,
    isOpeningTurn,
    finalTurnPlayerId,
    pendingTiles,
    players.length,
    onTurnFinished,
    setBag,
    setCelebration,
    setChecking,
    setFinalTurnPlayerId,
    setPendingTiles,
    setPhase,
    setPlacedTiles,
    setPlayedWords,
    setPlayers,
    setStatusMessage,
    setScorelessTurnCount,
    setGameEndReason,
  ]);

  const passTurn = useCallback(() => {
    if (!canTakeTurn) {
      setStatusMessage({ type: "error", text: "Espera tu turno para jugar." });
      return;
    }
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) => {
        if (index !== currentPlayerIndex) return player;
        const returnedTiles = Object.values(pendingTiles).map((tile) =>
          resetBlankTile({ ...tile }),
        );
        return { ...player, rack: [...player.rack, ...returnedTiles] };
      }),
    );
    setPendingTiles({});
    setStatusMessage(null);

    if (finalTurnPlayerId === currentPlayer.id) {
      setFinalTurnPlayerId(null);
      setGameEndReason(GAME_END_REASONS.BAG_EMPTY);
      setPhase(GAME_PHASES.GAME_OVER);
    } else if (finalTurnPlayerId) {
      setStatusMessage({
        type: "success",
        text: "Turno pasado. La ronda final continúa.",
      });
      advanceTurn();
    } else {
      finishScorelessTurn();
    }
    onTurnFinished?.();
  }, [
    advanceTurn,
    canTakeTurn,
    currentPlayer?.id,
    currentPlayerIndex,
    finalTurnPlayerId,
    finishScorelessTurn,
    onTurnFinished,
    pendingTiles,
    setFinalTurnPlayerId,
    setGameEndReason,
    setPendingTiles,
    setPhase,
    setPlayers,
    setStatusMessage,
  ]);

  const exchangeTiles = useCallback(
    (tileIds) => {
      if (!canTakeTurn) {
        setStatusMessage({ type: "error", text: "Espera tu turno para jugar." });
        return false;
      }
      if (Object.keys(pendingTiles).length > 0) {
        setStatusMessage({
          type: "error",
          text: "Retorna las fichas pendientes al atril antes de realizar un cambio.",
        });
        return false;
      }

      const exchange = exchangeRackTiles({
        rack: currentPlayer.rack,
        bag,
        tileIds,
      });
      if (exchange.error) {
        setStatusMessage({ type: "error", text: exchange.error });
        return false;
      }

      setBag(exchange.bag);
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayerIndex
            ? { ...player, rack: exchange.rack }
            : player,
        ),
      );
      finishScorelessTurn(
        `Cambiaste ${exchange.exchangedCount} ${
          exchange.exchangedCount === 1 ? "ficha" : "fichas"
        }. El cambio consumió tu turno.`,
      );
      onTurnFinished?.();
      return true;
    },
    [
      bag,
      canTakeTurn,
      currentPlayer,
      currentPlayerIndex,
      finishScorelessTurn,
      onTurnFinished,
      pendingTiles,
      setBag,
      setPlayers,
      setStatusMessage,
    ],
  );

  return { confirmWord, passTurn, exchangeTiles };
}
