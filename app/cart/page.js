"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {
  const { cartItems, products, addToCart, removeFromCart, setCartItems, currency, setShowUserLogin, user } =
    useAppContext();
  const [placingOrder, setPlacingOrder] = useState(false);

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

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
  };

  if (!cartProducts.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-3xl text-gray-400">Your cart is empty</p>
        <p className="text-gray-500 mt-3">
          Add some groceries to get started
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (placingOrder) return;
    setPlacingOrder(true);
    // Navigate to checkout
    window.location.href = "/checkout";
  };

  return (
    <div className="mt-10">
      <h1 className="text-3xl font-medium mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          {cartProducts.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 mb-4 bg-white"
            >
              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image?.[0] || "/images/logo.svg"}
                  alt={product.name}
                  className="w-20 h-20 object-contain"
                />
              </Link>

              <div className="flex-1">
                <Link
                  href={`/product/${product.id}`}
                  className="font-medium hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {product.category?.name}
                </p>
                <p className="text-primary font-medium mt-1">
                  {currency}
                  {product.offerPrice || product.price}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-primary/10 rounded-full px-3 py-1">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="w-7 h-7 rounded-full bg-white shadow cursor-pointer font-medium"
                >
                  -
                </button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-7 h-7 rounded-full bg-white shadow cursor-pointer font-medium"
                >
                  +
                </button>
              </div>

              <p className="font-medium w-20 text-right">
                {currency}
                {(product.offerPrice || product.price) * quantity}
              </p>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-500 cursor-pointer"
          >
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-medium mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {currency}
                {subtotal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery fee</span>
              <span className="font-medium">
                {deliveryFee === 0 ? "FREE" : `${currency}${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-medium">Total</span>
              <span className="font-medium text-lg text-primary">
                {currency}
                {total}
              </span>
            </div>
          </div>

          {deliveryFee > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Add {currency}
              {500 - subtotal} more for free delivery!
            </p>
          )}

          <button
            onClick={handleCheckout}
            className="w-full mt-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium cursor-pointer"
          >
            {user ? "Proceed to Checkout" : "Login to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;