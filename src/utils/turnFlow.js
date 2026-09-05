export function getPostTurnAction({ isFinalTurn, remainingBagCount }) {
  if (isFinalTurn) return "gameover";
  if (remainingBagCount === 0) return "start-final-turn";
  return "advance";
}
