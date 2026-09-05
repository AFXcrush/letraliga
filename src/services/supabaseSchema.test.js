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

test("evita columnas ambiguas dentro de join_game_room", () => {
  const joinRoomFunction = schema.match(
    /create or replace function public\.join_game_room[\s\S]*?\n\$\$;/,
  )?.[0];

  assert.ok(joinRoomFunction, "join_game_room debe existir en el esquema");
  assert.match(joinRoomFunction, /where gp\.game_id = target_game\.id/);
  assert.match(joinRoomFunction, /gp\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(joinRoomFunction, /gp\.turn_order = slot/);
  assert.doesNotMatch(joinRoomFunction, /where game_id =/);
});
