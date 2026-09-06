import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import WordStatusBar from "./WordStatusBar.jsx";

const preview = {
  word: "xyzz",
  points: 7,
  words: [{ word: "xyzz", points: 7 }],
};

describe("validación previa de palabra", () => {
  test("avisa y bloquea la confirmación cuando la palabra no existe", () => {
    render(
      <WordStatusBar
        pendingWordPreview={preview}
        pendingTileCount={2}
        isOpeningTurn
        previewValidation={{
          status: "invalid",
          words: [{ word: "xyzz", valid: false }],
        }}
      />,
    );

    expect(screen.getByText("✕ XYZZ no existe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar palabra" }),
    ).toBeDisabled();
  });

  test("habilita la confirmación cuando todas las palabras existen", () => {
    render(
      <WordStatusBar
        pendingWordPreview={preview}
        pendingTileCount={2}
        isOpeningTurn
        previewValidation={{
          status: "valid",
          words: [{ word: "xyzz", valid: true }],
        }}
      />,
    );

    expect(screen.getByText("✓ Existe en el diccionario")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar palabra" }),
    ).toBeEnabled();
  });
});
