import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: auth.user.id },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Fetch cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { productId, quantity } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: auth.user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: quantity || existing.quantity + 1 },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: auth.user.id,
          productId,
          quantity: quantity || 1,
        },
      });
    }

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: auth.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
