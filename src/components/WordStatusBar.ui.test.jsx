import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import WordStatusBar from "./WordStatusBar.jsx";

const preview = {
  word: "xyzz",
  points: 7,
  words: [{ word: "xyzz", points: 7 }],
};

describe("validación previa de palabra", () => {
  test("oculta el resultado anterior mientras se prepara una nueva jugada", () => {
    const { rerender } = render(
      <WordStatusBar
        pendingWordPreview={preview}
        pendingTileCount={2}
        isOpeningTurn
        previewValidation={{
          status: "valid",
          words: [{ word: "xyzz", valid: true }],
        }}
        statusMessage={{ type: "success", text: "Luz: 12 puntos." }}
      />,
    );

    expect(screen.queryByText(/Luz: 12 puntos/)).not.toBeInTheDocument();

    rerender(
      <WordStatusBar
        pendingWordPreview={preview}
        pendingTileCount={2}
        isOpeningTurn
        statusMessage={{ type: "error", text: "Revisa la conexión." }}
      />,
    );

    expect(screen.getByText(/Revisa la conexión/)).toBeInTheDocument();

    rerender(
      <WordStatusBar
        pendingTileCount={0}
        statusMessage={{ type: "success", text: "Luz: 12 puntos." }}
      />,
    );

    expect(screen.getByText(/Luz: 12 puntos/)).toBeInTheDocument();
  });

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
