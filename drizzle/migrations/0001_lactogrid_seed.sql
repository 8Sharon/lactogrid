-- ============ LactoGrid seed data ============

insert into public.energy_current (id, solar_kw, battery_pct, battery_kwh, cooling_kw, lighting_kw, pump_kw, total_generation_kwh, total_consumption_kwh, battery_cycles, recommendation)
values (1, 5.2, 76, 4.8, 3.4, 0.6, 0.4, 42.6, 38.8, 2, 'Solar generation will be low tomorrow. Consider reducing non-essential loads between 10am-2pm.');

insert into public.system_devices (name, status, detail, icon, sort) values
  ('Solar Panels', 'Generating', '5.2 kW', 'solar', 1),
  ('Battery', '76%', '(4.8 kWh)', 'battery', 2),
  ('Cooling Tank', 'Running', '4°C', 'cooling', 3),
  ('Water Pump', 'Running', '', 'pump', 4),
  ('Lighting', 'On', '', 'light', 5);

insert into public.hourly_forecast (hour, generation_kw, expected_load_kw)
select h,
  case when h between 5 and 20 then round((7.5 * sin(pi() * (h - 5) / 15.0))::numeric, 1) else 0 end,
  round((3.0 + 1.2 * abs(sin(pi() * h / 12.0)) + case when h in (7,8,19,20) then 1.5 else 0 end)::numeric, 1)
from generate_series(0, 23) h;

insert into public.alerts (title, message, severity, is_read, created_at) values
  ('High milk temperature detected', 'A batch from Peter Mutua was received at 5.2°C — above the 5°C cooling threshold. Quality flagged for review.', 'critical', false, now() - interval '25 minutes'),
  ('Battery maintenance due in 3 days', 'Scheduled inspection of the battery bank at Kibwezi hub. Book a technician to avoid downtime during evening milking.', 'warning', false, now() - interval '3 hours'),
  ('Cooling tank filter cleaning reminder', 'The cooling tank filter should be cleaned this week to keep the unit running efficiently.', 'info', false, now() - interval '1 day'),
  ('Daily collection report ready', 'The milk collection summary for ' || to_char(current_date, 'FMDay, DD Mon YYYY') || ' is ready to review in Reports.', 'info', true, now() - interval '2 days');

insert into public.insights (icon, text, sort) values
  ('check', 'Rejection rate improved by 3.3% this month', 1),
  ('down', 'Energy cost reduced by 22% compared to last month', 2),
  ('up', 'Milk volume increased by 11% this month', 3);

insert into public.app_settings (category, title, description, sort) values
  ('system', 'Solar & Battery Configuration', 'Manage your energy system', 1),
  ('system', 'Cooling Tank Settings', 'Set temperature and alerts', 2),
  ('system', 'Notification Preferences', 'Email, SMS and in-app alerts', 3),
  ('account', 'Cooperative Profile', 'Edit your cooperative details', 4),
  ('account', 'Users & Permissions', 'Manage team access', 5),
  ('account', 'Data & Privacy', 'Your data, our priority', 6);

-- Daily metrics: last 15 days ending today (15-day sum = 57,820 L and KSh 1,156,400 revenue)
insert into public.daily_metrics (metric_date, collected_l, chilled_l, rejection_rate, solar_kwh, battery_kwh, grid_kwh, consumption_kwh, revenue_ksh, energy_cost_per_litre)
select current_date - (16 - rn), collected, round(collected * chill_factor), rejection,
  solar, battery, grid, consumption, collected * 20, cost
from (values
  (1, 4100, 0.976, 9.0, 48, 22, 3, 41, 8.7),
  (2, 3950, 0.974, 8.5, 52, 26, 4, 43, 8.6),
  (3, 3800, 0.977, 8.0, 56, 24, 2, 44, 8.4),
  (4, 4050, 0.975, 7.5, 60, 20, 5, 42, 8.3),
  (5, 4200, 0.978, 7.0, 55, 25, 3, 45, 8.1),
  (6, 3850, 0.973, 6.5, 58, 28, 6, 43, 8.0),
  (7, 3900, 0.975, 6.0, 62, 24, 4, 46, 7.9),
  (8, 4170, 0.976, 5.5, 57, 21, 3, 44, 7.7),
  (9, 3050, 0.972, 5.0, 55, 25, 4, 40, 7.6),
  (10, 3200, 0.974, 4.5, 62, 27, 5, 44, 7.4),
  (11, 3600, 0.976, 4.0, 58, 26, 3, 42, 7.3),
  (12, 4100, 0.977, 3.5, 45, 22, 6, 39, 7.1),
  (13, 3800, 0.973, 3.2, 50, 24, 4, 43, 7.0),
  (14, 4200, 0.975, 2.8, 65, 28, 5, 46, 6.9),
  (15, 3850, 0.9722, 2.1, 62, 24, 3, 48, 6.8)
) as v(rn, collected, chill_factor, rejection, solar, battery, grid, consumption, cost);

