import { useEffect } from "react";

export default function GameOptionsModal({
  open,
  onClose,
  onRestart,
  onAbandon,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bag-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bag-modal__dialog game-options__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-options-title"
      >
        <header className="bag-modal__header">
          <div>
            <h2 id="game-options-title">Opciones de partida</h2>
            <p>Elige qué hacer con la partida actual.</p>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={onClose}
            aria-label="Cerrar opciones de partida"
          >
            ×
          </button>
        </header>

        <div className="game-options__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Continuar jugando
          </button>
          <button type="button" className="btn btn--ghost" onClick={onRestart}>
            Reiniciar partida
          </button>
          <button type="button" className="btn btn--danger" onClick={onAbandon}>
            Abandonar partida
          </button>
        </div>
      </section>
    </div>
  );
}
