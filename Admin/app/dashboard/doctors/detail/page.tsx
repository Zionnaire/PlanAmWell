"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getDoctorByIdService, updateDoctorStatusService } from "../../../services/AdminService";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Table, Thead, Tbody, Tr, Th, Td, AvatarInitials } from "../../../components/ui/Table";
import { ArrowLeft, Mail, Phone, BadgeCheck, Briefcase, Calendar } from "lucide-react";

const STATUS_TONE: Record<string, "success" | "warning" | "error" | "neutral"> = {
  approved: "success",
  submitted: "warning",
  reviewing: "warning",
  rejected: "error",
};

const formatAvailability = (availability: any) => {
  if (!availability) return [];
  return Object.entries(availability).map(([day, hours]: [string, any]) => {
    const hoursText =
      typeof hours === "string"
        ? hours
        : hours?.from && hours?.to
        ? `${hours.from} - ${hours.to}`
        : JSON.stringify(hours);
    return { day, hoursText };
  });
};

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

function DoctorDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDoctor = async () => {
      try {
        const doc = await getDoctorByIdService(id);
        if (doc) {
          setDoctor({
            ...doc,
            fullName: doc.name || `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "No Name",
            specializationDisplay: Array.isArray(doc.specialization)
              ? doc.specialization.join(", ")
              : doc.specialization || "N/A",
            availabilityDisplay: formatAvailability(doc.availability),
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) return <p className="text-on-surface-variant">Loading doctor details...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!doctor) return <p className="text-on-surface-variant">Doctor not found.</p>;

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      setUpdating(true);
      await updateDoctorStatusService(doctor._id, confirmAction);
      setDoctor({ ...doctor, status: confirmAction });
      setConfirmAction(null);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/doctors")}
        className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to Doctors
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarInitials
            name={doctor.fullName}
            src={doctor.doctorImage?.url || doctor.profileImage}
            className="h-16 w-16 text-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-on-surface">{doctor.fullName}</h1>
            <Badge tone={STATUS_TONE[doctor.status] || "neutral"} className="mt-1">
              {doctor.status ? doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1) : "Unknown"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="tertiary"
            disabled={updating || doctor.status === "approved"}
            onClick={() => setConfirmAction("approved")}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            disabled={updating || doctor.status === "rejected"}
            onClick={() => setConfirmAction("rejected")}
          >
            Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DetailRow icon={<Mail size={18} />} label="Email" value={doctor.email || "N/A"} />
        <DetailRow icon={<BadgeCheck size={18} />} label="License Number" value={doctor.licenseNumber || "N/A"} />
        <DetailRow icon={<Briefcase size={18} />} label="Specialization" value={doctor.specializationDisplay} />
        <DetailRow icon={<Briefcase size={18} />} label="Years of Experience" value={doctor.yearsOfExperience ?? "N/A"} />
        <DetailRow icon={<Phone size={18} />} label="Contact Number" value={doctor.contactNumber || "N/A"} />
        <DetailRow
          icon={<Calendar size={18} />}
          label="Joined At"
          value={doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "N/A"}
        />
      </div>

      {doctor.bio && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Bio</h3>
          <p className="text-sm text-on-surface">{doctor.bio}</p>
        </Card>
      )}

      <Card padding={doctor.availabilityDisplay.length === 0}>
        <h3 className="mb-2 px-6 pt-6 text-lg font-semibold text-on-surface">Availability</h3>
        {doctor.availabilityDisplay.length ? (
          <Table>
            <Thead>
              <Tr>
                <Th>Day</Th>
                <Th>Hours</Th>
              </Tr>
            </Thead>
            <Tbody>
              {doctor.availabilityDisplay.map((a: any) => (
                <Tr key={a.day}>
                  <Td className="capitalize">{a.day}</Td>
                  <Td className="text-on-surface-variant">{a.hoursText}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <p className="px-6 pb-6 text-sm text-on-surface-variant">No availability on file.</p>
        )}
      </Card>

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === "approved" ? "Approve this doctor?" : "Reject this doctor?"}
      >
        <p className="mb-6 text-sm text-on-surface-variant">
          You are about to mark <strong>{doctor.fullName}</strong> as{" "}
          <strong>{confirmAction === "approved" ? "Approved" : "Rejected"}</strong>. This updates their status
          immediately.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={updating}>
            Cancel
          </Button>
          <Button
            variant={confirmAction === "approved" ? "tertiary" : "danger"}
            onClick={handleConfirm}
            disabled={updating}
          >
            {updating ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading doctor details...</p>}>
      <DoctorDetail />
    </Suspense>
  );
}
