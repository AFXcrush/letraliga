import { useState } from "react";
import BlankLetterModal from "./BlankLetterModal.jsx";
import ExchangeTilesModal from "./ExchangeTilesModal.jsx";
import LetterTile from "./LetterTile.jsx";

export default function Rack({
  tiles,
  onReturnTile,
  onRecall,
  onShuffle,
  onAssignBlank,
  onExchange,
  onSelectTile,
  selectedTileId,
  canRecall,
  disabled,
  bagCount,
}) {
  const [blankTileId, setBlankTileId] = useState(null);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const tile = JSON.parse(raw);
    // Solo nos interesa si la ficha venía del tablero (from: {row, col}).
    if (tile.from && tile.from !== "rack") {
      onReturnTile?.(tile);
    }
  };

  return (
    <div className="rack-section">
      <BlankLetterModal
        open={Boolean(blankTileId)}
        onClose={() => setBlankTileId(null)}
        onChoose={(letter) => {
          onAssignBlank?.(blankTileId, letter);
          onSelectTile?.(blankTileId);
          setBlankTileId(null);
        }}
      />
      <ExchangeTilesModal
        tiles={tiles}
        bagCount={bagCount}
        open={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        onConfirm={onExchange}
      />
      <div className="rack-actions" aria-label="Acciones antes del atril">
        <button
          type="button"
          className="rack-action"
          onClick={onRecall}
          disabled={!canRecall || disabled}
          title="Devolver al atril todas las fichas colocadas en este turno"
        >
          <span aria-hidden="true">↩</span> Retornar al atril
        </button>
        <button
          type="button"
          className="rack-action"
          onClick={onShuffle}
          disabled={tiles.length < 2 || disabled}
          title="Cambiar el orden de las fichas del atril"
        >
          <span aria-hidden="true">⇄</span> Mezclar fichas
        </button>
      </div>

      <div
        className="rack"
        aria-label="Atril"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tiles.length === 0 && <span className="rack__empty">Atril vacío</span>}
        {tiles.map((tile) => (
          <LetterTile
            key={tile.id}
            id={tile.id}
            letter={tile.letter}
            points={tile.points}
            isBlank={tile.isBlank}
            onChooseBlank={() => setBlankTileId(tile.id)}
            onSelect={() => onSelectTile?.(tile.id)}
            selected={selectedTileId === tile.id}
            disabled={disabled}
          />
        ))}
      </div>

      <button
        type="button"
        className="rack-action rack-action--exchange"
        onClick={() => setIsExchangeOpen(true)}
        disabled={bagCount === 0 || canRecall || disabled}
        title={
          canRecall
            ? "Retorna primero las fichas pendientes al atril"
            : "Devolver fichas a la bolsa y recibir otras; consume el turno"
        }
      >
        <span aria-hidden="true">🔄</span> Cambiar fichas
      </button>
    </div>
  );
}
