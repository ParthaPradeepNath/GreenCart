"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const AdminDashboard = () => {
  const { user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading dashboard...</div>;
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: "/images/box_icon.svg",
      href: "/admin/products",
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: "/images/order_icon.svg",
      href: "/admin/orders",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: "/images/refresh_icon.svg",
      href: "/admin/orders",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "/images/profile_icon.png",
      href: "/admin",
      color: "bg-purple-100 text-purple-700",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: "/images/coin_icon.svg",
      href: "/admin/orders",
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">
        Welcome back, {user?.name}!
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.color}`}>
              <img src={card.icon} alt="" className="w-5 h-5" />
            </div>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary transition"
        >
          <h3 className="font-medium text-lg">Add New Product</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add a new product to the catalog
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary transition"
        >
          <h3 className="font-medium text-lg">Manage Orders</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and update order statuses
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;