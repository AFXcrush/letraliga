import { readTileDragData, writeTileDragData } from "../utils/tileDrag.js";

// Ficha de letra individual del atril.
export default function LetterTile({
  id,
  letter,
  points,
  isBlank,
  onChooseBlank,
  onSelect,
  onReorderTile,
  selected,
  placementDisabled = false,
  reorderDisabled = false,
}) {
  const handleDragStart = (e) => {
    if (reorderDisabled) return;
    writeTileDragData(e.dataTransfer, {
      id,
      letter,
      points,
      isBlank,
      from: "rack",
    });
  };

  const handleClick = () => {
    if (placementDisabled || reorderDisabled) return;
    if (isBlank && (!letter || selected)) {
      onChooseBlank?.();
      return;
    }
    onSelect?.();
  };

  const handleDragOver = (event) => {
    if (reorderDisabled) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event) => {
    if (reorderDisabled) return;
    const tile = readTileDragData(event.dataTransfer);
    if (tile?.from === "rack") {
      event.preventDefault();
      event.stopPropagation();
      if (tile.id !== id) onReorderTile?.(tile.id, id);
    }
  };

  return (
    <button
      className={`letter-tile${selected ? " letter-tile--selected" : ""}${
        placementDisabled ? " letter-tile--placement-disabled" : ""
      }`}
      draggable={!reorderDisabled}
      disabled={reorderDisabled}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      aria-pressed={selected}
      aria-disabled={placementDisabled || reorderDisabled}
      title={
        placementDisabled && !reorderDisabled
          ? "Arrastra la ficha para ordenar tu atril"
          : isBlank && (!letter || selected)
            ? "Elegir la letra del comodín"
            : "Seleccionar ficha para colocarla con un clic"
      }
      aria-label={
        isBlank && letter
          ? `Comodín asignado a ${letter}, 0 puntos`
          : letter
          ? `Ficha ${letter}, ${points} puntos`
          : "Ficha en blanco (comodín). Presiona para elegir una letra"
      }
    >
      <span className="letter-tile__letter">{letter || "·"}</span>
      <span className="letter-tile__points">{points}</span>
      {isBlank && letter && (
        <span className="letter-tile__blank-mark" aria-hidden="true">
          ★
        </span>
      )}
    </button>
  );
}
