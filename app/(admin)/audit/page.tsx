"use client";

import { useEffect, useState } from "react";
import { auditActionLabel, AUDIT_ACTION_LABELS } from "@/lib/labels";

interface AuditEntry {
  id: number;
  user_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

const DESTRUCTIVE = new Set([
  "product_delete",
  "category_delete",
  "supplier_delete",
  "user_delete",
  "user_role_change",
  "totp_disabled",
]);

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/audit?page=${page}&action=${filter}`);
        const data = await res.json();
        if (data.success) {
          setEntries(data.data);
          setTotalPages(data.pagination.totalPages);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [page, filter]);

  function when(value: string) {
    return new Date(value).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Riwayat Aktivitas
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Catatan siapa mengubah apa. Tidak bisa dihapus atau diubah.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">Semua aktivitas</option>
          {Object.keys(AUDIT_ACTION_LABELS).map((action) => (
            <option key={action} value={action}>
              {auditActionLabel(action)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-600">Memuat riwayat…</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <li key={entry.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        DESTRUCTIVE.has(entry.action)
                          ? "bg-red-100 text-red-800"
                          : entry.action === "login_failed"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {auditActionLabel(entry.action)}
                    </span>
                    <p className="text-sm text-gray-900 mt-1.5 break-all">
                      {entry.user_email ?? "(tanpa akun)"}
                    </p>
                    {entry.entity && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {entry.entity}: {entry.entity_id}
                      </p>
                    )}
                    {entry.details && (
                      <p className="text-xs text-gray-500 mt-0.5 break-all">
                        {Object.entries(entry.details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {when(entry.created_at)}
                    </p>
                    {entry.ip && (
                      <p className="text-xs text-gray-400 mt-0.5">{entry.ip}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700">
              Hal {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2.5 border rounded-lg disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2.5 border rounded-lg disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
