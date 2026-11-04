"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCombinedGrowth } from "../hooks/useCombinedGrowth";

export default function UserGrowthChart() {
  const { growthData, loading, error } = useCombinedGrowth(3); // last 3 months

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error}</p>;

  // Map weekly growth data for chart
  const chartData =
    growthData?.weeklyGrowth?.map((item: any) => ({
      week: item.label,
      users: item.users,
      doctors: item.doctors,
    })) || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg mb-4">User & Doctor Growth Over Time</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="week" />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="#e91e63" strokeWidth={3} />
          <Line type="monotone" dataKey="doctors" stroke="#2196f3" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
