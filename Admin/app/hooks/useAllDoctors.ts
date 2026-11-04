import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to flatten nested objects for safe rendering
const normalizeDoctor = (doc: any) => ({
  ...doc,
  fullName: doc.name || `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "No Name",
  specializationDisplay:
    typeof doc.specialization === "string"
      ? doc.specialization
      : Array.isArray(doc.specialization)
      ? doc.specialization.join(", ")
      : JSON.stringify(doc.specialization || "Unknown"),
  createdAtDisplay: doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString()
    : "N/A",
  availableDisplay: doc.available
    ? `${doc.available.from || "N/A"} - ${doc.available.to || "N/A"}`
    : "N/A",
});

export const useAllDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(data.data.map(normalizeDoctor));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.put(
        `${BASE_URL}/admin/doctors/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoctors((prev) =>
        prev.map((doc) => (doc._id === id ? normalizeDoctor(data.data) : doc))
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

  return { doctors, loading, updatingId, error, fetchDoctors, updateDoctorStatus };
};
