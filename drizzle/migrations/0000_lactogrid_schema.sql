do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception
  when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text default '',
  job_title text default 'Cooperative Manager',
  cooperative_name text not null default 'Kibwezi Dairy Cooperative',
  cooperative_location text not null default 'Kibwezi, Makueni',
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

create table public.farmers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null default '',
  status text not null default 'active' check (status in ('active','inactive')),
  balance numeric not null default 0,
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.milk_collections (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.farmers(id) on delete cascade not null,
  volume_l numeric not null check (volume_l > 0),
  temp_c numeric not null,
  quality text not null default 'pass' check (quality in ('pass','check')),
  collected_at timestamptz not null default now()
);

create table public.daily_metrics (
  metric_date date primary key,
  collected_l numeric not null default 0,
  chilled_l numeric not null default 0,
  rejection_rate numeric not null default 0,
  solar_kwh numeric not null default 0,
  battery_kwh numeric not null default 0,
  grid_kwh numeric not null default 0,
  consumption_kwh numeric not null default 0,
  revenue_ksh numeric not null default 0,
  energy_cost_per_litre numeric not null default 0
);

create table public.energy_current (
  id integer primary key default 1 check (id = 1),
  solar_kw numeric not null default 0,
  battery_pct numeric not null default 0,
  battery_kwh numeric not null default 0,
  cooling_kw numeric not null default 0,
  lighting_kw numeric not null default 0,
  pump_kw numeric not null default 0,
  total_generation_kwh numeric not null default 0,
  total_consumption_kwh numeric not null default 0,
  battery_cycles integer not null default 0,
  recommendation text not null default '',
  updated_at timestamptz not null default now()
);

create table public.system_devices (
  id integer primary key generated always as identity,
  name text not null,
  status text not null,
  detail text not null default '',
  icon text not null default 'solar',
  sort integer not null default 0
);

create table public.hourly_forecast (
  hour integer primary key,
  generation_kw numeric not null default 0,
  expected_load_kw numeric not null default 0
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null default '',
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.insights (
  id integer primary key generated always as identity,
  icon text not null default 'check',
  text text not null,
  sort integer not null default 0
);

create table public.app_settings (
  id integer primary key generated always as identity,
  category text not null check (category in ('system','account')),
  title text not null,
  description text not null default '',
  sort integer not null default 0
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
grant select, insert, update, delete on public.farmers to authenticated;
grant all on public.farmers to service_role;
grant select, insert, update, delete on public.milk_collections to authenticated;
grant all on public.milk_collections to service_role;
grant select, insert, update, delete on public.daily_metrics to authenticated;
grant all on public.daily_metrics to service_role;
grant select, insert, update, delete on public.energy_current to authenticated;
grant all on public.energy_current to service_role;
grant select, insert, update, delete on public.system_devices to authenticated;
grant all on public.system_devices to service_role;
grant select, insert, update, delete on public.hourly_forecast to authenticated;
grant all on public.hourly_forecast to service_role;
grant select, insert, update, delete on public.alerts to authenticated;
grant all on public.alerts to service_role;
grant select, insert, update, delete on public.insights to authenticated;
grant all on public.insights to service_role;
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.farmers enable row level security;
alter table public.milk_collections enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.energy_current enable row level security;
alter table public.system_devices enable row level security;
alter table public.hourly_forecast enable row level security;
alter table public.alerts enable row level security;
alter table public.insights enable row level security;
alter table public.app_settings enable row level security;

create policy "Authenticated users can read profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Authenticated users can read roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated full access farmers" on public.farmers for all to authenticated using (true) with check (true);
create policy "Authenticated full access collections" on public.milk_collections for all to authenticated using (true) with check (true);
create policy "Authenticated full access daily metrics" on public.daily_metrics for all to authenticated using (true) with check (true);
create policy "Authenticated full access energy current" on public.energy_current for all to authenticated using (true) with check (true);
create policy "Authenticated full access devices" on public.system_devices for all to authenticated using (true) with check (true);
create policy "Authenticated full access forecast" on public.hourly_forecast for all to authenticated using (true) with check (true);
create policy "Authenticated full access alerts" on public.alerts for all to authenticated using (true) with check (true);
create policy "Authenticated full access insights" on public.insights for all to authenticated using (true) with check (true);
create policy "Authenticated full access app settings" on public.app_settings for all to authenticated using (true) with check (true);
