-- Añade updated_at a buildings, assets y manuals, y lo mantiene
-- actualizado automáticamente en cada modificación.

alter table buildings add column if not exists updated_at timestamptz not null default now();
alter table assets add column if not exists updated_at timestamptz not null default now();
alter table manuals add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on buildings;
create trigger set_updated_at
  before update on buildings
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on assets;
create trigger set_updated_at
  before update on assets
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on manuals;
create trigger set_updated_at
  before update on manuals
  for each row execute procedure public.set_updated_at();
