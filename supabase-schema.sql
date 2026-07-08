-- AIA Agent CRM — Supabase schema
-- Run this in Supabase Dashboard > SQL Editor, then paste your project URL and anon key
-- into the app's Settings page.
--
-- NOTE: This pilot setup allows access with the anon key alone (single-user app).
-- If you later add Supabase Auth, tighten the policies to auth.uid()-based rules.

create table if not exists customers (
  id uuid primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  address text,
  birthdate date,
  type text,          -- life | health | saving | invest | group | prospect
  status text,        -- active | vip | prospect | lapsed
  note text,
  lat double precision,
  lng double precision
);

create table if not exists policies (
  id uuid primary key,
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete cascade,
  policy_no text,
  plan_name text,
  premium numeric,
  sum_assured numeric,
  start_date date,
  renewal_date date
);

create table if not exists claims (
  id uuid primary key,
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete cascade,
  claim_date date,
  claim_type text,
  amount numeric,
  status text,        -- pending | approved | paid | rejected
  detail text
);

create table if not exists reminders (
  id uuid primary key,
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete set null,
  title text not null,
  remind_date date,
  rem_type text,      -- renewal | birthday | followup | other
  done boolean default false
);

-- Enable RLS with permissive anon policies (single-user pilot)
alter table customers enable row level security;
alter table policies  enable row level security;
alter table claims    enable row level security;
alter table reminders enable row level security;

do $$
declare tbl text;
begin
  foreach tbl in array array['customers','policies','claims','reminders'] loop
    execute format('drop policy if exists "anon all" on %I', tbl);
    execute format('create policy "anon all" on %I for all using (true) with check (true)', tbl);
  end loop;
end $$;
