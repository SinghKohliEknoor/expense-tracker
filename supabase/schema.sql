-- ═══════════════════════════════════════════════════════════════
--  Expense Tracker — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── Tables ───────────────────────────────────────────────────

create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

create table public.categories (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  icon        text not null default 'ellipse-outline',
  color       text not null default '#7C3AED',
  type        text check (type in ('expense', 'income')) not null,
  is_default  boolean default false not null,
  created_at  timestamptz default now() not null
);

create table public.transactions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  amount      numeric(12, 2) not null check (amount > 0),
  type        text check (type in ('expense', 'income')) not null,
  category_id uuid references public.categories(id) on delete set null,
  note        text,
  date        date not null default current_date,
  created_at  timestamptz default now() not null
);

create table public.budgets (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount      numeric(12, 2) not null check (amount > 0),
  period      text check (period in ('weekly', 'monthly', 'yearly')) default 'monthly' not null,
  created_at  timestamptz default now() not null
);

-- ─── Row Level Security ────────────────────────────────────────

alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "Users can manage own categories"
  on public.categories for all using (auth.uid() = user_id);

-- Transactions
create policy "Users can manage own transactions"
  on public.transactions for all using (auth.uid() = user_id);

-- Budgets
create policy "Users can manage own budgets"
  on public.budgets for all using (auth.uid() = user_id);

-- ─── Trigger: auto-create profile on sign-up ──────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Trigger: seed default categories for every new user ──────

create or replace function public.seed_default_categories()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.categories (user_id, name, icon, color, type, is_default) values
    -- Expense categories
    (new.id, 'Food & Dining',   'restaurant-outline',       '#F59E0B', 'expense', true),
    (new.id, 'Transport',       'car-outline',               '#3B82F6', 'expense', true),
    (new.id, 'Utilities',       'flash-outline',             '#7C3AED', 'expense', true),
    (new.id, 'Entertainment',   'game-controller-outline',   '#EC4899', 'expense', true),
    (new.id, 'Shopping',        'bag-outline',               '#F97316', 'expense', true),
    (new.id, 'Health',          'heart-outline',             '#22C55E', 'expense', true),
    (new.id, 'Other',           'ellipse-outline',           '#6B7280', 'expense', true),
    -- Income categories
    (new.id, 'Salary',          'briefcase-outline',         '#22C55E', 'income',  true),
    (new.id, 'Freelance',       'laptop-outline',            '#3B82F6', 'income',  true),
    (new.id, 'Investments',     'trending-up-outline',       '#F59E0B', 'income',  true),
    (new.id, 'Other Income',    'ellipse-outline',           '#6B7280', 'income',  true);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.seed_default_categories();

-- ─── Indexes for query performance ────────────────────────────

create index transactions_user_id_date_idx on public.transactions (user_id, date desc);
create index transactions_type_idx         on public.transactions (type);
create index categories_user_id_type_idx   on public.categories   (user_id, type);