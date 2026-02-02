"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const loginData = await res.json();

      if (!res.ok) {
        setError(loginData.error || "Login failed");
        setLoading(false);
        return;
      }

      document.cookie = `session=${loginData.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (loginData.user.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/shop";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Login to Bazarsip</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Register here
        </Link>
      </p>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="font-semibold text-blue-900 mb-2">Test Accounts:</p>
        <div className="space-y-1 text-blue-800">
          <p>
            <strong>Admin:</strong> admin@bazarsip.com / admin123
          </p>
          <p>
            <strong>Customer:</strong> customer@bazarsip.com / customer123
          </p>
        </div>
      </div>
    </form>
  );
}
