"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAUser } from "../../../services/AdminService";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { AvatarInitials } from "../../../components/ui/Table";
import { ArrowLeft, Mail, Phone, AtSign, MapPin, Calendar, VenetianMask, FileText } from "lucide-react";

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-container/10 text-tertiary-container">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p>
        <p className="text-sm text-on-surface break-words">{value}</p>
      </div>
    </div>
  );
}

function UserDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAUser(id);
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p className="text-on-surface-variant">Loading user details...</p>;
  if (error) return <p className="text-error">Error loading user: {error}</p>;
  if (!user) return <p className="text-on-surface-variant">User not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/users")}
        className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Card className="flex flex-col items-center text-center md:col-span-4">
          <AvatarInitials name={user.name || "?"} src={user.userImage?.url} className="mb-4 h-20 w-20 text-2xl" />
          <h1 className="text-2xl font-bold text-on-surface">{user.name || "No Name"}</h1>
          {user.status && (
            <Badge tone={user.status?.toLowerCase() === "active" ? "success" : "neutral"} className="mt-3">
              {user.status}
            </Badge>
          )}
        </Card>

        <Card className="space-y-4 md:col-span-8">
          {user.email && <DetailRow icon={<Mail size={18} />} label="Email" value={user.email} />}
          {user.phone && <DetailRow icon={<Phone size={18} />} label="Phone" value={user.phone} />}
          {user.username && <DetailRow icon={<AtSign size={18} />} label="Username" value={`@${user.username}`} />}
          {user.address && <DetailRow icon={<MapPin size={18} />} label="Address" value={user.address} />}
          {user.gender && <DetailRow icon={<VenetianMask size={18} />} label="Gender" value={user.gender} />}
          {user.createdAt && (
            <DetailRow
              icon={<Calendar size={18} />}
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
          {user.bio && <DetailRow icon={<FileText size={18} />} label="Bio" value={user.bio} />}
        </Card>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading user details...</p>}>
      <UserDetail />
    </Suspense>
  );
}
