"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import { registerAdminService, isAdminAuthenticated } from "../../services/AdminService";

// Creating a new admin account now requires an already-authenticated admin
// (the backend route is no longer public — see adminRoutes.ts) — this page
// itself used to be reachable by anyone, letting them self-register full
// admin access with no invite or approval step. The real gate is on the
// backend; this redirect is just so a signed-out visitor gets sent to login
// instead of hitting a confusing failure after filling out the form.
export default function AdminRegisterPage() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/auth/login");
    }
  }, [router]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerAdminService(form);
      setSuccess(true);
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      {/* Left Side Image */}
      <div
        className="hidden md:flex w-1/2 relative"
        style={{ backgroundImage: "url('/reproductive.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center px-6">
          <h1 className="text-white text-4xl font-bold text-center drop-shadow-lg">
            Welcome to Plan Am Well Admin
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 py-12 md:py-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6 border border-gray-200"
          style={{ background: colors.card, color: colors.text }}
        >
          <h2 className="text-3xl font-bold text-center">Create Admin Account</h2>
          <p className="text-center text-sm text-gray-500">
            Add a new administrator to Plan Am Well
          </p>

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              Admin account created successfully.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded border outline-none focus:ring-2 focus:ring-pink-500 transition"
              style={{ borderColor: colors.border, background: colors.background, color: colors.text }}
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded border outline-none focus:ring-2 focus:ring-pink-500 transition"
              style={{ borderColor: colors.border, background: colors.background, color: colors.text }}
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded border outline-none focus:ring-2 focus:ring-pink-500 transition"
            style={{ borderColor: colors.border, background: colors.background, color: colors.text }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded border outline-none focus:ring-2 focus:ring-pink-500 transition"
            style={{ borderColor: colors.border, background: colors.background, color: colors.text }}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition transform active:scale-95 ${
              loading ? "opacity-70 cursor-not-allowed bg-pink-600" : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <a href="/dashboard" className="text-pink-600 hover:underline font-medium">
              &larr; Back to Dashboard
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
