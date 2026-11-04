"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { adminGetAllArticles } from "../../../services/AdvocacyService";
import { ArrowLeft, Edit } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const STATUS_TONE: Record<string, "success" | "warning" | "neutral" | "info"> = {
  published: "success",
  draft: "neutral",
  scheduled: "info",
};

function AdminArticleView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminGetAllArticles()
      .then((res) => setArticle(res.data.find((x: any) => x._id === id)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-on-surface-variant">Loading...</p>;
  if (!article) return <p className="text-on-surface-variant">Article not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/advocacy")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <Button variant="outline" onClick={() => router.push(`/dashboard/advocacy/edit?id=${id}`)}>
          <Edit size={16} /> Edit Article
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Badge tone={STATUS_TONE[article.status] || "neutral"} className="capitalize">
            {article.status || "draft"}
          </Badge>
          <span className="text-sm text-on-surface-variant">
            {article.partner ? `By ${article.partner}` : article.author?.name ? `By ${article.author.name}` : "Partner: N/A"}
          </span>
        </div>
        <h1 className="mb-6 text-3xl font-bold text-on-surface">{article.title}</h1>
        {article.featuredImage?.url && (
          <img src={article.featuredImage.url} alt="" className="mb-6 w-full rounded-2xl object-cover" />
        )}
        <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </Card>
    </div>
  );
}

export default function AdminArticleViewPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading...</p>}>
      <AdminArticleView />
    </Suspense>
  );
}
