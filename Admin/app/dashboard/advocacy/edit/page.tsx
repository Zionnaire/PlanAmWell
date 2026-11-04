"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminGetAllArticles, adminUpdateArticle, adminDeleteArticle } from "../../../services/AdvocacyService";
import ArticleEditor from "../../../components/advocacy/ArticleEditor";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";

function EditArticle() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminGetAllArticles()
      .then((res) => {
        const found = res.data.find((x: any) => x._id === id);
        if (found) {
          setForm({ ...found, tags: (found.tags || []).join(", "), partner: found.partner || found.author?.name || "" });
          setImagePreview(found.featuredImage?.url || null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!id) return;
    setSaving(status);
    setError(null);
    try {
      const tagsArray =
        typeof form.tags === "string" ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : form.tags || [];

      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        tags: tagsArray,
        slug: form.slug || "",
        status,
        featured: !!form.featured,
      };

      await adminUpdateArticle(id, payload, file || undefined);
      router.push("/dashboard/advocacy");
    } catch (err: any) {
      setError(err.message || "Failed to save article");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await adminDeleteArticle(id);
      router.push("/dashboard/advocacy");
    } catch (err: any) {
      setError(err.message || "Failed to delete article");
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-on-surface-variant">Loading article...</p>;
  if (!form) return <p className="text-on-surface-variant">Article not found.</p>;

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
          <h1 className="text-xl font-bold text-primary">Edit Article</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} />
          </Button>
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
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Input label="Slug" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <Textarea
          label="Excerpt"
          value={form.excerpt || ""}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          rows={3}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
          />
          <span className="text-sm font-semibold text-on-surface">Featured Article</span>
        </label>
      </Card>

      <div>
        <label className="mb-2 block text-sm font-semibold text-on-surface">Content</label>
        <ArticleEditor content={form.content || ""} onChange={(html) => setForm((prev: any) => ({ ...prev, content: html }))} />
      </div>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Article">
        <p className="mb-6 text-sm text-on-surface-variant">
          Are you sure you want to delete <strong>{form.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading article...</p>}>
      <EditArticle />
    </Suspense>
  );
}
