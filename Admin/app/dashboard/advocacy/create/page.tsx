"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateArticle } from "../../../services/AdvocacyService";
import ArticleEditor from "../../../components/advocacy/ArticleEditor";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { ArrowLeft, Upload } from "lucide-react";

export default function CreateArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    slug: "",
    partner: "",
    featured: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setSaving(status);
    setError(null);
    try {
      const tagsArray = form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [];

      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        tags: tagsArray,
        slug: form.slug || "",
        status,
        featured: !!form.featured,
        author: { name: form.partner || "Partner" },
      };

      await adminCreateArticle(payload, file || undefined);
      router.push("/dashboard/advocacy");
    } catch (err: any) {
      setError(err.message || "Failed to create article");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">New Article</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!!saving} onClick={() => handleSubmit("draft")}>
            {saving === "draft" ? "Saving..." : "Save Draft"}
          </Button>
          <Button disabled={!!saving} onClick={() => handleSubmit("published")}>
            {saving === "published" ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <Card className="space-y-4">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter article title here..."
          className="w-full border-none bg-transparent p-0 text-4xl font-bold text-on-surface outline-none placeholder:text-outline"
        />

        {imagePreview ? (
          <div className="relative h-56 overflow-hidden rounded-2xl">
            <img src={imagePreview} alt="Cover" className="h-full w-full object-cover" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
        ) : (
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-variant bg-surface-container-low transition-colors hover:bg-surface-container">
            <Upload size={32} className="mb-2 text-outline" />
            <span className="font-semibold text-on-surface-variant">Upload Cover Image</span>
            <span className="mt-1 text-xs text-outline">1200 x 630px recommended</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </Card>

      <Card className="space-y-4">
        <Input
          label="Partner Name"
          placeholder="Partner organization name"
          value={form.partner}
          onChange={(e) => setForm({ ...form, partner: e.target.value })}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Category"
            placeholder="e.g., Health, Education"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Tags"
            placeholder="tag1, tag2, tag3"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <Input label="Slug" placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <Textarea
          label="Excerpt"
          placeholder="Brief summary of the article (150-200 characters)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          rows={3}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
          />
          <span className="text-sm font-semibold text-on-surface">Featured Article</span>
        </label>
      </Card>

      <div>
        <label className="mb-2 block text-sm font-semibold text-on-surface">Content</label>
        <ArticleEditor content={form.content} onChange={(html) => setForm((prev: any) => ({ ...prev, content: html }))} />
      </div>
    </div>
  );
}
