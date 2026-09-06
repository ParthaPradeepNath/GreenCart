"use client";

import React from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

const CategoryClient = ({ categoryName, products, cat }) => {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-700">{categoryName}</span>
      </div>

      <h1 className="text-3xl font-medium capitalize">{categoryName}</h1>
      <p className="text-gray-500 mt-1">{products.length} products</p>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-2xl text-gray-400">No products in this category</p>
          <p className="text-gray-500 mt-2">Check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryClient;