create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  description text,
  project_type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  provider text not null,
  model text not null,
  generation_type text not null check (generation_type in ('image', 'video', 'image-to-video')),
  prompt text not null,
  negative_prompt text,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  provider_job_id text,
  input_media_path text,
  output_media_path text,
  output_url text,
  aspect_ratio text,
  duration_seconds integer,
  resolution text,
  credits_used integer not null default 0,
  error_code text,
  error_message text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create table if not exists public.credit_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.generations(id) on delete set null,
  transaction_type text not null check (transaction_type in ('credit', 'debit', 'refund')),
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  idempotency_key text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text unique,
  plan_id text,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists generations_provider_job_idx on public.generations(provider_job_id);
create index if not exists projects_user_updated_idx on public.projects(user_id, updated_at desc);
create index if not exists credit_transactions_user_created_idx on public.credit_transactions(user_id, created_at desc);

insert into storage.buckets(id, name, private)
values ('alien-ai-media', 'alien-ai-media', true)
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id) on conflict (id) do nothing;
  insert into public.credit_accounts(user_id, balance) values (new.id, 100) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.reserve_generation_credits(
  p_user_id uuid, p_amount integer, p_generation_id uuid, p_idempotency_key text
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_balance integer;
begin
  if p_amount <= 0 then return true; end if;
  select balance into v_balance from public.credit_accounts where user_id = p_user_id for update;
  if v_balance is null or v_balance < p_amount then return false; end if;
  if exists(select 1 from public.credit_transactions
            where user_id = p_user_id and idempotency_key = p_idempotency_key) then return true; end if;
  update public.credit_accounts set balance = v_balance - p_amount, updated_at = now()
  where user_id = p_user_id;
  insert into public.credit_transactions(
    user_id, generation_id, transaction_type, amount, balance_after, idempotency_key, description
  ) values (
    p_user_id, p_generation_id, 'debit', p_amount, v_balance - p_amount,
    p_idempotency_key, 'Generation credit reservation'
  );
  return true;
end;
$$;

create or replace function public.refund_generation_credits(p_generation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_amount integer; v_key text; v_balance integer;
begin
  select user_id, credits_used, idempotency_key into v_user, v_amount, v_key
  from public.generations where id = p_generation_id;
  if v_user is null or v_amount <= 0 then return; end if;
  if exists(select 1 from public.credit_transactions
            where user_id = v_user and idempotency_key = v_key || '-refund') then return; end;
  select balance into v_balance from public.credit_accounts where user_id = v_user for update;
  update public.credit_accounts set balance = v_balance + v_amount, updated_at = now() where user_id = v_user;
  insert into public.credit_transactions(
    user_id, generation_id, transaction_type, amount, balance_after, idempotency_key, description
  ) values (
    v_user, p_generation_id, 'refund', v_amount, v_balance + v_amount,
    v_key || '-refund', 'Failed generation refund'
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.generations enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_owner_read" on public.profiles for select using (auth.uid() = id);
create policy "profiles_owner_write" on public.profiles for update using (auth.uid() = id);
create policy "projects_owner_all" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "generations_owner_read" on public.generations for select using (auth.uid() = user_id);
create policy "credits_owner_read" on public.credit_accounts for select using (auth.uid() = user_id);
create policy "credit_transactions_owner_read" on public.credit_transactions for select using (auth.uid() = user_id);
create policy "subscriptions_owner_read" on public.subscriptions for select using (auth.uid() = user_id);
