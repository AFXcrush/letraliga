import { LETTER_MULTIPLIERS } from "../layout/letterData.js";

// Cada casilla del tablero. Si tiene una ficha encima, muestra el puntaje
// YA multiplicado por el tipo de casilla (2L/3L); si la ficha se mueve a
// otra casilla, este cálculo se rehace solo porque se deriva en cada render
// a partir de `type`, no se guarda un valor fijo en la ficha.
const LABELS = {
  plain: "",
  "2L": "2L",
  "3L": "3L",
  "2W": "2W",
  "3W": "3W",
};

function StarIcon() {
  return (
    <svg className="star-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.85 6.32 6.9.72-5.16 4.72 1.47 6.79L12 17.9l-6.06 3.15 1.47-6.79-5.16-4.72 6.9-.72L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Cell({
  type,
  row,
  col,
  placedTile,
  isPending,
  isCelebrating,
  onDropTile,
  onSelectCell,
  isClickTarget,
}) {
  const label = LABELS[type] ?? "";
  const multiplier = LETTER_MULTIPLIERS[type] ?? 1;
  const displayPoints = placedTile
    ? placedTile.points * (isPending ? multiplier : 1)
    : 0;
  const bonusTone = placedTile?.scoreBonus?.tone;
  const bonusClass = bonusTone ? ` cell--wild-${bonusTone}` : "";

  const handleDragOver = (e) => {
    if (placedTile) return; // casilla ocupada, no acepta otra ficha
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (placedTile) return;
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const tile = JSON.parse(raw);
    onDropTile?.({ row, col, tile });
  };

  const handleDragStart = (e) => {
    if (!placedTile || !isPending) return; // las confirmadas quedan fijas
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ ...placedTile, from: { row, col } }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <button
      className={`cell cell--${type}${placedTile ? " cell--occupied" : ""}${
        isPending ? " cell--pending" : ""
      }${isCelebrating ? " cell--celebrating" : ""}${
        isClickTarget ? " cell--click-target" : ""
      }${bonusClass}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDrop={handleDrop}
      onClick={() => {
        if (!placedTile) onSelectCell?.({ row, col });
      }}
      draggable={Boolean(placedTile) && isPending}
      onDragStart={handleDragStart}
      aria-label={`Casilla fila ${row}, columna ${col}${
        type === "star" ? ", centro" : label ? `, ${label}` : ""
      }`}
      data-row={row}
      data-col={col}
    >
      {placedTile ? (
        <span className="cell__placed">
          <span className="cell__placed-letter">
            {placedTile.letter || "·"}
          </span>
          <span className="cell__placed-points">{displayPoints}</span>
          {placedTile.scoreBonus?.label && (
            <span className="cell__bonus" aria-hidden="true">
              {placedTile.scoreBonus.label}
            </span>
          )}
        </span>
      ) : type === "star" ? (
        <StarIcon />
      ) : (
        label
      )}
    </button>
  );
}
