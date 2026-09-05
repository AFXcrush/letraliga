import { useState } from "react";
import { useGame } from "../context/GameContext.jsx";
import { isOnlineGameAvailable } from "../services/onlineGameService.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

const MAX_PLAYERS = 4;

export default function Lobby() {
  const {
    startGame,
    createOnlineSession,
    joinOnlineSession,
    checking,
    statusMessage,
    darkMode,
    toggleDarkMode,
  } = useGame();
  const [names, setNames] = useState([""]);
  const [error, setError] = useState(null);
  const [onlineOpen, setOnlineOpen] = useState(false);
  const [onlineName, setOnlineName] = useState("");
  const [roomCode, setRoomCode] = useState("");

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

  const handleCreateRoom = async () => {
    const name = onlineName.trim();
    if (!name) {
      setError("Escribe tu nombre para crear una sala.");
      return;
    }
    setError(null);
    await createOnlineSession(name);
  };

  const handleJoinRoom = async () => {
    const name = onlineName.trim();
    const code = roomCode.trim();
    if (!name || !code) {
      setError("Escribe tu nombre y el código de seis caracteres.");
      return;
    }
    setError(null);
    await joinOnlineSession(code, name);
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

          {error && !onlineOpen && <p className="lobby__error">{error}</p>}

          <button type="submit" className="btn btn--primary lobby__submit">
            Empezar a jugar
          </button>
        </form>

        <div className="lobby__separator"><span>o</span></div>
        <button
          type="button"
          className="btn btn--ghost lobby__online-toggle"
          onClick={() => setOnlineOpen((open) => !open)}
          disabled={!isOnlineGameAvailable}
        >
          {onlineOpen ? "Ocultar modo online" : "Jugar online"}
        </button>

        {onlineOpen && (
          <section className="lobby__online" aria-label="Partida online">
            <input
              type="text"
              className="lobby__input"
              placeholder="Tu nombre online"
              value={onlineName}
              maxLength={20}
              onChange={(event) => setOnlineName(event.target.value)}
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCreateRoom}
              disabled={checking}
            >
              Crear sala
            </button>
            <div className="lobby__join-row">
              <input
                type="text"
                className="lobby__input lobby__code-input"
                placeholder="Código de sala"
                value={roomCode}
                maxLength={6}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleJoinRoom}
                disabled={checking}
              >
                Unirse
              </button>
            </div>
          </section>
        )}

        {(error || statusMessage?.type === "error") && onlineOpen && (
          <p className="lobby__error">{error ?? statusMessage.text}</p>
        )}

        <p className="lobby__note">
          {isOnlineGameAvailable
            ? "Modo online disponible: esta partida podrá sincronizarse con Supabase."
            : "Jugando en modo local. Conectá Supabase (ver .env.example) para jugar online."}
        </p>
      </div>
    </div>
  );
}
