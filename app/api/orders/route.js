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
    const orders = await prisma.order.findMany({
      where: { userId: auth.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
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
    const { items, amount, address, paymentType, isPaid, razorpayOrderId } =
      await request.json();

    if (!items || !items.length || !amount || !address) {
      return NextResponse.json(
        { success: false, message: "Order details are incomplete" },
        { status: 400 }
      );
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: auth.user.id,
        amount,
        address: JSON.stringify(address),
        paymentType: paymentType || "COD",
        isPaid: isPaid || false,
        razorpayOrderId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Clear items from server cart after order
    if (isPaid) {
      await prisma.cartItem.deleteMany({
        where: { userId: auth.user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order" },
      { status: 500 }
    );
  }
}
