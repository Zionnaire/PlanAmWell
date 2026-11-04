import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== Admin API Instance ====================
const adminApi = axios.create({
  baseURL: `${BASE_URL}`,
});

// ==================== REQUEST INTERCEPTOR ====================
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(" [adminApi] Token attached to request");
      } else {
        console.warn(" [adminApi] No token found in localStorage");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================


adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only run client-side
    if (typeof window === "undefined") return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("🔄 [adminApi] 401 error - attempting token refresh");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/auth/refreshToken`, { refreshToken });

        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
    console.error("❌ [adminApi] Token refresh failed:", refreshError);
    localStorage.clear();
    
    // ONLY redirect if we aren't already on the login page
    if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
        window.location.assign("/auth/login");
    }
    return Promise.reject(refreshError);
}
}

    if (error.response?.status === 403) {
      console.error("❌ [adminApi] 403 Forbidden - Insufficient permissions");
    }

    return Promise.reject(error);
  }
);
// ==================== ADMIN AUTH SERVICES ====================
// Creating a new admin now requires an already-authenticated admin's own
// token (the backend route is no longer public) — routed through adminApi
// so that token is actually attached, instead of a bare unauthenticated call.
export const registerAdminService = async (adminData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  const { data } = await adminApi.post(`/admin/adminRegister`, adminData);
  return data?.data;
};

export const loginAdminService = async (credentials: { email: string; password: string }) => {
  const { data } = await axios.post(`${BASE_URL}/admin/adminLogin`, credentials);
  if (data.success && data.data.token) localStorage.setItem("token", data.data.token);
  return data?.data;
};

// ==================== ADMIN DASHBOARD SERVICES ====================
export const getPendingDoctors = async () => {
  const { data } = await adminApi.get("/admin/doctors/pending");
  return data?.data || [];
};

export const updateDoctorStatusService = async (doctorId: string, status: string) => {
  const { data } = await adminApi.put(`/admin/doctors/${doctorId}`, { status });
  return data?.data;
};

export const getAllDoctors = async () => {
  const { data } = await adminApi.get("/admin/doctors");
  return data?.data || [];
};

// The doctor detail page used to fetch the entire doctor list just to find
// one record by id. The public `/doctors/:id` route already exists and
// returns non-approved doctors too when called with an admin token, so use
// that instead.
export const getDoctorByIdService = async (doctorId: string) => {
  const { data } = await adminApi.get(`/doctors/${doctorId}`);
  return data?.data;
};

export const getAllUsers = async () => {
  const { data } = await adminApi.get("/admin/users");
  return data?.data || [];
};

export const getAUser = async (userId: string) => {
  const { data } = await adminApi.get(`admin/user/${userId}`);
  return data?.data;
};

export const getAllAdmins = async () => {
  const { data } = await adminApi.get("admin/allAdmins");
  return data?.data || [];
};

export const getCombinedGrowthService = async (months: number = 1) => {
  const { data } = await adminApi.get(`admin/combinedGrowth`, { params: { months } });
  return data?.data || data;
};

// ==================== ADMIN PARTNER SERVICES ====================
// Use adminApi with /partners prefix (assuming routes are under /admin)
export const getAllPartnersService = async () => {
  try {
    console.log("📡 Fetching all partners...");
    const { data } = await adminApi.get("/partners/");
    console.log("✅ Partners response:", data);
    return data?.data || [];
  } catch (error: any) {
    console.error("❌ getAllPartnersService error:", error.response?.data || error);
    throw error;
  }
};

export const getPartnerByIdService = async (partnerId: string) => {
  console.log("API URL:", adminApi.defaults.baseURL, `/partners/${partnerId}`);

  try {
    console.log("📡 Fetching partner:", partnerId);
    const { data } = await adminApi.get(`/partners/${partnerId}`);
    console.log("✅ Partner response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ getPartnerByIdService error:", error.response?.data || error.message || error);
    throw error;
  }
};


export const createPartnerService = async (formData: FormData) => {
  try {
    console.log("📡 Creating partner...");
    
    // Log what we're sending
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const { data } = await adminApi.post("/partners/", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("✅ Create partner response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ createPartnerService error:", error.response?.data || error);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    throw error;
  }
};

export const updatePartnerService = async (partnerId: string, formData: FormData) => {
  try {
    console.log("📡 Updating partner:", partnerId);
    const { data } = await adminApi.put(`/partners/${partnerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Update partner response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ updatePartnerService error:", error.response?.data || error);
    throw error;
  }
};

export const deletePartnerService = async (partnerId: string) => {
  try {
    console.log("📡 Deleting partner:", partnerId);
    const { data } = await adminApi.delete(`/partners/${partnerId}`);
    console.log("✅ Delete partner response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ deletePartnerService error:", error.response?.data || error);
    throw error;
  }
};

export const togglePartnerStatusService = async (partnerId: string) => {
  try {
    console.log("📡 Toggling partner status:", partnerId);
    const { data } = await adminApi.patch(`/partners/${partnerId}/toggle-status`);
    console.log("✅ Toggle status response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ togglePartnerStatusService error:", error.response?.data || error);
    throw error;
  }
};

export const getPartnerStatsService = async () => {
  try {
    console.log("📡 Fetching partner stats...");
    const { data } = await adminApi.get("/partners/stats");
    console.log("✅ Partner stats response:", data);
    return data?.data;
  } catch (error: any) {
    console.error("❌ getPartnerStatsService error:", error.response?.data || error);
    throw error;
  }
};

