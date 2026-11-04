import React, { FC, ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  growth?: number;
  icon?: ReactNode;
}

export const StatCard: FC<StatCardProps> = ({ label, value, growth, icon }) => {
  const isNegative = typeof growth === "number" && growth < 0;
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container/10 text-tertiary-container">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-on-surface">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {typeof growth === "number" && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isNegative ? "text-error" : "text-success"
            }`}
          >
            {isNegative ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
    </Card>
  );
};
