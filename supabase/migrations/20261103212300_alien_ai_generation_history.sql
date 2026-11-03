create table if not exists public.video_generations (
  id uuid primary key default gen_random_uuid(),
  provider_task_id text unique not null,
  demo_user_id text not null,
  prompt text not null,
  model text not null,
  ratio text,
  duration_seconds integer,
  status text not null default 'queued',
  output_url text,
  failure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_generations_demo_user_created_idx
  on public.video_generations (demo_user_id, created_at desc);

alter table public.video_generations enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists video_generations_set_updated_at on public.video_generations;
create trigger video_generations_set_updated_at
before update on public.video_generations
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('alien-ai-media', 'alien-ai-media', false)
on conflict (id) do nothing;
