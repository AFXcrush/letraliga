import test from "node:test";
import assert from "node:assert/strict";
import {
  balanceRack,
  isConsonant,
  isVowel,
} from "./rackBalance.js";

const tile = (letter, id) => ({ id, letter, points: 1 });

test("el reparto inicial asegura al menos dos vocales y dos consonantes", () => {
  const bag = [
    ..."BCDFGHJ".split("").map((letter, i) => tile(letter, `c-${i}`)),
    tile("A", "a"),
    tile("E", "e"),
  ];
  const result = balanceRack({
    rack: [],
    bag,
    minVowels: 2,
    minConsonants: 2,
  });

  assert.equal(result.rack.filter(isVowel).length, 2);
  assert.ok(result.rack.filter(isConsonant).length >= 2);
  assert.equal(result.rack.length, 7);
  assert.equal(result.rack.length + result.bag.length, bag.length);
});

test("al rellenar un turno asegura dos vocales y una consonante", () => {
  const rack = "AEIOU".split("").map((letter, i) => tile(letter, `r-${i}`));
  const bag = [tile("O", "o"), tile("U", "u"), tile("T", "t")];
  const result = balanceRack({
    rack,
    bag,
    minVowels: 2,
    minConsonants: 1,
  });

  assert.ok(result.rack.filter(isVowel).length >= 2);
  assert.equal(result.rack.filter(isConsonant).length, 1);
  assert.equal(result.rack.length, 7);
});

test("ignora un mínimo que la bolsa no puede completar", () => {
  const bag = "BCDFGHJ".split("").map((letter, i) => tile(letter, `c-${i}`));
  const result = balanceRack({
    rack: [],
    bag,
    minVowels: 2,
    minConsonants: 2,
  });

  assert.equal(result.rack.filter(isVowel).length, 0);
  assert.equal(result.rack.length, 7);
  assert.equal(result.bag.length, 0);
});
