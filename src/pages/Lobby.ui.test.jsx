import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const game = vi.hoisted(() => ({
  startGame: vi.fn(),
  createOnlineSession: vi.fn(async () => true),
  joinOnlineSession: vi.fn(async () => true),
  checking: false,
  statusMessage: null,
  darkMode: false,
  toggleDarkMode: vi.fn(),
}));

vi.mock("../context/GameContext.jsx", () => ({ useGame: () => game }));
vi.mock("../services/onlineGameService.js", () => ({
  isOnlineGameAvailable: true,
}));

import Lobby from "./Lobby.jsx";

describe("lobby online", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("crea una sala con el nombre del jugador", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    await user.click(screen.getByRole("button", { name: "Jugar online" }));
    await user.type(screen.getByPlaceholderText("Tu nombre online"), "Ana");
    await user.click(screen.getByRole("button", { name: "Crear sala" }));

    expect(game.createOnlineSession).toHaveBeenCalledWith("Ana");
  });

  test("normaliza visualmente el código antes de unirse", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    await user.click(screen.getByRole("button", { name: "Jugar online" }));
    await user.type(screen.getByPlaceholderText("Tu nombre online"), "Luis");
    await user.type(screen.getByPlaceholderText("Código de sala"), "abc123");
    await user.click(screen.getByRole("button", { name: "Unirse" }));

    expect(game.joinOnlineSession).toHaveBeenCalledWith("ABC123", "Luis");
  });
});
