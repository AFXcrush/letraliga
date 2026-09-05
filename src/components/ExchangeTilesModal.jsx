import { useEffect, useState } from "react";

export default function ExchangeTilesModal({
  tiles,
  bagCount,
  open,
  onClose,
  onConfirm,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setIsConfirming(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      if (isConfirming) {
        setIsConfirming(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isConfirming, open, onClose]);

  if (!open) return null;

  const toggleTile = (tileId) => {
    setIsConfirming(false);
    setSelectedIds((currentIds) => {
      if (currentIds.includes(tileId)) {
        return currentIds.filter((id) => id !== tileId);
      }
      if (currentIds.length >= bagCount) return currentIds;
      return [...currentIds, tileId];
    });
  };

  const confirmExchange = () => {
    if (onConfirm(selectedIds)) {
      setIsConfirming(false);
      onClose();
    }
  };

  return (
    <div
      className="bag-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bag-modal__dialog exchange-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exchange-modal-title"
      >
        <header className="bag-modal__header">
          <div>
            <h2 id="exchange-modal-title">Cambiar fichas</h2>
            <p>Selecciona las fichas que devolverás a la bolsa.</p>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={onClose}
            aria-label="Cerrar cambio de fichas"
          >
            ×
          </button>
        </header>

        <div className="exchange-modal__tiles" aria-label="Fichas para cambiar">
          {tiles.map((tile) => {
            const selected = selectedIds.includes(tile.id);
            const selectionFull = selectedIds.length >= bagCount;
            return (
              <button
                type="button"
                className={`exchange-modal__tile${
                  selected ? " exchange-modal__tile--selected" : ""
                }`}
                key={tile.id}
                onClick={() => toggleTile(tile.id)}
                aria-pressed={selected}
                disabled={!selected && selectionFull}
                aria-label={`Cambiar ${
                  tile.isBlank ? `comodín${tile.letter ? ` asignado a ${tile.letter}` : ""}` : `ficha ${tile.letter}`
                }`}
              >
                <strong>{tile.isBlank ? tile.letter || "★" : tile.letter}</strong>
                <small>{tile.points}</small>
              </button>
            );
          })}
        </div>

        <p className="exchange-modal__summary">
          {selectedIds.length} de {Math.min(tiles.length, bagCount)} posibles · El
          cambio consume el turno.
        </p>
        <div className="exchange-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setIsConfirming(true)}
            disabled={selectedIds.length === 0}
          >
            Confirmar cambio
          </button>
        </div>
      </section>

      {isConfirming && (
        <div className="exchange-confirmation">
          <section
            className="bag-modal__dialog exchange-confirmation__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exchange-confirmation-title"
            aria-describedby="exchange-confirmation-description"
          >
            <h3 id="exchange-confirmation-title">
              Confirmar cambio de fichas
            </h3>
            <p id="exchange-confirmation-description">
              Vas a cambiar {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "ficha" : "fichas"}. Esta acción
              consume tu turno y no se puede deshacer.
            </p>
            <div className="exchange-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setIsConfirming(false)}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={confirmExchange}
              >
                Sí, cambiar {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "ficha" : "fichas"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
