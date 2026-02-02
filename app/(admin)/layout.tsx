"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, lazy, Suspense } from "react";

const AdminSidebar = lazy(() => import("app/components/admin/Sidebar"));

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "session=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<SidebarSkeleton />}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </Suspense>

      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}
      >
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
      <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
        <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
      <nav className="px-4 py-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded animate-pulse"></div>
        ))}
      </nav>
    </aside>
  );
}