-- Farmers: 5 named + 143 generated = 148 (142 active)
insert into public.farmers (full_name, phone, status, balance, joined_at) values
  ('Mary Wanjiku', '0722 345 678', 'active', 2400, current_date - 480),
  ('John Kimani', '0731 456 789', 'active', 1850, current_date - 420),
  ('Grace Njeri', '0745 567 890', 'active', 1200, current_date - 365),
  ('Peter Mutua', '0712 678 901', 'active', 950, current_date - 300),
  ('Aisha Mwangi', '0716 789 012', 'active', 1600, current_date - 250);

insert into public.farmers (full_name, phone, status, balance, joined_at)
select
  firsts[1 + (rn % 20)] || ' ' || lasts[1 + ((rn * 7) % 20)],
  '07' || to_char(((rn * 1379) % 900 + 100), 'FM000') || ' ' || to_char(((rn * 631) % 900 + 100), 'FM000') || ' ' || to_char(((rn * 211) % 900 + 100), 'FM000'),
  case when rn % 25 = 0 or rn = 101 then 'inactive' else 'active' end,
  283,
  current_date - ((rn * 13) % 720)
from (
  select rn, array['Joseph','Esther','Samuel','Ruth','Daniel','Naomi','Brian','Faith','Kevin','Lucy','Dennis','Janet','Paul','Cynthia','Victor','Mercy','Simon','Beatrice','Collins','Winnie'] as firsts,
    array['Kamau','Otieno','Achieng','Kiptoo','Chebet','Omondi','Wafula','Njoroge','Kilonzo','Muthoni','Barasa','Cherotich','Odhiambo','Kariuki','Wekesa','Nyambura','Korir','Atieno','Mwendwa','Nduta'] as lasts
  from generate_series(6, 148) rn
) g;

-- Balance total exactly KSh 48,600
update public.farmers set balance = 414
where id = (select id from public.farmers where balance = 283 order by created_at desc limit 1);

-- Today's collections: 5 named rows matching the collage table
insert into public.milk_collections (farmer_id, volume_l, temp_c, quality, collected_at)
select f.id, v.volume, v.temp, v.quality,
  current_date + time '07:30' + (rn * 3 || ' minutes')::interval
from (
  select full_name, volume, temp, quality, row_number() over () as rn
  from (values
    ('Mary Wanjiku', 28, 3.8, 'pass'),
    ('John Kimani', 32, 4.1, 'pass'),
    ('Grace Njeri', 24, 4.5, 'pass'),
    ('Peter Mutua', 18, 5.2, 'check'),
    ('Aisha Mwangi', 21, 4.0, 'pass')
  ) vv(full_name, volume, temp, quality)
) v
join public.farmers f on f.full_name = v.full_name;

-- Generated collections for the other 137 farmers, tuned so today sums to exactly 3,850 L
insert into public.milk_collections (farmer_id, volume_l, temp_c, quality, collected_at)
select f.id,
  20 + (rn % 18),
  3.5 + ((rn * 3) % 14) / 10.0,
  case when rn in (135, 136, 137) then 'check' else 'pass' end,
  current_date + time '06:30' + (rn * 4 || ' minutes')::interval
from public.farmers f
cross join generate_series(1, 137) rn
where f.full_name not in ('Mary Wanjiku','John Kimani','Grace Njeri','Peter Mutua','Aisha Mwangi')
order by f.created_at, rn;

update public.milk_collections
set volume_l = volume_l - 1
where collected_at::date = current_date
  and farmer_id in (select id from public.farmers where full_name not in ('Mary Wanjiku','John Kimani','Grace Njeri','Peter Mutua','Aisha Mwangi'));

update public.milk_collections
set volume_l = volume_l - 1
where id in (
  select m.id from public.milk_collections m
  join public.farmers f on f.id = m.farmer_id
  where m.collected_at::date = current_date
    and f.full_name not in ('Mary Wanjiku','John Kimani','Grace Njeri','Peter Mutua','Aisha Mwangi')
  order by m.volume_l desc limit 2
);

-- Demo account: Sarah Wanjiru, Cooperative Manager (Kibwezi Dairy Cooperative)
do $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = 'sarah@kibwezidairy.co.ke';
  if uid is null then
    insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values (gen_random_uuid(), 'authenticated', 'authenticated', 'sarah@kibwezidairy.co.ke', crypt('Kibwezi2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Wanjiru"}', now(), now())
    returning id into uid;
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, 'email', 'email', jsonb_build_object('sub', uid::text, 'email', 'sarah@kibwezidairy.co.ke'), now(), now(), now());
  end if;
  insert into public.profiles (id, full_name, phone, job_title, cooperative_name, cooperative_location)
  values (uid, 'Sarah Wanjiru', '0722 345 678', 'Cooperative Manager', 'Kibwezi Dairy Cooperative', 'Kibwezi, Makueni')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (uid, 'admin') on conflict do nothing;
end $$;
