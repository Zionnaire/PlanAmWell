// hooks/useCombinedGrowth.ts
import { useState, useEffect, useCallback } from "react";
import { getCombinedGrowthService } from "../services/AdminService";

export const useCombinedGrowth = (months: number = 1) => {
  const [growthData, setGrowthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCombinedGrowthService(months);
      setGrowthData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch growth data");
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    fetchGrowth();
  }, [fetchGrowth]);

  return {
    growthData,
    loading,
    error,
    refetch: fetchGrowth,
  };
};
