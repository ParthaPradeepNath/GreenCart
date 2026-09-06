import OrderDetailsClient from "./OrderDetailsClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Order ${id} - GreenCart`,
  };
}

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  return <OrderDetailsClient id={id} />;
}