"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getArticleBySlug } from "../../../services/AdvocacyService";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { Card } from "../../../components/ui/Card";

function PublicArticleView() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    getArticleBySlug(slug)
      .then((res) => setArticle(res))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-on-surface-variant">Loading...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!article) return <p className="text-on-surface-variant">Article not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <NextLink
        href="/dashboard/advocacy"
        className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={18} /> Back
      </NextLink>

      <Card>
        <h1 className="mb-2 text-3xl font-bold text-on-surface">{article.title}</h1>
        <p className="mb-6 text-sm text-on-surface-variant">
          {article.author?.name ? `By ${article.author.name}` : ""}
        </p>
        {article.featuredImage?.url && (
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || ""}
            className="mb-6 w-full rounded-2xl object-cover"
          />
        )}
        <div
          className="prose prose-sm sm:prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </Card>
    </div>
  );
}

export default function PublicArticleViewPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading...</p>}>
      <PublicArticleView />
    </Suspense>
  );
}
