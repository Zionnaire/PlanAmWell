"use client";

import React, { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="pl-4 text-sm font-semibold text-on-surface">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`h-14 w-full rounded-full border border-transparent bg-surface-container-low px-6 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              icon ? "pl-12" : ""
            } ${error ? "border-error" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="pl-4 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
