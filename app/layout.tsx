import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "US Trip Dashboard",
  description: "Temporary shared dashboard for Ho, Lai, and Ooi families"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
