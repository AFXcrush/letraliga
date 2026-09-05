import { useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext.jsx";
import Lobby from "./pages/Lobby.jsx";
import Game from "./pages/Game.jsx";
import GameOver from "./pages/GameOver.jsx";

function Screens() {
  const { phase, darkMode } = useGame();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (phase === "playing") return <Game />;
  if (phase === "gameover") return <GameOver />;
  return <Lobby />;
}

export default function App() {
  return (
    <GameProvider>
      <Screens />
    </GameProvider>
  );
}
