-- Create a table for user profiles tracking XP, level, and streaks
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  discriminator text,
  avatar_url text,
  level integer default 1,
  xp integer default 0,
  streak integer default 0,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  unique(username, discriminator)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);


-- Create a trigger to automatically create a profile for every new user
create function public.handle_new_user()
returns trigger as $$
declare
  random_disc text;
  handle text;
  adjectives text[] := array['Crimson', 'Neon', 'Shadow', 'Silent', 'Cosmic', 'Lunar', 'Solar', 'Astral', 'Midnight', 'Zen', 'Cyber', 'Crystal', 'Phantom', 'Hidden', 'Azure', 'Golden', 'Silver'];
  nouns text[] := array['Ronin', 'Samurai', 'Ninja', 'Kitsune', 'Dragon', 'Tiger', 'Kami', 'Oni', 'Tengu', 'Yokai', 'Otaku', 'Sensei', 'Senpai', 'Bushi', 'Kage', 'Neko'];
begin
  random_disc := lpad(floor(random() * 10000)::text, 4, '0');
  
  handle := adjectives[1 + (floor(random() * array_length(adjectives, 1))::int)] || nouns[1 + (floor(random() * array_length(nouns, 1))::int)];
  
  insert into public.profiles (id, username, discriminator, avatar_url)
  values (new.id, handle, random_disc, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
