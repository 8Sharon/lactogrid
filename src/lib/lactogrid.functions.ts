import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const todayStart = () => `${new Date().toISOString().slice(0, 10)}T00:00:00`;

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("full_name, job_title, cooperative_name, cooperative_location")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? { full_name: "Cooperative Manager", job_title: "Cooperative Manager", cooperative_name: "Kibwezi Dairy Cooperative", cooperative_location: "Kibwezi, Makueni" };
  });

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [metricsRes, devicesRes, todayRes] = await Promise.all([
      sb.from("daily_metrics").select("*").order("metric_date", { ascending: false }).limit(8),
      sb.from("system_devices").select("*").order("sort"),
      sb.from("milk_collections").select("volume_l, temp_c, quality").gte("collected_at", todayStart()),
    ]);
    const metrics = metricsRes.data ?? [];
    const m = metrics[0];
    const wk = metrics[metrics.length - 1];
    const rows = todayRes.data ?? [];
    const totalCollected = rows.reduce((s, r) => s + Number(r.volume_l), 0);
    const avgTemp = rows.length ? rows.reduce((s, r) => s + Number(r.temp_c), 0) / rows.length : (m?.avg_temp_c ?? 0);
    const passRate = rows.length ? (100 * rows.filter((r) => r.quality === "pass").length) / rows.length : 0;
    const chillRatio = m && m.collected_l > 0 ? Number(m.chilled_l) / Number(m.collected_l) : 0.97;
    const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
    const week = [...metrics].reverse();
    return {
      stats: {
        totalCollected,
        collectedDelta: pct(totalCollected, Number(wk?.collected_l ?? totalCollected)),
        chilled: totalCollected * chillRatio,
        chilledPct: Math.round(chillRatio * 1000) / 10,
        rejection: m ? Number(m.rejection_rate) : 0,
        rejectionDelta: m && wk ? Math.round((Number(m.rejection_rate) - Number(wk.rejection_rate)) * 10) / 10 : 0,
        energyUsage: m ? Number(m.consumption_kwh) : 0,
        energyDelta: m && wk ? pct(Number(m.consumption_kwh), Number(wk.consumption_kwh)) : 0,
        avgTemp: Math.round(avgTemp * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
      },
      milkChart: week.map((d) => ({
        date: d.metric_date,
        collected: Number(d.collected_l),
        chilled: Number(d.chilled_l),
      })),
      energyChart: week.map((d) => ({
        date: d.metric_date,
        solar: Number(d.solar_kwh),
        battery: Number(d.battery_kwh),
        grid: Number(d.grid_kwh),
      })),
      devices: (devicesRes.data ?? []).map((d) => ({ ...d, detail: d.detail ?? "" })),
    };
  });

export const getEnergy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [cur, fc] = await Promise.all([
      sb.from("energy_current").select("*").eq("id", 1).single(),
      sb.from("hourly_forecast").select("*").order("hour"),
    ]);
    return {
      current: cur.data,
      forecast: (fc.data ?? []).map((f) => ({
        hour: f.hour,
        generation: Number(f.generation_kw),
        load: Number(f.expected_load_kw),
      })),
    };
  });

export const getMilkCollection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [collRes, metricsRes, farmersRes] = await Promise.all([
      sb.from("milk_collections").select("volume_l, temp_c, quality, collected_at, farmers!inner(full_name)").gte("collected_at", todayStart()).order("collected_at", { ascending: false }),
      sb.from("daily_metrics").select("*").order("metric_date", { ascending: false }).limit(8),
      sb.from("farmers").select("id", { count: "exact" }),
    ]);
    const rows = collRes.data ?? [];
    const metrics = metricsRes.data ?? [];
    const m = metrics[0];
    const yest = metrics[1];
    const totalCollected = rows.reduce((s, r) => s + Number(r.volume_l), 0);
    const avgTemp = rows.length ? rows.reduce((s, r) => s + Number(r.temp_c), 0) / rows.length : 0;
    const passRate = rows.length ? (100 * rows.filter((r) => r.quality === "pass").length) / rows.length : 0;
    const newThisWeek = await sb.from("farmers").select("id", { count: "exact" }).gte("joined_at", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
    const week = [...metrics].reverse();
    return {
      stats: {
        totalCollected,
        collectedDelta: yest ? Math.round(((totalCollected - Number(yest.collected_l)) / Number(yest.collected_l)) * 1000) / 10 : 0,
        avgTemp: Math.round(avgTemp * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        passRateDelta: m ? Math.round((100 - Number(m.rejection_rate) - (100 - Number(yest?.rejection_rate ?? m.rejection_rate))) * 10) / 10 : 0,
        farmerCount: farmersRes.count ?? 0,
        newFarmers: newThisWeek.count ?? 0,
      },
      trends: week.map((d) => ({ date: d.metric_date, volume: Number(d.collected_l), temp: Number(d.avg_temp_c) })),
      recent: rows.slice(0, 5).map((r) => ({
        farmer: (r as { farmers?: { full_name?: string } }).farmers?.full_name ?? "",
        volume: Number(r.volume_l),
        temp: Number(r.temp_c),
        quality: r.quality,
        time: r.collected_at,
      })),
    };
  });

