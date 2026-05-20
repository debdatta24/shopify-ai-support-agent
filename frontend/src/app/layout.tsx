import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CommerceMind AI — Ecommerce Customer Support Dashboard",
  description: "AI-powered ecommerce customer support dashboard with chat, order tracking, refund management, and escalation handling.",
  keywords: "ecommerce, customer support, AI, dashboard, order tracking, refunds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-mesh">
        <Sidebar />
        <main className="lg:pl-64 transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
