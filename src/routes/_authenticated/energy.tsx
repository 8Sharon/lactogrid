import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { Sun, BatteryCharging, Snowflake, Lightbulb, Droplets, Cpu } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getEnergy } from "@/lib/lactogrid.functions";
import { PageHeader, Panel } from "@/components/lactogrid/bits";

export const Route = createFileRoute("/_authenticated/energy")({
  head: () => ({
    meta: [
      { title: "Energy Management — LactoGrid" },
      { name: "description", content: "Monitor and control your solar, battery and loads with AI-optimized dispatch." },
      { property: "og:title", content: "Energy Management — LactoGrid" },
      { property: "og:description", content: "Monitor and control your solar, battery and loads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnergyPage,
});

const hourLabel = (h: number) => (h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`);

function Energy() {
  const getEnergyFn = useServerFn(getEnergy);
  const { data } = useSuspenseQuery({ queryKey: ["energy"], queryFn: getEnergyFn });
  const c = data.current;
  const forecast = data.forecast.filter((f) => f.hour % 6 === 0 ? true : f.hour >= 5 && f.hour <= 21);
  const chartData = data.forecast.map((f) => ({ ...f, label: hourLabel(f.hour) }));

  const loads = [
    { icon: Snowflake, name: "Cooling Tank", kw: `${c.cooling_kw} kW`, color: "bg-[color:var(--color-chart-1)]" },
    { icon: Lightbulb, name: "Lighting", kw: `${c.lighting_kw} kW`, color: "bg-[color:var(--color-chart-3)]" },
    { icon: Droplets, name: "Water Pump", kw: `${c.pump_kw} kW`, color: "bg-[color:var(--color-chart-2)]" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Energy Management" subtitle="Monitor and control your solar, battery and loads" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Current Energy Flow">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--color-chart-3)]/20">
                  <Sun className="h-5 w-5 text-[#d9a406]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Solar Panels</p>
                  <p className="text-xs text-muted-foreground">{c.solar_kw} kW</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--color-chart-4)]/20">
                  <BatteryCharging className="h-5 w-5 text-[color:var(--color-chart-4)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Battery</p>
                  <p className="text-xs text-muted-foreground">{c.battery_pct}% · {c.battery_kwh} kWh</p>
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Smart Controller</p>
                </div>
                <p className="mt-0.5 text-xs text-primary">AI Optimized</p>
              </div>
            </div>
            <div className="space-y-3">
              {loads.map((l) => (
                <div key={l.name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${l.color}`}>
                    <l.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.kw}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Energy Forecast (Next 24h)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="generation" name="Solar Generation" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#gen)" />
              <Area type="monotone" dataKey="load" name="Expected Load" stroke="var(--color-chart-1)" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Today's Energy Summary" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Total Generation</p>
              <p className="mt-1 text-xl font-bold">{c.total_generation_kwh} kWh</p>
            </div>
            <div className="rounded-xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Total Consumption</p>
              <p className="mt-1 text-xl font-bold">{c.total_consumption_kwh} kWh</p>
            </div>
            <div className="rounded-xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Battery Cycles</p>
              <p className="mt-1 text-xl font-bold">{c.battery_cycles} cycles</p>
            </div>
          </div>
        </Panel>

        <Panel className="bg-primary text-primary-foreground">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Cpu className="h-4 w-4" /> AI Recommendation
          </div>
          <p className="text-sm leading-relaxed text-primary-foreground/90">{c.recommendation}</p>
          <button className="mt-4 rounded-lg bg-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/25">
            View Details
          </button>
        </Panel>
      </div>
    </div>
  );
}

export function EnergyPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading energy data…</div>}>
      <Energy />
    </Suspense>
  );
}
