"use client";

import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-inverse-surface/20 backdrop-blur-xl"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg rounded-3xl border border-outline-variant/50 bg-surface-container-lowest/90 p-8 shadow-2xl backdrop-blur-xl ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
        >
          <X size={18} />
        </button>
        {title && <h2 className="mb-2 text-2xl font-bold text-on-surface pr-8">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
