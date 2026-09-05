export function createPlayedWordEntries(words, player) {
  return words.map(({ word, points }) => ({
    word,
    points,
    playerId: player.id,
    playerName: player.name,
  }));
}

export function createSuccessMessage({
  words,
  wordPoints,
  bonusPoints,
  turnPoints,
  startsFinalTurn,
}) {
  const scoreSummary = words
    .map(({ word, points }) => `"${word.toUpperCase()}" (${points})`)
    .join(" + ");

  return `${scoreSummary}: ${wordPoints} puntos${
    bonusPoints ? ` + bono de ${bonusPoints}` : ""
  }. Total: ${turnPoints}.${
    startsFinalTurn
      ? " La bolsa quedó vacía: tienes un último turno con tus nuevas fichas."
      : ""
  }`;
}

export function createCelebration(resolved, bonusPoints, turnPoints) {
  return {
    id: `${Date.now()}-${resolved.word}`,
    word: resolved.word,
    words: resolved.words.map(({ word }) => word),
    points: turnPoints,
    wordPoints: resolved.points,
    bonusPoints,
    cellsKeys: resolved.cellsKeys,
  };
}
