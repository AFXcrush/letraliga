import test from "node:test";
import assert from "node:assert/strict";
import { exchangeRackTiles } from "./tileExchange.js";

const keepOrder = (tiles) => tiles;

test("reemplaza la misma cantidad de fichas y devuelve las anteriores a la bolsa", () => {
  const result = exchangeRackTiles({
    rack: [
      { id: "a", letter: "A", points: 1 },
      { id: "b", letter: "B", points: 3 },
    ],
    bag: [
      { id: "c", letter: "C", points: 3 },
      { id: "d", letter: "D", points: 2 },
    ],
    tileIds: ["a"],
    shuffle: keepOrder,
  });

  assert.deepEqual(result.rack.map(({ id }) => id), ["b", "c"]);
  assert.deepEqual(result.bag.map(({ id }) => id), ["d", "a"]);
  assert.equal(result.exchangedCount, 1);
});

test("reinicia un comodín asignado antes de devolverlo a la bolsa", () => {
  const result = exchangeRackTiles({
    rack: [{ id: "blank", letter: "R", points: 0, isBlank: true }],
    bag: [{ id: "a", letter: "A", points: 1 }],
    tileIds: ["blank"],
    shuffle: keepOrder,
  });

  assert.equal(result.bag[0].letter, "");
  assert.equal(result.bag[0].points, 0);
});

test("rechaza un cambio mayor que la cantidad disponible en la bolsa", () => {
  const result = exchangeRackTiles({
    rack: [
      { id: "a", letter: "A", points: 1 },
      { id: "b", letter: "B", points: 3 },
    ],
    bag: [{ id: "c", letter: "C", points: 3 }],
    tileIds: ["a", "b"],
    shuffle: keepOrder,
  });

  assert.match(result.error, /al menos 2 fichas/);
});

test("balancea el atril recibido si la bolsa tiene letras suficientes", () => {
  const rack = ["B", "C", "D", "F", "G", "H", "J"].map((letter, index) => ({
    id: `rack-${index}`,
    letter,
    points: 1,
  }));
  const bag = ["L", "M", "A", "E", "I"].map((letter, index) => ({
    id: `bag-${index}`,
    letter,
    points: 1,
  }));
  const result = exchangeRackTiles({
    rack,
    bag,
    tileIds: ["rack-0", "rack-1"],
    shuffle: keepOrder,
  });

  assert.ok(result.rack.filter(({ letter }) => "AEIOU".includes(letter)).length >= 2);
});
