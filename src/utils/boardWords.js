import {
  LETTER_MULTIPLIERS,
  WORD_MULTIPLIERS,
} from "../layout/letterData.js";

const HORIZONTAL = { dr: 0, dc: 1 };
const VERTICAL = { dr: 1, dc: 0 };

function keyFor(row, col) {
  return `${row}-${col}`;
}

function cellTypeFor(key, boardLayout) {
  const [row, col] = key.split("-").map(Number);
  return boardLayout[row]?.[col] ?? "plain";
}

function findCenterKey(boardLayout) {
  for (let row = 0; row < boardLayout.length; row += 1) {
    const col = boardLayout[row].indexOf("star");
    if (col !== -1) return keyFor(row, col);
  }
  return null;
}

function touchesConfirmedTile(pendingCells, confirmedKeySet) {
  return pendingCells.some(({ row, col }) =>
    [
      keyFor(row - 1, col),
      keyFor(row + 1, col),
      keyFor(row, col - 1),
      keyFor(row, col + 1),
    ].some((key) => confirmedKeySet.has(key)),
  );
}

function collectWord(board, row, col, { dr, dc }) {
  let startRow = row;
  let startCol = col;

  while (board[keyFor(startRow - dr, startCol - dc)]) {
    startRow -= dr;
    startCol -= dc;
  }

  const cells = [];
  let currentRow = startRow;
  let currentCol = startCol;
  while (board[keyFor(currentRow, currentCol)]) {
    const key = keyFor(currentRow, currentCol);
    cells.push({ key, tile: board[key] });
    currentRow += dr;
    currentCol += dc;
  }

  return cells;
}

