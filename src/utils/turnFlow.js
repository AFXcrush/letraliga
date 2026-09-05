export function getPostTurnAction({
  finalTurnPlayerId,
  currentPlayerId,
  remainingBagCount,
}) {
  if (finalTurnPlayerId && currentPlayerId === finalTurnPlayerId) {
    return "gameover";
  }
  if (!finalTurnPlayerId && remainingBagCount === 0) {
    return "start-final-round";
  }
  return "advance";
}

export function getScorelessTurnAction({
  currentCount,
  playerCount,
  roundsToEnd,
}) {
  const nextCount = currentCount + 1;
  return {
    nextCount,
    gameOver: playerCount > 0 && nextCount >= playerCount * roundsToEnd,
  };
}
