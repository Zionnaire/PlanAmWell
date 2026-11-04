import React, { FC, ReactNode } from "react";

type Tone = "success" | "warning" | "error" | "neutral" | "info";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, { bg: string; fg: string; dot: string }> = {
  success: { bg: "bg-success-container", fg: "text-on-success-container", dot: "bg-success" },
  warning: { bg: "bg-secondary-fixed", fg: "text-on-secondary-fixed-variant", dot: "bg-secondary" },
  error: { bg: "bg-error-container", fg: "text-on-error-container", dot: "bg-error" },
  info: { bg: "bg-tertiary-fixed", fg: "text-on-tertiary-fixed-variant", dot: "bg-tertiary" },
  neutral: { bg: "bg-surface-container-highest", fg: "text-on-surface-variant", dot: "bg-outline" },
};

export const Badge: FC<BadgeProps> = ({ children, tone = "neutral", dot = true, className = "" }) => {
  const t = toneClasses[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${t.bg} ${t.fg} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
};
