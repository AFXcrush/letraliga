export function getPostTurnAction({ isFinalTurn, remainingBagCount }) {
  if (isFinalTurn) return "gameover";
  if (remainingBagCount === 0) return "start-final-turn";
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
