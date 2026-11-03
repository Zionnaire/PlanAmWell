"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, BarChart2 } from "lucide-react";
import { getAllOrdersService, verifyOrderPaymentService } from "../../services/AdminService";
import { orderStatusTone, statusLabel } from "../../lib/orderStatus";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { Pagination } from "../../components/ui/Pagination";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersService();
      setOrders(data);
      verifyPendingOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPendingOrders = async (list: any[]) => {
    const pending = list.filter((o) => o.paymentStatus === "pending");
    if (pending.length === 0) return;
    await Promise.allSettled(pending.map((o) => verifyOrderPaymentService(o._id)));
    try {
      const refreshed = await getAllOrdersService();
      setOrders(refreshed);
    } catch (err) {
      console.error("Failed to refresh orders after verify", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.orderNumber?.toLowerCase().includes(q) ||
        o.shippingAddress?.name?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.toLowerCase().includes(q);
      const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
      const matchDelivery = deliveryFilter === "all" || o.deliveryStatus === deliveryFilter;
      return matchSearch && matchPayment && matchDelivery;
    });
  }, [orders, search, paymentFilter, deliveryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter, deliveryFilter]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Orders</h1>
          <p className="mt-1 text-on-surface-variant">Manage and track all customer orders.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/orders/commission")}>
            <BarChart2 size={16} /> Commission Report
          </Button>
          <Button variant="primary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Paid" value={orders.filter((o) => o.paymentStatus === "paid").length} />
        <StatCard label="Pending Payment" value={orders.filter((o) => o.paymentStatus === "pending").length} />
        <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} />
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by order #, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
            <option value="all">All Deliveries</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </Card>

      <Card padding={false}>
        {loading ? (
          <p className="p-6 text-on-surface-variant">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-on-surface-variant">No orders match your filters.</p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Order #</Th>
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Date</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Payment</Th>
                  <Th className="hidden lg:table-cell">Delivery</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedOrders.map((order) => (
                  <Tr
                    key={order._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/detail?id=${order._id}`)}
                  >
                    <Td className="font-mono font-semibold text-on-surface">
                      #{order.orderNumber?.slice(0, 8).toUpperCase()}
                    </Td>
                    <Td>
                      <p className="font-semibold text-on-surface">{order.shippingAddress?.name ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{order.shippingAddress?.phone ?? ""}</p>
                    </Td>
                    <Td className="hidden text-on-surface-variant md:table-cell">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </Td>
                    <Td className="text-right font-semibold text-on-surface">
                      ₦{Number(order.total ?? 0).toLocaleString()}
                    </Td>
                    <Td>
                      <Badge tone={orderStatusTone(order.paymentStatus)}>{statusLabel(order.paymentStatus)}</Badge>
                    </Td>
                    <Td className="hidden lg:table-cell">
                      <Badge tone={orderStatusTone(order.deliveryStatus)}>{statusLabel(order.deliveryStatus)}</Badge>
                    </Td>
                  </Tr>
                ))}
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
    </div>
  );
}
