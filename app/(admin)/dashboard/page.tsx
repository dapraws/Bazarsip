import { pool } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import StatsCards from "app/components/admin/StatsCard";
import QuickActions from "app/components/admin/QuickActions";
import RecentOrdersTable from "app/components/admin/RecentOrderTable";

async function getStats() {
  const [products, categories, orders, users] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM products"),
    pool.query("SELECT COUNT(*) FROM categories"),
    pool.query("SELECT COUNT(*), SUM(total) FROM orders"),
    pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
  ]);

  return {
    totalProducts: parseInt(products.rows[0].count),
    totalCategories: parseInt(categories.rows[0].count),
    totalOrders: parseInt(orders.rows[0].count || 0),
    totalRevenue: parseFloat(orders.rows[0].sum || 0),
    totalCustomers: parseInt(users.rows[0].count),
  };
}

async function getRecentOrders() {
  const result = await pool.query(`
    SELECT o.*, u.name as customer_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 5
  `);
  return result.rows;
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats with loading state */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards stats={stats} />
      </Suspense>

      <QuickActions />

      <Suspense fallback={<OrdersTableSkeleton />}>
        <RecentOrdersTable orders={recentOrders} />
      </Suspense>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-6 border animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
