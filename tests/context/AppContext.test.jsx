import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppContextProvider, useAppContext } from "@/context/AppContext";

const CartProbe = () => {
  const { cartItems, addToCart, removeFromCart, updateCartItem, products, user } =
    useAppContext();
  return (
    <div>
      <div data-testid="cart-count">
        {Object.values(cartItems).reduce((a, b) => a + b, 0)}
      </div>
      <div data-testid="product-count">{products.length}</div>
      <div data-testid="user-name">{user?.name || "none"}</div>
      <button onClick={() => addToCart("p1")}>add-p1</button>
      <button onClick={() => addToCart("p1")}>add-p1-again</button>
      <button onClick={() => removeFromCart("p1")}>remove-p1</button>
      <button onClick={() => updateCartItem("p1", 5)}>set-5</button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <AppContextProvider>
      <CartProbe />
    </AppContextProvider>
  );

describe("AppContext", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, products: [] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds an item to the cart", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText("add-p1"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1"));
  });

  it("increments quantity when the same item is added twice", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText("add-p1"));
    await user.click(screen.getByText("add-p1-again"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("2"));
  });

  it("decrements and removes the item after last unit is removed", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText("add-p1"));
    await user.click(screen.getByText("remove-p1"));
    await waitFor(() =>
      expect(screen.getByTestId("cart-count").textContent).toBe("0")
    );
  });

  it("updates the item quantity to an explicit value", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText("add-p1"));
    await user.click(screen.getByText("set-5"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("5"));
  });

  it("persists the cart to localStorage", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText("add-p1"));
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("cartItems"));
      expect(stored).toEqual({ p1: 1 });
    });
  });

  it("loads products from the API on mount", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        products: [{ id: "p1", name: "Apple" }],
      }),
    });
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId("product-count").textContent).toBe("1")
    );
  });

  it("loads the user when a token exists", async () => {
    localStorage.setItem("token", "jwt-token");
    global.fetch = vi.fn((url) => {
      if (String(url).includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            user: { id: "u1", name: "Alice", email: "a@b.com", role: "user" },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, products: [] }),
      });
    });
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId("user-name").textContent).toBe("Alice")
    );
  });
});