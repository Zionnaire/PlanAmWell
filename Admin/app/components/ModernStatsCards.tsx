"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, Clock, DollarSign } from "lucide-react";
import { useCombinedGrowth } from "../hooks/useCombinedGrowth";
import { getAllOrdersService } from "../services/AdminService";
import { StatCard } from "./ui/StatCard";
import { Card } from "./ui/Card";

type StatItem = {
  title: string;
  value: string | number;
  growth: number;
  icon: any;
};

export default function ModernStatsCards() {
  const { growthData, loading, error } = useCombinedGrowth(1); // last month

  // The backend's combinedGrowth endpoint has no concept of revenue, so this
  // card used to just render `$0` forever. Orders already carry a reliable
  // `total`/`paymentStatus`, and the Orders page sums those client-side for
  // its own "Total Revenue" stat — mirror that here, scoped to the current
  // calendar month, since there's no dedicated revenue aggregate endpoint yet.
  const [revenue, setRevenue] = useState<{ current: number; growth: number }>({ current: 0, growth: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadRevenue = async () => {
      try {
        const orders = await getAllOrdersService();
        const paidOrders = (orders || []).filter((o: any) => o.paymentStatus === "paid");

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthRevenue = paidOrders
          .filter((o: any) => o.createdAt && new Date(o.createdAt) >= currentMonthStart)
          .reduce((sum: number, o: any) => sum + Number(o.total ?? 0), 0);

        const previousMonthRevenue = paidOrders
          .filter(
            (o: any) =>
              o.createdAt && new Date(o.createdAt) >= previousMonthStart && new Date(o.createdAt) < currentMonthStart
          )
          .reduce((sum: number, o: any) => sum + Number(o.total ?? 0), 0);

        const growth = previousMonthRevenue
          ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
          : currentMonthRevenue
          ? 100
          : 0;

        if (!cancelled) setRevenue({ current: currentMonthRevenue, growth });
      } catch (err) {
        console.error("Failed to fetch orders for Monthly Revenue stat", err);
      }
    };

    loadRevenue();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-surface-container-low" />
        ))}
      </div>
    );
  }

  if (error || !growthData) return null;

  const stats: StatItem[] = [
    {
      title: "Total Users",
      value: growthData.totalUsers,
      growth: Number(growthData.userGrowthPercentage) || 0,
      icon: Users,
    },
    {
      title: "Active Doctors",
      value: growthData.totalApprovedDoctors,
      growth: Number(growthData.doctorGrowthPercentage) || 0,
      icon: Stethoscope,
    },
    {
      title: "Pending Approvals",
      value: growthData.totalPendingDoctors,
      growth: Number(growthData.pendingGrowthPercentage) || 0,
      icon: Clock,
    },
    {
      title: "Monthly Revenue",
      value: `₦${revenue.current.toLocaleString()}`,
      growth: Number(revenue.growth.toFixed(2)) || 0,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.title}
          label={item.title}
          value={item.value}
          growth={item.growth}
          icon={<item.icon size={20} />}
        />
      ))}
    </div>
  );
}
