export function moveRackTile(rack, tileId, targetTileId = null) {
  if (tileId === targetTileId) return rack;
  const sourceIndex = rack.findIndex(({ id }) => id === tileId);
  if (sourceIndex < 0) return rack;

  const nextRack = [...rack];
  const [tile] = nextRack.splice(sourceIndex, 1);
  const targetIndex = targetTileId
    ? nextRack.findIndex(({ id }) => id === targetTileId)
    : nextRack.length;
  if (targetIndex < 0) return rack;

  nextRack.splice(targetIndex, 0, tile);
  return nextRack;
}
