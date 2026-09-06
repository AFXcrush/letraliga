import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BlankLetterModal from "./BlankLetterModal.jsx";

describe("BlankLetterModal", () => {
  it("se monta directamente en la página para no heredar la posición del atril", () => {
    render(
      <BlankLetterModal
        open
        onChoose={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Elige una letra" });

    expect(dialog.closest(".blank-modal")?.parentElement).toBe(document.body);
    expect(screen.getAllByRole("button", { name: /Usar el comodín como/i })).toHaveLength(27);
  });
});
