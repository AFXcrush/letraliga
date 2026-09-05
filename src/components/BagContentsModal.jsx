import { useEffect, useMemo } from "react";
import { LETTER_DISTRIBUTION } from "../layout/letterData.js";

export default function BagContentsModal({ bag, bagCounts, total, open, onClose }) {
  const counts = useMemo(() => {
    if (bagCounts) return new Map(Object.entries(bagCounts));
    const nextCounts = new Map();
    for (const tile of bag) {
      nextCounts.set(tile.letter, (nextCounts.get(tile.letter) ?? 0) + 1);
    }
    return nextCounts;
  }, [bag, bagCounts]);

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
        className="bag-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-modal-title"
      >
        <header className="bag-modal__header">
          <div>
            <h2 id="bag-modal-title">Fichas en la bolsa</h2>
            <p>{total ?? bag.length} fichas disponibles</p>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={onClose}
            aria-label="Cerrar detalle de la bolsa"
          >
            ×
          </button>
        </header>

        <div className="bag-modal__grid">
          {LETTER_DISTRIBUTION.map(({ letter }) => {
            const count = counts.get(letter) ?? 0;
            return (
              <div
                className={`bag-modal__item${
                  count === 0 ? " bag-modal__item--empty" : ""
                }`}
                key={letter || "blank"}
              >
                <strong>{letter || "★"}</strong>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
        <p className="bag-modal__legend">★ = comodín</p>
      </section>
    </div>
  );
}
