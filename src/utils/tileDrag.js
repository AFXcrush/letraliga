const TILE_DATA_TYPES = ["application/json", "text/plain"];

export function writeTileDragData(dataTransfer, tile) {
  if (!dataTransfer) return false;
  const payload = JSON.stringify(tile);
  let wrotePayload = false;

  for (const type of TILE_DATA_TYPES) {
    try {
      dataTransfer.setData(type, payload);
      wrotePayload = true;
    } catch {
      // Algunos navegadores sólo aceptan uno de los dos formatos.
    }
  }

  if (wrotePayload) dataTransfer.effectAllowed = "move";
  return wrotePayload;
}

export function readTileDragData(dataTransfer) {
  if (!dataTransfer) return null;

  for (const type of TILE_DATA_TYPES) {
    try {
      const raw = dataTransfer.getData(type);
      if (!raw) continue;
      const tile = JSON.parse(raw);
      if (tile && typeof tile === "object" && tile.id) return tile;
    } catch {
      // Prueba el siguiente formato si éste no existe o no contiene JSON.
    }
  }

  return null;
}
