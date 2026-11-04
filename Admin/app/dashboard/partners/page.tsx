"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePartnerContext } from "../../context/PartnerContext";
import { Building2, Search, Plus } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";

const PAGE_SIZE = 10;

export default function PartnersListPage() {
  const router = useRouter();
  const { partners, loading, fetchAllPartners } = usePartnerContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (partners.length === 0) {
      fetchAllPartners();
    }
  }, []);

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || partner.partnerType === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / PAGE_SIZE));
  const pagedPartners = filteredPartners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Partners</h1>
          <p className="mt-1 text-on-surface-variant">Manage partner organizations, NGOs, and medical clinics.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/partners/create")}>
          <Plus size={18} /> Add Partner
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Partners" value={partners.length} />
        <StatCard label="Active Partners" value={partners.filter((p) => p.isActive).length} />
        <StatCard label="Business Partners" value={partners.filter((p) => p.partnerType === "business").length} />
        <StatCard label="Individual Partners" value={partners.filter((p) => p.partnerType === "individual").length} />
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search partners by name or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading partners...</p>
        ) : filteredPartners.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="mx-auto mb-4 text-outline" />
            <h3 className="mb-2 text-lg font-semibold text-on-surface">No Partners Found</h3>
            <p className="mb-4 text-on-surface-variant">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first partner"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button onClick={() => router.push("/dashboard/partners/create")}>Add Partner</Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Partner</Th>
                  <Th className="hidden md:table-cell">Type</Th>
                  <Th className="hidden lg:table-cell">Contact</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedPartners.map((partner) => (
                  <Tr
                    key={partner._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/partners/detail?id=${partner._id}`)}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tertiary-container/10 text-tertiary-container">
                          {partner.logo ? (
                            <img src={partner.logo} alt={partner.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{partner.name}</p>
                          <p className="text-xs text-on-surface-variant">{partner.profession || "No profession"}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell">
                      <Badge tone="neutral" dot={false} className="capitalize">
                        {partner.partnerType}
                      </Badge>
                    </Td>
                    <Td className="hidden text-on-surface-variant lg:table-cell">{partner.email || partner.phone || "—"}</Td>
                    <Td>
                      <Badge tone={partner.isActive ? "success" : "error"}>
                        {partner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredPartners.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
