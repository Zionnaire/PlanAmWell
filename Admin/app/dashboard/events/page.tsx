"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllEventsAdminService, updateEventService, deleteEventService } from "../../services/AdminService";
import { Search, Plus, Edit, Users, Trash2, EyeOff, Eye } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td, RowActions } from "../../components/ui/Table";
import { EventBannerThumb } from "../../components/events/EventBannerPicker";

const PAGE_SIZE = 10;

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  category?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  isVirtual: boolean;
  capacity?: number;
  isActive: boolean;
  rsvpCount: number;
  bannerImage?: { url: string } | null;
  bannerPreset?: string | null;
  organizerName?: string;
  isPaidPlacement?: boolean;
  ticketPriceKobo?: number;
}

type TimeFilter = "all" | "upcoming" | "past";

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEventsAdminService();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category).filter(Boolean))) as string[],
    [events]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch = e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q);
      const matchesCategory = category === "all" || e.category === category;
      const isUpcoming = new Date(e.startsAt).getTime() >= now;
      const matchesTime = timeFilter === "all" || (timeFilter === "upcoming" ? isUpcoming : !isUpcoming);
      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [events, search, category, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, category, timeFilter]);

  const handleToggleActive = async (event: AdminEvent) => {
    setTogglingId(event._id);
    try {
      await updateEventService(event._id, { isActive: !event.isActive });
      setEvents((prev) => prev.map((e) => (e._id === event._id ? { ...e, isActive: !e.isActive } : e)));
    } catch (err: any) {
      alert(err.message || "Failed to update event");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEventService(deleteTarget._id);
      setEvents((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Community Hub</h1>
          <p className="mt-1 text-on-surface-variant">Manage live events, support groups, and community sessions.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/events/create")}>
          <Plus size={18} /> Create Event
        </Button>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search events..."
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
          <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}>
            <option value="all">All Time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading events...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-on-surface-variant">No events found.</p>
        ) : (
          <>
            {/* Category/Going are hidden below their breakpoints (not just
                scrollable) so the table actually fits typical laptop widths
                without a horizontal scrollbar — Event/Date & Location/Status/
                Actions are the four columns that matter at any width. The
                Table component's own overflow-x-auto wrapper stays as a
                fallback for anything narrower still, it just shouldn't be
                the normal case anymore. */}
            <Table>
              <Thead>
                <Tr>
                  <Th>Event</Th>
                  <Th className="hidden md:table-cell">Category</Th>
                  <Th>Date &amp; Location</Th>
                  <Th className="hidden lg:table-cell">Going</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedEvents.map((e) => {
                  const isPast = new Date(e.startsAt).getTime() < Date.now();
                  return (
                    <Tr key={e._id}>
                      <Td className="font-semibold text-on-surface">
                        <div className="flex items-center gap-3">
                          <EventBannerThumb imageUrl={e.bannerImage?.url} preset={e.bannerPreset as any} />
                          <div>
                            <div className="flex items-center gap-2">
                              {e.title}
                              {e.isPaidPlacement && <Badge tone="warning">Featured</Badge>}
                            </div>
                            {!!e.ticketPriceKobo && (
                              <p className="mt-0.5 text-xs font-normal text-on-surface-variant">
                                ₦{(e.ticketPriceKobo / 100).toLocaleString()} ticket
                              </p>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden md:table-cell">
                        {e.category ? <Badge tone="info">{e.category}</Badge> : <span className="text-on-surface-variant">—</span>}
                      </Td>
                      <Td className="text-on-surface-variant">
                        <div>
                          {new Date(e.startsAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs">{e.isVirtual ? "Online" : e.location || "In person"}</div>
                      </Td>
                      <Td className="hidden text-on-surface-variant lg:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {e.rsvpCount}
                          {e.capacity ? ` / ${e.capacity}` : ""}
                        </span>
                      </Td>
                      <Td>
                        {isPast ? (
                          <Badge tone="neutral">Past</Badge>
                        ) : (
                          <Badge tone={e.isActive ? "success" : "neutral"}>{e.isActive ? "Active" : "Deactivated"}</Badge>
                        )}
                      </Td>
                      <Td>
                        <RowActions>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/events/edit?id=${e._id}`)}>
                            <Edit size={14} /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(e)}
                            disabled={togglingId === e._id}
                          >
                            {e.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            {e.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(e)}>
                            <Trash2 size={14} />
                          </Button>
                        </RowActions>
                      </Td>
                    </Tr>
                  );
                })}
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event">
        <p className="mb-6 text-sm text-on-surface-variant">
          Are you sure you want to permanently delete <strong>{deleteTarget?.title}</strong>? This removes it and its
          RSVP history and cannot be undone.
          {deleteTarget && deleteTarget.rsvpCount > 0 && (
            <>
              {" "}
              Consider <strong>Deactivate</strong> instead — {deleteTarget.rsvpCount} patient
              {deleteTarget.rsvpCount === 1 ? " has" : "s have"} already RSVP&apos;d.
            </>
          )}
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
