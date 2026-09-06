import { describe, it, expect, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

async function importProducts() {
  return import("@/app/api/products/route");
}

describe("GET /api/products", () => {
  it("returns all products with their categories", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { id: "p1", name: "Apple", category: { name: "Fruits" } },
      { id: "p2", name: "Potato", category: { name: "Vegetables" } },
    ]);
    const { GET } = await importProducts();
    const res = await GET(new Request("http://localhost:3000/api/products"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.products).toHaveLength(2);
  });

  it("passes a category filter to Prisma", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    const { GET } = await importProducts();
    await GET(
      new Request("http://localhost:3000/api/products?category=Fruits")
    );
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          category: { name: { equals: "Fruits", mode: "insensitive" } },
        },
      })
    );
  });

  it("passes a search term to Prisma", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    const { GET } = await importProducts();
    await GET(
      new Request("http://localhost:3000/api/products?search=apple")
    );
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { contains: "apple", mode: "insensitive" } },
      })
    );
  });

  it("applies the limit parameter", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    const { GET } = await importProducts();
    await GET(new Request("http://localhost:3000/api/products?limit=5"));
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });
});