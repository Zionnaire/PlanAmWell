"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, UserPlus } from "lucide-react";
import { getPlatformSettingsService, updatePlatformSettingsService } from "../../services/AdminService";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function SettingsPage() {
  const [feeNaira, setFeeNaira] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlatformSettingsService()
      .then((settings) => setFeeNaira(String((settings?.consultationFeeKobo ?? 0) / 100)))
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const naira = Number(feeNaira);
    if (!naira || naira <= 0) {
      setError("Enter a valid fee amount.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updatePlatformSettingsService(Math.round(naira * 100));
      setSaved(true);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-on-surface">
          <SettingsIcon size={22} className="text-primary" /> Platform Settings
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          Values here apply platform-wide, on both the mobile app and web.
        </p>
      </div>

      <Card className="max-w-md space-y-4">
        <h3 className="text-sm font-semibold text-on-surface">Consultation Fee</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <>
            <Input
              label="Amount (₦)"
              type="number"
              min={1}
              value={feeNaira}
              onChange={(e) => setFeeNaira(e.target.value)}
            />
            <p className="text-xs text-on-surface-variant">
              Charged to every patient booking a consultation, on mobile and web alike. Changing this only affects
              appointments booked after the change — existing bookings keep the fee they were charged at.
            </p>
            {error && <p className="text-sm text-error">{error}</p>}
            {saved && <p className="text-sm text-primary">Saved.</p>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </Card>

      <Card className="max-w-md space-y-3">
        <h3 className="text-sm font-semibold text-on-surface">Admin Team</h3>
        <p className="text-xs text-on-surface-variant">
          Add another administrator. They&apos;ll get full access to this dashboard, so only invite people you trust.
        </p>
        <Link href="/auth/register">
          <Button variant="outline">
            <UserPlus size={16} /> Create Admin Account
          </Button>
        </Link>
      </Card>
    </div>
  );
}
