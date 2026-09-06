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

test("actualiza la sala recién creada sin referenciar variables inexistentes", () => {
  const createRoomFunction = schema.match(
    /create or replace function public\.create_game_room[\s\S]*?\n\$\$;/,
  )?.[0];

  assert.ok(createRoomFunction, "create_game_room debe existir en el esquema");
  assert.match(createRoomFunction, /where g\.id = new_game_id/);
  assert.doesNotMatch(createRoomFunction, /target_game/);
});

test("la vista previa online publica posiciones pero no datos de fichas", () => {
  const previewFunction = schema.match(
    /create or replace function public\.preview_game_turn[\s\S]*?\n\$\$;/,
  )?.[0];

  assert.ok(previewFunction, "preview_game_turn debe existir en el esquema");
  assert.match(previewFunction, /preview_tile_keys jsonb/);
  assert.match(previewFunction, /'\{pendingTileKeys\}'/);
  assert.match(previewFunction, /'\{lastMoveKeys\}'/);
  assert.doesNotMatch(previewFunction, /letter|points|tile_id/i);
});

test("programa una limpieza idempotente sin borrar partidas recientes", () => {
  assert.match(schema, /create extension if not exists pg_cron/);
  assert.match(schema, /create or replace function public\.cleanup_expired_game_data\(\)/);
  assert.match(schema, /'finished', 'abandoned'[\s\S]*interval '24 hours'/);
  assert.match(schema, /g\.status = 'waiting'[\s\S]*interval '6 hours'/);
  assert.match(schema, /g\.status = 'playing'[\s\S]*interval '7 days'/);
  assert.match(schema, /u\.is_anonymous is true[\s\S]*interval '30 days'/);
  assert.match(schema, /'letra-liga-daily-cleanup'/);
  assert.match(schema, /select public\.cleanup_expired_game_data\(\)/);
});
