const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function isVowel(tile) {
  return VOWELS.has(tile.letter);
}

export function isConsonant(tile) {
  return Boolean(tile.letter) && !isVowel(tile);
}

function countMatching(tiles, predicate) {
  return tiles.filter(predicate).length;
}

// Completa el atril y, si la bolsa lo permite, intercambia fichas para
// respetar los mínimos. Los comodines no cuentan como vocal ni consonante.
export function balanceRack({
  rack,
  bag,
  rackSize = 7,
  minVowels,
  minConsonants,
}) {
  const nextRack = [...rack];
  const nextBag = [...bag];

  while (nextRack.length < rackSize && nextBag.length > 0) {
    nextRack.push(nextBag.shift());
  }

  function satisfyMinimum(predicate, minimum, protectedRules) {
    const deficit = minimum - countMatching(nextRack, predicate);
    if (deficit <= 0) return;

    // Si la bolsa no puede cubrir por completo el mínimo, la regla se ignora.
    if (countMatching(nextBag, predicate) < deficit) return;

    for (let index = 0; index < deficit; index += 1) {
      const bagIndex = nextBag.findIndex(predicate);
      const rackIndex = nextRack.findIndex(
        (tile) =>
          !predicate(tile) &&
          protectedRules.every(
            ({ predicate: protectedPredicate, minimum: protectedMinimum }) =>
              !protectedPredicate(tile) ||
              countMatching(nextRack, protectedPredicate) - 1 >=
                protectedMinimum,
          ),
      );

      if (bagIndex === -1 || rackIndex === -1) return;

      const [requiredTile] = nextBag.splice(bagIndex, 1);
      const [returnedTile] = nextRack.splice(rackIndex, 1, requiredTile);
      nextBag.push(returnedTile);
    }
  }

  satisfyMinimum(isVowel, minVowels, [
    { predicate: isConsonant, minimum: minConsonants },
  ]);
  satisfyMinimum(isConsonant, minConsonants, [
    { predicate: isVowel, minimum: minVowels },
  ]);

  return { rack: nextRack, bag: nextBag };
}
