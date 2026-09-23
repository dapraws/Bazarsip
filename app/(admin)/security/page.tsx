"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Step = "loading" | "off" | "scanning" | "codes" | "on";

export default function SecurityPage() {
  const [step, setStep] = useState<Step>("loading");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setStep(data.success && data.user.totp_enabled ? "on" : "off");
    })();
  }, []);

  async function startSetup() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const data = await res.json();
    setBusy(false);

    if (!data.success) {
      setError(data.error || "Gagal memulai");
      return;
    }

    setQr(data.data.qr);
    setSecret(data.data.secret);
    setStep("scanning");
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setBusy(false);

    if (!data.success) {
      setError(data.error || "Kode salah");
      return;
    }

    setRecoveryCodes(data.data.recoveryCodes);
    setCode("");
    setStep("codes");
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setBusy(false);

    if (!data.success) {
      setError(data.error || "Gagal menonaktifkan");
      return;
    }

    setPassword("");
    setStep("off");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Keamanan Akun
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Verifikasi dua langkah: walau kata sandi bocor, orang lain tetap
          butuh HP-mu untuk masuk.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
        {step === "loading" && <p className="text-gray-600">Memuat…</p>}

        {step === "off" && (
          <>
            <p className="text-sm text-gray-700">
              Belum aktif. Kamu perlu aplikasi authenticator di HP — Google
              Authenticator atau Authy, keduanya gratis.
            </p>
            <button
              onClick={startSetup}
              disabled={busy}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Menyiapkan…" : "Aktifkan"}
            </button>
          </>
        )}

        {step === "scanning" && (
          <form onSubmit={confirmSetup} className="space-y-4">
            <p className="text-sm text-gray-700">
              1. Buka aplikasi authenticator, pilih tambah akun, lalu pindai
              kode ini.
            </p>

            {qr && (
              <Image
                src={qr}
                alt="Kode QR untuk aplikasi authenticator"
                width={240}
                height={240}
                unoptimized
                className="rounded-lg border border-gray-200"
              />
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">
                Tidak bisa memindai?
              </summary>
              <p className="mt-2 text-gray-700">
                Masukkan kode ini manual di aplikasi:
              </p>
              <code className="mt-1 block break-all rounded bg-gray-100 p-2 text-xs">
                {secret}
              </code>
            </details>

            <p className="text-sm text-gray-700">
              2. Masukkan 6 angka yang muncul, untuk memastikan sudah cocok.
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.4em]"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("off")}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {busy ? "Memeriksa…" : "Aktifkan"}
              </button>
            </div>
          </form>
        )}

        {step === "codes" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              <strong>Simpan sekarang.</strong> Kode ini hanya tampil sekali.
              Kalau HP hilang atau ganti, ini satu-satunya jalan masuk. Foto
              atau tulis di tempat aman — jangan di HP yang sama.
            </div>

            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {recoveryCodes.map((rc) => (
                <li key={rc} className="rounded bg-gray-100 px-3 py-2">
                  {rc}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setStep("on")}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg"
            >
              Sudah saya simpan
            </button>
          </div>
        )}

        {step === "on" && (
          <form onSubmit={disable} className="space-y-4">
            <p className="text-sm font-medium text-green-700">
              Aktif. Setiap masuk akan diminta kode dari HP.
            </p>
            <p className="text-sm text-gray-600">
              Untuk mematikan, masukkan kata sandimu.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {busy ? "Memproses…" : "Matikan verifikasi dua langkah"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
