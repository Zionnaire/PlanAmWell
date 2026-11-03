"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../../services/AdminService";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td, AvatarInitials } from "../../components/ui/Table";

type FilterType = "all" | "active" | "no-email";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || (filter === "active" && u.email) || (filter === "no-email" && !u.email);

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Users</h1>
        <p className="mt-1 text-on-surface-variant">Manage platform users and view their details.</p>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
            <option value="all">All Users</option>
            <option value="active">Active (Has Email)</option>
            <option value="no-email">No Email</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading users...</p>
        ) : error ? (
          <p className="p-6 text-error">Error loading users: {error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-6 text-on-surface-variant">No users found.</p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th className="hidden md:table-cell">Phone</Th>
                  <Th className="hidden lg:table-cell">Joined</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedUsers.map((u) => (
                  <Tr
                    key={u._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/users/detail?id=${u._id}`)}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={u.name || "?"} src={u.userImage?.url} />
                        <span className="font-semibold text-on-surface">{u.name || "No Name"}</span>
                      </div>
                    </Td>
                    <Td className="text-on-surface-variant">{u.email || "—"}</Td>
                    <Td className="hidden text-on-surface-variant md:table-cell">{u.phone || "—"}</Td>
                    <Td className="hidden text-on-surface-variant lg:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </Td>
                    <Td>
                      <Badge tone={u.email ? "success" : "neutral"}>{u.email ? "Active" : "No Email"}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
