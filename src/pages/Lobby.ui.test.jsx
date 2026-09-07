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

    await user.click(screen.getByRole("button", { name: /Online/ }));
    await user.type(
      screen.getByPlaceholderText("¿Cómo te llamas?"),
      "Pedro Perez",
    );
    await user.click(screen.getByRole("button", { name: "Crear sala online" }));

    expect(game.createOnlineSession).toHaveBeenCalledWith("Pedro Perez");
  });

  test("normaliza visualmente el código antes de unirse", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    await user.click(screen.getByRole("button", { name: /Online/ }));
    await user.click(screen.getByRole("button", { name: "Tengo un código" }));
    await user.type(screen.getByPlaceholderText("¿Cómo te llamas?"), "Luis");
    await user.type(screen.getByPlaceholderText("ABC123"), "abc123");
    await user.click(screen.getByRole("button", { name: "Unirme a la sala" }));

    expect(game.joinOnlineSession).toHaveBeenCalledWith("ABC123", "Luis");
  });

  test("muestra sólo el flujo elegido para evitar acciones duplicadas", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    expect(screen.getByRole("button", { name: "Empezar partida local" })).toBeVisible();
    expect(screen.queryByPlaceholderText("¿Cómo te llamas?")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Online/ }));

    expect(screen.queryByRole("button", { name: "Empezar partida local" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear sala online" })).toBeVisible();
    expect(screen.queryByPlaceholderText("ABC123")).not.toBeInTheDocument();
  });

  test("limita los nombres a doce caracteres válidos", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    const nameInput = screen.getByRole("textbox", {
      name: "Nombre del jugador 1",
    });
    await user.type(nameInput, " Ana_123!!!JugadorExtra");

    expect(nameInput).toHaveValue("Ana123Jugado");
    expect(nameInput.value).toHaveLength(12);

    await user.click(
      screen.getByRole("button", { name: "Empezar partida local" }),
    );
    expect(game.startGame).toHaveBeenCalledWith(["Ana123Jugado"]);
  });

  test("no permite iniciar con espacios o símbolos", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    await user.type(
      screen.getByRole("textbox", { name: "Nombre del jugador 1" }),
      " _-! ",
    );
    await user.click(
      screen.getByRole("button", { name: "Empezar partida local" }),
    );

    expect(game.startGame).not.toHaveBeenCalled();
    expect(screen.getByText("Pon al menos un nombre para jugar.")).toBeVisible();
  });
});
