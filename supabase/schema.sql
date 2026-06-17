-- Esquema inicial: gestión de mantenimiento de instalaciones contra incendios

create type asset_type as enum ('extintor', 'bie', 'detector', 'central', 'compuerta');
create type event_type as enum ('revision', 'incidencia', 'retimbrado', 'sustitucion');
create type asset_status as enum ('ok', 'aviso', 'vencido', 'fuera_de_servicio');

create table buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  type asset_type not null,
  code text,
  location text,
  brand text,
  model text,
  serial_number text,
  install_date date,
  expiry_date date,
  last_check_date date,
  next_due_date date,
  status asset_status not null default 'ok',
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index assets_building_id_idx on assets(building_id);
create index assets_type_idx on assets(type);
create index assets_next_due_date_idx on assets(next_due_date);

create table manuals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text,
  model text,
  asset_type asset_type,
  file_url text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table maintenance_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  event_date date not null default current_date,
  event_type event_type not null,
  description text,
  technician text,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index maintenance_events_asset_id_idx on maintenance_events(asset_id);
create index maintenance_events_event_date_idx on maintenance_events(event_date);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'tecnico',
  created_at timestamptz not null default now()
);

-- Row Level Security: cualquier usuario autenticado puede leer/escribir
-- (equipo de confianza pequeño; se puede restringir por rol más adelante)

alter table buildings enable row level security;
alter table assets enable row level security;
alter table manuals enable row level security;
alter table maintenance_events enable row level security;
alter table profiles enable row level security;

create policy "authenticated full access" on buildings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on assets
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on manuals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on maintenance_events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "users read all profiles" on profiles
  for select using (auth.role() = 'authenticated');

create policy "users update own profile" on profiles
  for update using (auth.uid() = id);

-- Crea automáticamente un profile al registrarse un usuario nuevo
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), 'tecnico');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket de Storage para manuales y adjuntos (ejecutar tras crear el bucket "manuals" en Studio > Storage)
