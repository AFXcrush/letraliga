import { useMemo } from "react";
import { BOARD_LAYOUT } from "../layout/boardLayout.js";
import { resolvePendingWord } from "../utils/boardWords.js";

/** Calcula el tablero combinado y la vista previa sin duplicar estado. */
export function useBoardState(placedTiles, pendingTiles) {
  const boardForWordCheck = useMemo(
    () => ({ ...placedTiles, ...pendingTiles }),
    [placedTiles, pendingTiles],
  );

  const pendingWordPreview = useMemo(() => {
    const pendingKeys = Object.keys(pendingTiles);
    if (pendingKeys.length === 0) return null;

    return resolvePendingWord({
      placedTiles: boardForWordCheck,
      pendingKeys,
      boardLayout: BOARD_LAYOUT,
    });
  }, [boardForWordCheck, pendingTiles]);

  return { boardForWordCheck, pendingWordPreview };
}
