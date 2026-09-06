"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const Orders = () => {
  const { user, setShowUserLogin, currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setShowUserLogin(true);
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, setShowUserLogin]);

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading orders...</div>;
  }

  if (!user) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-gray-400">Please login to view your orders</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-3xl text-gray-400">No orders yet</p>
        <p className="text-gray-500 mt-3">Your orders will appear here</p>
        <Link
          href="/products"
          className="inline-block mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 mb-10">
      <h1 className="text-3xl font-medium mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const address =
            typeof order.address === "string"
              ? JSON.parse(order.address || "{}")
              : order.address;

          const statusColors = {
            "Order Placed": "bg-blue-100 text-blue-700",
            Processing: "bg-yellow-100 text-yellow-700",
            Shipped: "bg-purple-100 text-purple-700",
            Delivered: "bg-green-100 text-green-700",
            Cancelled: "bg-red-100 text-red-700",
          };

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium">{order.items[0]?.name}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      statusColors[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                    {order.paymentType}
                    {order.isPaid && " • Paid"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.id}
                      src={item.image || "/images/logo.svg"}
                      alt={item.name}
                      className="w-12 h-12 object-contain border-2 border-white rounded-full bg-white"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium">
                      {currency}
                      {order.amount}
                    </p>
                    {address && (
                      <p className="text-xs text-gray-500">
                        {address.city}, {address.state}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/order/${order.id}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;