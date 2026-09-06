const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categories = [
  { name: "Vegetables", bgColor: "#FEF6DA" },
  { name: "Fruits", bgColor: "#FEE0E0" },
  { name: "Drinks", bgColor: "#F0F5DE" },
  { name: "Instant", bgColor: "#E1F5EC" },
  { name: "Dairy", bgColor: "#FEE6CD" },
  { name: "Bakery", bgColor: "#E0F6FE" },
  { name: "Grains", bgColor: "#F1E3F9" },
];

const products = [
  { name: "Potato 500g", category: "Vegetables", price: 25, offerPrice: 20, images: ["/images/products/potato_image_1.png"], description: ["Fresh and organic", "Rich in carbohydrates", "Ideal for curries and fries"], inStock: true, isBestSeller: true },
  { name: "Tomato 1 kg", category: "Vegetables", price: 40, offerPrice: 35, images: ["/images/products/tomato_image.png"], description: ["Juicy and ripe", "Rich in Vitamin C", "Perfect for salads and sauces", "Farm fresh quality"], inStock: true, isBestSeller: true },
  { name: "Carrot 500g", category: "Vegetables", price: 30, offerPrice: 28, images: ["/images/products/carrot_image.png"], description: ["Sweet and crunchy", "Good for eyesight", "Ideal for juices and salads"], inStock: true },
  { name: "Spinach 500g", category: "Vegetables", price: 18, offerPrice: 15, images: ["/images/products/spinach_image_1.png"], description: ["Rich in iron", "High in vitamins", "Perfect for soups and salads"], inStock: true },
  { name: "Onion 500g", category: "Vegetables", price: 22, offerPrice: 19, images: ["/images/products/onion_image_1.png"], description: ["Fresh and pungent", "Perfect for cooking", "A kitchen staple"], inStock: true },
  { name: "Apple 1 kg", category: "Fruits", price: 120, offerPrice: 110, images: ["/images/products/apple_image.png"], description: ["Crisp and juicy", "Rich in fiber", "Boosts immunity", "Perfect for snacking and desserts", "Organic and farm fresh"], inStock: true, isBestSeller: true },
  { name: "Orange 1 kg", category: "Fruits", price: 80, offerPrice: 75, images: ["/images/products/orange_image.png"], description: ["Juicy and sweet", "Rich in Vitamin C", "Perfect for juices and salads"], inStock: true },
  { name: "Banana 1 kg", category: "Fruits", price: 50, offerPrice: 45, images: ["/images/products/banana_image_1.png"], description: ["Sweet and ripe", "High in potassium", "Great for smoothies and snacking"], inStock: true },
  { name: "Mango 1 kg", category: "Fruits", price: 150, offerPrice: 140, images: ["/images/products/mango_image_1.png"], description: ["Sweet and flavorful", "Perfect for smoothies and desserts", "Rich in Vitamin A"], inStock: true, isBestSeller: true },
  { name: "Grapes 500g", category: "Fruits", price: 70, offerPrice: 65, images: ["/images/products/grapes_image_1.png"], description: ["Fresh and juicy", "Rich in antioxidants", "Perfect for snacking and fruit salads"], inStock: true },
  { name: "Amul Milk 1L", category: "Dairy", price: 60, offerPrice: 55, images: ["/images/products/amul_milk_image.png"], description: ["Pure and fresh", "Rich in calcium", "Ideal for tea, coffee, and desserts", "Trusted brand quality"], inStock: true, isBestSeller: true },
  { name: "Paneer 200g", category: "Dairy", price: 90, offerPrice: 85, images: ["/images/products/paneer_image.png"], description: ["Soft and fresh", "Rich in protein", "Ideal for curries and snacks"], inStock: true },
  { name: "Eggs 12 pcs", category: "Dairy", price: 90, offerPrice: 85, images: ["/images/products/eggs_image.png"], description: ["Farm fresh", "Rich in protein", "Ideal for breakfast and baking"], inStock: true },
  { name: "Cheese 200g", category: "Dairy", price: 140, offerPrice: 130, images: ["/images/products/cheese_image.png"], description: ["Creamy and delicious", "Perfect for pizzas and sandwiches", "Rich in calcium"], inStock: true },
  { name: "Coca-Cola 1.5L", category: "Drinks", price: 80, offerPrice: 75, images: ["/images/products/coca_cola_image.png"], description: ["Refreshing and fizzy", "Perfect for parties and gatherings", "Best served chilled"], inStock: true },
  { name: "Pepsi 1.5L", category: "Drinks", price: 78, offerPrice: 73, images: ["/images/products/pepsi_image.png"], description: ["Chilled and refreshing", "Perfect for celebrations", "Best served cold"], inStock: true },
  { name: "Sprite 1.5L", category: "Drinks", price: 79, offerPrice: 74, images: ["/images/products/sprite_image_1.png"], description: ["Refreshing citrus taste", "Perfect for hot days", "Best served chilled"], inStock: true },
  { name: "Fanta 1.5L", category: "Drinks", price: 77, offerPrice: 72, images: ["/images/products/fanta_image_1.png"], description: ["Sweet and fizzy", "Great for parties and gatherings", "Best served cold"], inStock: true },
  { name: "7 Up 1.5L", category: "Drinks", price: 76, offerPrice: 71, images: ["/images/products/seven_up_image_1.png"], description: ["Refreshing lemon-lime flavor", "Perfect for refreshing", "Best served chilled"], inStock: true },
  { name: "Basmati Rice 5kg", category: "Grains", price: 550, offerPrice: 520, images: ["/images/products/basmati_rice_image.png"], description: ["Long grain and aromatic", "Perfect for biryani and pulao", "Premium quality"], inStock: true, isBestSeller: true },
  { name: "Wheat Flour 5kg", category: "Grains", price: 250, offerPrice: 230, images: ["/images/products/wheat_flour_image.png"], description: ["High-quality whole wheat", "Soft and fluffy rotis", "Rich in nutrients"], inStock: true },
  { name: "Organic Quinoa 500g", category: "Grains", price: 450, offerPrice: 420, images: ["/images/products/quinoa_image.png"], description: ["High in protein and fiber", "Gluten-free", "Rich in vitamins and minerals"], inStock: true },
  { name: "Brown Rice 1kg", category: "Grains", price: 120, offerPrice: 110, images: ["/images/products/brown_rice_image.png"], description: ["Whole grain and nutritious", "Helps in weight management", "Good source of magnesium"], inStock: true },
  { name: "Barley 1kg", category: "Grains", price: 150, offerPrice: 140, images: ["/images/products/barley_image.png"], description: ["Rich in fiber", "Helps improve digestion", "Low in fat and cholesterol"], inStock: true },
  { name: "Brown Bread 400g", category: "Bakery", price: 40, offerPrice: 35, images: ["/images/products/brown_bread_image.png"], description: ["Soft and healthy", "Made from whole wheat", "Ideal for breakfast and sandwiches"], inStock: true },
  { name: "Butter Croissant 100g", category: "Bakery", price: 50, offerPrice: 45, images: ["/images/products/butter_croissant_image.png"], description: ["Flaky and buttery", "Freshly baked", "Perfect for breakfast or snacks"], inStock: true },
  { name: "Chocolate Cake 500g", category: "Bakery", price: 350, offerPrice: 325, images: ["/images/products/chocolate_cake_image.png"], description: ["Rich and moist", "Made with premium cocoa", "Ideal for celebrations and parties"], inStock: true },
  { name: "Whole Bread 400g", category: "Bakery", price: 45, offerPrice: 40, images: ["/images/products/whole_wheat_bread_image.png"], description: ["Healthy and nutritious", "Made with whole wheat flour", "Ideal for sandwiches and toast"], inStock: true },
  { name: "Vanilla Muffins 6 pcs", category: "Bakery", price: 100, offerPrice: 90, images: ["/images/products/vanilla_muffins_image.png"], description: ["Soft and fluffy", "Perfect for a quick snack", "Made with real vanilla"], inStock: true },
  { name: "Maggi Noodles 280g", category: "Instant", price: 55, offerPrice: 50, images: ["/images/products/maggi_image.png"], description: ["Instant and easy to cook", "Delicious taste", "Popular among kids and adults"], inStock: true, isBestSeller: true },
  { name: "Top Ramen 270g", category: "Instant", price: 45, offerPrice: 40, images: ["/images/products/top_ramen_image.png"], description: ["Quick and easy to prepare", "Spicy and flavorful", "Loved by college students and families"], inStock: true },
  { name: "Knorr Cup Soup 70g", category: "Instant", price: 35, offerPrice: 30, images: ["/images/products/knorr_soup_image.png"], description: ["Convenient for on-the-go", "Healthy and nutritious", "Variety of flavors"], inStock: true },
  { name: "Yippee Noodles 260g", category: "Instant", price: 50, offerPrice: 45, images: ["/images/products/yippee_image.png"], description: ["Non-fried noodles for healthier choice", "Tasty and filling", "Convenient for busy schedules"], inStock: true },
  { name: "Oats Noodles 72g", category: "Instant", price: 40, offerPrice: 35, images: ["/images/products/maggi_oats_image.png"], description: ["Healthy alternative with oats", "Good for digestion", "Perfect for breakfast or snacks"], inStock: true },
];

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.name] = created.id;
  }
  console.log(`Created ${Object.keys(categoryMap).length} categories`);

  // Create products
  let count = 0;
  for (const product of products) {
    const categoryId = categoryMap[product.category];
    if (!categoryId) continue;

    await prisma.product.create({
      data: {
        name: product.name,
        categoryId,
        price: product.price,
        offerPrice: product.offerPrice,
        image: product.images,
        description: product.description,
        inStock: product.inStock,
        isBestSeller: product.isBestSeller,
      },
    });
    count++;
  }
  console.log(`Created ${count} products`);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@greencart.com",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("Created admin user: admin@greencart.com / admin123");

  // Create demo user
  const demoHashedPassword = await bcrypt.hash("user123", 10);
  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@greencart.com",
      password: demoHashedPassword,
      role: "user",
    },
  });
  console.log("Created demo user: user@greencart.com / user123");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
