import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateToken } from "@/lib/auth";

const prismaMock = vi.hoisted(() => ({
  cartItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const authedRequest = (path, { method = "GET", body, query } = {}) => {
  const token = generateToken("user-1", "user");
  const url = query
    ? `http://localhost:3000/api/cart${query}`
    : `http://localhost:3000/api/cart`;
  return new Request(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

async function importCart() {
  return import("@/app/api/cart/route");
}

describe("cart API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cart", () => {
    it("returns 401 without auth", async () => {
      const { GET } = await importCart();
      const res = await GET(new Request("http://localhost:3000/api/cart"));
      expect(res.status).toBe(401);
    });

    it("returns the user's cart with products", async () => {
      prismaMock.cartItem.findMany.mockResolvedValue([
        { id: "c1", productId: "p1", quantity: 2, product: {} },
      ]);
      const { GET } = await importCart();
      const res = await GET(authedRequest("/api/cart"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.cart).toHaveLength(1);
      expect(prismaMock.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user-1" } })
      );
    });
  });

  describe("POST /api/cart", () => {
    it("returns 400 when productId is missing", async () => {
      const { POST } = await importCart();
      const res = await POST(authedRequest("/api/cart", { method: "POST", body: {} }));
      expect(res.status).toBe(400);
    });

    it("returns 404 for a non-existent product", async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      const { POST } = await importCart();
      const res = await POST(
        authedRequest("/api/cart", { method: "POST", body: { productId: "p-missing" } })
      );
      expect(res.status).toBe(404);
    });

    it("creates a new cart item for a new product", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: "p1" });
      prismaMock.cartItem.findUnique.mockResolvedValue(null);
      prismaMock.cartItem.create.mockResolvedValue({
        id: "new",
        userId: "user-1",
        productId: "p1",
        quantity: 1,
      });
      const { POST } = await importCart();
      const res = await POST(
        authedRequest("/api/cart", { method: "POST", body: { productId: "p1" } })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(prismaMock.cartItem.create).toHaveBeenCalledWith({
        data: { userId: "user-1", productId: "p1", quantity: 1 },
      });
    });

    it("increments quantity for an existing cart item", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: "p1" });
      prismaMock.cartItem.findUnique.mockResolvedValue({
        id: "c1",
        quantity: 2,
      });
      prismaMock.cartItem.update.mockResolvedValue({
        id: "c1",
        quantity: 3,
      });
      const { POST } = await importCart();
      const res = await POST(
        authedRequest("/api/cart", { method: "POST", body: { productId: "p1" } })
      );
      expect(res.status).toBe(200);
      expect(prismaMock.cartItem.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { quantity: 3 },
      });
    });
  });

  describe("DELETE /api/cart", () => {
    it("returns 400 without productId", async () => {
      const { DELETE } = await importCart();
      const res = await DELETE(authedRequest("/api/cart", { method: "DELETE" }));
      expect(res.status).toBe(400);
    });

    it("removes the item from the cart", async () => {
      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      const { DELETE } = await importCart();
      const res = await DELETE(
        authedRequest("/api/cart", { method: "DELETE", query: "?productId=p1" })
      );
      expect(res.status).toBe(200);
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1", productId: "p1" },
      });
    });
  });
});