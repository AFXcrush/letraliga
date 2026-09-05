import test from "node:test";
import assert from "node:assert/strict";
import {
  assignBlankLetter,
  resetBlankTile,
} from "./blankTile.js";

test("el comodín adopta una letra pero conserva cero puntos", () => {
  const blank = { id: "blank-1", letter: "", points: 0, isBlank: true };
  const assigned = assignBlankLetter(blank, "Ñ");

  assert.equal(assigned.letter, "Ñ");
  assert.equal(assigned.points, 0);
  assert.equal(assigned.isBlank, true);
});

test("el comodín se reinicia al volver al atril", () => {
  const assigned = {
    id: "blank-1",
    letter: "R",
    points: 0,
    isBlank: true,
  };

  assert.deepEqual(resetBlankTile(assigned), {
    id: "blank-1",
    letter: "",
    points: 0,
    isBlank: true,
  });
});

test("una ficha normal no se modifica al retornar", () => {
  const regular = { id: "a-1", letter: "A", points: 1 };
  assert.equal(resetBlankTile(regular), regular);
});
