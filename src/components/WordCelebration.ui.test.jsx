import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import WordCelebration from "./WordCelebration.jsx";

test("notifica quién confirmó la palabra y su puntaje", () => {
  render(
    <WordCelebration
      celebration={{
        id: "move-1",
        playerName: "Ana",
        words: ["casa", "ala"],
        points: 12,
        bonusPoints: 0,
      }}
      onDismiss={vi.fn()}
    />,
  );

  expect(screen.getByRole("status")).toHaveTextContent("Ana confirmó");
  expect(screen.getByRole("status")).toHaveTextContent("CASA + ALA");
  expect(screen.getByRole("status")).toHaveTextContent("+12 puntos");
});
