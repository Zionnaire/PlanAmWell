// services/AdvocacyService.ts
import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// --------------------------------------
// Helper: Get token directly
// --------------------------------------
const getToken = (): string | null => {
  if (typeof window === "undefined") {
    console.log("[getToken] Running on server, no token available");
    return null;
  }

  const token = localStorage.getItem("token");
  console.log("[getToken] Token from localStorage:", token);
  return token;
};

// --------------------------------------
// PUBLIC
// --------------------------------------
export const getPublicArticles = async (params = {}) => {
  const res = await axios.get(`${BASE}/advocacy`, { params });
  return res.data;
};

export const getArticleBySlug = async (slug: string) => {
  const res = await axios.get(`${BASE}/advocacy/${slug}`);
  return res.data?.data;
};

// --------------------------------------
// ADMIN
// --------------------------------------
export const adminGetAllArticles = async (params = {}) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.get(`${BASE}/advocacy/admin/all`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const adminCreateArticle = async (payload: any, file?: File) => {
  if (typeof window === "undefined") {
    throw new Error("Cannot call this on the server");
  }

  const token = getToken();
  if (!token) throw new Error("Not authenticated as Admin.");

  // Build FormData
  const form = new FormData();
 for (const key in payload) {
  const value = payload[key];
  if (value !== undefined && value !== null) {
    if (key === "author" && typeof value === "object") {
      // Append each author field individually
      for (const aKey in value) {
        form.append(`author[${aKey}]`, value[aKey]);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => form.append(`${key}[]`, item));
    } else {
      form.append(key, value.toString());
    }
  }
}

  if (file) form.append("featuredImage", file);

  // Build headers properly
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    // NOTE: Do NOT set Content-Type manually for FormData
  };

  // Debug logging
  console.log("[adminCreateArticle] POST URL:", `${BASE}/advocacy/admin`);
  console.log("[adminCreateArticle] Headers:", headers);
  console.log("[adminCreateArticle] FormData entries:");
  for (const pair of form.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const res = await axios.post(`${BASE}/advocacy/admin`, form, { headers });
    console.log("[adminCreateArticle] Success:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("[adminCreateArticle] Axios Error:", error);
    console.error("[adminCreateArticle] Error Response:", error.response);
    console.error("[adminCreateArticle] Status:", error.response?.status);
    console.error("[adminCreateArticle] Request Headers:", error.config?.headers);
    throw error;
  }
};

export const adminUpdateArticle = async (id: string, payload: any, file?: File) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  
  for (const key in payload) {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          form.append(`${key}[]`, item);
        });
      } else {
        form.append(key, value.toString());
      }
    }
  }
  
  if (file) {
    form.append("featuredImage", file);
  }

  const res = await axios.put(`${BASE}/advocacy/admin/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const adminDeleteArticle = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.delete(`${BASE}/advocacy/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getAdvocacyStats = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.get(`${BASE}/advocacy/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getArticleStats = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.get(`${BASE}/advocacy/admin/stats/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};