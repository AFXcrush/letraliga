// Ficha de letra individual del atril.
export default function LetterTile({
  id,
  letter,
  points,
  isBlank,
  onChooseBlank,
  onSelect,
  selected,
  disabled = false,
}) {
  const handleDragStart = (e) => {
    if (disabled) return;
    const payload = JSON.stringify({
      id,
      letter,
      points,
      isBlank,
      from: "rack",
    });

    // Firefox y algunos navegadores basados en WebKit pueden ignorar tipos
    // personalizados durante un arrastre. text/plain mantiene el movimiento
    // disponible cuando application/json no se admite.
    try {
      e.dataTransfer.setData("application/json", payload);
    } catch {
      // El formato de respaldo se registra debajo.
    }
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = () => {
    if (disabled) return;
    if (isBlank && (!letter || selected)) {
      onChooseBlank?.();
      return;
    }
    onSelect?.();
  };

  return (
    <button
      className={`letter-tile${selected ? " letter-tile--selected" : ""}`}
      draggable={!disabled && (!isBlank || Boolean(letter))}
      disabled={disabled}
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
