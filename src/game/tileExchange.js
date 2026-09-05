import { shuffleBag } from "../layout/letterData.js";
import { resetBlankTile } from "../utils/blankTile.js";
import { balanceRack } from "../utils/rackBalance.js";
import { TURN_RACK_RULES } from "./constants.js";

/**
 * Cambia fichas sin permitir que el jugador robe inmediatamente las mismas
 * que acaba de devolver. La función es pura e inyecta el mezclador en tests.
 */
export function exchangeRackTiles({ rack, bag, tileIds, shuffle = shuffleBag }) {
  const selectedIds = new Set(tileIds);
  const selectedTiles = rack.filter(({ id }) => selectedIds.has(id));

  if (selectedTiles.length === 0) {
    return { error: "Selecciona al menos una ficha para cambiar." };
  }
  if (selectedTiles.length !== selectedIds.size) {
    return { error: "La selección contiene fichas que ya no están en el atril." };
  }
  if (bag.length < selectedTiles.length) {
    return {
      error: `La bolsa necesita al menos ${selectedTiles.length} fichas para realizar el cambio.`,
    };
  }

  const shuffledBag = shuffle([...bag]);
  const replacements = shuffledBag.slice(0, selectedTiles.length);
  const remainingBag = shuffledBag.slice(selectedTiles.length);
  const keptTiles = rack.filter(({ id }) => !selectedIds.has(id));
  const returnedTiles = selectedTiles.map((tile) => resetBlankTile({ ...tile }));
  const balanced = balanceRack({
    rack: [...keptTiles, ...replacements],
    bag: remainingBag,
    rackSize: rack.length,
    ...TURN_RACK_RULES,
  });

  return {
    rack: balanced.rack,
    bag: shuffle([...balanced.bag, ...returnedTiles]),
    exchangedCount: selectedTiles.length,
  };
}
