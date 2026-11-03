"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePartnerContext } from "../../../context/PartnerContext";
import { getPartnerByIdService, getPartnerOrdersService } from "../../../services/AdminService";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  ArrowLeft,
  Package,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../../components/ui/Table";
import { orderStatusTone, statusLabel } from "../../../lib/orderStatus";

import { Partner } from "@/app/types/partner";

interface Order {
  id: string;
  orderId: string;
  totalPrice: number;
  status: string;
  platform: string;
  user: {
    name: string;
    origin: string;
  };
  frontImage?: string;
  itemCount: number;
  createdAt?: string;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-on-surface-variant">{icon}</span>
      <div>
        <p className="text-sm text-on-surface-variant">{label}</p>
        <p className="text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function PartnerDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { partners, loading: contextLoading, fetchAllPartners } = usePartnerContext();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "orders">("overview");

  const partnerId = searchParams.get("id");

  const fetchPartnerOrders = useCallback(async () => {
    if (!partnerId) return;

    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const data = await getPartnerOrdersService(partnerId);
      setOrders(data || []);
    } catch (error: any) {
      console.error("Failed to fetch partner orders:", error);
      setOrdersError(error.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (partners.length === 0 && !contextLoading) {
      fetchAllPartners();
    }
  }, [partners.length, contextLoading, fetchAllPartners]);

  useEffect(() => {
    if (!partnerId) return;

    const loadPartner = async () => {
      const match = partners.find((p) => p._id === partnerId);
      if (match) {
        setPartner(match);
        setLocalLoading(false);
        return;
      }

      if (!contextLoading) {
        try {
          const fetchedPartner = await getPartnerByIdService(partnerId);
          setPartner(fetchedPartner || null);
        } catch (error) {
          console.error("Fetch error:", error);
          setPartner(null);
        } finally {
          setLocalLoading(false);
        }
      }
    };

    loadPartner();
  }, [partnerId, partners, contextLoading]);

  useEffect(() => {
    if (partner && partner.partnerType === "business" && selectedTab === "orders") {
      fetchPartnerOrders();
    }
  }, [partner, selectedTab, fetchPartnerOrders]);

  const isCurrentlyLoading = (contextLoading && partners.length === 0) || (localLoading && !partner);

  if (isCurrentlyLoading) {
    return <p className="text-on-surface-variant">Loading partner...</p>;
  }

  if (!partner) {
    return (
      <Card className="flex items-start gap-3 border border-error-container bg-error-container">
        <AlertCircle className="text-on-error-container" size={24} />
        <div>
          <h3 className="font-semibold text-on-error-container">Partner not found</h3>
          <p className="text-sm text-on-error-container">The partner ID &quot;{partnerId}&quot; does not exist.</p>
          <Button variant="danger" className="mt-4" onClick={() => router.push("/dashboard/partners")}>
            Back to Partners
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/partners")}
        className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to Partners
      </button>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-tertiary-container/10 text-tertiary-container">
            {partner.partnerImage?.url || partner.logo ? (
              <img
                src={partner.partnerImage?.url || partner.logo}
                alt={partner.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 size={32} />
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{partner.name}</h1>
              <Badge tone={partner.isActive ? "success" : "error"}>{partner.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="mb-1 text-on-surface-variant">{partner.profession || "No Profession Specified"}</p>
            <Badge tone="neutral" dot={false} className="capitalize">
              {partner.partnerType}
            </Badge>
          </div>
        </div>

        <Button onClick={() => router.push(`/dashboard/partners/edit?id=${partnerId}`)}>
          <Edit size={18} /> Edit Partner
        </Button>
      </div>

      <div className="flex gap-6 border-b border-surface-variant">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
            selectedTab === "overview" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Overview
        </button>
        {partner.partnerType === "business" && (
          <>
            <button
              onClick={() => setSelectedTab("orders")}
              className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                selectedTab === "orders" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Orders
            </button>
          </>
        )}
      </div>

      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-on-surface">Contact Information</h2>
            <InfoRow icon={<Mail size={18} />} label="Email" value={partner.email || "N/A"} />
            <InfoRow icon={<Phone size={18} />} label="Phone" value={partner.phone || "N/A"} />
            <InfoRow
              icon={<Globe size={18} />}
              label="Website"
              value={
                partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {partner.website}
                  </a>
                ) : (
                  "N/A"
                )
              }
            />
            <InfoRow icon={<MapPin size={18} />} label="Business Address" value={partner.businessAddress || "N/A"} />

            <div className="border-t border-surface-variant pt-4">
              <h3 className="mb-2 font-semibold text-on-surface">About</h3>
              <p className="leading-relaxed text-on-surface-variant">
                {partner.description || "No description provided for this partner."}
              </p>
            </div>
          </Card>

          {partner.partnerType === "business" && (
            <div className="space-y-4">
              <StatCard label="Total Orders" value={orders.length} icon={<Package size={18} />} />
              <StatCard
                label="Total Revenue"
                value={`₦${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toLocaleString()}`}
                icon={<DollarSign size={18} />}
              />
            </div>
          )}
        </div>
      )}

      {selectedTab === "orders" && (
        <Card padding={false}>
          <div className="flex items-center justify-between border-b border-surface-variant p-6">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Partner Orders</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Orders fulfilled by {partner.name}</p>
            </div>
          </div>

          {loadingOrders ? (
            <p className="p-6 text-on-surface-variant">Loading orders...</p>
          ) : ordersError ? (
            <p className="p-6 text-error">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="p-12 text-center text-on-surface-variant">No orders found.</p>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.id}>
                    <Td className="font-semibold text-on-surface">{order.orderId}</Td>
                    <Td>
                      <p className="font-medium text-on-surface">{order.user.name}</p>
                      <p className="text-xs text-on-surface-variant">{order.user.origin}</p>
                    </Td>
                    <Td className="text-on-surface-variant">{order.itemCount} items</Td>
                    <Td className="font-medium text-on-surface">₦{order.totalPrice.toLocaleString()}</Td>
                    <Td>
                      <Badge tone={orderStatusTone(order.status)}>{statusLabel(order.status)}</Badge>
                    </Td>
                    <Td className="text-on-surface-variant">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}

export default function PartnerDetailsPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading partner...</p>}>
      <PartnerDetails />
    </Suspense>
  );
}
