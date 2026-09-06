import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";

export async function generateMetadata({ params }) {
  const { name } = await params;
  return {
    title: `${name} - GreenCart`,
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const products = await prisma.product.findMany({
    where: {
      category: {
        name: { equals: decodedName, mode: "insensitive" },
      },
    },
    include: { category: true },
  });

  const cat = await prisma.category.findUnique({
    where: { name: decodedName },
  });

  return <CategoryClient categoryName={decodedName} products={products} cat={cat} />;
}