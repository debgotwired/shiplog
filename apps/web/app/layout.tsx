import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shiplog",
  description: "Changelog as an in-product surface for announcements, targeting, distribution, and adoption."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
