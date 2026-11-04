// hooks/useApi.ts
import { useState, useCallback } from "react";

export const useApi = <T,>(apiFunc: (...args: any[]) => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFunc(...args);
        setData(res);
        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Request failed";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
};
