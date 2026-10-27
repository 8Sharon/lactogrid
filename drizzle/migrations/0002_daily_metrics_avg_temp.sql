alter table public.daily_metrics add column avg_temp_c numeric not null default 0;

update public.daily_metrics set avg_temp_c = v.t
from (values
  ('1', 4.6), ('2', 4.5), ('3', 4.5), ('4', 4.4), ('5', 4.4), ('6', 4.3), ('7', 4.3),
  ('8', 4.2), ('9', 4.4), ('10', 4.3), ('11', 4.2), ('12', 4.3), ('13', 4.2), ('14', 4.1)
) as v(day, t)
where metric_date = current_date - (16 - v.day::int);

update public.daily_metrics set avg_temp_c = 4.2 where metric_date = current_date;

grant select, insert, update, delete on public.daily_metrics to authenticated;
grant all on public.daily_metrics to service_role;