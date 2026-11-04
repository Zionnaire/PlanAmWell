"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllEventsAdminService,
  updateEventService,
  deleteEventService,
  EventPayload,
  EventBannerPreset,
} from "../../../services/AdminService";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { EventBannerPicker } from "../../../components/events/EventBannerPicker";
import { ArrowLeft, Trash2 } from "lucide-react";

interface FormState {
  title: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  isVirtual: boolean;
  location: string;
  capacity: string;
  organizerName: string;
  registrationUrl: string;
  isPaidPlacement: boolean;
  ticketPriceNaira: string;
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in the viewer's local time,
// not the ISO string the API returns.
function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditEvent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [form, setForm] = useState<FormState | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerPreset, setBannerPreset] = useState<EventBannerPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAllEventsAdminService()
      .then((events) => {
        const found = events.find((e: any) => e._id === id);
        if (found) {
          setForm({
            title: found.title,
            description: found.description,
            category: found.category || "",
            startsAt: toLocalInputValue(found.startsAt),
            endsAt: toLocalInputValue(found.endsAt),
            isVirtual: found.isVirtual,
            location: found.location || "",
            capacity: found.capacity ? String(found.capacity) : "",
            organizerName: found.organizerName || "",
            registrationUrl: found.registrationUrl || "",
            isPaidPlacement: !!found.isPaidPlacement,
            ticketPriceNaira: found.ticketPriceKobo ? String(found.ticketPriceKobo / 100) : "",
          });
          setRsvpCount(found.rsvpCount || 0);
          setExistingImageUrl(found.bannerImage?.url || null);
          setBannerPreset(found.bannerPreset || null);
        } else {
          setError("Event not found.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handlePresetSelected(p: EventBannerPreset | null) {
    setBannerPreset(p);
    // Picking a built-in graphic replaces any existing uploaded photo.
    setExistingImageUrl(null);
  }

  async function handleSubmit() {
    if (!form || !id) return;
    if (!form.title.trim() || !form.description.trim() || !form.startsAt) {
      setError("Title, description, and start time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<EventPayload> = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        isVirtual: form.isVirtual,
        location: form.isVirtual ? undefined : form.location.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        bannerPreset: bannerFile ? undefined : bannerPreset || undefined,
        organizerName: form.organizerName.trim() || undefined,
        registrationUrl: form.registrationUrl.trim() || undefined,
        isPaidPlacement: form.isPaidPlacement,
        ticketPriceKobo: form.ticketPriceNaira ? Math.round(Number(form.ticketPriceNaira) * 100) : undefined,
      };
      await updateEventService(id, payload, bannerFile || undefined);
      router.push("/dashboard/events");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteEventService(id);
      router.push("/dashboard/events");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete event");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) return <p className="text-on-surface-variant">Loading event...</p>;
  if (!form) return <p className="text-error">{error || "Event not found."}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">Edit Event</h1>
        </div>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      {rsvpCount > 0 && (
        <div className="rounded-2xl border border-tertiary-fixed bg-tertiary-fixed px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          {rsvpCount} patient{rsvpCount === 1 ? " has" : "s have"} already RSVP&apos;d — changes to the time or
          location won&apos;t notify them automatically.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <Card className="space-y-4">
        <EventBannerPicker
          existingImageUrl={existingImageUrl}
          preset={bannerPreset}
          filePreviewUrl={bannerPreview}
          onFileSelected={setBannerFile}
          onPresetSelected={handlePresetSelected}
        />

        <Input label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
        <Input label="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Starts at" type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          <Input label="Ends at (optional)" type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isVirtual"
            checked={form.isVirtual}
            onChange={(e) => set("isVirtual", e.target.checked)}
            className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
          />
          <label htmlFor="isVirtual" className="text-sm font-semibold text-on-surface">
            This is a virtual/online event
          </label>
        </div>

        {!form.isVirtual && <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />}

        <Input
          label="Capacity (optional)"
          type="number"
          min={1}
          placeholder="Leave blank for unlimited"
          value={form.capacity}
          onChange={(e) => set("capacity", e.target.value)}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">Organizer &amp; Monetization</h2>

        <Input
          label="Organizer name (optional)"
          value={form.organizerName}
          onChange={(e) => set("organizerName", e.target.value)}
        />
        <Input
          label="Registration link (optional)"
          placeholder="https://organizer-site.com/register"
          value={form.registrationUrl}
          onChange={(e) => set("registrationUrl", e.target.value)}
        />

        <Input
          label="Ticket price in ₦ (optional — leave blank for a free event)"
          type="number"
          min={0}
          step="0.01"
          value={form.ticketPriceNaira}
          onChange={(e) => set("ticketPriceNaira", e.target.value)}
        />
        {rsvpCount > 0 && (
          <p className="-mt-2 text-xs text-error">
            Changing the ticket price won&apos;t affect the {rsvpCount} RSVP{rsvpCount === 1 ? "" : "s"} already paid
            — only new registrations pay the new price.
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPaidPlacement"
            checked={form.isPaidPlacement}
            onChange={(e) => set("isPaidPlacement", e.target.checked)}
            className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
          />
          <label htmlFor="isPaidPlacement" className="text-sm font-semibold text-on-surface">
            Featured / paid placement
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/events")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Event">
        <p className="mb-6 text-sm text-on-surface-variant">
          Are you sure you want to permanently delete <strong>{form.title}</strong>? This removes it and its RSVP
          history and cannot be undone.
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

export default function EditEventPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading event...</p>}>
      <EditEvent />
    </Suspense>
  );
}
