import React, { FC, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export const Card: FC<CardProps> = ({ children, className = "", padding = true, ...props }) => (
  <div
    className={`rounded-[28px] bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${
      padding ? "p-6" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);
