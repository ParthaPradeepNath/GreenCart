"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const categoryImages = {
  Vegetables: "/images/products/organic_vegitable_image.png",
  Fruits: "/images/products/fresh_fruits_image.png",
  Drinks: "/images/products/bottles_image.png",
  Instant: "/images/products/maggi_image.png",
  Dairy: "/images/products/dairy_product_image.png",
  Bakery: "/images/products/bakery_image.png",
  Grains: "/images/products/grain_image.png",
};

const defaultBgColors = {
  Vegetables: "#FEF6DA",
  Fruits: "#FEE0E0",
  Drinks: "#F0F5DE",
  Instant: "#E1F5EC",
  Dairy: "#FEE6CD",
  Bakery: "#E0F6FE",
  Grains: "#F1E3F9",
};

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.categories.map((cat) => ({
            ...cat,
            image: categoryImages[cat.name] || null,
            bgColor: defaultBgColors[cat.name] || "#FEF6DA",
          }));
          setCategories(mapped);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Categories</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${encodeURIComponent(category.name.toLowerCase())}`}
            className="group cursor-pointer py-5 px-3 rounded-lg flex flex-col justify-center items-center"
            style={{ backgroundColor: category.bgColor }}
          >
            {category.image && (
              <img
                src={category.image}
                alt="icon"
                className="group-hover:scale-108 transition max-w-28"
              />
            )}
            <p className="text-sm font-medium">{category.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
