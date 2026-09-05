import { useCallback } from "react";
import { GAME_PHASES, RACK_SIZE, TURN_RACK_RULES } from "../game/constants.js";
import {
  createCelebration,
  createPlayedWordEntries,
  createSuccessMessage,
} from "../game/turnResult.js";
import { BOARD_LAYOUT } from "../layout/boardLayout.js";
import { checkWordExists } from "../services/dictionary.js";
import { resetBlankTile } from "../utils/blankTile.js";
import { resolvePendingWord } from "../utils/boardWords.js";
import { getFullRackBonus } from "../utils/gameStats.js";
import { balanceRack } from "../utils/rackBalance.js";
import { getPostTurnAction } from "../utils/turnFlow.js";

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
  isFinalTurn,
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
  setIsFinalTurn,
}) {
  const advanceTurn = useCallback(() => {
    setCurrentPlayerIndex((index) => (index + 1) % players.length);
  }, [players.length, setCurrentPlayerIndex]);

  const confirmWord = useCallback(async () => {
    const pendingKeys = Object.keys(pendingTiles);
    if (pendingKeys.length === 0) {
      setStatusMessage({
        type: "error",
        text: "Coloca al menos una ficha en el tablero.",
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
      isFinalTurn,
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
        startsFinalTurn: postTurnAction === "start-final-turn",
      }),
    });
    setCelebration(createCelebration(resolved, bonusPoints, turnPoints));

    if (postTurnAction === "gameover") {
      setIsFinalTurn(false);
      setPhase(GAME_PHASES.GAME_OVER);
    } else if (postTurnAction === "start-final-turn") {
      setIsFinalTurn(true);
    } else if (players.length > 0) {
      advanceTurn();
    }
  }, [
    advanceTurn,
    bag,
    boardForWordCheck,
    currentPlayer,
    currentPlayerIndex,
    isFinalTurn,
    pendingTiles,
    players.length,
    setBag,
    setCelebration,
    setChecking,
    setIsFinalTurn,
    setPendingTiles,
    setPhase,
    setPlacedTiles,
    setPlayedWords,
    setPlayers,
    setStatusMessage,
  ]);

  const passTurn = useCallback(() => {
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

    if (isFinalTurn) {
      setIsFinalTurn(false);
      setPhase(GAME_PHASES.GAME_OVER);
    } else {
      advanceTurn();
    }
  }, [
    advanceTurn,
    currentPlayerIndex,
    isFinalTurn,
    pendingTiles,
    setIsFinalTurn,
    setPendingTiles,
    setPhase,
    setPlayers,
    setStatusMessage,
  ]);

  return { confirmWord, passTurn };
}
