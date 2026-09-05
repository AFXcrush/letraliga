export const FULL_RACK_BONUS = 25;

export function getFullRackBonus(usedTileCount, rackSize = 7) {
  return usedTileCount === rackSize ? FULL_RACK_BONUS : 0;
}

export function getGameHighlights(playedWords) {
  if (playedWords.length === 0) {
    return { longestWord: null, highestScoringWord: null };
  }

  return playedWords.reduce(
    (highlights, entry) => ({
      longestWord:
        Array.from(entry.word).length >
        Array.from(highlights.longestWord.word).length
          ? entry
          : highlights.longestWord,
      highestScoringWord:
        entry.points > highlights.highestScoringWord.points
          ? entry
          : highlights.highestScoringWord,
    }),
    {
      longestWord: playedWords[0],
      highestScoringWord: playedWords[0],
    },
  );
}
