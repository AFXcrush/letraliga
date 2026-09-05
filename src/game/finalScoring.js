function rackPoints(rack) {
  return rack.reduce((sum, tile) => sum + tile.points, 0);
}

/** Aplica penalizaciones de atril y el premio del jugador que lo vació. */
export function applyFinalScoring(players) {
  const penalties = new Map(
    players.map((player) => [player.id, rackPoints(player.rack)]),
  );
  const emptyRackPlayer = players.find(({ rack }) => rack.length === 0);
  const transferredPoints = emptyRackPlayer
    ? players.reduce(
        (sum, player) =>
          player.id === emptyRackPlayer.id
            ? sum
            : sum + penalties.get(player.id),
        0,
      )
    : 0;

  return players.map((player) => {
    const rackPenalty = penalties.get(player.id);
    const rackBonus =
      player.id === emptyRackPlayer?.id ? transferredPoints : 0;
    return {
      ...player,
      rackPenalty,
      rackBonus,
      finalScore: player.score - rackPenalty + rackBonus,
    };
  });
}
