export default function PlayerList({ players, currentPlayerIndex, localPlayerId }) {
  return (
    <div className="player-list" aria-label="Jugadores">
      {players.map((player, i) => (
        <div
          key={player.id}
          className={`player-list__item${
            i === currentPlayerIndex ? " player-list__item--active" : ""
          }`}
        >
          <span className="player-list__name">
            {i === currentPlayerIndex && (
              <span className="player-list__turn-dot" aria-hidden="true" />
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
