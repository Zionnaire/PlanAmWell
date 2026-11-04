"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useCombinedGrowth } from "../hooks/useCombinedGrowth";
import { Card } from "./ui/Card";

const COLORS = ["var(--color-primary)", "var(--color-secondary-container)", "var(--color-chart-negative)"]; // Approved / Pending / Rejected

export default function DoctorStatusChart() {
  const { growthData, loading, error } = useCombinedGrowth(1);

  if (loading || error) return null;

  const data = [
    { name: "Approved", value: growthData?.totalApprovedDoctors ?? 0 },
    { name: "Pending", value: growthData?.totalPendingDoctors ?? 0 },
    { name: "Rejected", value: growthData?.totalRejectedDoctors ?? 0 },
  ];

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-on-surface">Doctor Approval Status</h3>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-surface-variant)",
              borderRadius: 12,
              color: "var(--color-on-surface)",
            }}
          />
          <Legend wrapperStyle={{ color: "var(--color-on-surface-variant)" }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
