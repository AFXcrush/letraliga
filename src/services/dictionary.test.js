import test from "node:test";
import assert from "node:assert/strict";
import { checkWordExists, normalizeWord } from "./dictionary.js";

const spanishWordsModule = await import(
  "an-array-of-spanish-words/index.json",
  { with: { type: "json" } },
);
const spanishWordSet = new Set(
  spanishWordsModule.default.map(normalizeWord),
);
const loadTestWordSet = async () => spanishWordSet;

test("normaliza espacios, mayúsculas y vocales acentuadas", () => {
  assert.equal(normalizeWord("  CAMIÓN  "), "camion");
  assert.equal(normalizeWord("ÁRBOL"), "arbol");
  assert.equal(normalizeWord("pingüino"), "pinguino");
});

test("conserva la ñ como una letra distinta de la n", () => {
  assert.equal(normalizeWord("NIÑO"), "niño");
  assert.notEqual(normalizeWord("NIÑO"), normalizeWord("NINO"));
});

test("acepta palabras españolas conocidas y palabras sin tilde en las fichas", async () => {
  for (const word of ["casa", "PERRO", "RAZA", "niño", "camión"]) {
    const result = await checkWordExists(word, loadTestWordSet);
    assert.equal(result.error, undefined, word);
    assert.equal(result.valid, true, word);
  }
});

test("acepta palabras formadas con fichas de dígrafo", async () => {
  for (const word of ["CHICO", "LLAMA", "CARRO"]) {
    const result = await checkWordExists(word, loadTestWordSet);
    assert.equal(result.valid, true, word);
  }
});

test("rechaza texto que no pertenece al diccionario", async () => {
  const result = await checkWordExists("zzqxwvv", loadTestWordSet);
  assert.equal(result.error, undefined);
  assert.equal(result.valid, false);
});