function uniqueWords(words) {
  const seen = new Set();
  return words.filter((wordCells) => {
    const signature = wordCells.map(({ key }) => key).join("|");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

// Resuelve la jugada principal y todas las palabras perpendiculares creadas
// por las fichas nuevas. Los multiplicadores se activan sólo bajo fichas
// pendientes. En modo Wild, sus mejoras quedan guardadas en `upgradedTiles`.
export function resolvePendingWord({ placedTiles, pendingKeys, boardLayout }) {
  if (pendingKeys.length === 0) return null;

  const pendingKeySet = new Set(pendingKeys);
  const confirmedKeySet = new Set(
    Object.keys(placedTiles).filter((key) => !pendingKeySet.has(key)),
  );
  const pendingCells = pendingKeys.map((key) => {
    const [row, col] = key.split("-").map(Number);
    return { row, col, key };
  });
  const sameRow = pendingCells.every(
    ({ row }) => row === pendingCells[0].row,
  );
  const sameCol = pendingCells.every(
    ({ col }) => col === pendingCells[0].col,
  );

  if (!sameRow && !sameCol) {
    return { error: "Las fichas deben ir en una sola fila o columna." };
  }


  // Los layouts de pruebas de puntuación pueden no incluir estrella; las
  // reglas de apertura/conexión se activan en el tablero real al encontrarla.
  const centerKey = findCenterKey(boardLayout);
  if (centerKey && confirmedKeySet.size === 0 && !pendingKeySet.has(centerKey)) {
    return { error: "La primera palabra debe cubrir la estrella central." };
  }
  if (
    centerKey &&
    confirmedKeySet.size > 0 &&
    !touchesConfirmedTile(pendingCells, confirmedKeySet)
  ) {
    return { error: "La jugada debe conectarse con una palabra del tablero." };
  }

  let mainDirection = sameRow ? HORIZONTAL : VERTICAL;
  if (pendingCells.length === 1) {
    const [{ row, col }] = pendingCells;
    const horizontalWord = collectWord(
      placedTiles,
      row,
      col,
      HORIZONTAL,
    );
    const verticalWord = collectWord(placedTiles, row, col, VERTICAL);
    if (verticalWord.length > horizontalWord.length) {
      mainDirection = VERTICAL;
    }
  }

  const [{ row: anchorRow, col: anchorCol }] = pendingCells;
  const mainWordCells = collectWord(
    placedTiles,
    anchorRow,
    anchorCol,
    mainDirection,
  );
  const mainWordKeys = new Set(mainWordCells.map(({ key }) => key));

  if (pendingKeys.some((key) => !mainWordKeys.has(key))) {
    return { error: "No puede haber espacios vacíos dentro de la palabra." };
  }

  const perpendicularDirection =
    mainDirection === HORIZONTAL ? VERTICAL : HORIZONTAL;
  const perpendicularWords = pendingCells
    .map(({ row, col }) =>
      collectWord(placedTiles, row, col, perpendicularDirection),
    )
    .filter((wordCells) => wordCells.length > 1);
  const wordCellsList = uniqueWords([mainWordCells, ...perpendicularWords]);
  const involvedKeys = [
    ...new Set(wordCellsList.flatMap((cells) => cells.map(({ key }) => key))),
  ];

  // Primero se aplica una mejora de letra una sola vez a cada ficha nueva.
  const upgradedTiles = Object.fromEntries(
    involvedKeys.map((key) => [key, { ...placedTiles[key] }]),
  );

  for (const key of pendingKeys) {
    const cellType = cellTypeFor(key, boardLayout);
    const letterMultiplier = LETTER_MULTIPLIERS[cellType] ?? 1;
    if (letterMultiplier > 1) {
      upgradedTiles[key] = {
        ...upgradedTiles[key],
        points: upgradedTiles[key].points * letterMultiplier,
        scoreBonus: {
          kind: "letter",
          label: cellType,
          multiplier: letterMultiplier,
          tone: cellType,
        },
      };
    }
  }

  const persistentWordMultipliers = Object.fromEntries(
    involvedKeys.map((key) => [key, 1]),
  );

  const words = wordCellsList.map((wordCells) => {
    let wordMultiplier = 1;
    let wordBonusTone = null;
    const wordBonusOrigins = new Map();

    for (const { key } of wordCells) {
      const cellType = cellTypeFor(key, boardLayout);
      if (pendingKeySet.has(key) && WORD_MULTIPLIERS[cellType]) {
        wordMultiplier *= WORD_MULTIPLIERS[cellType];
        wordBonusOrigins.set(key, cellType);
        if (cellType === "3W" || !wordBonusTone) {
          wordBonusTone = cellType;
        }
      }
    }

    const letterSum = wordCells.reduce(
      (sum, { key }) => sum + upgradedTiles[key].points,
      0,
    );

    if (wordMultiplier > 1) {
      for (const { key } of wordCells) {
        persistentWordMultipliers[key] *= wordMultiplier;
        const cellType = cellTypeFor(key, boardLayout);
        const originType = wordBonusOrigins.get(key);
        const isNonMultiplierCell =
          cellType === "plain" || cellType === "star";

        if (originType) {
          upgradedTiles[key].scoreBonus = {
            kind: "word",
            label: originType,
            multiplier: WORD_MULTIPLIERS[originType],
            tone: originType,
          };
        } else if (isNonMultiplierCell) {
          upgradedTiles[key].scoreBonus = {
            kind: "word",
            label: null,
            multiplier: wordMultiplier,
            tone: wordBonusTone,
          };
        }
      }
    }

    return {
      word: wordCells.map(({ key }) => upgradedTiles[key].letter).join(""),
      cellsKeys: wordCells.map(({ key }) => key),
      points: letterSum * wordMultiplier,
      wordMultiplier,
    };
  });

  // Las mejoras de palabra se guardan después de puntuar todas las palabras,
  // evitando que el orden horizontal/vertical altere el puntaje del turno.
  for (const key of involvedKeys) {
    upgradedTiles[key].points *= persistentWordMultipliers[key];
  }

  return {
    word: words[0].word,
    words,
    cellsKeys: involvedKeys,
    points: words.reduce((sum, word) => sum + word.points, 0),
    upgradedTiles,
  };
}
