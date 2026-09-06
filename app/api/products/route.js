import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    const where = {};
    if (category) {
      where.category = { name: { equals: category, mode: "insensitive" } };
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
