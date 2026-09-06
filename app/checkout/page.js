"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const Checkout = () => {
  const router = useRouter();
  const { cartItems, products, setCartItems, user, setShowUserLogin, currency } =
    useAppContext();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      setShowUserLogin(true);
      router.push("/cart");
    }
  }, [user, router, setShowUserLogin]);

  if (!user) return null;

  const cartProducts = Object.keys(cartItems)
    .filter((id) => cartItems[id] > 0)
    .map((id) => ({
      product: products.find((p) => p.id === id),
      quantity: cartItems[id],
    }))
    .filter((item) => item.product);

  const subtotal = cartProducts.reduce(
    (sum, item) =>
      sum + (item.product.offerPrice || item.product.price) * item.quantity,
    0
  );
  const deliveryFee = subtotal > 500 ? 0 : 25;
  const total = subtotal + deliveryFee;

  if (!cartProducts.length) {
    router.push("/cart");
    return null;
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    if (paymentMethod === "COD") {
      placeOrder("COD", false, null);
    } else {
      processOnlinePayment();
    }
  };

  const processOnlinePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to initiate payment");
        setProcessing(false);
        return;
      }

      // Mock payment - since this is test mode
      if (data.mock) {
        toast.success("Payment successful (test mode)");
        placeOrder("Online", true, data.orderId);
        return;
      }

      // Real Razorpay flow
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        setProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "GreenCart",
        description: "Grocery Order",
        order_id: data.orderId,
        handler: async (response) => {
          placeOrder("Online", true, response.razorpay_order_id);
        },
        prefill: {
          name: address.firstName + " " + address.lastName,
          email: address.email,
          contact: address.phone,
        },
        theme: {
          color: "#4fbf8b",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setProcessing(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  const placeOrder = async (paymentType, isPaid, razorpayOrderId) => {
    try {
      const token = localStorage.getItem("token");
      const items = cartProducts.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        price: product.offerPrice || product.price,
        image: product.image?.[0] || "",
        quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          amount: total,
          address,
          paymentType,
          isPaid,
          razorpayOrderId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        setCartItems({});
        localStorage.removeItem("cartItems");
        router.push(`/order/${data.order.id}`);
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const onDisable = processing || !address.firstName || !address.lastName || !address.street || !address.city || !address.state || !address.zipcode || !address.phone;

  return (
    <div className="mt-10 mb-10">
      <h1 className="text-3xl font-medium mb-8">Checkout</h1>

      <form onSubmit={handleShippingSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Shipping details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-5">Delivery Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  First Name *
                </label>
                <input
                  name="firstName"
                  value={address.firstName}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  value={address.lastName}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 block mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={address.email}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 block mb-1">
                  Street Address *
                </label>
                <input
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  City *
                </label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  State *
                </label>
                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  ZIP Code *
                </label>
                <input
                  name="zipcode"
                  value={address.zipcode}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">
                    Pay when you receive your order
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "Online"}
                  onChange={() => setPaymentMethod("Online")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium">Online Payment (Razorpay)</p>
                  <p className="text-sm text-gray-500">
                    Pay securely with UPI, Cards, or Netbanking
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-medium mb-4">Order Summary</h2>

          {cartProducts.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3 py-2">
              <img
                src={product.image?.[0] || "/images/logo.svg"}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">Qty: {quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {currency}
                {(product.offerPrice || product.price) * quantity}
              </p>
            </div>
          ))}

          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{currency}{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">
                {deliveryFee === 0 ? "FREE" : `${currency}${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
              <span className="font-medium">Total</span>
              <span className="font-medium text-primary">{currency}{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={onDisable}
            className="w-full mt-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing
              ? "Processing..."
              : paymentMethod === "COD"
              ? "Place Order (COD)"
              : "Pay & Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;