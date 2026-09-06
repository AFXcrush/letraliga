import { useCallback } from "react";
import { shuffleBag } from "../layout/letterData.js";
import { assignBlankLetter, resetBlankTile } from "../utils/blankTile.js";

function tileForRack(tile) {
  return resetBlankTile({
    id: tile.id,
    letter: tile.letter,
    points: tile.points,
    ...(tile.isBlank ? { isBlank: true } : {}),
  });
}

export function useTileActions({
  canInteract = true,
  placedTiles,
  pendingTiles,
  currentPlayerIndex,
  setPendingTiles,
  setLastMoveKeys,
  setPlayers,
  setStatusMessage,
}) {
  const placeTile = useCallback(
    ({ row, col, tile }) => {
      if (!canInteract) return;
      const key = `${row}-${col}`;
      if (placedTiles[key] || pendingTiles[key]) return;

      setPendingTiles((previousTiles) => {
        const nextTiles = { ...previousTiles };
        if (tile.from && tile.from !== "rack") {
          delete nextTiles[`${tile.from.row}-${tile.from.col}`];
        }
        nextTiles[key] = {
          id: tile.id,
          letter: tile.letter,
          points: tile.points,
          ...(tile.isBlank ? { isBlank: true } : {}),
        };
        return nextTiles;
      });

      if (!tile.from || tile.from === "rack") {
        setPlayers((players) =>
          players.map((player, index) =>
            index === currentPlayerIndex
              ? {
                  ...player,
                  rack: player.rack.filter(({ id }) => id !== tile.id),
                }
              : player,
          ),
        );
      }
      setStatusMessage(null);
      setLastMoveKeys([]);
    },
    [
      canInteract,
      currentPlayerIndex,
      pendingTiles,
      placedTiles,
      setPendingTiles,
      setPlayers,
      setLastMoveKeys,
      setStatusMessage,
    ],
  );

  const returnTileToRack = useCallback(
    (tile) => {
      if (!canInteract) return;
      const key = `${tile.from.row}-${tile.from.col}`;
      if (!pendingTiles[key]) return;

      setPendingTiles((previousTiles) => {
        const nextTiles = { ...previousTiles };
        delete nextTiles[key];
        return nextTiles;
      });
      setPlayers((players) =>
        players.map((player, index) =>
          index === currentPlayerIndex
            ? { ...player, rack: [...player.rack, tileForRack(tile)] }
            : player,
        ),
      );
      setStatusMessage(null);
    },
    [
      canInteract,
      currentPlayerIndex,
      pendingTiles,
      setPendingTiles,
      setPlayers,
      setStatusMessage,
    ],
  );

  const recallPendingTiles = useCallback(() => {
    if (!canInteract) return;
    const returnedTiles = Object.values(pendingTiles).map(tileForRack);
    if (returnedTiles.length === 0) return;

    setPlayers((players) =>
      players.map((player, index) =>
        index === currentPlayerIndex
          ? { ...player, rack: [...player.rack, ...returnedTiles] }
          : player,
      ),
    );
    setPendingTiles({});
    setStatusMessage(null);
  }, [
    canInteract,
    currentPlayerIndex,
    pendingTiles,
    setPendingTiles,
    setPlayers,
    setStatusMessage,
  ]);

  const assignBlank = useCallback(
    (tileId, letter) => {
      if (!canInteract) return;
      setPlayers((players) =>
        players.map((player, index) =>
          index === currentPlayerIndex
            ? {
                ...player,
                rack: player.rack.map((tile) =>
                  tile.id === tileId ? assignBlankLetter(tile, letter) : tile,
                ),
              }
            : player,
        ),
      );
    },
    [canInteract, currentPlayerIndex, setPlayers],
  );

  const shuffleRack = useCallback(() => {
    if (!canInteract) return;
    setPlayers((players) =>
      players.map((player, index) => {
        if (index !== currentPlayerIndex || player.rack.length < 2) {
          return player;
        }

        let shuffled = shuffleBag(player.rack);
        const keptSameOrder = shuffled.every(
          (tile, tileIndex) => tile.id === player.rack[tileIndex].id,
        );
        if (keptSameOrder) shuffled = [...shuffled.slice(1), shuffled[0]];

        return { ...player, rack: shuffled };
      }),
    );
  }, [canInteract, currentPlayerIndex, setPlayers]);

  return {
    placeTile,
    returnTileToRack,
    recallPendingTiles,
    assignBlank,
    shuffleRack,
  };
}
