create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.sentences (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  tense text check (tense in ('present','past','future')),
  aspect text check (aspect in ('simple','progressive','perfect','perfect-progressive')),
  voice text check (voice in ('active','passive')),
  construction text,
  difficulty int check (difficulty between 1 and 5) default 2,
  source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

create trigger trg_sentences_updated_at
before update on public.sentences
for each row execute procedure public.set_updated_at();

create index if not exists idx_sentences_text_trgm on public.sentences using gin (text gin_trgm_ops);

alter table public.sentences enable row level security;

create policy "Sentences readable by everyone"
on public.sentences for select
to anon, authenticated using (is_active);

create policy "Sentences writable by authenticated"
on public.sentences for all
to authenticated using (true) with check (true);
