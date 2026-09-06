import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Product ${id} - GreenCart`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}