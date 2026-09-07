import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameOver from "./GameOver.jsx";

const {
  playVictorySound,
  resetToLobby,
  startGame,
  startOnlineMatch,
  leaveOnlineSession,
} = vi.hoisted(() => ({
  playVictorySound: vi.fn(),
  resetToLobby: vi.fn(),
  startGame: vi.fn(),
  startOnlineMatch: vi.fn(),
  leaveOnlineSession: vi.fn(),
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
    resetToLobby,
    startGame,
    startOnlineMatch,
    leaveOnlineSession,
    isOnlineGame: true,
    checking: false,
    gameEndReason: "scoreless-turns",
  }),
}));

describe("GameOver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playVictorySound.mockClear();
    resetToLobby.mockClear();
    startGame.mockClear();
    startOnlineMatch.mockClear();
    leaveOnlineSession.mockClear();
  });

  afterEach(() => vi.useRealTimers());

  it("reproduce la fanfarria una sola vez al mostrar el resultado", () => {
    render(<GameOver />);

    expect(screen.getByText("Ana ganó la partida 🎉")).toBeInTheDocument();
    expect(playVictorySound).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(playVictorySound).toHaveBeenCalledTimes(1);
  });

  it("inicia otra partida online sin volver al lobby", () => {
    render(<GameOver />);

    fireEvent.click(screen.getByRole("button", { name: "Jugar otra vez" }));

    expect(startOnlineMatch).toHaveBeenCalledTimes(1);
    expect(resetToLobby).not.toHaveBeenCalled();
  });

  it("permite salir de la partida terminada y volver al lobby", () => {
    render(<GameOver />);

    fireEvent.click(screen.getByRole("button", { name: "Lobby" }));

    expect(leaveOnlineSession).toHaveBeenCalledTimes(1);
    expect(startOnlineMatch).not.toHaveBeenCalled();
    expect(resetToLobby).not.toHaveBeenCalled();
  });
});
