import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <p className="text-2xl text-gray-600 mt-4">Page not found</p>
      <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="inline-block mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}