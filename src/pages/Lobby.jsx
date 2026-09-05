import { useState } from "react";
import { useGame } from "../context/GameContext.jsx";
import { isOnlineModeAvailable } from "../services/gameService.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

const MAX_PLAYERS = 4;

export default function Lobby() {
  const { startGame, darkMode, toggleDarkMode } = useGame();
  const [names, setNames] = useState([""]);
  const [error, setError] = useState(null);

  const updateName = (index, value) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => {
    if (names.length >= MAX_PLAYERS) return;
    setNames((prev) => [...prev, ""]);
  };

  const removePlayer = (index) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = names.map((n) => n.trim()).filter(Boolean);

    if (cleaned.length === 0) {
      setError("Poné al menos un nombre para jugar.");
      return;
    }
    if (new Set(cleaned.map((n) => n.toLowerCase())).size !== cleaned.length) {
      setError("Los nombres de los jugadores deben ser distintos.");
      return;
    }

    setError(null);
    startGame(cleaned);
  };

  return (
    <div className="lobby">
      <div className="lobby__theme">
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      </div>

      <div className="lobby__card">
        <p className="app-title">Letra Liga</p>
        <h1 className="lobby__heading">Armá tu partida</h1>
        <p className="lobby__subtitle">
          De 1 a {MAX_PLAYERS} jugadores, por turnos, en este mismo dispositivo.
        </p>

        <form className="lobby__form" onSubmit={handleSubmit}>
          {names.map((name, i) => (
            <div className="lobby__player-row" key={i}>
              <input
                type="text"
                className="lobby__input"
                placeholder={`Jugador ${i + 1}`}
                value={name}
                maxLength={20}
                onChange={(e) => updateName(i, e.target.value)}
              />
              {names.length > 1 && (
                <button
                  type="button"
                  className="lobby__remove"
                  aria-label="Quitar jugador"
                  onClick={() => removePlayer(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {names.length < MAX_PLAYERS && (
            <button type="button" className="btn btn--ghost" onClick={addPlayer}>
              + Agregar jugador
            </button>
          )}

          {error && <p className="lobby__error">{error}</p>}

          <button type="submit" className="btn btn--primary lobby__submit">
            Empezar a jugar
          </button>
        </form>

        <p className="lobby__note">
          {isOnlineModeAvailable
            ? "Modo online disponible: esta partida podrá sincronizarse con Supabase."
            : "Jugando en modo local. Conectá Supabase (ver .env.example) para jugar online."}
        </p>
      </div>
    </div>
  );
}
