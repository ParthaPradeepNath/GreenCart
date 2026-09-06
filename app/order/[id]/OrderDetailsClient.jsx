"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const OrderDetailsClient = ({ id }) => {
  const { user, setShowUserLogin, currency } = useAppContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-gray-400">Order not found</p>
        <Link
          href="/orders"
          className="inline-block mt-4 text-primary hover:underline"
        >
          View all orders
        </Link>
      </div>
    );
  }

  const address = typeof order.address === "string" ? JSON.parse(order.address) : order.address;

  return (
    <div className="mt-10 mb-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10 text-green-600"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mt-4">
            {order.paymentType === "COD"
              ? "Order Placed!"
              : "Payment Successful!"}
          </h1>
          <p className="text-gray-500 mt-2">
            Thank you, {order.user?.name}! Your order has been confirmed.
          </p>

          <div className="border-t border-gray-200 mt-6 pt-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-primary">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium">
                {order.paymentType} {order.isPaid && "• Paid"}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">
                {currency}
                {order.amount}
              </span>
            </div>
            {address && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <p className="font-medium mb-1">Delivering to:</p>
                <p className="text-gray-600">
                  {address.firstName} {address.lastName}, {address.street},{" "}
                  {address.city}, {address.state} - {address.zipcode}
                </p>
                <p className="text-gray-600 mt-1">Phone: {address.phone}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <h3 className="font-medium text-left mb-3">Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                <img
                  src={item.image || "/images/logo.svg"}
                  alt={item.name}
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} x {currency}
                    {item.price}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {currency}
                  {item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="inline-block mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsClient;