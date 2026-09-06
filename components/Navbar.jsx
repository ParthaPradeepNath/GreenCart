"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, setShowUserLogin, logout, cartItems, isSeller } = useAppContext();
  const pathname = usePathname();

  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const onSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
        <Link href="/" onClick={() => setOpen(false)}>
          <img src="/images/logo.svg" alt="logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <Link href="/" className={pathname === "/" ? "text-primary font-medium" : "hover:text-primary"}>
            Home
          </Link>
          <Link href="/products" className={pathname === "/products" ? "text-primary font-medium" : "hover:text-primary"}>
            All Product
          </Link>
          <Link href="/" className="hover:text-primary">
            Contact
          </Link>

          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch(e)}
            />
            <button onClick={onSearch} className="cursor-pointer">
              <img src="/images/search_icon.svg" alt="search" className="w-4 h-4" />
            </button>
          </div>

          <Link href="/cart" className="relative cursor-pointer">
            <img src="/images/nav_cart_icon.svg" alt="cart" className="w-6 opacity-80" />
            {cartCount > 0 && (
              <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
                {cartCount}
              </button>
            )}
          </Link>

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img src="/images/profile_icon.png" alt="profile" className="w-10" />
              <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-34 rounded-md text-sm z-40">
                <li>
                  <Link href="/orders" className="block p-1.5 pl-3 hover:bg-primary/10">
                    My Orders
                  </Link>
                </li>
                {isSeller && (
                  <li>
                    <Link href="/admin" className="block p-1.5 pl-3 hover:bg-primary/10">
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li onClick={logout} className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer">
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          aria-label="Menu"
          className="sm:hidden"
        >
          <img src="/images/menu_icon.svg" alt="menu" />
        </button>

        {/* Mobile Menu */}
        {open && (
          <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-2 px-5 text-sm md:hidden z-50">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/products" onClick={() => setOpen(false)}>
              All Products
            </Link>
            {user && (
              <Link href="/orders" onClick={() => setOpen(false)}>
                My Orders
              </Link>
            )}
            {isSeller && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Admin Panel
              </Link>
            )}
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart ({cartCount})
            </Link>
            <Link href="/" onClick={() => setOpen(false)}>
              Contact
            </Link>

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="cursor-pointer px-6 py-2 mt-2 bg-primary-dull hover:bg-primary transition text-white rounded-full text-sm"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="cursor-pointer px-6 py-2 mt-2 bg-primary-dull hover:bg-primary transition text-white rounded-full text-sm"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
      <LoginModal />
    </>
  );
};

export default Navbar;
