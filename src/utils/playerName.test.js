import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidPlayerName,
  MAX_PLAYER_NAME_LENGTH,
  sanitizePlayerName,
} from "./playerName.js";

test("acepta nombres de hasta doce letras, números y espacios simples", () => {
  assert.equal(isValidPlayerName("JoséÑ2"), true);
  assert.equal(isValidPlayerName("Pedro Perez"), true);
  assert.equal(isValidPlayerName("Jugador12345"), true);
  assert.equal("Jugador12345".length, MAX_PLAYER_NAME_LENGTH);
});

test("elimina espacios, símbolos y caracteres que superan el límite", () => {
  assert.equal(sanitizePlayerName(" Ana_  123!!!"), "Ana 123");
  assert.equal(sanitizePlayerName("Jugador123456789"), "Jugador12345");
});

test("rechaza nombres vacíos o con caracteres no permitidos", () => {
  assert.equal(isValidPlayerName(""), false);
  assert.equal(isValidPlayerName("a    b"), false);
  assert.equal(isValidPlayerName("Ana "), false);
  assert.equal(isValidPlayerName("Ana!"), false);
});
