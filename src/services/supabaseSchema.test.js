import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const schema = readFileSync(
  new URL("../../supabase/schema.sql", import.meta.url),
  "utf8",
);

test("califica las funciones de pgcrypto con el esquema extensions", () => {
  assert.match(schema, /extensions\.gen_random_bytes\(6\)/);
  assert.doesNotMatch(schema, /(?<!extensions\.)gen_random_bytes\(6\)/);
});
