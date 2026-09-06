"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "₹";

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Load user from token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setIsSeller(data.user.role === "admin");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart from server (if logged in) or localStorage
  const loadCart = () => {
    const localCart = localStorage.getItem("cartItems");
    if (localCart) {
      setCartItems(JSON.parse(localCart));
    }
  };

  const saveCartLocally = (cartData) => {
    localStorage.setItem("cartItems", JSON.stringify(cartData));
  };

  // Add Product to Cart
  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    saveCartLocally(cartData);
    toast.success("Added to Cart");

    // Sync with server if logged in
    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: itemId, quantity: 1 }),
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }
  };

  // Update Cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    saveCartLocally(cartData);
    toast.success("Cart updated");

    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: itemId, quantity }),
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }
  };

  // Remove Product From Cart
  const removeFromCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    setCartItems(cartData);
    saveCartLocally(cartData);
    toast.success("Removed from Cart");

    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`/api/cart?productId=${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);
    setIsSeller(false);
    localStorage.removeItem("token");
    toast.success("Logged out");
    router.push("/");
  };

  useEffect(() => {
    fetchProducts();
    loadCart();
    loadUser();
  }, []);

  const value = {
    router,
    user,
    setUser,
    setIsSeller,
    isSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems,
    logout,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
