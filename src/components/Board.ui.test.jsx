import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Board from "./Board.jsx";

describe("indicadores del tablero", () => {
  test("oculta los datos de una ficha pendiente adversaria", () => {
    render(<Board maskedPendingKeys={["9-13"]} />);
    const cell = screen.getByRole("button", {
      name: "Casilla fila 9, columna 13, centro",
    });

    expect(cell).toHaveClass("cell--opponent-pending");
    expect(cell).not.toHaveTextContent(/[A-ZÁÉÍÓÚÑ]/);
  });

  test("marca las casillas de la última jugada", () => {
    render(
      <Board
        placedTiles={{ "9-13": { id: "tile-a", letter: "A", points: 1 } }}
        lastMoveKeys={["9-13"]}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "Casilla fila 9, columna 13, centro",
      }),
    ).toHaveClass("cell--last-move");
  });
});
