"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAllDoctors } from "../hooks/useAllDoctors";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Table, Thead, Tbody, Tr, Th, Td, RowActions } from "./ui/Table";
import { RefreshCw, Eye } from "lucide-react";

export default function PendingDoctors() {
  const { doctors, loading, updatingId, error, fetchDoctors, updateDoctorStatus } = useAllDoctors();
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [confirmTarget, setConfirmTarget] = useState<{ doc: any; status: "approved" | "rejected" } | null>(null);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    await updateDoctorStatus(confirmTarget.doc._id, confirmTarget.status);
    setConfirmTarget(null);
  };

  const pendingDoctors = doctors.filter((d) => d.status === "submitted" || d.status === "reviewing");
  const approvedDoctors = doctors.filter((d) => d.status === "approved");
  const rows = tab === "pending" ? pendingDoctors : approvedDoctors;

  if (loading) {
    return (
      <Card className="py-16 text-center font-semibold text-primary">Loading doctors...</Card>
    );
  }

  return (
    <Card padding={false}>
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 pb-4">
        <h3 className="text-lg font-semibold text-on-surface">Doctor Management</h3>
        <button
          onClick={fetchDoctors}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <p className="px-6 pb-4 text-sm font-semibold text-error">{error}</p>}

      <div className="flex gap-2 px-6 pb-4">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "pending" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          Pending ({pendingDoctors.length})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "approved" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          Approved ({approvedDoctors.length})
        </button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Specialization</Th>
            <Th>Submitted</Th>
            <Th>Availability</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((doc: any) => (
            <Tr key={doc._id}>
              <Td className="font-semibold text-on-surface">{doc.fullName}</Td>
              <Td className="text-on-surface-variant">{doc.specializationDisplay}</Td>
              <Td className="text-on-surface-variant">{doc.createdAtDisplay}</Td>
              <Td className="text-on-surface-variant">{doc.availableDisplay}</Td>
              <Td>
                <RowActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/doctors/detail?id=${doc._id}`)}
                  >
                    <Eye size={14} /> View
                  </Button>
                  {tab === "pending" && (
                    <>
                      <Button
                        variant="tertiary"
                        size="sm"
                        disabled={updatingId === doc._id}
                        onClick={() => setConfirmTarget({ doc, status: "approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={updatingId === doc._id}
                        onClick={() => setConfirmTarget({ doc, status: "rejected" })}
                      >
                        Deny
                      </Button>
                    </>
                  )}
                </RowActions>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {rows.length === 0 && (
        <div className="py-10 text-center text-on-surface-variant">
          {tab === "pending" ? "No pending doctors." : "No approved doctors yet."}
        </div>
      )}

      <Modal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title={confirmTarget?.status === "approved" ? "Approve this doctor?" : "Reject this doctor?"}
      >
        <p className="mb-6 text-sm text-on-surface-variant">
          You are about to mark <strong>{confirmTarget?.doc.fullName}</strong> as{" "}
          <strong>{confirmTarget?.status === "approved" ? "Approved" : "Rejected"}</strong>. This updates their
          status immediately.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={updatingId === confirmTarget?.doc._id}>
            Cancel
          </Button>
          <Button
            variant={confirmTarget?.status === "approved" ? "tertiary" : "danger"}
            onClick={handleConfirm}
            disabled={updatingId === confirmTarget?.doc._id}
          >
            {updatingId === confirmTarget?.doc._id ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
