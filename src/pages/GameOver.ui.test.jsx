import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameOver from "./GameOver.jsx";

const { playVictorySound } = vi.hoisted(() => ({
  playVictorySound: vi.fn(),
}));

vi.mock("../services/soundEffects.js", () => ({
  playVictorySound,
  playWordConfirmedSound: vi.fn(),
}));
vi.mock("../components/PanZoom.jsx", () => ({
  default: ({ children }) => <div>{children(1)}</div>,
}));
vi.mock("../context/GameContext.jsx", () => ({
  useGame: () => ({
    players: [{ id: "p1", name: "Ana", score: 12, rack: [] }],
    placedTiles: {},
    playedWords: [],
    celebration: null,
    darkMode: false,
    dismissCelebration: vi.fn(),
    toggleDarkMode: vi.fn(),
    resetToLobby: vi.fn(),
    gameEndReason: "scoreless-turns",
  }),
}));

describe("GameOver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playVictorySound.mockClear();
  });

  afterEach(() => vi.useRealTimers());

  it("reproduce la fanfarria una sola vez al mostrar el resultado", () => {
    render(<GameOver />);

    expect(screen.getByText("Ana ganó la partida 🎉")).toBeInTheDocument();
    expect(playVictorySound).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(playVictorySound).toHaveBeenCalledTimes(1);
  });
});
