import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useGame } from "../context/GameContext.jsx";
import { isOnlineGameAvailable } from "../services/onlineGameService.js";

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
  const [mode, setMode] = useState("local");
  const [onlineAction, setOnlineAction] = useState("create");
  const [names, setNames] = useState([""]);
  const [onlineName, setOnlineName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(null);

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
  };

  const updateName = (index, value) => {
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const addPlayer = () => {
    if (names.length < MAX_PLAYERS) setNames((prev) => [...prev, ""]);
  };

  const removePlayer = (index) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocalSubmit = (event) => {
    event.preventDefault();
    const cleaned = names.map((name) => name.trim()).filter(Boolean);

    if (cleaned.length === 0) {
      setError("Poné al menos un nombre para jugar.");
      return;
    }
    if (new Set(cleaned.map((name) => name.toLowerCase())).size !== cleaned.length) {
      setError("Los nombres de los jugadores deben ser distintos.");
      return;
    }

    setError(null);
    startGame(cleaned);
  };

  const handleOnlineSubmit = async (event) => {
    event.preventDefault();
    const name = onlineName.trim();
    const code = roomCode.trim();
    if (!name) {
      setError("Escribe tu nombre para jugar online.");
      return;
    }
    if (onlineAction === "join" && !code) {
      setError("Escribe el código de seis caracteres de la sala.");
      return;
    }

    setError(null);
    if (onlineAction === "create") await createOnlineSession(name);
    else await joinOnlineSession(code, name);
  };

  return (
    <div className="lobby">
      <div className="lobby__theme">
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      </div>

      <main className="lobby__card">
        <p className="app-title">Letra Liga</p>
        <h1 className="lobby__heading">Elegí cómo jugar</h1>
        <p className="lobby__subtitle">Puedes jugar aquí mismo o invitar a otras personas.</p>

        <div className="lobby__mode-tabs" aria-label="Modo de juego">
          <button
            type="button"
            className={`lobby__mode-tab ${mode === "local" ? "is-active" : ""}`}
            aria-pressed={mode === "local"}
            onClick={() => selectMode("local")}
          >
            <span aria-hidden="true">🎲</span>
            En este dispositivo
          </button>
          <button
            type="button"
            className={`lobby__mode-tab ${mode === "online" ? "is-active" : ""}`}
            aria-pressed={mode === "online"}
            onClick={() => selectMode("online")}
            disabled={!isOnlineGameAvailable}
          >
            <span aria-hidden="true">🌐</span>
            Online
          </button>
        </div>

        {mode === "local" ? (
          <form className="lobby__form" onSubmit={handleLocalSubmit}>
            <div className="lobby__section-heading">
              <strong>Jugadores</strong>
              <span>1 a {MAX_PLAYERS}, compartiendo esta pantalla</span>
            </div>
            {names.map((name, index) => (
              <div className="lobby__player-row" key={index}>
                <input
                  type="text"
                  className="lobby__input"
                  aria-label={`Nombre del jugador ${index + 1}`}
                  placeholder={`Jugador ${index + 1}`}
                  value={name}
                  maxLength={20}
                  onChange={(event) => updateName(index, event.target.value)}
                />
                {names.length > 1 && (
                  <button
                    type="button"
                    className="lobby__remove"
                    aria-label={`Quitar jugador ${index + 1}`}
                    onClick={() => removePlayer(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {names.length < MAX_PLAYERS && (
              <button type="button" className="btn btn--ghost" onClick={addPlayer}>
                + Agregar otro jugador
              </button>
            )}
            {error && <p className="lobby__error">{error}</p>}
            <button type="submit" className="btn btn--primary lobby__submit">
              Empezar partida local
            </button>
          </form>
        ) : (
          <form className="lobby__form" onSubmit={handleOnlineSubmit}>
            <label className="lobby__field">
              <span>Tu nombre</span>
              <input
                type="text"
                className="lobby__input"
                placeholder="¿Cómo te llamas?"
                value={onlineName}
                maxLength={20}
                onChange={(event) => setOnlineName(event.target.value)}
              />
            </label>

            <div className="lobby__online-actions" aria-label="Acción online">
              <button
                type="button"
                className={onlineAction === "create" ? "is-active" : ""}
                aria-pressed={onlineAction === "create"}
                onClick={() => {
                  setOnlineAction("create");
                  setError(null);
                }}
              >
                Crear una sala
              </button>
              <button
                type="button"
                className={onlineAction === "join" ? "is-active" : ""}
                aria-pressed={onlineAction === "join"}
                onClick={() => {
                  setOnlineAction("join");
                  setError(null);
                }}
              >
                Tengo un código
              </button>
            </div>

            {onlineAction === "join" && (
              <label className="lobby__field">
                <span>Código de sala</span>
                <input
                  type="text"
                  className="lobby__input lobby__code-input"
                  placeholder="ABC123"
                  value={roomCode}
                  maxLength={6}
                  autoComplete="off"
                  onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                />
              </label>
            )}

            {(error || statusMessage?.type === "error") && (
              <p className="lobby__error">{error ?? statusMessage.text}</p>
            )}
            <button type="submit" className="btn btn--primary lobby__submit" disabled={checking}>
              {checking
                ? "Conectando…"
                : onlineAction === "create"
                  ? "Crear sala online"
                  : "Unirme a la sala"}
            </button>
          </form>
        )}

        {!isOnlineGameAvailable && (
          <p className="lobby__note">El modo online estará disponible al conectar Supabase.</p>
        )}
      </main>
    </div>
  );
}
