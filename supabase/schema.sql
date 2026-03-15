-- Run this in your Supabase project: SQL Editor → New query → Run

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);


-- ─── Posts ───────────────────────────────────────────────────────────────────
create table public.posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  content     text not null,
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on posts for select using (true);

create policy "Users can insert their own posts"
  on posts for insert with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts for delete using (auth.uid() = user_id);


-- ─── Likes ───────────────────────────────────────────────────────────────────
create table public.likes (
  id          uuid default gen_random_uuid() primary key,
  post_id     uuid references public.posts on delete cascade not null,
  user_id     uuid references public.profiles on delete cascade not null,
  created_at  timestamptz default now(),
  unique (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on likes for select using (true);

create policy "Users can insert their own likes"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on likes for delete using (auth.uid() = user_id);


-- ─── Comments ─────────────────────────────────────────────────────────────────
create table public.comments (
  id          uuid default gen_random_uuid() primary key,
  post_id     uuid references public.posts on delete cascade not null,
  user_id     uuid references public.profiles on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on comments for select using (true);

create policy "Users can insert their own comments"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = user_id);


-- ─── Auto-create profile on signup ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
