"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { getOrderByIdService, refreshOrderDeliveryService, verifyOrderPaymentService } from "../../../services/AdminService";
import { orderStatusTone, statusLabel } from "../../../lib/orderStatus";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../../components/ui/Table";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between border-b border-surface-variant py-2 last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="font-semibold text-on-surface">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function OrderDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") ?? "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const found = await getOrderByIdService(orderId);
        setOrder(found);
        // Only ever showed whatever a partner webhook last wrote — re-check
        // with the partner directly instead of waiting on it indefinitely.
        if (found?.paymentStatus === "pending") {
          verifyOrderPaymentService(orderId)
            .then(() => getOrderByIdService(orderId))
            .then((updated) => {
              if (updated) setOrder(updated);
            })
            .catch((err) => console.error("Failed to verify order payment", err));
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  const handleRefreshDelivery = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const result = await refreshOrderDeliveryService(orderId);
      if (result?.data?.deliveryStatus) {
        setOrder((prev: any) => ({ ...prev, deliveryStatus: result.data.deliveryStatus }));
        setRefreshMsg(`Delivery status updated to: ${result.data.deliveryStatus}`);
      } else {
        setRefreshMsg("Delivery status refreshed (no change).");
      }
    } catch (err: any) {
      setRefreshMsg("Failed to refresh delivery status from partner.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <p className="text-on-surface-variant">Loading order...</p>;

  if (!order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <Card className="py-12 text-center text-on-surface-variant">Order not found.</Card>
      </div>
    );
  }

  const subtotal = Number(order.subtotal ?? 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const total = Number(order.total ?? subtotal + shippingFee);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Order #{order.orderNumber?.slice(0, 8).toUpperCase() ?? orderId.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <Button onClick={handleRefreshDelivery} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Delivery"}
        </Button>
      </div>

      {refreshMsg && (
        <div className="rounded-2xl border border-tertiary-fixed bg-tertiary-fixed/20 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          {refreshMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard icon={<CreditCard size={18} />} title="Order Status">
          <div className="flex justify-between border-b border-surface-variant py-2">
            <span className="text-sm text-on-surface-variant">Payment Status</span>
            <Badge tone={orderStatusTone(order.paymentStatus)}>{statusLabel(order.paymentStatus)}</Badge>
          </div>
          <div className="flex justify-between border-b border-surface-variant py-2 last:border-0">
            <span className="text-sm text-on-surface-variant">Delivery Status</span>
            <Badge tone={orderStatusTone(order.deliveryStatus)}>{statusLabel(order.deliveryStatus)}</Badge>
          </div>
          {order.partnerOrderCode && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-on-surface-variant">Partner Order Code</span>
              <span className="font-mono text-sm font-medium text-on-surface">{order.partnerOrderCode}</span>
            </div>
          )}
        </SectionCard>

        <SectionCard icon={<MapPin size={18} />} title="Shipping Address">
          <InfoRow label="Name" value={order.shippingAddress?.name} />
          <InfoRow label="Phone" value={order.shippingAddress?.phone} />
          <InfoRow label="Address" value={order.shippingAddress?.addressLine ?? order.shippingAddress?.address} />
          <InfoRow label="City" value={order.shippingAddress?.city} />
          <InfoRow label="LGA" value={order.shippingAddress?.lga} />
          <InfoRow label="State" value={order.shippingAddress?.state} />
        </SectionCard>

        <div className="md:col-span-2">
          <SectionCard icon={<Package size={18} />} title="Items">
            {order.items?.length > 0 ? (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th className="text-center">Qty</Th>
                    <Th className="text-right">Unit Price</Th>
                    <Th className="text-right">Line Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.items.map((item: any, idx: number) => (
                    <Tr key={idx}>
                      <Td>
                        <p className="font-medium text-on-surface">{item.name ?? item.productId ?? "—"}</p>
                        {item.sku && <p className="text-xs text-on-surface-variant">SKU: {item.sku}</p>}
                      </Td>
                      <Td className="text-center text-on-surface-variant">{item.quantity ?? 1}</Td>
                      <Td className="text-right text-on-surface-variant">
                        ₦{Number(item.price ?? 0).toLocaleString()}
                      </Td>
                      <Td className="text-right font-semibold text-on-surface">
                        ₦{(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <p className="text-sm text-on-surface-variant">No item details available.</p>
            )}

            <div className="ml-auto mt-4 max-w-xs space-y-2 border-t border-surface-variant pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium text-on-surface">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Delivery Fee</span>
                <span className="font-medium text-on-surface">₦{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-surface-variant pt-2 text-sm font-bold">
                <span className="text-on-surface">Total</span>
                <span className="text-base text-primary">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {(order.deliveryInfo || order.trackingNumber) && (
          <div className="md:col-span-2">
            <SectionCard icon={<Truck size={18} />} title="Delivery Info">
              {order.trackingNumber && <InfoRow label="Tracking Number" value={order.trackingNumber} />}
              {order.deliveryInfo?.carrier && <InfoRow label="Carrier" value={order.deliveryInfo.carrier} />}
              {order.deliveryInfo?.estimatedDate && (
                <InfoRow
                  label="Estimated Delivery"
                  value={new Date(order.deliveryInfo.estimatedDate).toLocaleDateString()}
                />
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading order...</p>}>
      <OrderDetail />
    </Suspense>
  );
}
