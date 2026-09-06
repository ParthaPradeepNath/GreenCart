"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const statuses = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order deleted");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading orders...</div>;
  }

  const statusColor = {
    "Order Placed": "bg-blue-100 text-blue-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Orders ({filteredOrders.length})</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition ${
            !statusFilter
              ? "bg-primary text-white border-primary"
              : "border-gray-300 text-gray-600"
          }`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition ${
              statusFilter === status
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const address =
              typeof order.address === "string"
                ? JSON.parse(order.address || "{}")
                : order.address;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {order.user?.name} ({order.user?.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">₹{order.amount}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {order.paymentType}
                      {order.isPaid && " • Paid"}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs border-none outline-none cursor-pointer rounded-full px-2 py-1 ${statusColor[order.status] || "bg-gray-100"}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-gray-50 rounded p-2"
                    >
                      <img
                        src={item.image || "/images/logo.svg"}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {item.quantity} x ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {address && (
                  <p className="text-xs text-gray-500 mt-3">
                    Deliver to: {address.firstName} {address.lastName},{" "}
                    {address.street}, {address.city}, {address.state} -{" "}
                    {address.zipcode} • {address.phone}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;