import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const orderExists = await prisma.order.findUnique({ where: { id } });
    if (!orderExists) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
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
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
