import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import WordMeaningsModal from "./WordMeaningsModal.jsx";

describe("modal de significados", () => {
  test("lista la definición, el jugador y el puntaje de una palabra confirmada", async () => {
    const loadMeaning = vi.fn().mockResolvedValue({
      definitions: ["Edificación destinada a vivienda."],
      sourceUrl: "https://es.wiktionary.org/wiki/casa",
    });

    render(
      <WordMeaningsModal
        playedWords={[
          {
            word: "casa",
            playerId: "player-1",
            playerName: "Ana",
            points: 8,
          },
        ]}
        open
        onClose={() => {}}
        loadMeaning={loadMeaning}
      />,
    );

    expect(await screen.findByText("CASA")).toBeInTheDocument();
    expect(screen.getByText("Ana · 8 pts")).toBeInTheDocument();
    expect(
      screen.getByText("Edificación destinada a vivienda."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Wikcionario/ })).toHaveAttribute(
      "href",
      "https://es.wiktionary.org/wiki/casa",
    );
  });
});
