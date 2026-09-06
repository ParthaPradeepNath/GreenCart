import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "All Products - GreenCart",
};

export default function ProductsPage({ searchParams }) {
  return <ProductsClient searchParams={searchParams} />;
}