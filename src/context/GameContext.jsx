import { createContext, useContext } from "react";
import { useGameController } from "../hooks/useGameController.js";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const game = useGameController();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return game;
}
