import { useEffect } from "react";
import { createPortal } from "react-dom";
import { BLANK_LETTERS } from "../utils/blankTile.js";

export default function BlankLetterModal({ open, onChoose, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="bag-modal blank-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bag-modal__dialog blank-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blank-modal-title"
      >
        <header className="bag-modal__header">
          <div>
            <h2 id="blank-modal-title">Elige una letra</h2>
            <p>El comodín representará esta letra y seguirá valiendo 0 puntos.</p>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={onClose}
            aria-label="Cerrar selección de letra"
          >
            ×
          </button>
        </header>

        <div className="blank-modal__alphabet">
          {BLANK_LETTERS.map((letter) => (
            <button
              type="button"
              className="blank-modal__letter"
              key={letter}
              onClick={() => onChoose(letter)}
              aria-label={`Usar el comodín como ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}
