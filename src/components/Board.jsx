import Cell from "./Cell.jsx";
import { BOARD_LAYOUT } from "../layout/boardLayout.js";

export default function Board({
  scale = 1,
  placedTiles = {},
  pendingTiles = {},
  celebratingKeys = [],
  onDropTile,
  onSelectCell,
  hasSelectedTile = false,
}) {
  const rows = BOARD_LAYOUT.length;
  const cols = BOARD_LAYOUT[0].length;
  const cellSize = 32 * scale;

  return (
    <div
      className="board"
      aria-label="Tablero de juego"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        userSelect: "none",
        WebkitUserSelect: "none",
        "--cell-size": `${cellSize}px`,
        "--cell-font": `${10 * scale}px`,
      }}
    >
      {BOARD_LAYOUT.map((rowData, r) =>
        rowData.map((type, c) => {
          const key = `${r}-${c}`;
          const tile = pendingTiles[key] ?? placedTiles[key];
          return (
            <Cell
              key={key}
              type={type}
              row={r}
              col={c}
              placedTile={tile}
              isPending={Boolean(pendingTiles[key])}
              isCelebrating={celebratingKeys.includes(key)}
              onDropTile={onDropTile}
              onSelectCell={onSelectCell}
              isClickTarget={hasSelectedTile && !tile}
            />
          );
        }),
      )}
    </div>
  );
}
