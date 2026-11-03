"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  /**
   * ✅ Improved Token Check
   * Redirects to dashboard if a valid token exists
   */
  useEffect(() => {
    if (!hydrated) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Simple JWT expiration check
        const payload = token.split(".")[1];
        if (!payload) throw new Error("Invalid token format");
        
        const decoded = JSON.parse(atob(payload));
        const isExpired = decoded?.exp && Date.now() >= decoded.exp * 1000;

        if (isExpired) {
          console.warn("Token expired, clearing storage.");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Token validation failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    }
  }, [hydrated, router]);

  if (!hydrated) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/adminLogin`,
        {
          email: form.email.trim(),
          password: form.password,
        }
      );

      // Extract data from standard response format
      const loginData = response.data?.data || response.data;
      const token = loginData?.token;
      const refreshToken = loginData?.refreshToken;

      if (!token) {
        throw new Error("Authentication failed: Token not received.");
      }

      // ✅ Store both Access and Refresh tokens
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Side Image Decoration */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/Reproductive.jpeg')" }}
      >
        <div className="w-full h-full bg-black/20 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold px-10 text-center drop-shadow-lg">
                Welcome to Plan Am Well Admin
            </h1>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border"
          style={{ 
            background: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }}
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
            <p className="text-sm opacity-70">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full p-3 rounded border outline-none transition-all focus:ring-2 focus:ring-pink-500/20"
                style={{
                  borderColor: colors.border,
                  background: colors.background,
                  color: colors.text,
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full p-3 rounded border outline-none transition-all focus:ring-2 focus:ring-pink-500/20"
                style={{
                  borderColor: colors.border,
                  background: colors.background,
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <div className="flex justify-center items-center mt-6 mb-8 text-sm">
            <Link href="/auth/forgot-password" className="text-pink-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold transition-all transform active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-md"
            }`}
            style={{ background: colors.primary, color: "#fff" }}
          >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                </div>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}