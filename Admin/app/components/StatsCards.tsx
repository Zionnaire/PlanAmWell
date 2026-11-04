"use client";

import { Users, Stethoscope, Clock, DollarSign } from "lucide-react";
import { useCombinedGrowth } from "../hooks/useCombinedGrowth";

export default function ModernStatsCards() {
  const { growthData, loading, error } = useCombinedGrowth(1);

  if (loading) return null;
  if (error) return null;

  const stats = [
    {
      title: "Total Users",
      value: growthData?.totalUsers ?? 0,
      growth: growthData?.userGrowthPercentage ?? 0,
      icon: Users,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Active Doctors",
      value: growthData?.totalApprovedDoctors ?? 0,
      growth: growthData?.doctorGrowthPercentage ?? 0,
      icon: Stethoscope,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      title: "Pending Approvals",
      value: growthData?.totalPendingDoctors ?? 0,
      growth: growthData?.pendingGrowthPercentage ?? 0,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Monthly Revenue",
      value: `$${growthData?.monthlyRevenue ?? 0}`,
      growth: growthData?.revenueGrowthPercent ?? 0,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {stats.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm"
          >
            <div
              className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-linear-to-br ${item.gradient} opacity-20`}
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </p>
                <span
                  className={`text-xs font-medium ${
                    item.growth < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {item.growth.toFixed(1)}%
                </span>
              </div>
              <div
                className={`p-3 rounded-xl bg-linear-to-br ${item.gradient} text-white`}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
