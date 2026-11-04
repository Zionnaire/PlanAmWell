"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useCombinedGrowth } from "../hooks/useCombinedGrowth";
import { Card } from "./ui/Card";

export default function GrowthStackedBarChart() {
  const { growthData, loading, error } = useCombinedGrowth(3);

  if (loading || error || !growthData) return null;

  const data =
    growthData?.weeklyGrowth?.map((w: any) => ({
      week: w.label,
      Users: Number(w.users) || 0,
      Doctors: Number(w.doctors) || 0,
    })) || [];

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-on-surface">Weekly Users &amp; Doctors</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-variant)" />
          <XAxis dataKey="week" tick={{ fill: "var(--color-on-surface-variant)" }} />
          <YAxis tick={{ fill: "var(--color-on-surface-variant)" }} />
          <Tooltip
            formatter={(value: any, name: string) => [value.toLocaleString(), name]}
            contentStyle={{
              background: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-surface-variant)",
              borderRadius: 12,
              color: "var(--color-on-surface)",
            }}
            labelStyle={{ color: "var(--color-on-surface)" }}
          />
          <Legend wrapperStyle={{ color: "var(--color-on-surface-variant)" }} />
          <Bar dataKey="Users" stackId="a" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Doctors" stackId="a" fill="var(--color-tertiary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
