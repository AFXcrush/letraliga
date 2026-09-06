import { useEffect } from "react";
import { useGame } from "../context/GameContext.jsx";
import Board from "../components/Board.jsx";
import PanZoom from "../components/PanZoom.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import WordCelebration from "../components/WordCelebration.jsx";
import { getGameHighlights } from "../utils/gameStats.js";
import { GAME_END_REASONS } from "../game/constants.js";
import { applyFinalScoring } from "../game/finalScoring.js";
import { playVictorySound } from "../services/soundEffects.js";

export default function GameOver() {
  const {
    players,
    placedTiles,
    playedWords,
    celebration,
    darkMode,
    dismissCelebration,
    toggleDarkMode,
    resetToLobby,
    startOnlineMatch,
    isOnlineGame,
    checking,
    gameEndReason,
  } = useGame();
  const ranking = applyFinalScoring(players).sort(
    (a, b) => b.finalScore - a.finalScore,
  );
  const winner = ranking[0];
  const isTie =
    ranking.length > 1 && ranking[0]?.finalScore === ranking[1]?.finalScore;
  const { longestWord, highestScoringWord } =
    getGameHighlights(playedWords);
  const endedByScorelessTurns =
    gameEndReason === GAME_END_REASONS.SCORELESS_TURNS;
  const endedByPlayerLeaving =
    gameEndReason === GAME_END_REASONS.PLAYER_LEFT;
  const boardScale = Math.max(
    0.4,
    Math.min(
      1,
      (window.innerWidth - 110) / (27 * 32),
      (window.innerHeight - 110) / (19 * 32),
    ),
  );

  useEffect(() => {
    const victoryTimeout = window.setTimeout(playVictorySound, 500);
    return () => window.clearTimeout(victoryTimeout);
  }, []);

  return (
    <div className="game-over">
      <WordCelebration
        celebration={celebration}
        onDismiss={dismissCelebration}
      />
      <div className="game-over__board" aria-label="Tablero final">
        <PanZoom initialScale={boardScale}>
          {(scale) => <Board scale={scale} placedTiles={placedTiles} />}
        </PanZoom>
      </div>
      <div className="game-over__theme">
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      </div>
      <div className="game-over__overlay">
        <section className="game-over__card">
        <p className="app-title">Letra Liga</p>
        <h1 className="lobby__heading">
          {endedByScorelessTurns || endedByPlayerLeaving
            ? "¡Partida finalizada!"
            : "¡Se acabaron las fichas!"}
        </h1>
        {endedByScorelessTurns && (
          <p className="game-over__reason">
            Se completaron dos rondas consecutivas sin confirmar palabras.
          </p>
        )}
        {endedByPlayerLeaving && (
          <p className="game-over__reason">
            Un jugador abandonó la sala online.
          </p>
        )}
        <p className="lobby__subtitle">
          {isTie
            ? "¡La partida terminó en empate!"
            : `${winner?.name} ganó la partida 🎉`}
        </p>

        <ol className="game-over__ranking">
          {ranking.map((player, i) => (
            <li key={player.id} className="game-over__ranking-item">
              <span>
                {i + 1}. {player.name}
              </span>
              <span className="game-over__score-detail">
                <strong>{player.finalScore} pts</strong>
                {player.rackPenalty > 0 && (
                  <small>−{player.rackPenalty} por fichas</small>
                )}
                {player.rackBonus > 0 && (
                  <small>+{player.rackBonus} por atril vacío</small>
                )}
              </span>
            </li>
          ))}
        </ol>

        <div className="game-over__highlights">
          <div className="game-over__highlight">
            <span>Palabra más larga</span>
            <strong>{longestWord?.word.toUpperCase() ?? "—"}</strong>
            {longestWord && (
              <small>
                {Array.from(longestWord.word).length} letras · {longestWord.playerName}
              </small>
            )}
          </div>
          <div className="game-over__highlight">
            <span>Mayor puntaje</span>
            <strong>{highestScoringWord?.word.toUpperCase() ?? "—"}</strong>
            {highestScoringWord && (
              <small>
                {highestScoringWord.points} pts · {highestScoringWord.playerName}
              </small>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn btn--primary lobby__submit"
          onClick={isOnlineGame ? startOnlineMatch : resetToLobby}
          disabled={checking}
        >
          {checking
            ? "Preparando partida…"
            : isOnlineGame
              ? "Jugar otra vez"
              : "Jugar otra partida"}
        </button>
        </section>
      </div>
    </div>
  );
}
