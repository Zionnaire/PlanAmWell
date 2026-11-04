import { useState, useEffect, useCallback } from "react";
import { getAllUsers, getAUser } from "../services/AdminService";

export const useAllUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = async (userId: string) => {
    setModalLoading(true);
    setModalError(null);

    try {
      const user = await getAUser(userId);
      setSelectedUser(user);
    } catch (err: any) {
      setModalError(err.message || "Failed to fetch user details");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,

    selectedUser,
    fetchUserById,
    modalLoading,
    modalError,
    setSelectedUser,
  };
};
