"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { usePartner as usePartnerHook } from "../hooks/usePartner";
import { Partner } from "../types/partner";

interface PartnerContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  fetchAllPartners: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const { partners, loading, error, fetchAllPartners } = usePartnerHook();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Check ref first, then token.
    if (!hasFetchedRef.current && token) {
      hasFetchedRef.current = true; // Set this BEFORE the async call to prevent race conditions
      fetchAllPartners();
    }
  }, [fetchAllPartners]);

  return (
    <PartnerContext.Provider value={{ partners, loading, error, fetchAllPartners }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => {
  const context = useContext(PartnerContext);
  if (!context) throw new Error("usePartnerContext must be used within PartnerProvider");
  return context;
};
