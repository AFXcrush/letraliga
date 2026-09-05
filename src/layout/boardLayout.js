// Layout del tablero: grid de 19 filas x 27 columnas.
// "plain" = casilla normal, "2L"/"3L" = multiplican el puntaje de LA LETRA
// que se coloque encima, "2W"/"3W" = multiplican el puntaje de TODA LA PALABRA
// que pase por esa casilla, "star" = casilla central (inicio obligatorio de
// la primera palabra, como en el Scrabble clasico).
export const BOARD_LAYOUT = [
  [
    "plain", "plain", "plain", "2L", "plain", "plain", "2L", "plain", "2L",
    "plain", "plain", "2L", "plain", "plain", "plain", "2L", "plain", "plain",
    "2L", "plain", "2L", "plain", "plain", "2L", "plain", "plain", "plain",
  ],
  [
    "plain", "2L", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "2L", "plain", "plain", "plain", "2W",
    "plain", "plain", "plain", "2W", "plain", "plain", "plain", "2L", "plain",
  ],
  [
    "plain", "plain", "plain", "plain", "2L", "plain", "3L", "plain", "3L",
    "plain", "2L", "plain", "plain", "plain", "plain", "plain", "2L", "plain",
    "3L", "plain", "3L", "plain", "2L", "plain", "plain", "plain", "plain",
  ],
  [
    "2L", "2W", "2L", "plain", "plain", "plain", "plain", "3W", "plain",
    "plain", "plain", "plain", "2L", "2W", "2L", "plain", "plain", "plain",
    "plain", "3W", "plain", "plain", "plain", "plain", "2L", "2W", "2L",
  ],
  [
    "plain", "plain", "plain", "plain", "2L", "plain", "3L", "plain", "3L",
    "plain", "2L", "plain", "plain", "plain", "plain", "plain", "2L", "plain",
    "3L", "plain", "3L", "plain", "2L", "plain", "plain", "plain", "plain",
  ],
  [
    "plain", "2L", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "2L", "plain", "plain", "plain", "2W",
    "plain", "plain", "plain", "2W", "plain", "plain", "plain", "2L", "plain",
  ],
  [
    "plain", "plain", "plain", "2L", "plain", "plain", "2L", "plain", "2L",
    "plain", "plain", "2L", "plain", "plain", "plain", "2L", "plain", "plain",
    "2L", "plain", "2L", "plain", "plain", "2L", "plain", "plain", "plain",
  ],
  [
    "plain", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "plain", "plain", "2W", "plain", "plain", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "plain", "plain", "2W", "plain",
    "plain", "plain", "plain",
  ],
  [
    "3L", "plain", "3L", "plain", "plain", "plain", "plain", "2L", "plain",
    "plain", "plain", "plain", "3L", "plain", "3L", "plain", "plain", "plain",
    "plain", "2L", "plain", "plain", "plain", "plain", "3L", "plain", "3L",
  ],
  [
    "plain", "plain", "plain", "2W", "plain", "plain", "plain", "2W", "plain",
    "plain", "plain", "2W", "plain", "star", "plain", "2W", "plain", "plain",
    "plain", "2W", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
  ],
  [
    "3L", "plain", "3L", "plain", "plain", "plain", "plain", "2L", "plain",
    "plain", "plain", "plain", "3L", "plain", "3L", "plain", "plain", "plain",
    "plain", "2L", "plain", "plain", "plain", "plain", "3L", "plain", "3L",
  ],
  [
    "plain", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "plain", "plain", "2W", "plain", "plain", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "plain", "plain", "2W", "plain",
    "plain", "plain", "plain",
  ],
  [
    "plain", "plain", "plain", "2L", "plain", "plain", "2L", "plain", "2L",
    "plain", "plain", "2L", "plain", "plain", "plain", "2L", "plain", "plain",
    "2L", "plain", "2L", "plain", "plain", "2L", "plain", "plain", "plain",
  ],
  [
    "plain", "2L", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "2L", "plain", "plain", "plain", "2W",
    "plain", "plain", "plain", "2W", "plain", "plain", "plain", "2L", "plain",
  ],
  [
    "plain", "plain", "plain", "plain", "2L", "plain", "3L", "plain", "3L",
    "plain", "2L", "plain", "plain", "plain", "plain", "plain", "2L", "plain",
    "3L", "plain", "3L", "plain", "2L", "plain", "plain", "plain", "plain",
  ],
  [
    "2L", "2W", "2L", "plain", "plain", "plain", "plain", "3W", "plain",
    "plain", "plain", "plain", "2L", "2W", "2L", "plain", "plain", "plain",
    "plain", "3W", "plain", "plain", "plain", "plain", "2L", "2W", "2L",
  ],
  [
    "plain", "plain", "plain", "plain", "2L", "plain", "3L", "plain", "3L",
    "plain", "2L", "plain", "plain", "plain", "plain", "plain", "2L", "plain",
    "3L", "plain", "3L", "plain", "2L", "plain", "plain", "plain", "plain",
  ],
  [
    "plain", "2L", "plain", "plain", "plain", "2W", "plain", "plain", "plain",
    "2W", "plain", "plain", "plain", "2L", "plain", "plain", "plain", "2W",
    "plain", "plain", "plain", "2W", "plain", "plain", "plain", "2L", "plain",
  ],
  [
    "plain", "plain", "plain", "2L", "plain", "plain", "2L", "plain", "2L",
    "plain", "plain", "2L", "plain", "plain", "plain", "2L", "plain", "plain",
    "2L", "plain", "2L", "plain", "plain", "2L", "plain", "plain", "plain",
  ],
];
