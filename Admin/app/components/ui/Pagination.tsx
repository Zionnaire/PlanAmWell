"use client";

import React, { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5
  );

  return (
    <div className="flex flex-col gap-3 border-t border-surface-variant px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-on-surface-variant">
        Showing <span className="font-semibold text-on-surface">{start}</span> to{" "}
        <span className="font-semibold text-on-surface">{end}</span> of{" "}
        <span className="font-semibold text-on-surface">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-variant text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              p === page
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-variant text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
