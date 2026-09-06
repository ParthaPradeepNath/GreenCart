import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { items, address, paymentMethod } = await request.json();

    if (!items || !items.length || !address) {
      return NextResponse.json(
        { success: false, message: "Cart and address are required" },
        { status: 400 }
      );
    }

    // Calculate amount
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const amount = items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      if (product) {
        const price = product.offerPrice || product.price;
        return sum + price * item.quantity;
      }
      return sum;
    }, 0);

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    if (paymentMethod === "COD") {
      // Create direct order for COD
      const order = await prisma.order.create({
        data: {
          userId: auth.user.id,
          amount,
          address: JSON.stringify(address),
          paymentType: "COD",
          isPaid: false,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId);
              return {
                productId: item.productId,
                name: product.name,
                price: product.offerPrice || product.price,
                image: product.image[0],
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Clear server cart
      await prisma.cartItem.deleteMany({ where: { userId: auth.user.id } });

      return NextResponse.json({
        success: true,
        message: "Order placed successfully",
        order,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
