"use client";

import React, { FC, HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes, useState } from "react";

export const Table: FC<HTMLAttributes<HTMLTableElement>> = ({ className = "", children, ...props }) => (
  <div className="overflow-x-auto">
    <table className={`w-full border-collapse text-left ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", children, ...props }) => (
  <thead className={`border-b border-surface-variant bg-surface-container-low/50 ${className}`} {...props}>
    {children}
  </thead>
);

export const Tbody: FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", children, ...props }) => (
  <tbody className={`divide-y divide-surface-variant ${className}`} {...props}>
    {children}
  </tbody>
);

export const Tr: FC<HTMLAttributes<HTMLTableRowElement>> = ({ className = "", children, ...props }) => (
  <tr className={`group transition-colors hover:bg-surface-container-low/50 ${className}`} {...props}>
    {children}
  </tr>
);

export const Th: FC<ThHTMLAttributes<HTMLTableCellElement>> = ({ className = "", children, ...props }) => (
  <th
    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const Td: FC<TdHTMLAttributes<HTMLTableCellElement>> = ({ className = "", children, ...props }) => (
  <td className={`px-6 py-4 text-sm text-on-surface ${className}`} {...props}>
    {children}
  </td>
);

export const RowActions: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
    {children}
  </div>
);

export const AvatarInitials: FC<{ name: string; src?: string | null; className?: string }> = ({
  name,
  src,
  className = "",
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const showImage = src && !imgFailed;
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tertiary-container text-sm font-bold text-on-tertiary-container ${className}`}
    >
      {showImage ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setImgFailed(true)} />
      ) : (
        initials || "?"
      )}
    </div>
  );
};