export const getFarmers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string; page?: number }) => z.object({ search: z.string().optional(), page: z.number().optional() }).parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const sb = context.supabase;
    const search = (data.search ?? "").trim().toLowerCase();
    const page = Math.max(1, data.page ?? 1);
    const [farmersRes, collRes, newMonthRes] = await Promise.all([
      sb.from("farmers").select("*").order("created_at"),
      sb.from("milk_collections").select("farmer_id, volume_l, temp_c").gte("collected_at", todayStart()),
      sb.from("farmers").select("id", { count: "exact" }).gte("joined_at", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
    ]);
    const all = farmersRes.data ?? [];
    const todayMap = new Map((collRes.data ?? []).map((c) => [c.farmer_id, c]));
    const todayTotal = (collRes.data ?? []).reduce((s, c) => s + Number(c.volume_l), 0);
    const filtered = search
      ? all.filter((f) => f.full_name.toLowerCase().includes(search) || f.phone.toLowerCase().includes(search))
      : all;
    const pageSize = 5;
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const p = Math.min(page, pages);
    const slice = filtered.slice((p - 1) * pageSize, p * pageSize);
    return {
      stats: {
        total: all.length,
        active: all.filter((f) => f.status === "active").length,
        avgDaily: all.length ? Math.round((todayTotal / all.length) * 10) / 10 : 0,
        totalBalance: all.reduce((s, f) => s + Number(f.balance), 0),
        newThisMonth: newMonthRes.count ?? 0,
      },
      rows: slice.map((f, i) => {
        const c = todayMap.get(f.id);
        return {
          n: (p - 1) * pageSize + i + 1,
          id: f.id,
          name: f.full_name,
          phone: f.phone,
          litToday: c ? Number(c.volume_l) : 0,
          temp: c ? Number(c.temp_c) : 0,
          status: f.status,
          balance: Number(f.balance),
        };
      }),
      page: p,
      pages,
      total: filtered.length,
    };
  });

export const getReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [metricsRes, insightsRes] = await Promise.all([
      sb.from("daily_metrics").select("*").order("metric_date"),
      sb.from("insights").select("*").order("sort"),
    ]);
    const metrics = metricsRes.data ?? [];
    const last7 = metrics.slice(-7);
    const prev = metrics.slice(0, Math.max(1, metrics.length - 7));
    const sum = (arr: typeof metrics, k: "collected_l" | "revenue_ksh" | "consumption_kwh" | "solar_kwh") => arr.reduce((s, d) => s + Number(d[k]), 0);
    const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
    const last = metrics[metrics.length - 1];
    return {
      stats: {
        totalCollected: sum(metrics, "collected_l"),
        collectedDelta: pct(sum(last7, "collected_l"), sum(prev, "collected_l")),
        totalRevenue: sum(metrics, "revenue_ksh"),
        revenueDelta: pct(sum(last7, "revenue_ksh"), sum(prev, "revenue_ksh")),
        costPerLitre: last ? Number(last.energy_cost_per_litre) : 0,
        costDelta: last ? pct(Number(last.energy_cost_per_litre), Number(prev[prev.length - 1]?.energy_cost_per_litre ?? last.energy_cost_per_litre)) : 0,
      },
      days: metrics.map((d) => ({
        date: d.metric_date,
        collected: Number(d.collected_l),
        rejection: Number(d.rejection_rate),
        solar: Number(d.solar_kwh),
        consumption: Number(d.consumption_kwh),
        revenue: Number(d.revenue_ksh),
        quality: Math.round((100 - Number(d.rejection_rate)) * 10) / 10,
      })),
      insights: insightsRes.data ?? [],
    };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [metricsRes, topRes] = await Promise.all([
      sb.from("daily_metrics").select("*").order("metric_date"),
      sb.from("milk_collections").select("volume_l, temp_c, farmers!inner(full_name)").gte("collected_at", todayStart()).order("volume_l", { ascending: false }).limit(5),
    ]);
    const metrics = metricsRes.data ?? [];
    const solar = metrics.reduce((s, d) => s + Number(d.solar_kwh), 0);
    const battery = metrics.reduce((s, d) => s + Number(d.battery_kwh), 0);
    const grid = metrics.reduce((s, d) => s + Number(d.grid_kwh), 0);
    return {
      collectionByDay: metrics.map((d) => ({ date: d.metric_date, collected: Number(d.collected_l), chilled: Number(d.chilled_l) })),
      energyMix: [
        { name: "Solar", value: Math.round(solar) },
        { name: "Battery", value: Math.round(battery) },
        { name: "Grid", value: Math.round(grid) },
      ],
      topFarmers: (topRes.data ?? []).map((r) => ({
        name: (r as { farmers?: { full_name?: string } }).farmers?.full_name ?? "",
        volume: Number(r.volume_l),
        temp: Number(r.temp_c),
      })),
    };
  });

export const getAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("alerts").select("*").order("created_at", { ascending: false });
    const alerts = data ?? [];
    return { alerts, unread: alerts.filter((a) => !a.is_read).length };
  });

export const markAlertRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await context.supabase.from("alerts").update({ is_read: true }).eq("id", data.id);
    return { ok: true };
  });

export const addFarmer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { full_name: string; phone: string }) =>
    z.object({
      full_name: z.string().trim().min(2).max(100),
      phone: z.string().trim().max(20).optional().default(""),
    }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("farmers")
      .insert({ full_name: data.full_name, phone: data.phone })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const addCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farmer_id: string; volume_l: number; temp_c: number }) =>
    z.object({
      farmer_id: z.string().uuid(),
      volume_l: z.coerce.number().positive().max(200),
      temp_c: z.coerce.number().min(-2).max(40),
    }).parse(input))
  .handler(async ({ context, data }) => {
    const quality = data.temp_c > 5 ? "check" : "pass";
    const { error } = await context.supabase
      .from("milk_collections")
      .insert({ farmer_id: data.farmer_id, volume_l: data.volume_l, temp_c: data.temp_c, quality });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listFarmerOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("farmers").select("id, full_name").order("full_name");
    return data ?? [];
  });
