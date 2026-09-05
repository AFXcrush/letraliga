import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "./App.jsx";

function createDataTransfer() {
  const values = new Map();
  return {
    dropEffect: "none",
    effectAllowed: "all",
    setData: (type, value) => values.set(type, value),
    getData: (type) => values.get(type) ?? "",
  };
}

async function startGame() {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole("textbox"), "Prueba");
  await user.click(screen.getByRole("button", { name: "Empezar a jugar" }));
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
});
