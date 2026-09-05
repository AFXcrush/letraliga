// Ficha de letra individual del atril.
export default function LetterTile({
  id,
  letter,
  points,
  isBlank,
  onChooseBlank,
  onSelect,
  selected,
}) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id, letter, points, isBlank, from: "rack" }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = () => {
    if (isBlank && (!letter || selected)) {
      onChooseBlank?.();
      return;
    }
    onSelect?.();
  };

  return (
    <button
      className={`letter-tile${selected ? " letter-tile--selected" : ""}`}
      draggable={!isBlank || Boolean(letter)}
      onDragStart={handleDragStart}
      onClick={handleClick}
      aria-pressed={selected}
      title={
        isBlank && (!letter || selected)
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
