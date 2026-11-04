"use client";

import { useEffect, useState } from "react";
import { getAdvocacyStats } from "../../../services/AdvocacyService";
import { ArrowLeft, FileText, CheckCircle2, Eye } from "lucide-react";
import NextLink from "next/link";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";

export default function AdvocacyAnalytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdvocacyStats().then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-on-surface-variant">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NextLink
          href="/dashboard/advocacy"
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={20} /> Back
        </NextLink>
        <h1 className="text-2xl font-bold text-on-surface">Advocacy Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Articles" value={stats.totalArticles} icon={<FileText size={18} />} />
        <StatCard label="Published" value={stats.publishedArticles} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Total Views" value={stats.totalViews} icon={<Eye size={18} />} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-on-surface">Top Categories</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stats.categoryStats.map((c: any) => (
            <Card key={c._id}>
              <p className="text-sm text-on-surface-variant">{c._id}</p>
              <p className="text-lg font-semibold text-on-surface">{c.count} articles</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Views: {c.views} • Likes: {c.likes}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
