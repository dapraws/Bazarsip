"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserRole(userId: number, currentRole: string) {
    const newRole = currentRole === "admin" ? "customer" : "admin";

    if (!confirm(`Change role to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        alert("Role updated!");
        fetchUsers();
      } else {
        alert("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola akun pelanggan dan admin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat pengguna…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Belum ada pengguna</div>
        ) : (
          <>
            {/* Phone: stacked cards; the six-column table has no room. */}
            <ul className="md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600 break-all">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Bergabung{" "}
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleUserRole(user.id, user.role)}
                    className="w-full mt-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Ubah jadi {user.role === "admin" ? "customer" : "admin"}
                  </button>
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Peran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bergabung
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{user.id}</td>
                  <td className="px-6 py-4 text-sm">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleUserRole(user.id, user.role)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ubah peran
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
