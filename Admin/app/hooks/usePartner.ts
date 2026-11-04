// hooks/usePartner.ts
import { useState, useCallback } from "react";
import {
  getAllPartnersService,
  getPartnerByIdService,
  createPartnerService,
  updatePartnerService,
  deletePartnerService,
  togglePartnerStatusService,
  getPartnerStatsService,
} from "../services/AdminService";

import { Partner } from "../types/partner";



interface UsePartnerHook {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  stats: any;

  fetchAllPartners: () => Promise<void>;
  fetchPartnerById: (id: string) => Promise<Partner | null>;
  createPartner: (formData: FormData) => Promise<Partner | null>;
  updatePartner: (id: string, formData: FormData) => Promise<Partner | null>;
  deletePartner: (id: string) => Promise<boolean>;
  togglePartnerStatus: (id: string) => Promise<Partner | null>;
  fetchPartnerStats: () => Promise<any>;
}

export const usePartner = (): UsePartnerHook => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

const fetchAllPartners = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await getAllPartnersService();
    
    // ✅ FIX: Extract array from { success: true, count: 4, data: [...] }
    const actualData = response?.data || (Array.isArray(response) ? response : []);

    const mappedPartners = actualData.map((p: any) => ({
      ...p,
      _id: p._id,
      name: p.name,
      logo: p.partnerImage?.url || p.partnerImage || "",
      website: p.website || p.socialLinks?.[0] || "",
      status: p.isActive ? "active" : "inactive",
    }));

    setPartners(mappedPartners);
  } catch (err: any) {
    setError(err.message || "Failed to fetch partners");
  } finally {
    setLoading(false); // This stops contextLoading
  }
}, []);
  const fetchPartnerById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartnerByIdService(id);
      if (!data) return null;

      return {
        _id: data._id,
        name: data.name,
        logo: data.partnerImage?.url || data.partnerImage || "",
        website: data.website || data.socialLinks?.[0] || "",
        status: data.isActive ? "active" : "inactive",
        ...data,
      };
    } catch (err: any) {
      console.error("[usePartner] fetchPartnerById error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to fetch partner");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPartner = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📤 Sending create partner request...");
      
      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const newPartner = await createPartnerService(formData);
      console.log("✅ Partner created:", newPartner);
      
      setPartners((prev) => [...prev, newPartner]);
      return newPartner;
    } catch (err: any) {
      console.error("[usePartner] createPartner error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to create partner";
      setError(errorMessage);
      
      // Re-throw the error so the component can catch it
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePartner = useCallback(async (id: string, formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📤 Sending update partner request for ID:", id);
      
      const updatedPartner = await updatePartnerService(id, formData);
      console.log("✅ Partner updated:", updatedPartner);
      
      setPartners((prev) =>
        prev.map((p) => (p._id === id ? updatedPartner : p))
      );
      return updatedPartner;
    } catch (err: any) {
      console.error("[usePartner] updatePartner error:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to update partner";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePartner = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePartnerService(id);
      setPartners((prev) => prev.filter((p) => p._id !== id));
      return true;
    } catch (err: any) {
      console.error("[usePartner] deletePartner error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to delete partner");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePartnerStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPartner = await togglePartnerStatusService(id);
      setPartners((prev) =>
        prev.map((p) => (p._id === id ? updatedPartner : p))
      );
      return updatedPartner;
    } catch (err: any) {
      console.error("[usePartner] togglePartnerStatus error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to toggle status");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPartnerStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartnerStatsService();
      setStats(data);
      return data;
    } catch (err: any) {
      console.error("[usePartner] fetchPartnerStats error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to fetch stats");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    partners,
    loading,
    error,
    stats,
    fetchAllPartners,
    fetchPartnerById,
    createPartner,
    updatePartner,
    deletePartner,
    togglePartnerStatus,
    fetchPartnerStats,
  };
};