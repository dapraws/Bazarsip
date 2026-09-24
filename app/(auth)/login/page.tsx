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
  // Held between the password step and the code step. Not a session: it
  // permits one thing, submitting a code, and expires in minutes.
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);

  // The server sets the session as an httpOnly cookie. Writing it from here
  // would create a second copy that scripts can read, which is exactly what
  // httpOnly prevents.
  function goToLanding(role: string) {
    window.location.href = role === "admin" ? "/dashboard" : "/shop";
  }

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
        setError(loginData.error || "Email atau kata sandi salah");
        setLoading(false);
        return;
      }

      if (loginData.requires2fa) {
        setChallenge(loginData.challenge);
        setLoading(false);
        return;
      }

      goToLanding(loginData.user.role);
    } catch {
      setError("Ada masalah. Coba lagi.");
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, code, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kode salah");
        setLoading(false);
        return;
      }

      goToLanding(data.user.role);
    } catch {
      setError("Ada masalah. Coba lagi.");
      setLoading(false);
    }
  }

  if (challenge) {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <h1 className="text-2xl font-bold text-center">Verifikasi</h1>
        <p className="text-center text-sm text-gray-600">
          Buka aplikasi authenticator di HP dan masukkan 6 angka yang tampil.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span>
            Ingat HP ini selama 30 hari
            <span className="block text-xs text-gray-500">
              Jangan dicentang kalau ini bukan perangkatmu sendiri.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Memeriksa…" : "Lanjut"}
        </button>

        <p className="text-center text-xs text-gray-500">
          HP hilang atau ganti? Masukkan salah satu kode cadangan di kolom yang
          sama.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Masuk ke Bazarsip</h1>

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
          placeholder="nama@email.com"
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
          Kata Sandi
        </label>
        <input
          id="password"
          type="password"
          placeholder="Kata sandi"
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
        {loading ? "Masuk…" : "Masuk"}
      </button>

      <p className="text-sm text-center text-gray-600">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Daftar di sini
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
