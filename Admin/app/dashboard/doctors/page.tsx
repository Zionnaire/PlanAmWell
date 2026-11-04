"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllDoctors } from "../../services/AdminService";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td, AvatarInitials } from "../../components/ui/Table";

type StatusFilter = "all" | "approved" | "submitted" | "reviewing" | "rejected";

const PAGE_SIZE = 10;

const STATUS_TONE: Record<string, "success" | "warning" | "error" | "neutral"> = {
  approved: "success",
  submitted: "warning",
  reviewing: "warning",
  rejected: "error",
};

function specializationText(specialization: any) {
  if (Array.isArray(specialization)) return specialization.join(", ") || "N/A";
  return specialization || "N/A";
}

// Some doctor records only have firstName/lastName, not a combined `name` —
// same fallback as useAllDoctors.ts's normalizeDoctor (used by the
// Dashboard's PendingDoctors) and the doctor detail page.
function doctorName(d: any) {
  return d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "No Name";
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSearch =
        doctorName(d).toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase()) ||
        specializationText(d.specialization).toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [doctors, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PAGE_SIZE));
  const pagedDoctors = filteredDoctors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Doctors</h1>
        <p className="mt-1 text-on-surface-variant">Review and manage doctor credentials and approval status.</p>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by name, email, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="reviewing">Reviewing</option>
            <option value="submitted">Submitted</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading doctors...</p>
        ) : error ? (
          <p className="p-6 text-error">Error loading doctors: {error}</p>
        ) : filteredDoctors.length === 0 ? (
          <p className="p-6 text-on-surface-variant">No doctors found.</p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Doctor</Th>
                  <Th className="hidden md:table-cell">Specialization</Th>
                  <Th className="hidden lg:table-cell">Joined</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedDoctors.map((d) => (
                  <Tr
                    key={d._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/doctors/detail?id=${d._id}`)}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={doctorName(d)} src={d.doctorImage?.url || d.profileImage} />
                        <div>
                          <p className="font-semibold text-on-surface">{doctorName(d)}</p>
                          <p className="text-xs text-on-surface-variant">{d.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden text-on-surface-variant md:table-cell">{specializationText(d.specialization)}</Td>
                    <Td className="hidden text-on-surface-variant lg:table-cell">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                    </Td>
                    <Td>
                      <Badge tone={STATUS_TONE[d.status] || "neutral"}>
                        {d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Unknown"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredDoctors.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
