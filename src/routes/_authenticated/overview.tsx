import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { Droplets, Snowflake, ShieldCheck, Zap, Sun } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getOverview } from "@/lib/lactogrid.functions";
import { StatCard, PageHeader, Panel } from "@/components/lactogrid/bits";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({
    meta: [
      { title: "Overview — LactoGrid" },
      { name: "description", content: "Real-time performance of your dairy cooperative: milk chilled, rejection rate, energy usage and system status." },
      { property: "og:title", content: "Overview — LactoGrid" },
      { property: "og:description", content: "Real-time performance of your dairy cooperative." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

const fmtDay = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Overview() {
  const getOverviewFn = useServerFn(getOverview);
  const { data } = useSuspenseQuery({ queryKey: ["overview"], queryFn: getOverviewFn });
  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const s = data.stats;
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Overview"
        subtitle="Real-time performance of your dairy cooperative"
        right={
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">{today}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 font-medium shadow-sm">
              <Sun className="h-4 w-4 text-[#f5b50a]" /> 22°C Sunny
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Droplets className="h-5 w-5" />}
          iconBg="bg-primary"
          label="Total Milk Collected"
          value={`${fmt(s.totalCollected)} L`}
          sub={`${s.collectedDelta >= 0 ? "+" : ""}${s.collectedDelta}% vs last week`}
        />
        <StatCard
          icon={<Snowflake className="h-5 w-5" />}
          iconBg="bg-[color:var(--color-chart-1)]"
          label="Milk Chilled"
          value={`${fmt(s.chilled)} L`}
          sub={`${Math.round(s.chilledPct)}% of collected`}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          iconBg="bg-destructive"
          label="Rejection Rate"
          value={`${s.rejection}%`}
          sub={`${s.rejectionDelta > 0 ? "+" : ""}${s.rejectionDelta}% vs last week`}
          subTone={s.rejectionDelta <= 0 ? "positive" : "negative"}
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          iconBg="bg-[color:var(--color-chart-3)]"
          label="Energy Usage"
          value={`${s.energyUsage} kWh`}
          sub={`${s.energyDelta >= 0 ? "+" : ""}${s.energyDelta}% vs last week`}
          subTone={s.energyDelta <= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Milk Collection & Cooling">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.milkChart.map((d) => ({ ...d, label: fmtDay(d.date) }))} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="collected" name="Collected" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chilled" name="Chilled" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Energy Generation & Usage">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.energyChart.map((d) => ({ ...d, label: fmtDay(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="solar" name="Solar Generation" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="battery" name="Battery" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="grid" name="Grid" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="System Status">
          <ul className="space-y-4">
            {data.devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.status} {d.detail}</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-positive" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export function OverviewPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading overview…</div>}>
      <Overview />
    </Suspense>
  );
}
