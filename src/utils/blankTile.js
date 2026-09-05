export const BLANK_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export function assignBlankLetter(tile, letter) {
  if (!BLANK_LETTERS.includes(letter)) return tile;
  return { ...tile, letter, points: 0, isBlank: true };
}

export function resetBlankTile(tile) {
  if (!tile.isBlank) return tile;
  return { ...tile, letter: "", points: 0, isBlank: true };
}
