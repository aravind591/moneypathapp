// Root layout — applies the dark theme and global styles to every page.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyPath — Student Loan Platform",
  description: "Apply for and track your education loan, all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
