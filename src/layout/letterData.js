// Distribución de fichas basada en Scrabble español con un refuerzo para
// juego fluido: agregamos una vocal extra de cada tipo y una ficha extra
// para S y N. Cada letra conserva su valor de puntos original.
export const LETTER_DISTRIBUTION = [
  { letter: "A", count: 13, points: 1 },
  { letter: "B", count: 2, points: 3 },
  { letter: "C", count: 4, points: 3 },
  { letter: "CH", count: 1, points: 5 },
  { letter: "D", count: 5, points: 2 },
  { letter: "E", count: 13, points: 1 },
  { letter: "F", count: 1, points: 4 },
  { letter: "G", count: 2, points: 2 },
  { letter: "H", count: 2, points: 4 },
  { letter: "I", count: 7, points: 1 },
  { letter: "J", count: 1, points: 8 },
  { letter: "L", count: 4, points: 1 },
  { letter: "LL", count: 1, points: 8 },
  { letter: "M", count: 2, points: 3 },
  { letter: "N", count: 6, points: 1 },
  { letter: "Ñ", count: 1, points: 8 },
  { letter: "O", count: 10, points: 1 },
  { letter: "P", count: 2, points: 3 },
  { letter: "Q", count: 1, points: 5 },
  { letter: "R", count: 5, points: 1 },
  { letter: "RR", count: 1, points: 8 },
  { letter: "S", count: 7, points: 1 },
  { letter: "T", count: 4, points: 1 },
  { letter: "U", count: 6, points: 1 },
  { letter: "V", count: 1, points: 4 },
  { letter: "X", count: 1, points: 8 },
  { letter: "Y", count: 1, points: 4 },
  { letter: "Z", count: 1, points: 10 },
  { letter: "", count: 2, points: 0 }, // comodín / ficha en blanco
];

// Arma la "bolsa" completa (100 fichas) a partir de la distribución,
// cada una con un id único para poder usarla como key de React.
export function buildLetterBag() {
  const bag = [];
  let uid = 0;
  for (const { letter, count, points } of LETTER_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      bag.push({
        id: `tile-${uid++}`,
        letter,
        points,
        ...(letter === "" ? { isBlank: true } : {}),
      });
    }
  }
  return bag;
}

// Mezcla la bolsa (Fisher-Yates)
export function shuffleBag(bag) {
  const arr = [...bag];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Constantes de multiplicadores según el tipo de casilla del tablero.
export const LETTER_MULTIPLIERS = { "2L": 2, "3L": 3 };
export const WORD_MULTIPLIERS = { "2W": 2, "3W": 3 };
