import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "./App.jsx";
import { saveGameSnapshot } from "./services/gameStorage.js";

function createDataTransfer({ rejectJson = false } = {}) {
  const values = new Map();
  return {
    dropEffect: "none",
    effectAllowed: "all",
    setData: (type, value) => {
      if (rejectJson && type === "application/json") {
        throw new Error("Formato no admitido");
      }
      values.set(type, value);
    },
    getData: (type) => values.get(type) ?? "",
  };
}

async function startGame() {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole("textbox"), "Prueba");
  await user.click(screen.getByRole("button", { name: "Empezar partida local" }));
  return user;
}

function getFirstRegularTile() {
  return screen
    .getAllByRole("button")
    .find((button) =>
      /^Ficha .+, \d+ puntos$/.test(button.getAttribute("aria-label") ?? ""),
    );
}

describe("interacción entre el atril y el tablero", () => {
  test("impide seleccionar como texto las letras del tablero", async () => {
    await startGame();
    const board = screen.getByLabelText("Tablero de juego");

    expect(getComputedStyle(board).userSelect).toBe("none");
  });

  test("mantiene desactivados los significados hasta confirmar una palabra", async () => {
    await startGame();

    expect(
      screen.getByRole("button", { name: "Significados" }),
    ).toBeDisabled();
  });

  test("destaca claramente al jugador que tiene el turno", async () => {
    await startGame();
    const activePlayer = screen.getByText("Prueba").closest(".player-list__item");

    expect(activePlayer).toHaveClass("player-list__item--active");
    expect(activePlayer).toHaveAttribute("aria-current", "true");
    expect(activePlayer).toHaveTextContent("Turno");
  });

  test("ordena las acciones como Retornar, Mezclar, Atril y Cambiar", async () => {
    await startGame();
    const rackSection = screen.getByLabelText("Atril").parentElement;
    const orderedItems = Array.from(rackSection.children).slice(-3);

    expect(orderedItems[0]).toHaveAttribute("aria-label", "Acciones antes del atril");
    expect(orderedItems[0]).toHaveTextContent(/Retornar al atril.*Mezclar fichas/);
    expect(orderedItems[1]).toHaveAttribute("aria-label", "Atril");
    expect(orderedItems[2]).toHaveTextContent("Cambiar fichas");
  });

  test("permite jugar pulsando una ficha y luego una casilla", async () => {
    const user = await startGame();
    const tile = getFirstRegularTile();
    const tileLetter = tile.querySelector(".letter-tile__letter").textContent;
    const centerCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });

    await user.click(tile);
    expect(tile).toHaveAttribute("aria-pressed", "true");
    await user.click(centerCell);

    expect(centerCell).toHaveTextContent(tileLetter);
    expect(
      screen.getByText(/Coloca al menos 2 fichas nuevas/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar palabra" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Retornar al atril" }),
    ).toBeEnabled();
  });

  test("mantiene funcional el arrastre nativo hacia una casilla", async () => {
    await startGame();
    const tile = getFirstRegularTile();
    const tileLetter = tile.querySelector(".letter-tile__letter").textContent;
    const centerCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(tile, { dataTransfer });
    fireEvent.dragEnter(centerCell, { dataTransfer });
    fireEvent.dragOver(centerCell, { dataTransfer });
    fireEvent.drop(centerCell, { dataTransfer });

    expect(centerCell).toHaveTextContent(tileLetter);
    expect(
      screen.getByRole("button", { name: "Retornar al atril" }),
    ).toBeEnabled();
  });

  test("devuelve al atril una ficha pendiente con doble clic", async () => {
    const user = await startGame();
    const tile = getFirstRegularTile();
    const tileLetter = tile.querySelector(".letter-tile__letter").textContent;
    const centerCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });

    await user.click(tile);
    await user.click(centerCell);
    expect(centerCell).toHaveTextContent(tileLetter);

    await user.dblClick(centerCell);

    expect(centerCell).not.toHaveTextContent(tileLetter);
    expect(
      screen.getByRole("button", { name: "Retornar al atril" }),
    ).toBeDisabled();
  });

  test("usa texto plano si el navegador rechaza el formato de arrastre JSON", async () => {
    await startGame();
    const tile = getFirstRegularTile();
    const tileLetter = tile.querySelector(".letter-tile__letter").textContent;
    const centerCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });
    const dataTransfer = createDataTransfer({ rejectJson: true });

    fireEvent.dragStart(tile, { dataTransfer });
    fireEvent.dragEnter(centerCell, { dataTransfer });
    fireEvent.dragOver(centerCell, { dataTransfer });
    fireEvent.drop(centerCell, { dataTransfer });

    expect(dataTransfer.dropEffect).toBe("move");
    expect(centerCell).toHaveTextContent(tileLetter);
  });

  test("permite validar una sola ficha nueva después de la apertura", async () => {
    saveGameSnapshot({
      phase: "playing",
      players: [
        {
          id: "player-1",
          name: "Prueba",
          score: 0,
          rack: [{ id: "tile-n", letter: "N", points: 1 }],
        },
      ],
      currentPlayerIndex: 0,
      bag: [],
      placedTiles: {
        "9-13": { id: "tile-u", letter: "U", points: 1 },
      },
      pendingTiles: {},
      playedWords: [],
      isFinalTurn: false,
      scorelessTurnCount: 0,
      darkMode: false,
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Ficha N, 1 puntos" }));
    await user.click(
      screen.getByRole("button", { name: "Casilla fila 9, columna 14" }),
    );

    expect(
      await screen.findByText(
        "✓ Existe en el diccionario",
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar palabra" }),
    ).toBeEnabled();
    expect(screen.getByText("UN (2)")).toBeInTheDocument();
  });

  test("retira el resaltado anterior al colocar la primera ficha nueva", async () => {
    saveGameSnapshot({
      phase: "playing",
      players: [
        {
          id: "player-1",
          name: "Prueba",
          score: 0,
          rack: [{ id: "tile-n", letter: "N", points: 1 }],
        },
      ],
      currentPlayerIndex: 0,
      bag: [],
      placedTiles: {
        "9-13": { id: "tile-u", letter: "U", points: 1 },
      },
      pendingTiles: {},
      lastMoveKeys: ["9-13"],
      playedWords: [],
      scorelessTurnCount: 0,
      darkMode: false,
    });
    const user = userEvent.setup();
    render(<App />);
    const previousCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });
    expect(previousCell).toHaveClass("cell--last-move");

    await user.click(screen.getByRole("button", { name: "Ficha N, 1 puntos" }));
    await user.click(
      screen.getByRole("button", { name: "Casilla fila 9, columna 14" }),
    );
    expect(previousCell).not.toHaveClass("cell--last-move");
  });

  test("termina después de dos rondas sin palabras", async () => {
    const user = await startGame();
    const passButton = screen.getByRole("button", { name: "Pasar turno" });

    await user.click(passButton);
    await user.click(screen.getByRole("button", { name: "Pasar turno" }));

    expect(
      screen.getByRole("heading", { name: "¡Partida finalizada!" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/dos rondas consecutivas/)).toBeInTheDocument();
  });

  test("permite colocar fichas y recorrer el tablero con teclado", async () => {
    const user = await startGame();
    const tile = getFirstRegularTile();
    const centerCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });
    const rightCell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 14",
    });

    tile.focus();
    await user.keyboard("{Enter}");
    centerCell.focus();
    await user.keyboard("{Enter}");
    expect(centerCell).not.toBeEmptyDOMElement();

    centerCell.focus();
    await user.keyboard("{ArrowRight}");
    expect(rightCell).toHaveFocus();
  });

  test("recupera una partida guardada al volver a cargar la aplicación", () => {
    saveGameSnapshot({
      phase: "playing",
      players: [
        {
          id: "saved-player",
          name: "Partida guardada",
          score: 12,
          rack: [],
        },
      ],
      currentPlayerIndex: 0,
      bag: [],
      placedTiles: {},
      pendingTiles: {},
      playedWords: [],
      isFinalTurn: false,
      scorelessTurnCount: 0,
      darkMode: false,
    });

    render(<App />);

    expect(screen.getByText(/Turno de Partida guardada/)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  test("permite abandonar una partida desde el menú de opciones", async () => {
    const user = await startGame();
    await user.click(screen.getByRole("button", { name: /Opciones/ }));
    await user.click(screen.getByRole("button", { name: "Abandonar partida" }));

    expect(
      screen.getByRole("heading", { name: "Elige cómo jugar" }),
    ).toBeInTheDocument();
  });
});