// ==================== ORDER SERVICES ====================
export const getAllOrdersService = async () => {
  const { data } = await adminApi.get("/admin/orders");
  return data?.data || [];
};

export const getOrderByIdService = async (orderId: string) => {
  const { data } = await adminApi.get(`/admin/orders/${orderId}`);
  return data?.data ?? null;
};

export const refreshOrderDeliveryService = async (orderId: string) => {
  const { data } = await adminApi.get(`/admin/orders/${orderId}/delivery`);
  return data;
};

// Orders only ever showed whatever Order.paymentStatus a partner webhook last
// wrote — if that webhook was delayed or never arrived, a paid order sat
// showing "pending" here indefinitely. Actively re-check with the partner
// instead, same fallback the web and mobile order pages already have.
export const verifyOrderPaymentService = async (orderId: string) => {
  const { data } = await adminApi.get(`/payment/by-order/${orderId}`);
  const paymentReference = data?.data?.paymentReference;
  if (!paymentReference) return null;
  const verifyRes = await adminApi.post(`/payment/verify`, { paymentReference });
  return verifyRes.data;
};

export const getCommissionReportService = async (year: number, month: number) => {
  const { data } = await adminApi.get("/admin/reports/commission", {
    params: { year, month },
  });
  return data?.data || [];
};

// ==================== PLATFORM SETTINGS ====================
export const getPlatformSettingsService = async () => {
  const { data } = await adminApi.get("/platform-settings");
  return data?.data;
};

export const updatePlatformSettingsService = async (consultationFeeKobo: number) => {
  const { data } = await adminApi.put("/platform-settings", { consultationFeeKobo });
  return data?.data;
};

// ==================== COMMUNITY HUB EVENTS ====================
export const getAllEventsAdminService = async () => {
  const { data } = await adminApi.get("/events/admin/all");
  return data?.data || [];
};

export type EventBannerPreset = "support-circle" | "workshop" | "qa-session" | "wellness" | "celebration";

export interface EventPayload {
  title: string;
  description: string;
  category?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  isVirtual: boolean;
  capacity?: number;
  bannerPreset?: EventBannerPreset;
  organizerName?: string;
  registrationUrl?: string;
  isPaidPlacement?: boolean;
  ticketPriceKobo?: number;
}

function eventPayloadToFormData(payload: Partial<EventPayload> & { isActive?: boolean; clearBanner?: boolean }): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  return form;
}

export const createEventService = async (payload: EventPayload, bannerFile?: File) => {
  const form = eventPayloadToFormData(payload);
  if (bannerFile) form.append("bannerImage", bannerFile);
  const { data } = await adminApi.post("/events", form);
  return data?.data;
};

export const updateEventService = async (
  id: string,
  payload: Partial<EventPayload> & { isActive?: boolean; clearBanner?: boolean },
  bannerFile?: File
) => {
  // A plain isActive-only toggle (the list page's Activate/Deactivate
  // action) never touches the banner — keep it a simple JSON PUT rather
  // than round-tripping through FormData for no reason.
  const keys = Object.keys(payload);
  if (!bannerFile && keys.length === 1 && keys[0] === "isActive") {
    const { data } = await adminApi.put(`/events/${id}`, payload);
    return data?.data;
  }
  const form = eventPayloadToFormData(payload);
  if (bannerFile) form.append("bannerImage", bannerFile);
  const { data } = await adminApi.put(`/events/${id}`, form);
  return data?.data;
};

export const deleteEventService = async (id: string) => {
  const { data } = await adminApi.delete(`/events/${id}`);
  return data;
};

// ==================== UTILITY FUNCTIONS ====================
export const isAdminAuthenticated = (): boolean => !!localStorage.getItem("token");

export const logoutAdmin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  console.log("✅ [logoutAdmin] Admin logged out");
};


/**
 * Get all orders for a specific partner
 */
export const getPartnerOrdersService = async (partnerId: string) => {
  try {
    console.log("📡 Fetching orders for partner:", partnerId);
    const { data } = await adminApi.get(`/partners/${partnerId}/orders`);
    console.log("✅ Partner orders response:", data);
    return data?.data || [];
  } catch (error: any) {
    console.error("❌ getPartnerOrdersService error:", error.response?.data || error);
    throw error;
  }
};

/**
 * Get commission report for a specific partner by month/year
 */
export const getPartnerCommissionReportService = async (
  partnerId: string,
  year: number,
  month: number
) => {
  try {
    console.log(`📡 Fetching commission report for partner: ${partnerId}, ${year}-${month}`);
    const { data } = await adminApi.get(`/partners/${partnerId}/commission`, {
      params: { year, month },
    });
    console.log("✅ Commission report response:", data);
    return data?.data || [];
  } catch (error: any) {
    console.error("❌ getPartnerCommissionReportService error:", error.response?.data || error);
    throw error;
  }
};
// ==================== EXPORTS ====================
export default {
  registerAdminService,
  loginAdminService,
  getPendingDoctors,
  updateDoctorStatusService,
  getAllDoctors,
  getDoctorByIdService,
  getAllUsers,
  getAUser,
  getAllAdmins,
  getCombinedGrowthService,
  isAdminAuthenticated,
  logoutAdmin,
  // Partner Services
  getAllPartnersService,
  getPartnerByIdService,
  createPartnerService,
  updatePartnerService,
  deletePartnerService,
  togglePartnerStatusService,
  getPartnerStatsService,
  getPartnerOrdersService,
  getPartnerCommissionReportService,
};