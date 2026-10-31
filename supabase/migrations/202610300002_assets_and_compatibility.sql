create table if not exists public.generation_assets (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('input_image', 'output_image', 'output_video', 'thumbnail')),
  storage_path text not null,
  mime_type text,
  byte_size bigint check (byte_size >= 0),
  created_at timestamptz not null default now()
);

create index if not exists generation_assets_generation_idx on public.generation_assets(generation_id);
create index if not exists generation_assets_user_idx on public.generation_assets(user_id, created_at desc);

create or replace view public.credit_balances as
select user_id, balance, updated_at
from public.credit_accounts;

alter table public.generation_assets enable row level security;
create policy "generation_assets_owner_all" on public.generation_assets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
