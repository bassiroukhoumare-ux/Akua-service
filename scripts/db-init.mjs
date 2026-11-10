// Création des tables AKUA Service dans Neon (sans risque : peut être relancé, ne supprime rien).
// Reprend aussi les données enregistrées jusqu'ici sur l'ordinateur (.data/), une seule fois.
// Utilisation : npm run db:init
import { neon } from "@neondatabase/serverless";
import { existsSync, readFileSync } from "node:fs";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquant");
const sql = neon(url);

await sql`create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
)`;
await sql`create table if not exists images (
  id text primary key,
  mime text not null,
  b64 text not null,
  created_at timestamptz not null default now()
)`;
await sql`create table if not exists team_members (
  id text primary key,
  name text not null,
  identifier text not null,
  modules jsonb not null default '[]',
  status text not null,
  secret text,
  must_change boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen timestamptz,
  password_changed_at timestamptz
)`;
await sql`create table if not exists visits (
  id bigserial primary key,
  t timestamptz not null,
  v text not null,
  s text not null,
  p text not null,
  src text not null,
  c text not null default '',
  d text not null,
  e text
)`;
await sql`create index if not exists visits_t on visits (t)`;
await sql`create table if not exists reviews (
  id text primary key,
  product_id text not null,
  status text not null default 'publie',
  data jsonb not null,
  created_at timestamptz not null default now()
)`;
await sql`create index if not exists reviews_product on reviews (product_id)`;
await sql`create table if not exists saved_carts (
  id text primary key,
  phone_digits text not null,
  status text not null,
  data jsonb not null,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)`;
await sql`create index if not exists saved_carts_phone on saved_carts (phone_digits)`;
await sql`create table if not exists favorites (
  visitor text not null,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (visitor, product_id)
)`;
await sql`create table if not exists media (
  id text primary key,
  mime text not null,
  size bigint not null,
  chunks int not null default 0,
  complete boolean not null default false,
  created_at timestamptz not null default now()
)`;
await sql`create table if not exists media_chunks (
  media_id text not null,
  idx int not null,
  b64 text not null,
  primary key (media_id, idx)
)`;
await sql`create table if not exists orders (
  id text primary key,
  ref text not null,
  promo_code text,
  data jsonb not null,
  created_at timestamptz not null default now()
)`;
await sql`create index if not exists orders_promo on orders (promo_code)`;
await sql`alter table team_members add column if not exists perms jsonb`;
await sql`alter table orders add column if not exists status text not null default 'pending'`;
await sql`alter table orders add column if not exists status_by text`;
await sql`alter table orders add column if not exists status_at timestamptz`;
await sql`create index if not exists orders_status on orders (status)`;
await sql`create sequence if not exists order_number_seq`;
await sql`create table if not exists admin_seen (
  user_key text not null,
  module text not null,
  seen_at timestamptz not null default now(),
  primary key (user_key, module)
)`;
await sql`create table if not exists push_subscriptions (
  endpoint text primary key,
  user_key text not null,
  keys jsonb not null,
  prefs jsonb not null default '{}',
  user_agent text,
  created_at timestamptz not null default now(),
  last_ok timestamptz
)`;
console.log("Tables prêtes.");

// --- reprise des données locales (.data/) si les tables sont vides
const [{ n: teamCount }] = await sql`select count(*)::int as n from team_members`;
if (!teamCount && existsSync(".data/equipe.json")) {
  const list = JSON.parse(readFileSync(".data/equipe.json", "utf8"));
  for (const m of list) {
    await sql`insert into team_members (id, name, identifier, modules, status, secret, must_change, created_at, last_seen, password_changed_at)
      values (${m.id}, ${m.name}, ${m.identifier}, ${JSON.stringify(m.modules)}, ${m.status}, ${m.secret ?? null}, ${m.mustChange}, ${m.createdAt}, ${m.lastSeen ?? null}, ${m.passwordChangedAt ?? null})
      on conflict (id) do nothing`;
  }
  console.log(`Équipe reprise : ${list.length} équipier(s).`);
}
const [{ n: visitCount }] = await sql`select count(*)::int as n from visits`;
if (!visitCount && existsSync(".data/visites.jsonl")) {
  const rows = readFileSync(".data/visites.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  for (const v of rows) {
    await sql`insert into visits (t, v, s, p, src, c, d, e) values (${new Date(v.t).toISOString()}, ${v.v}, ${v.s}, ${v.p}, ${v.src}, ${v.c}, ${v.d}, ${v.e ?? null})`;
  }
  console.log(`Visites reprises : ${rows.length}.`);
}
const counts = await sql`select
  (select count(*) from team_members)::int as equipe,
  (select count(*) from visits)::int as visites,
  (select count(*) from app_state)::int as contenus,
  (select count(*) from reviews)::int as avis,
  (select count(*) from saved_carts)::int as paniers`;
console.log("Contenu de la base :", counts[0]);
