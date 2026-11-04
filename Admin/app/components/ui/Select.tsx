"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="pl-4 text-sm font-semibold text-on-surface">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`h-14 w-full appearance-none rounded-full border border-transparent bg-surface-container-low pl-6 pr-10 text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
