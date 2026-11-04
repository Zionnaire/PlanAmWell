"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminGetAllArticles, adminDeleteArticle } from "../../services/AdvocacyService";
import { Search, Plus, Edit, BarChart2, Eye, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td, RowActions } from "../../components/ui/Table";

const PAGE_SIZE = 10;

const STATUS_TONE: Record<string, "success" | "warning" | "neutral" | "info"> = {
  published: "success",
  draft: "neutral",
  scheduled: "info",
};

export default function AdvocacyListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await adminGetAllArticles();
      setArticles(res.data || []);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category).filter(Boolean))),
    [articles]
  );

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch = a.title?.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q);
      const matchesCategory = category === "all" || a.category === category;
      const matchesStatus = status === "all" || a.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, search, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedArticles = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteArticle(deleteTarget._id);
      setArticles((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Advocacy Articles</h1>
          <p className="mt-1 text-on-surface-variant">Manage educational and advocacy content across the platform.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/advocacy/analytics")}>
            <BarChart2 size={18} /> Analytics
          </Button>
          <Button onClick={() => router.push("/dashboard/advocacy/create")}>
            <Plus size={18} /> Add Article
          </Button>
        </div>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading articles...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-on-surface-variant">No articles found.</p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Author</Th>
                  <Th className="hidden md:table-cell">Category</Th>
                  <Th className="hidden lg:table-cell">Views</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedArticles.map((a) => (
                  <Tr key={a._id}>
                    <Td className="font-semibold text-on-surface">{a.title}</Td>
                    <Td className="text-on-surface-variant">{a.author?.name || a.partner || "—"}</Td>
                    <Td className="hidden md:table-cell">{a.category ? <Badge tone="info">{a.category}</Badge> : <span className="text-on-surface-variant">—</span>}</Td>
                    <Td className="hidden text-on-surface-variant lg:table-cell">{a.views ?? 0}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[a.status] || "neutral"} className="capitalize">
                        {a.status || "draft"}
                      </Badge>
                    </Td>
                    <Td>
                      <RowActions>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/advocacy/views?id=${a._id}`)}>
                          <Eye size={14} /> Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/advocacy/edit?id=${a._id}`)}>
                          <Edit size={14} /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/advocacy/analytics/view?id=${a._id}`)}
                        >
                          <BarChart2 size={14} /> Analytics
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(a)}>
                          <Trash2 size={14} />
                        </Button>
                      </RowActions>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Article">
        <p className="mb-6 text-sm text-on-surface-variant">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>
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
