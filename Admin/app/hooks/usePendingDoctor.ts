// hooks/usePendingDoctors.ts
import { useState, useEffect } from "react";
import { getPendingDoctors, updateDoctorStatusService } from "../services/AdminService";

export const usePendingDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all pending doctors
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const pending = await getPendingDoctors();
      setDoctors(pending);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch pending doctors");
    } finally {
      setLoading(false);
    }
  };

  // Update doctor status
  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      const updatedDoctor = await updateDoctorStatusService(id, status);

      // Update the doctor in state with backend response
      setDoctors((prev) =>
        prev.map((doc) => (doc._id === id ? updatedDoctor : doc))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update doctor status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, updatingId, error, updateStatus, fetchDoctors };
};
