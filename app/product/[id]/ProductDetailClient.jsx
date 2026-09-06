"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const ProductDetailClient = ({ id }) => {
  const { currency, addToCart, removeFromCart, cartItems } = useAppContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error(data.message || "Product not found");
        }
      } catch (error) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-gray-400">Product not found</p>
      </div>
    );
  }

  const displayPrice = product.offerPrice || product.price;
  const inCart = cartItems[product.id] || 0;

  return (
    <div className="mt-10 pb-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center bg-white">
            <img
              src={product.image?.[activeImage] || "/images/logo.svg"}
              alt={product.name}
              className="max-h-80 object-contain"
            />
          </div>
          {product.image?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`border rounded p-1 cursor-pointer ${
                    activeImage === i ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-14 h-14 object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            {product.category?.name}
          </p>
          <h1 className="text-3xl font-semibold mt-2">{product.name}</h1>

          <div className="flex items-center gap-0.5 mt-3">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  src={
                    i < 4
                      ? "/images/star_icon.svg"
                      : "/images/star_dull_icon.svg"
                  }
                  alt="star"
                  className="w-4"
                />
              ))}
            <span className="ml-2 text-sm text-gray-500">(4.0)</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-medium text-primary">
              {currency}
              {displayPrice}
            </span>
            {product.price !== displayPrice && (
              <span className="ml-3 text-lg text-gray-400 line-through">
                {currency}
                {product.price}
              </span>
            )}
            {product.price !== displayPrice && (
              <span className="ml-3 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {Math.round(
                  ((product.price - displayPrice) / product.price) * 100
                )}% off
              </span>
            )}
          </div>

          {product.inStock ? (
            <p className="mt-2 text-sm text-green-600">In Stock</p>
          ) : (
            <p className="mt-2 text-sm text-red-500">Out of Stock</p>
          )}

          {/* Description */}
          {product.description?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-lg">About this item</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                {product.description.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-8">
            {!inCart ? (
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/images/cart_icon.svg" alt="cart" className="w-5" />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium mr-2">
                  Quantity:
                </span>
                <div className="flex items-center gap-3 bg-primary/25 rounded px-4 py-2">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-lg cursor-pointer px-2"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-medium">{inCart}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="text-lg cursor-pointer px-2"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailClient;