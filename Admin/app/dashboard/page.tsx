import ModernStatsCards from "../components/ModernStatsCards";
import GrowthBarChart from "../components/GrowthBarChart";
import DoctorStatusChart from "../components/DoctorStatusChart";
import RecentUsers from "../components/RecentUsers";
import PendingDoctors from "../components/PendingDoctors";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* KPI Section */}
      <ModernStatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthBarChart />
        </div>
        <DoctorStatusChart />
      </div>

      {/* Activity Section — PendingDoctors is a full data table (5 cols +
          row actions), so it stays full-width rather than squeezed into a
          half-width column next to RecentUsers's simple list. */}
      <div className="space-y-6">
        <RecentUsers />
        <PendingDoctors />
      </div>
    </div>
  );
}
