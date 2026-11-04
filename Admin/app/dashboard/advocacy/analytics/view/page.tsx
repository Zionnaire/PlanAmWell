"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getArticleStats } from "../../../../services/AdvocacyService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowLeft, Eye, Heart, Share2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { StatCard } from "../../../../components/ui/StatCard";
import { Badge } from "../../../../components/ui/Badge";
import { useCssVarColor } from "../../../../hooks/useCssVarColor";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function authorNameOf(entity: any): string {
  if (!entity?.author) return "Anonymous";
  if (typeof entity.author === "string") return entity.author;
  return entity.author.name || "Anonymous";
}

function ArticleAnalytics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const primaryColor = useCssVarColor("--color-primary", "#b10045");
  const gridColor = useCssVarColor("--color-surface-variant", "#e5e2e1");
  const tickColor = useCssVarColor("--color-on-surface-variant", "#5b4043");

  useEffect(() => {
    if (!id) return;
    getArticleStats(id)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-on-surface-variant">Loading analytics...</p>;
  if (!stats) return <p className="text-error">No stats available for this article.</p>;

  const { article } = stats;

  const dailyViewsChart = {
    labels: article.dailyViews?.map((d: any) => d.date) || [],
    datasets: [
      {
        label: "Daily Views",
        data: article.dailyViews?.map((d: any) => d.views) || [],
        backgroundColor: primaryColor,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor }, grid: { color: gridColor } },
    },
    plugins: {
      legend: { labels: { color: tickColor } },
    },
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-2xl font-bold text-on-surface">{article.title} — Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Views" value={article.views} icon={<Eye size={18} />} />
        <StatCard label="Likes" value={article.likes} icon={<Heart size={18} />} />
        <StatCard label="Shares" value={article.shares || 0} icon={<Share2 size={18} />} />
      </div>

      {(article.partner || article.category || article.tags?.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {article.partner && (
            <Card>
              <p className="text-sm text-on-surface-variant">Partner</p>
              <p className="font-semibold text-on-surface">{article.partner}</p>
            </Card>
          )}
          {article.category && (
            <Card>
              <p className="text-sm text-on-surface-variant">Category</p>
              <p className="font-semibold text-on-surface">{article.category}</p>
            </Card>
          )}
          {article.tags?.length > 0 && (
            <Card>
              <p className="text-sm text-on-surface-variant">Tags</p>
              <p className="font-semibold text-on-surface">{article.tags.join(", ")}</p>
            </Card>
          )}
        </div>
      )}

      {article.referrers?.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-on-surface">Top Referrers</h2>
          <ul className="space-y-1 text-sm text-on-surface-variant">
            {article.referrers.map((r: any, i: number) => (
              <li key={i}>
                {r.source} — {r.count} views
              </li>
            ))}
          </ul>
        </Card>
      )}

      {article.dailyViews?.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-on-surface">Daily Views</h2>
          <Bar data={dailyViewsChart} options={chartOptions} />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {article.topCountries?.length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold text-on-surface">Top Countries</h2>
            <ul className="space-y-1 text-sm text-on-surface-variant">
              {article.topCountries.map((c: any, i: number) => (
                <li key={i}>
                  {c.country} — {c.views} views
                </li>
              ))}
            </ul>
          </Card>
        )}

        {article.topDevices?.length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold text-on-surface">Top Devices</h2>
            <ul className="space-y-1 text-sm text-on-surface-variant">
              {article.topDevices.map((d: any, i: number) => (
                <li key={i}>
                  {d.device} — {d.views} views
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {article.comments?.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-on-surface">Comments ({article.comments.length})</h2>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {article.comments.map((comment: any) => (
              <div key={comment._id} className="border-b border-surface-variant pb-2 last:border-none">
                <p className="text-sm font-semibold text-on-surface">
                  {authorNameOf(comment)}{" "}
                  {comment.status === "flagged" && (
                    <Badge tone="error" className="ml-2">
                      Flagged{comment.flagReason ? `: ${comment.flagReason}` : ""}
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-on-surface-variant">{comment.content}</p>
                <div className="mt-1 text-xs text-on-surface-variant">
                  {new Date(comment.createdAt).toLocaleString()} • {comment.likes || 0} likes
                </div>

                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2">
                    {comment.replies.map((reply: any) => (
                      <div key={reply._id} className="border-l-2 border-surface-variant pl-3">
                        <p className="text-sm font-semibold text-on-surface">
                          {authorNameOf(reply)}{" "}
                          {reply.status === "flagged" && (
                            <Badge tone="error" className="ml-2">
                              Flagged{reply.flagReason ? `: ${reply.flagReason}` : ""}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-on-surface-variant">{reply.content}</p>
                        <div className="mt-1 text-xs text-on-surface-variant">
                          {new Date(reply.createdAt).toLocaleString()} • {reply.likes || 0} likes
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ArticleAnalyticsPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading analytics...</p>}>
      <ArticleAnalytics />
    </Suspense>
  );
}
