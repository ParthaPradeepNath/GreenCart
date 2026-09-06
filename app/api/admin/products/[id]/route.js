import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin fetch product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const { name, categoryId, price, offerPrice, images, description, inStock, isBestSeller } =
      await request.json();

    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(offerPrice !== undefined && {
          offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        }),
        ...(images && { image: images }),
        ...(description && { description }),
        ...(inStock !== undefined && { inStock }),
        ...(isBestSeller !== undefined && { isBestSeller }),
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;

    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
