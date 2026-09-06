import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  useAppContext: vi.fn(),
}));

vi.mock("@/context/AppContext", () => ({
  useAppContext: mocks.useAppContext,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

import ProductCard from "@/components/ProductCard";

const baseProduct = {
  id: "p1",
  name: "Organic Apple",
  price: 120,
  offerPrice: 100,
  image: ["/images/products/apple_image.png"],
  category: { name: "Fruits" },
};

describe("ProductCard", () => {
  beforeEach(() => {
    mocks.useAppContext.mockReturnValue({
      currency: "₹",
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      cartItems: {},
    });
  });

  it("renders the product name, category, and price", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Organic Apple")).toBeInTheDocument();
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    // offer price shown with strikethrough original
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹120")).toBeInTheDocument();
  });

  it("links to the product detail page", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/product/p1");
  });

  it("renders the regular price when there is no offer", () => {
    const { offerPrice, ...regular } = baseProduct;
    render(<ProductCard product={regular} />);
    expect(screen.getByText("₹120")).toBeInTheDocument();
    expect(screen.queryByText("₹100")).not.toBeInTheDocument();
  });

  it("calls addToCart when Add is clicked", async () => {
    const user = userEvent.setup();
    const addToCart = vi.fn();
    mocks.useAppContext.mockReturnValue({
      currency: "₹",
      addToCart,
      removeFromCart: vi.fn(),
      cartItems: {},
    });
    render(<ProductCard product={baseProduct} />);
    await user.click(screen.getByText("Add"));
    expect(addToCart).toHaveBeenCalledWith("p1");
  });

  it("shows quantity stepper with +/- when item is in the cart", async () => {
    const user = userEvent.setup();
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();
    mocks.useAppContext.mockReturnValue({
      currency: "₹",
      addToCart,
      removeFromCart,
      cartItems: { p1: 3 },
    });
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(screen.getByText("+"));
    expect(addToCart).toHaveBeenCalledWith("p1");
    await user.click(screen.getByText("-"));
    expect(removeFromCart).toHaveBeenCalledWith("p1");
  });

  it("returns null when no product is provided", () => {
    const { container } = render(<ProductCard />);
    expect(container.firstChild).toBeNull();
  });
});