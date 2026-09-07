import { useEffect, useRef } from "react";

export default function PlayerList({ players, currentPlayerIndex, localPlayerId }) {
  const activePlayerRef = useRef(null);

  useEffect(() => {
    activePlayerRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentPlayerIndex]);

  return (
    <div className="player-list" aria-label="Jugadores">
      {players.map((player, i) => (
        <div
          key={player.id}
          ref={i === currentPlayerIndex ? activePlayerRef : undefined}
          aria-current={i === currentPlayerIndex ? "true" : undefined}
          className={`player-list__item${
            i === currentPlayerIndex ? " player-list__item--active" : ""
          }`}
        >
          <span className="player-list__name">
            {i === currentPlayerIndex && (
              <span className="player-list__turn-label">Turno</span>
            )}
            {player.name}
            {player.id === localPlayerId && " (tú)"}
          </span>
          <span className="player-list__score">{player.score}</span>
        </div>
      ))}
    </div>
  );
}
