import type { ReactNode } from "react";

type Tone = "success" | "warning" | "error" | "neutral" | "info";

const TONE_MAP: Record<string, Tone> = {
  paid: "success",
  delivered: "success",
  shipped: "info",
  processing: "info",
  pending: "warning",
  failed: "error",
  cancelled: "error",
};

export function orderStatusTone(status?: string): Tone {
  return TONE_MAP[status?.toLowerCase() ?? ""] ?? "neutral";
}

export function statusLabel(status?: string): ReactNode {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
