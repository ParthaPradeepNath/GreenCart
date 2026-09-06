import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateToken } from "@/lib/auth";

const prismaMock = vi.hoisted(() => ({
  order: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  cartItem: {
    deleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const authedRequest = (body) => {
  const token = generateToken("user-1", "user");
  return new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

async function importOrders() {
  return import("@/app/api/orders/route");
}

const sampleItems = [
  {
    productId: "p1",
    name: "Apple 1 kg",
    price: 110,
    image: "/images/products/apple_image.png",
    quantity: 2,
  },
];

describe("orders API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/orders", () => {
    it("returns 401 without auth", async () => {
      const { GET } = await importOrders();
      const res = await GET(new Request("http://localhost:3000/api/orders"));
      expect(res.status).toBe(401);
    });

    it("returns the user's orders", async () => {
      prismaMock.order.findMany.mockResolvedValue([{ id: "o1", amount: 220 }]);
      const { GET } = await importOrders();
      const token = generateToken("user-1", "user");
      const res = await GET(
        new Request("http://localhost:3000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.orders).toHaveLength(1);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user-1" } })
      );
    });
  });

  describe("POST /api/orders", () => {
    it("returns 401 without auth", async () => {
      const { POST } = await importOrders();
      const res = await POST(
        new Request("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: sampleItems }),
        })
      );
      expect(res.status).toBe(401);
    });

    it("returns 400 for incomplete order details", async () => {
      const { POST } = await importOrders();
      const res = await POST(authedRequest({ items: [] }));
      expect(res.status).toBe(400);
    });

    it("creates a COD order with nested items", async () => {
      prismaMock.order.create.mockResolvedValue({
        id: "o1",
        items: sampleItems,
      });
      const { POST } = await importOrders();
      const res = await POST(
        authedRequest({
          items: sampleItems,
          amount: 220,
          address: { street: "123 Main St", city: "Delhi" },
          paymentType: "COD",
          isPaid: false,
        })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.order.id).toBe("o1");

      const createArg = prismaMock.order.create.mock.calls[0][0];
      expect(createArg.data.paymentType).toBe("COD");
      expect(createArg.data.isPaid).toBe(false);
      // Coupon: amount
      expect(createArg.data.amount).toBe(220);
      // cart should NOT be cleared for COD
      expect(prismaMock.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it("clears the cart for a paid order", async () => {
      prismaMock.order.create.mockResolvedValue({ id: "o1", items: [] });
      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 3 });
      const { POST } = await importOrders();
      const res = await POST(
        authedRequest({
          items: sampleItems,
          amount: 220,
          address: { street: "123 Main St", city: "Delhi" },
          paymentType: "Online",
          isPaid: true,
        })
      );
      expect(res.status).toBe(200);
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
    });
  });
});