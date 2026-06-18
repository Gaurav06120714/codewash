import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeWash",
  description: "Blast source code off the screen with a pressure washer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
