"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Users, BookOpen, MessageCircle, Shield, Star, Check } from "lucide-react";
import { EventBannerPreset } from "../../services/AdminService";

// Kept in sync by hand with backend/src/models/Event.ts (EVENT_BANNER_PRESETS)
// and web/src/components/community/EventBanner.tsx — same 5 keys, same
// gradients, so a preset picked here looks identical to what patients see.
export const PRESETS: { key: EventBannerPreset; label: string; icon: React.ElementType; gradient: string }[] = [
  { key: "support-circle", label: "Support Groups", icon: Users, gradient: "linear-gradient(135deg, #d81e5b 0%, #b10045 100%)" },
  { key: "workshop", label: "Workshops & Learning", icon: BookOpen, gradient: "linear-gradient(135deg, #feae2c 0%, #835500 100%)" },
  { key: "qa-session", label: "Q&A / Ask the Expert", icon: MessageCircle, gradient: "linear-gradient(135deg, #0b71cd 0%, #0058a4 100%)" },
  { key: "wellness", label: "Wellness & Safety", icon: Shield, gradient: "linear-gradient(135deg, #d81e5b 0%, #0b71cd 100%)" },
  { key: "celebration", label: "Community & Social", icon: Star, gradient: "linear-gradient(135deg, #d81e5b 0%, #feae2c 50%, #0b71cd 100%)" },
];

// Compact read-only thumbnail for the events list/table — same visual
// treatment (photo or gradient+icon) as the full picker/patient-facing
// banner, just small.
export function EventBannerThumb({
  imageUrl,
  preset,
  className = "h-10 w-10",
}: {
  imageUrl?: string | null;
  preset?: EventBannerPreset | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={`shrink-0 rounded-xl object-cover ${className}`} />
    );
  }
  const spec = PRESETS.find((p) => p.key === preset) || PRESETS[PRESETS.length - 1];
  const Icon = spec.icon;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl text-white ${className}`}
      style={{ background: spec.gradient }}
    >
      <Icon size={16} />
    </div>
  );
}

interface EventBannerPickerProps {
  existingImageUrl?: string | null;
  preset?: EventBannerPreset | null;
  onFileSelected: (file: File | null) => void;
  onPresetSelected: (preset: EventBannerPreset | null) => void;
  filePreviewUrl: string | null;
}

export function EventBannerPicker({
  existingImageUrl,
  preset,
  onFileSelected,
  onPresetSelected,
  filePreviewUrl,
}: EventBannerPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "preset">(existingImageUrl || filePreviewUrl ? "upload" : "preset");

  const previewUrl = filePreviewUrl || existingImageUrl;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    onFileSelected(f);
    onPresetSelected(null);
  }

  function clearUpload() {
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-on-surface">Event banner</label>
        <div className="flex gap-1 rounded-full bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "upload" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            Upload photo
          </button>
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "preset" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            Use built-in
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        previewUrl ? (
          <div className="relative h-40 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Banner preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clearUpload}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Remove banner"
            >
              <X size={16} />
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
        ) : (
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-variant bg-surface-container-low transition-colors hover:bg-surface-container">
            <Upload size={28} className="mb-2 text-outline" />
            <span className="text-sm font-semibold text-on-surface-variant">Upload a banner or flyer</span>
            <span className="mt-1 text-xs text-outline">1200 x 400px recommended, up to 5MB</span>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const selected = preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onPresetSelected(p.key)}
                className={`relative flex h-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl text-white transition-all ${
                  selected ? "ring-2 ring-primary ring-offset-2" : "opacity-90 hover:opacity-100"
                }`}
                style={{ background: p.gradient }}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-primary">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <Icon size={22} />
                <span className="px-2 text-center text-[11px] font-semibold leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
