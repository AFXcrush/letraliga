import { useState } from "react";
import PlayerList from "../components/PlayerList.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useGame } from "../context/GameContext.jsx";

export default function OnlineRoom() {
  const [copied, setCopied] = useState(false);
  const {
    players,
    onlineSession,
    checking,
    statusMessage,
    startOnlineMatch,
    refreshOnlineRoom,
    leaveOnlineSession,
    darkMode,
    toggleDarkMode,
  } = useGame();

  const copyCode = async () => {
    await navigator.clipboard?.writeText(onlineSession.roomCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="lobby online-room">
      <div className="lobby__theme">
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      </div>
      <section className="lobby__card online-room__card">
        <p className="app-title">Sala online</p>
        <h1 className="lobby__heading">Esperando jugadores</h1>
        <p className="lobby__subtitle">
          Comparte este código. Cada persona debe abrirlo en otro navegador o dispositivo.
        </p>

        <button type="button" className="online-room__code" onClick={copyCode}>
          <strong>{onlineSession?.roomCode}</strong>
          <span>{copied ? "Copiado" : "Copiar código"}</span>
        </button>

        <PlayerList
          players={players}
          currentPlayerIndex={-1}
          localPlayerId={onlineSession?.playerId}
        />

        {statusMessage?.type === "error" && (
          <p className="lobby__error">{statusMessage.text}</p>
        )}

        {onlineSession?.isHost ? (
          <button
            type="button"
            className="btn btn--primary lobby__submit"
            onClick={startOnlineMatch}
            disabled={players.length < 2 || checking}
          >
            {checking ? "Preparando…" : "Comenzar partida"}
          </button>
        ) : (
          <p className="online-room__waiting">El anfitrión iniciará la partida.</p>
        )}

        <div className="online-room__actions">
          <button type="button" className="btn btn--ghost" onClick={refreshOnlineRoom} disabled={checking}>
            Actualizar sala
          </button>
          <button type="button" className="btn btn--ghost" onClick={leaveOnlineSession}>
            Salir
          </button>
        </div>
      </section>
    </div>
  );
}
