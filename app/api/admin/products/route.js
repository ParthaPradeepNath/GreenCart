import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Admin fetch products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { name, categoryId, price, offerPrice, images, description, inStock, isBestSeller } =
      await request.json();

    if (!name || !categoryId || !price) {
      return NextResponse.json(
        { success: false, message: "Name, category and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        image: images || [],
        description: description || [],
        inStock: inStock ?? true,
        isBestSeller: isBestSeller ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
