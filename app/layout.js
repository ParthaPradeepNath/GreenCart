import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppContextProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "GreenCart - Fresh Groceries Delivered",
  description:
    "Fresh groceries, vegetables, fruits and more delivered to your doorstep in minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>
          <Navbar />
          <Toaster />
          <main className="px-6 md:px-16 lg:px-24 xl:px-32">{children}</main>
          <Footer />
        </AppContextProvider>
      </body>
    </html>
  );
}
