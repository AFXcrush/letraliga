import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWiktionaryUrl,
  getWordMeaning,
  parseSpanishDefinitions,
} from "./wordMeanings.js";

const SAMPLE_EXTRACT = `
== Español ==
=== Etimología ===
Del latín casa.
==== Sustantivo femenino ====
casa ¦ plural: casas
1 Vivienda
Edificación destinada a vivienda.
2
Domicilio.
Sinónimos: hogar, morada.
3
Establecimiento comercial.
== Catalán ==
1
Casa.
`;

test("extrae solamente las primeras acepciones del apartado español", () => {
  assert.deepEqual(parseSpanishDefinitions(SAMPLE_EXTRACT), [
    "Vivienda Edificación destinada a vivienda.",
    "Domicilio.",
    "Establecimiento comercial.",
  ]);
});

test("devuelve una lista vacía si la página no tiene apartado español", () => {
  assert.deepEqual(parseSpanishDefinitions("== Inglés ==\n1 House."), []);
});

test("consulta Wikcionario y conserva el enlace de la entrada encontrada", async () => {
  let requestedUrl = "";
  const result = await getWordMeaning("CASA", async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      json: async () => ({
        query: { pages: [{ title: "casa", extract: SAMPLE_EXTRACT }] },
      }),
    };
  });

  assert.match(requestedUrl, /es\.wiktionary\.org\/w\/api\.php/);
  assert.match(requestedUrl, /gsrsearch=casa/);
  assert.equal(result.definitions.length, 3);
  assert.equal(result.sourceUrl, buildWiktionaryUrl("casa"));
});

test("informa el fallo de red sin inventar una definición", async () => {
  await assert.rejects(
    getWordMeaning("casa", async () => ({ ok: false })),
    /Wikcionario/,
  );
});
