"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container hover:opacity-90",
  tertiary: "bg-tertiary-container text-on-tertiary hover:opacity-90",
  outline: "border-2 border-outline text-on-surface hover:bg-surface-container-high bg-transparent",
  ghost: "text-on-surface-variant hover:bg-surface-container-high bg-transparent",
  danger: "bg-error text-on-error hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  md: "h-14 px-6 text-sm",
  sm: "h-10 px-4 text-xs",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
