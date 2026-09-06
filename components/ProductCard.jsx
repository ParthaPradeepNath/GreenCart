"use client";

import React from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems } = useAppContext();

  if (!product) return null;

  const inCart = cartItems[product.id] || 0;
  const displayPrice = product.offerPrice || product.price;

  return (
    <div className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full">
      <Link
        href={`/product/${product.id}`}
        className="group cursor-pointer flex items-center justify-center px-2"
      >
        <img
          className="group-hover:scale-105 transition max-w-26 md:max-w-36 h-36 object-contain"
          src={product.image?.[0] || "/images/logo.svg"}
          alt={product.name}
        />
      </Link>
      <div className="text-gray-500/60 text-sm">
        <p>{product.category?.name}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">
          {product.name}
        </p>
        <div className="flex items-center gap-0.5">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                src={
                  i < 4 ? "/images/star_icon.svg" : "/images/star_dull_icon.svg"
                }
                alt="star icon"
                className="md:w-3.5 w-3"
              />
            ))}
          <p>(4)</p>
        </div>
        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}
            {displayPrice}{" "}
            {product.price !== displayPrice && (
              <span className="text-gray-500/60 md:text-sm text-xs line-through">
                {currency}
                {product.price}
              </span>
            )}
          </p>
          <div className="text-primary">
            {!inCart ? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer"
                onClick={() => addToCart(product.id)}
              >
                <img src="/images/cart_icon.svg" alt="cart_icon" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  -
                </button>
                <span className="w-5 text-center">{inCart}</span>
                <button
                  onClick={() => addToCart(product.id)}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
