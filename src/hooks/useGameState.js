import { useState } from "react";
import { GAME_PHASES } from "../game/constants.js";

/** Estado mutable central. Las reglas viven en hooks especializados. */
export function useGameState() {
  const [phase, setPhase] = useState(GAME_PHASES.LOBBY);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [bag, setBag] = useState([]);
  const [placedTiles, setPlacedTiles] = useState({});
  const [pendingTiles, setPendingTiles] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [checking, setChecking] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [playedWords, setPlayedWords] = useState([]);
  const [isFinalTurn, setIsFinalTurn] = useState(false);

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
    isFinalTurn,
    setIsFinalTurn,
  };
}
