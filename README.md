# GreenCart - Full-Stack Grocery E-Commerce

A full-stack grocery e-commerce application built with:

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes (full-stack)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay (test mode)
- **Deploy:** Docker + Docker Compose

## Features

### Customer
- Browse products by category (`/products`, `/category/[name]`)
- Product detail pages with image gallery (`/product/[id]`)
- Search & sort products
- Add to cart / update quantities (persisted to localStorage + DB when logged in)
- Checkout with delivery address + COD or Razorpay online payment (`/checkout`)
- Order history (`/orders`) and order confirmation (`/order/[id]`)
- User registration / login modal

### Admin (admin@greencart.com / admin123)
- Dashboard with stats (`/admin`)
- Product CRUD (create / edit / delete) (`/admin/products`)
- Order management with status updates (`/admin/orders`)

## Tech Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Framework     | Next.js 15 (App Router)                       |
| UI            | React 19, Tailwind CSS 4                       |
| Database      | PostgreSQL (Prisma ORM)                       |
| Auth          | JWT (jsonwebtoken) + bcrypt                   |
| Payments      | Razorpay                                      |
| Container     | Docker + Docker Compose                       |
| Toasts        | react-hot-toast                               |

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or a Neon serverless Postgres URL)
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable                  | Description                              |
|---------------------------|------------------------------------------|
| `DATABASE_URL`            | PostgreSQL connection string              |
| `JWT_SECRET`              | Secret for signing JWT tokens            |
| `JWT_REFRESH_SECRET`      | Secret for refresh tokens                |
| `RAZORPAY_KEY_ID`         | Razorpay test key ID (optional for dev)  |
| `RAZORPAY_KEY_SECRET`     | Razorpay test key secret (optional)      |
| `NEXT_PUBLIC_CURRENCY`    | Currency symbol (default `₹`)            |

### 3. Set up database & seed

```bash
npx prisma db push
npm run db:seed        # or: npx prisma db seed
```

This creates the schema and seeds:
- 7 categories, 34 products
- **Admin:** `admin@greencart.com` / `admin123`
- **Demo user:** `user@greencart.com` / `user123`

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Docker Deployment

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- The Next.js app on port 3000

The app container automatically runs `prisma db push` on startup (schema will be created; run the seed manually inside the container for initial data):

```bash
docker exec -it greencart_app sh -c "node prisma/seed.js"
```

## Database Schema

```
User      → CartItem, Order, Address
Category  → Product
Product   → CartItem, OrderItem
Order     → OrderItem
```

## Scripts

| Script              | Description                      |
|---------------------|----------------------------------|
| `npm run dev`       | Start dev server                 |
| `npm run build`     | Production build                 |
| `npm run start`     | Start production server          |
| `npm run lint`      | Lint code                        |
| `npm run db:generate` | Generate Prisma client        |
| `npm run db:push`   | Push schema to database          |
| `npm run db:seed`   | Seed database                    |
| `npm run db:studio` | Open Prisma Studio               |

## Project Structure

```
app/
├── api/          # Backend API routes (auth, products, cart, orders, admin, payment)
├── admin/        # Admin dashboard (dashboard, products, orders)
├── cart/         # Shopping cart page
├── category/     # Category product listing
├── checkout/     # Checkout with address + payment
├── order/        # Order confirmation
├── orders/       # Order history
├── product/      # Product detail page
├── products/     # All products with filters
├── page.js       # Home page
components/       # Reusable UI components
context/          # Global state (auth, cart, products)
lib/              # Prisma client, auth utils, formatting
prisma/           # Schema + seed script
```

## API Endpoints

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/auth/register`              | Register user                  |
| POST   | `/api/auth/login`                 | Login                          |
| GET    | `/api/auth/me`                    | Get current user (auth)        |
| GET    | `/api/products`                   | List products (filter/search)  |
| GET    | `/api/product/[id]`               | Get single product             |
| GET    | `/api/categories`                 | List categories                |
| GET/POST/DELETE | `/api/cart`               | Cart operations (auth)         |
| GET/POST | `/api/orders`                   | User orders (auth)             |
| GET    | `/api/orders/[id]`                | Single order (auth)            |
| POST   | `/api/payment`                    | Create Razorpay order (auth)   |
| POST   | `/api/checkout`                   | Place COD order (auth)         |
| GET/POST | `/api/admin/products`           | Admin product list/create      |
| PUT/DELETE | `/api/admin/products/[id]`     | Admin product update/delete    |
| GET    | `/api/admin/orders`               | Admin order list               |
| PUT/DELETE | `/api/admin/orders/[id]`       | Admin status update/delete     |
| GET    | `/api/admin/stats`                | Admin dashboard stats          |
| GET/POST | `/api/admin/categories`         | Admin category list/create     |
```