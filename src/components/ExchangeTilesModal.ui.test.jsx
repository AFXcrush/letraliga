import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ExchangeTilesModal from "./ExchangeTilesModal.jsx";

describe("modal de cambio de fichas", () => {
  test("pide confirmación antes de ejecutar el cambio", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => true);
    const onClose = vi.fn();
    render(
      <ExchangeTilesModal
        tiles={[
          { id: "a", letter: "A", points: 1 },
          { id: "b", letter: "B", points: 3 },
        ]}
        bagCount={4}
        open
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    const tile = screen.getByRole("button", { name: "Cambiar ficha A" });
    await user.click(tile);
    expect(tile).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", { name: "Confirmar cambio" }),
    );

    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("alertdialog", { name: "Confirmar cambio de fichas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/esta acción consume tu turno y no se puede deshacer/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Sí, cambiar 1 ficha" }),
    );

    expect(onConfirm).toHaveBeenCalledWith(["a"]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("permite volver al selector sin cambiar fichas", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => true);
    const onClose = vi.fn();
    render(
      <ExchangeTilesModal
        tiles={[{ id: "a", letter: "A", points: 1 }]}
        bagCount={4}
        open
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cambiar ficha A" }));
    await user.click(
      screen.getByRole("button", { name: "Confirmar cambio" }),
    );
    await user.click(screen.getByRole("button", { name: "Volver" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("alertdialog", { name: "Confirmar cambio de fichas" }),
    ).not.toBeInTheDocument();
  });
});
