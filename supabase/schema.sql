-- Letra Liga: esquema inicial para salas multijugador.
-- Ejecutar en el SQL Editor de Supabase después de habilitar Anonymous Sign-Ins.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique check (room_code ~ '^[A-Z0-9]{6}$'),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'waiting'
    check (status in ('waiting', 'playing', 'finished', 'abandoned')),
  public_state jsonb not null default '{}'::jsonb,
  state_version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  score integer not null default 0,
  turn_order smallint not null check (turn_order between 0 and 3),
  last_seen timestamptz not null default now(),
  unique (game_id, user_id),
  unique (game_id, turn_order)
);

-- Los atriles viven fuera de game_players para que una lectura de la lista de
-- participantes nunca revele fichas privadas de otro jugador.
create table if not exists public.player_racks (
  player_id uuid primary key references public.game_players(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tiles jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- La bolsa no se concede por SELECT a ningún cliente. Sólo las funciones del
-- backend con SECURITY DEFINER podrán repartir fichas en la fase siguiente.
create table if not exists public.game_bags (
  game_id uuid primary key references public.games(id) on delete cascade,
  tiles jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.moves (
  id bigint generated always as identity primary key,
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.game_players(id) on delete cascade,
  words jsonb not null,
  points integer not null check (points >= 0),
  board_delta jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists game_players_game_id_idx
  on public.game_players(game_id);
create index if not exists moves_game_id_idx on public.moves(game_id);

alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.player_racks enable row level security;
alter table public.game_bags enable row level security;
alter table public.moves enable row level security;

create or replace function public.is_game_member(target_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.game_players
    where game_id = target_game_id and user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_game_member(uuid) from public;
grant execute on function public.is_game_member(uuid) to authenticated;

drop policy if exists "members read games" on public.games;
create policy "members read games"
on public.games for select to authenticated
using (public.is_game_member(id));

drop policy if exists "members read player summaries" on public.game_players;
create policy "members read player summaries"
on public.game_players for select to authenticated
using (public.is_game_member(game_id));

drop policy if exists "players read own rack" on public.player_racks;
create policy "players read own rack"
on public.player_racks for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "members read moves" on public.moves;
create policy "members read moves"
on public.moves for select to authenticated
using (public.is_game_member(game_id));

revoke all on public.games, public.game_players, public.player_racks,
  public.game_bags, public.moves from anon, authenticated;
grant select on public.games, public.game_players, public.moves to authenticated;
grant select on public.player_racks to authenticated;

create or replace function public.create_game_room(player_name text)
returns table (game_id uuid, room_code text, player_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_game_id uuid;
  new_player_id uuid;
  new_code text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(player_name)) not between 1 and 20 then
    raise exception 'Player name must contain between 1 and 20 characters';
  end if;

  loop
    new_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (
      select 1 from public.games where games.room_code = new_code
    );
  end loop;

  insert into public.games (room_code, host_user_id)
  values (new_code, (select auth.uid()))
  returning id into new_game_id;

  insert into public.game_players (game_id, user_id, name, turn_order)
  values (new_game_id, (select auth.uid()), trim(player_name), 0)
  returning id into new_player_id;

  insert into public.player_racks (player_id, user_id)
  values (new_player_id, (select auth.uid()));
  insert into public.game_bags (game_id) values (new_game_id);

  return query select new_game_id, new_code, new_player_id;
end;
$$;

create or replace function public.join_game_room(join_code text, player_name text)
returns table (game_id uuid, room_code text, player_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_game public.games%rowtype;
  new_player_id uuid;
  next_turn smallint;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(player_name)) not between 1 and 20 then
    raise exception 'Player name must contain between 1 and 20 characters';
  end if;

  select * into target_game
  from public.games
  where games.room_code = upper(trim(join_code))
  for update;

  if target_game.id is null or target_game.status <> 'waiting' then
    raise exception 'Room is unavailable';
  end if;
  if exists (
    select 1 from public.game_players
    where game_id = target_game.id and user_id = (select auth.uid())
  ) then
    return query
      select target_game.id, target_game.room_code, gp.id
      from public.game_players gp
      where gp.game_id = target_game.id
        and gp.user_id = (select auth.uid());
    return;
  end if;

  select count(*)::smallint into next_turn
  from public.game_players where game_id = target_game.id;
  if next_turn >= 4 then raise exception 'Room is full'; end if;

  insert into public.game_players (game_id, user_id, name, turn_order)
  values (target_game.id, (select auth.uid()), trim(player_name), next_turn)
  returning id into new_player_id;
  insert into public.player_racks (player_id, user_id)
  values (new_player_id, (select auth.uid()));

  return query select target_game.id, target_game.room_code, new_player_id;
end;
$$;

create or replace function public.get_game_room(target_game_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_game_member(target_game_id) then
    raise exception 'Access denied';
  end if;

  return jsonb_build_object(
    'game', (select to_jsonb(g) from public.games g where g.id = target_game_id),
    'players', (
      select coalesce(jsonb_agg(to_jsonb(p) order by p.turn_order), '[]'::jsonb)
      from public.game_players p where p.game_id = target_game_id
    ),
    'rack', (
      select r.tiles from public.player_racks r
      where r.user_id = (select auth.uid())
        and r.player_id in (
          select id from public.game_players where game_id = target_game_id
        )
    )
  );
end;
$$;

revoke all on function public.create_game_room(text) from public;
revoke all on function public.join_game_room(text, text) from public;
revoke all on function public.get_game_room(uuid) from public;
grant execute on function public.create_game_room(text) to authenticated;
grant execute on function public.join_game_room(text, text) to authenticated;
grant execute on function public.get_game_room(uuid) to authenticated;

-- Postgres Changes requiere añadir explícitamente las tablas a la publicación.
do $$
begin
  alter publication supabase_realtime add table public.games;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.game_players;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.moves;
exception when duplicate_object then null;
end $$;
