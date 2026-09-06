"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";

const ProductsClient = ({ searchParams }) => {
  const router = useRouter();
  const { products, loading } = useAppContext();
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState(searchParams?.category || "");
  const [searchTerm, setSearchTerm] = useState(searchParams?.search || "");
  const [sortBy, setSortBy] = useState("");

  const search = searchParams?.search || "";

  useEffect(() => {
    let result = [...products];

    if (category) {
      result = result.filter(
        (p) => p.category?.name.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFiltered(result);
  }, [products, category, search, sortBy]);

  const categories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))];

  const onCategoryClick = (name) => {
    setCategory(name);
    router.push(name ? `/products?category=${name}` : "/products");
  };

  if (loading && !products.length) {
    return (
      <div className="py-24 text-center text-gray-500">Loading products...</div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-medium">
          {search ? `Search results for "${search}"` : "All Products"}
        </h1>
        <p className="text-gray-500">{filtered.length} products found</p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 mt-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryClick("")}
              className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition ${
                !category
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 text-gray-600 hover:border-primary"
              }`}
            >
              All
            </button>
            {categories.map((name) => (
              <button
                key={name}
                onClick={() => onCategoryClick(name)}
                className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition ${
                  category === name
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-600 hover:border-primary"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none bg-white cursor-pointer"
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-2xl text-gray-400">No products found</p>
          <p className="text-gray-500 mt-2">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsClient;