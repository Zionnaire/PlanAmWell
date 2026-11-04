"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAllUsers } from "../hooks/useAllUsers";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { AvatarInitials } from "./ui/Table";
import { Mail, Phone, AtSign, MapPin, Calendar } from "lucide-react";

interface UserModalProps {
  user: any;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-container/10 text-tertiary-container">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p>
        <p className="text-sm text-on-surface wrap-break-words">{value}</p>
      </div>
    </div>
  );
}

function UserModal({ user, loading, error, onClose }: UserModalProps) {
  if (!user && !loading) return null;

  return (
    <Modal open onClose={onClose} title={loading || error ? undefined : user?.name}>
      {loading ? (
        <div className="py-12 text-center font-semibold text-primary">Loading user details...</div>
      ) : error ? (
        <div className="py-12 text-center font-semibold text-error">{error}</div>
      ) : (
        <div className="space-y-4">
          <AvatarInitials
            name={user.name || "?"}
            src={user.userImage?.url}
            className="mx-auto mb-2 h-20 w-20 text-2xl"
          />
          {user.email && <DetailRow icon={<Mail size={18} />} label="Email" value={user.email} />}
          {user.phone && <DetailRow icon={<Phone size={18} />} label="Phone" value={user.phone} />}
          {user.username && <DetailRow icon={<AtSign size={18} />} label="Username" value={`@${user.username}`} />}
          {user.address && <DetailRow icon={<MapPin size={18} />} label="Address" value={user.address} />}
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
          <Button variant="primary" className="mt-2 w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default function RecentUsers() {
  const { users, loading, error, fetchUsers, selectedUser, fetchUserById, modalLoading, modalError, setSelectedUser } =
    useAllUsers();

  const router = useRouter();

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [users]
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">Recent User Registrations</h3>
        <button onClick={fetchUsers} className="text-sm font-semibold text-primary hover:underline">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center font-semibold text-primary">Loading users...</div>
      ) : error ? (
        <div className="py-8 text-center font-semibold text-error">{error}</div>
      ) : recentUsers.length === 0 ? (
        <div className="py-8 text-center text-on-surface-variant">No users found.</div>
      ) : (
        <ul className="space-y-1">
          {recentUsers.map((user: any, i: number) => (
            <li
              key={user._id}
              onClick={() => fetchUserById(user._id)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface-container-low ${
                i !== recentUsers.length - 1 ? "border-b border-surface-variant" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <AvatarInitials name={user.name || "?"} src={user.userImage?.url} />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{user.name || "No Name"}</p>
                  <p className="text-xs text-on-surface-variant">{user.email || user.phone || "—"}</p>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant">
                {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" className="mt-4 w-full" size="sm" onClick={() => router.push("/dashboard/users")}>
        View All Users
      </Button>

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} loading={modalLoading} error={modalError} />
      )}
    </Card>
  );
}
