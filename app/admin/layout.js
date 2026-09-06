"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const AdminLayout = ({ children }) => {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="py-24 text-center text-gray-500">Loading...</div>
    );
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: "/images/product_list_icon.svg" },
    { href: "/admin/products", label: "Products", icon: "/images/box_icon.svg" },
    { href: "/admin/orders", label: "Orders", icon: "/images/order_icon.svg" },
  ];

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="mt-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="md:w-56 shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img
              src="/images/profile_icon.png"
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <img src={link.icon} alt="" className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;