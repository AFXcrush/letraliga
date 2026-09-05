import { useGame } from "../context/GameContext.jsx";
import Board from "../components/Board.jsx";
import PanZoom from "../components/PanZoom.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import WordCelebration from "../components/WordCelebration.jsx";
import { getGameHighlights } from "../utils/gameStats.js";

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
  } = useGame();
  const ranking = [...players].sort((a, b) => b.score - a.score);
  const winner = ranking[0];
  const isTie = ranking.length > 1 && ranking[0]?.score === ranking[1]?.score;
  const { longestWord, highestScoringWord } =
    getGameHighlights(playedWords);
  const boardScale = Math.max(
    0.4,
    Math.min(
      1,
      (window.innerWidth - 110) / (27 * 32),
      (window.innerHeight - 110) / (19 * 32),
    ),
  );

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
        <h1 className="lobby__heading">¡Se acabaron las fichas!</h1>
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
              <strong>{player.score} pts</strong>
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

        <button type="button" className="btn btn--primary lobby__submit" onClick={resetToLobby}>
          Jugar otra partida
        </button>
        </section>
      </div>
    </div>
  );
}
