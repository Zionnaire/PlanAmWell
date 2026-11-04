"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, BarChart2, TrendingUp } from "lucide-react";
import { getCommissionReportService } from "../../../services/AdminService";
import { orderStatusTone, statusLabel } from "../../../lib/orderStatus";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { StatCard } from "../../../components/ui/StatCard";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../../components/ui/Table";

interface CommissionRecord {
  orderDate?: string;
  orderStatus?: string;
  orderCode?: string;
  itemsPurchased?: number;
  totalTransactionValue?: number;
  commissionAmountDue?: number;
  [key: string]: any;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CommissionReportPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommissionReportService(year, month);
      setRecords(Array.isArray(data) ? data : data?.orders ?? data?.records ?? []);
      setFetched(true);
    } catch (err: any) {
      setError("Failed to fetch commission report. Please try again.");
      console.error("Commission report error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = records.length;
  const totalTransactionValue = records.reduce((sum, r) => sum + Number(r.totalTransactionValue ?? 0), 0);
  const totalCommission = records.reduce((sum, r) => sum + Number(r.commissionAmountDue ?? 0), 0);

  const yearOptions = Array.from({ length: now.getFullYear() - 2019 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-on-surface">
            <BarChart2 size={22} className="text-primary" /> Commission Report
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">Monthly commission breakdown from partner orders.</p>
        </div>
      </div>

      <Card className="flex flex-col items-end gap-4 sm:flex-row">
        <div className="w-full sm:w-32">
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={fetchReport} disabled={loading} className="w-full sm:w-auto">
          <Search size={16} />
          {loading ? "Loading..." : "Generate Report"}
        </Button>
      </Card>

      {error && <div className="rounded-2xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>}

      {fetched && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={`Total Orders — ${MONTHS[month - 1]} ${year}`} value={totalOrders} />
            <StatCard label="Total Transaction Value" value={`₦${totalTransactionValue.toLocaleString()}`} />
            <StatCard
              label="Total Commission Due"
              value={`₦${totalCommission.toLocaleString()}`}
              icon={<TrendingUp size={18} />}
            />
          </div>

          <Card padding={false}>
            {records.length === 0 ? (
              <p className="p-6 text-on-surface-variant">
                No commission records found for {MONTHS[month - 1]} {year}.
              </p>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Order Code</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th className="text-center">Items</Th>
                    <Th className="text-right">Transaction Value</Th>
                    <Th className="text-right">Commission Due</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {records.map((r, idx) => (
                    <Tr key={idx}>
                      <Td className="font-mono text-xs text-on-surface-variant">{r.orderCode ?? r.orderId ?? "—"}</Td>
                      <Td className="text-on-surface-variant">
                        {r.orderDate ? new Date(r.orderDate).toLocaleDateString() : "—"}
                      </Td>
                      <Td>{r.orderStatus ? <Badge tone={orderStatusTone(r.orderStatus)}>{statusLabel(r.orderStatus)}</Badge> : "—"}</Td>
                      <Td className="text-center text-on-surface-variant">{r.itemsPurchased ?? "—"}</Td>
                      <Td className="text-right font-medium text-on-surface">
                        ₦{Number(r.totalTransactionValue ?? 0).toLocaleString()}
                      </Td>
                      <Td className="text-right font-semibold text-primary">
                        ₦{Number(r.commissionAmountDue ?? 0).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <tfoot className="border-t border-surface-variant bg-surface-container-low">
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-on-surface-variant">
                      Totals ({totalOrders} orders)
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-on-surface">
                      ₦{totalTransactionValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-primary">
                      ₦{totalCommission.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            )}
          </Card>
        </>
      )}

      {!fetched && !loading && (
        <Card className="py-12 text-center">
          <BarChart2 size={40} className="mx-auto mb-3 text-outline" />
          <p className="text-on-surface-variant">
            Select a year and month, then click <strong>Generate Report</strong>.
          </p>
        </Card>
      )}
    </div>
  );
}
