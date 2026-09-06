import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Rack from "./Rack.jsx";

function createDataTransfer() {
  const values = new Map();
  return {
    dropEffect: "none",
    effectAllowed: "all",
    setData: (type, value) => values.set(type, value),
    getData: (type) => values.get(type) ?? "",
  };
}

describe("orden personal del atril", () => {
  it("permite mover fichas y mezclarlas aunque no sea el turno", () => {
    const onReorderTile = vi.fn();
    const onShuffle = vi.fn();
    render(
      <Rack
        tiles={[
          { id: "a", letter: "A", points: 1 },
          { id: "b", letter: "B", points: 3 },
        ]}
        onReorderTile={onReorderTile}
        onShuffle={onShuffle}
        turnDisabled
        reorderDisabled={false}
        canRecall={false}
        bagCount={10}
      />,
    );
    const tileA = screen.getByRole("button", { name: "Ficha A, 1 puntos" });
    const tileB = screen.getByRole("button", { name: "Ficha B, 3 puntos" });
    const dataTransfer = createDataTransfer();

    expect(tileA).toHaveAttribute("draggable", "true");
    expect(tileA).toHaveAttribute("aria-disabled", "true");
    fireEvent.dragStart(tileB, { dataTransfer });
    fireEvent.dragEnter(tileA, { dataTransfer });
    fireEvent.drop(tileA, { dataTransfer });
    fireEvent.click(screen.getByRole("button", { name: /Mezclar fichas/ }));

    expect(onReorderTile).toHaveBeenCalledWith("b", "a");
    expect(onShuffle).toHaveBeenCalledTimes(1);
  });

  it("permite devolver una ficha del tablero aunque caiga sobre otra ficha", () => {
    const onReturnTile = vi.fn();
    render(
      <Rack
        tiles={[{ id: "a", letter: "A", points: 1 }]}
        onReturnTile={onReturnTile}
        turnDisabled={false}
        reorderDisabled={false}
        canRecall
        bagCount={10}
      />,
    );
    const tileA = screen.getByRole("button", { name: "Ficha A, 1 puntos" });
    const dataTransfer = createDataTransfer();
    dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: "b",
        letter: "B",
        points: 3,
        from: { row: 9, col: 13 },
      }),
    );

    fireEvent.dragEnter(tileA, { dataTransfer });
    fireEvent.drop(tileA, { dataTransfer });

    expect(onReturnTile).toHaveBeenCalledWith(
      expect.objectContaining({ id: "b", from: { row: 9, col: 13 } }),
    );
  });
});
